import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { LiquidSDK } from "liquid-sdk";
import { getCached, setCache } from "@/lib/cache";
import { getBlockTimestamp } from "@/lib/basescan";
import type { TokenListItem, PaginatedResponse } from "@/lib/types";

const DEPLOY_BLOCK = BigInt(44445784);
const CHUNK_SIZE = BigInt(100000);
const CACHE_TTL = 60 * 1000; // 1 minute

function createSDK() {
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org"),
  });
  return new LiquidSDK({ publicClient });
}

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

    const sdk = createSDK();
    const publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org"),
    });
    const currentBlock = await publicClient.getBlockNumber();

    // Fetch tokens using SDK's event-based approach in chunks
    const allTokens: (TokenListItem & { _block: bigint })[] = [];
    let fromBlock = DEPLOY_BLOCK;

    while (fromBlock < currentBlock) {
      const toBlock =
        fromBlock + CHUNK_SIZE > currentBlock
          ? currentBlock
          : fromBlock + CHUNK_SIZE;

      try {
        const tokens = await sdk.getTokens({ fromBlock, toBlock });
        for (const token of tokens) {
          const block = token.blockNumber ?? BigInt(0);
          allTokens.push({
            address: token.tokenAddress,
            name: token.tokenName,
            symbol: token.tokenSymbol,
            image: token.tokenImage,
            creator: token.msgSender,
            deployTimestamp: block.toString(),
            _block: block,
          });
        }
      } catch (error) {
        console.error(
          `Error reading blocks ${fromBlock}-${toBlock}:`,
          error
        );
      }

      fromBlock = toBlock + BigInt(1);
    }

    // Sort by block number (newest first)
    allTokens.sort((a, b) => Number(b._block - a._block));

    // Get timestamp for the first token's block (as reference)
    const firstBlock = allTokens.length > 0 ? Number(allTokens[0]._block) : Number(currentBlock);
    const currentTimestamp = await getBlockTimestamp(Number(currentBlock));
    const firstTimestamp = await getBlockTimestamp(firstBlock);

    // Convert block numbers to timestamps
    if (currentTimestamp && firstTimestamp) {
      for (const token of allTokens) {
        const blockDiff = Number(currentBlock) - Number(token._block);
        const timestamp = currentTimestamp - (blockDiff * 2);
        token.deployTimestamp = timestamp.toString();
      }
    }

    // Paginate
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTokens = allTokens.slice(startIndex, endIndex);

    // Remove _block from response
    const responseData = paginatedTokens.map(({ _block, ...rest }) => rest);

    const result: PaginatedResponse<TokenListItem> = {
      data: responseData,
      total: allTokens.length,
      page,
      pageSize,
      hasMore: endIndex < allTokens.length,
    };

    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Tokens API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}
