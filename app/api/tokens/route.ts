import { NextRequest, NextResponse } from "next/server";
import { scanAllTokens, getPublicClient } from "@/lib/scanner";
import { getBlockTimestamp } from "@/lib/basescan";
import { getCached, setCache } from "@/lib/cache";
import type { TokenListItem, PaginatedResponse } from "@/lib/types";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    const cacheKey = `tokens_page_${page}_${pageSize}`;
    const cached = getCached<PaginatedResponse<TokenListItem>>(
      cacheKey,
      CACHE_TTL
    );
    if (cached) {
      return NextResponse.json(cached);
    }

    const allTokens = await scanAllTokens();
    const publicClient = getPublicClient();
    const currentBlock = await publicClient.getBlockNumber();

    // Get current block timestamp for age calculation
    const currentTimestamp = await getBlockTimestamp(Number(currentBlock));

    // Convert to response format with timestamps
    const tokensWithTime: TokenListItem[] = allTokens.map((token) => {
      let deployTimestamp = token.blockNumber.toString();

      if (currentTimestamp) {
        const blockDiff = Number(currentBlock) - Number(token.blockNumber);
        deployTimestamp = (currentTimestamp - blockDiff * 2).toString();
      }

      return {
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        image: token.image,
        creator: token.creator,
        deployTimestamp,
      };
    });

    // Paginate
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTokens = tokensWithTime.slice(startIndex, endIndex);

    const result: PaginatedResponse<TokenListItem> = {
      data: paginatedTokens,
      total: tokensWithTime.length,
      page,
      pageSize,
      hasMore: endIndex < tokensWithTime.length,
    };

    setCache(cacheKey, result, CACHE_TTL);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Tokens API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}
