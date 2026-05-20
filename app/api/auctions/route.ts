import { NextResponse } from "next/server";
import { scanAllTokens, getPublicClient, DEPLOY_BLOCK } from "@/lib/scanner";
import { getCached, setCache } from "@/lib/cache";
import { AUCTION_ABI, ADDRESSES } from "@/lib/liquid";
import type { AuctionState } from "@/lib/types";

const CACHE_TTL = 10 * 1000; // 10 seconds for real-time data

export async function GET() {
  try {
    const cacheKey = "auctions_active";
    const cached = getCached<AuctionState[]>(cacheKey, CACHE_TTL);
    if (cached) {
      return NextResponse.json(cached);
    }

    const allTokens = await scanAllTokens();
    const publicClient = getPublicClient();
    const currentBlock = await publicClient.getBlockNumber();

    // Check auction state for each token's pool (last 100 tokens to keep it fast)
    const recentTokens = allTokens.slice(0, 100);
    const auctions: AuctionState[] = [];

    for (const token of recentTokens) {
      try {
        const result = await publicClient.readContract({
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
            status: isActive ? "active" : isEnded ? "ended" : "upcoming",
          });
        }
      } catch {
        // Skip tokens without auction data
      }
    }

    // Sort by status (active first)
    auctions.sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;
      return b.round - a.round;
    });

    setCache(cacheKey, auctions, CACHE_TTL);
    return NextResponse.json(auctions);
  } catch (error) {
    console.error("Auctions API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch auctions" },
      { status: 500 }
    );
  }
}
