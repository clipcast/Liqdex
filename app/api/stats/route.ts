import { NextResponse } from "next/server";
import { scanAllTokens, getPublicClient } from "@/lib/scanner";
import { getCached, setCache } from "@/lib/cache";
import { getTokenPrice } from "@/lib/geckoterminal";
import { AUCTION_ABI, ADDRESSES } from "@/lib/liquid";
import type { DashboardStats } from "@/lib/types";

const CACHE_TTL = 5 * 60 * 1000;
const SAMPLE_SIZE = 5;

export async function GET() {
  try {
    const cacheKey = "dashboard_stats";
    const cached = getCached<DashboardStats>(cacheKey, CACHE_TTL);
    if (cached) {
      return NextResponse.json(cached);
    }

    const allTokens = await scanAllTokens();
    const publicClient = getPublicClient();
    const currentBlock = await publicClient.getBlockNumber();

    const totalTokens = allTokens.length;

    // Sample recent tokens for volume/liquidity
    const sampleTokens = allTokens.slice(0, SAMPLE_SIZE);
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
        // Skip
      }
    }

    const avgVolume = sampleCount > 0 ? totalVolume / sampleCount : 0;
    const avgLiquidity = sampleCount > 0 ? totalLiquidity / sampleCount : 0;
    const estimatedVolume = Math.round(avgVolume * totalTokens);
    const estimatedLiquidity = Math.round(avgLiquidity * totalTokens);

    // Count active auctions (last 20 tokens)
    const recentTokens = allTokens.slice(0, 20);
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
        // Skip
      }
    }

    const stats: DashboardStats = {
      totalTokens,
      volume24h: estimatedVolume,
      totalLiquidity: estimatedLiquidity,
      activeAuctions,
    };

    setCache(cacheKey, stats, CACHE_TTL);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
