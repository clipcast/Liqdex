import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { LiquidSDK } from "liquid-sdk";
import { getCached, setCache } from "@/lib/cache";
import type { DashboardStats } from "@/lib/types";

const CACHE_TTL = 60 * 1000; // 1 minute
const DEPLOY_BLOCK = BigInt(44445000);
const CHUNK_SIZE = BigInt(100000);

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

    let totalTokens = 0;
    let fromBlock = DEPLOY_BLOCK;

    while (fromBlock < currentBlock) {
      const toBlock =
        fromBlock + CHUNK_SIZE > currentBlock
          ? currentBlock
          : fromBlock + CHUNK_SIZE;

      try {
        const tokens = await sdk.getTokens({ fromBlock, toBlock });
        totalTokens += tokens.length;
      } catch (error) {
        console.error(`Error reading blocks ${fromBlock}-${toBlock}:`, error);
      }

      fromBlock = toBlock + BigInt(1);
    }

    const stats: DashboardStats = {
      totalTokens,
      volume24h: 0,
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
