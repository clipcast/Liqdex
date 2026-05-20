import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { LiquidSDK } from "liquid-sdk";
import { getCached, setCache } from "@/lib/cache";
import { getTokenPrice } from "@/lib/geckoterminal";
import { AUCTION_ABI, ADDRESSES } from "@/lib/liquid";
import type { DashboardStats } from "@/lib/types";

const CACHE_TTL = 60 * 1000; // 1 minute
const DEPLOY_BLOCK = BigInt(44445000);
const CHUNK_SIZE = BigInt(100000);
const SAMPLE_SIZE = 10;

function createSDK() {
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org"),
  });
  return new LiquidSDK({ publicClient });
}

export async function GET() {
  try {
    const cacheKey = "dashboard_stats";
    const cached = getCached<DashboardStats>(cacheKey, CACHE_TTL);
    if (cached) {
      return NextResponse.json(cached);
    }

    const sdk = createSDK();
    const publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org"),
    });
    const currentBlock = await publicClient.getBlockNumber();

    // Scan all tokens
    const allTokens: { poolId: string; address: string }[] = [];
    let fromBlock = DEPLOY_BLOCK;

    while (fromBlock < currentBlock) {
      const toBlock =
        fromBlock + CHUNK_SIZE > currentBlock
          ? currentBlock
          : fromBlock + CHUNK_SIZE;

      try {
        const tokens = await sdk.getTokens({ fromBlock, toBlock });
        for (const token of tokens) {
          allTokens.push({
            poolId: token.poolId,
            address: token.tokenAddress,
          });
        }
      } catch (error) {
        console.error(`Error reading blocks ${fromBlock}-${toBlock}:`, error);
      }

      fromBlock = toBlock + BigInt(1);
    }

    const totalTokens = allTokens.length;

    // Sample recent tokens for volume/liquidity
    const sampleTokens = allTokens.slice(-SAMPLE_SIZE);
    let totalVolume = 0;
    let totalLiquidity = 0;
    let sampleCount = 0;

    for (const token of sampleTokens) {
      try {
        const price = await getTokenPrice(token.address);
        if (price) {
          totalVolume += price.volume24h;
          totalLiquidity += price.liquidity;
          sampleCount++;
        }
      } catch {
        // Skip failed price fetches
      }
    }

    // Extrapolate if we have sample data
    const avgVolume = sampleCount > 0 ? totalVolume / sampleCount : 0;
    const avgLiquidity = sampleCount > 0 ? totalLiquidity / sampleCount : 0;
    const estimatedVolume = Math.round(avgVolume * totalTokens);
    const estimatedLiquidity = Math.round(avgLiquidity * totalTokens);

    // Count active auctions from recent tokens (last 50)
    const recentTokens = allTokens.slice(-50);
    let activeAuctions = 0;

    for (const token of recentTokens) {
      try {
        const result = await publicClient.readContract({
          address: ADDRESSES.SNIPER_AUCTION as `0x${string}`,
          abi: AUCTION_ABI,
          functionName: "getAuctionState",
          args: [token.poolId as `0x${string}`],
        });

        const [, , , nextBlock] = result as [bigint, boolean, bigint, bigint];
        if (Number(nextBlock) > Number(currentBlock)) {
          activeAuctions++;
        }
      } catch {
        // Skip tokens without auction
      }
    }

    const stats: DashboardStats = {
      totalTokens,
      volume24h: estimatedVolume,
      totalLiquidity: estimatedLiquidity,
      activeAuctions,
    };

    setCache(cacheKey, stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
