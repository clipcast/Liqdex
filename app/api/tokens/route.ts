import { NextRequest, NextResponse } from "next/server";
import { getPublicClient, ADDRESSES, FACTORY_ABI } from "@/lib/liquid";
import { getCached, setCache } from "@/lib/cache";
import type { TokenListItem, PaginatedResponse } from "@/lib/types";

const DEPLOY_BLOCK = 29000000;
const CHUNK_SIZE = 10000;
const CACHE_TTL = 60 * 1000; // 1 minute

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

    const client = getPublicClient();
    const currentBlock = await client.getBlockNumber();

    const allTokens: TokenListItem[] = [];
    let fromBlock = DEPLOY_BLOCK;

    while (fromBlock < Number(currentBlock)) {
      const toBlock = Math.min(fromBlock + CHUNK_SIZE, Number(currentBlock));

      try {
        const tokens = await client.readContract({
          address: ADDRESSES.FACTORY as `0x${string}`,
          abi: FACTORY_ABI,
          functionName: "getTokens",
          args: [BigInt(fromBlock), BigInt(toBlock)],
        });

        if (tokens && Array.isArray(tokens)) {
          for (const token of tokens) {
            allTokens.push({
              address: token.poolId,
              name: token.name,
              symbol: token.symbol,
              image: token.image,
              creator: token.creator,
              deployTimestamp: token.deployTimestamp,
            });
          }
        }
      } catch (error) {
        console.error(`Error reading blocks ${fromBlock}-${toBlock}:`, error);
      }

      fromBlock = toBlock + 1;
    }

    // Sort by deploy timestamp (newest first)
    allTokens.sort((a, b) => Number(b.deployTimestamp - a.deployTimestamp));

    // Paginate
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTokens = allTokens.slice(startIndex, endIndex);

    const response: PaginatedResponse<TokenListItem> = {
      data: paginatedTokens,
      total: allTokens.length,
      page,
      pageSize,
      hasMore: endIndex < allTokens.length,
    };

    setCache(cacheKey, response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Tokens API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}
