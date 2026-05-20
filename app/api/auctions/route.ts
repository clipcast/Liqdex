import { NextRequest, NextResponse } from "next/server";
import { getPublicClient, ADDRESSES, FACTORY_ABI, AUCTION_ABI } from "@/lib/liquid";
import { getCached, setCache } from "@/lib/cache";
import type { AuctionState } from "@/lib/types";

const CACHE_TTL = 5 * 1000; // 5 seconds for real-time data

export async function GET(request: NextRequest) {
  try {
    const cacheKey = "auctions_active";
    const cached = getCached<AuctionState[]>(cacheKey, CACHE_TTL);
    if (cached) {
      return NextResponse.json(cached);
    }

    const client = getPublicClient();
    const currentBlock = await client.getBlockNumber();

    // Get recent tokens to check for auctions
    const DEPLOY_BLOCK = 29000000;
    const CHUNK_SIZE = 10000;
    const allTokens: { poolId: string; name: string; symbol: string }[] = [];

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
              poolId: token.poolId,
              name: token.name,
              symbol: token.symbol,
            });
          }
        }
      } catch (error) {
        console.error(`Error reading blocks ${fromBlock}-${toBlock}:`, error);
      }

      fromBlock = toBlock + 1;
    }

    // Check auction state for recent tokens (last 100)
    const recentTokens = allTokens.slice(-100);
    const auctions: AuctionState[] = [];

    for (const token of recentTokens) {
      try {
        const result = await client.readContract({
          address: ADDRESSES.SNIPER_AUCTION as `0x${string}`,
          abi: AUCTION_ABI,
          functionName: "getAuctionState",
          args: [token.poolId as `0x${string}`],
        });

        const [round, gasPeg, currentFee, nextBlock] = result as [
          bigint,
          boolean,
          bigint,
          bigint
        ];

        const isActive = Number(nextBlock) > Number(currentBlock);
        const isEnded = !isActive && Number(round) > 0;

        if (isActive || isEnded) {
          auctions.push({
            round: Number(round),
            gasPeg,
            currentFee: Number(currentFee) / 10000,
            nextBlock: Number(nextBlock),
            status: isActive ? "active" : "ended",
          });
        }
      } catch {
        // Skip tokens without auction
      }
    }

    // Sort by status (active first), then by round
    auctions.sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;
      return b.round - a.round;
    });

    setCache(cacheKey, auctions);
    return NextResponse.json(auctions);
  } catch (error) {
    console.error("Auctions API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch auctions" },
      { status: 500 }
    );
  }
}
