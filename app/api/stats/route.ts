import { NextResponse } from "next/server";
import { getPublicClient, ADDRESSES, FACTORY_ABI } from "@/lib/liquid";
import { getCached, setCache } from "@/lib/cache";
import type { DashboardStats } from "@/lib/types";

const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET() {
  try {
    const cacheKey = "dashboard_stats";
    const cached = getCached<DashboardStats>(cacheKey, CACHE_TTL);
    if (cached) {
      return NextResponse.json(cached);
    }

    const client = getPublicClient();
    const currentBlock = await client.getBlockNumber();

    const DEPLOY_BLOCK = 29000000;
    const CHUNK_SIZE = 10000;
    let totalTokens = 0;

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
          totalTokens += tokens.length;
        }
      } catch (error) {
        console.error(`Error reading blocks ${fromBlock}-${toBlock}:`, error);
      }

      fromBlock = toBlock + 1;
    }

    const stats: DashboardStats = {
      totalTokens,
      volume24h: 0, // Will be populated by GeckoTerminal
      totalLiquidity: 0,
      activeAuctions: 0,
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
