import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { LiquidSDK } from "liquid-sdk";
import { getCached, setCache } from "@/lib/cache";
import type { AuctionState } from "@/lib/types";
import { AUCTION_ABI, ADDRESSES } from "@/lib/liquid";

const CACHE_TTL = 5 * 1000; // 5 seconds for real-time data
const DEPLOY_BLOCK = BigInt(44445000);
const CHUNK_SIZE = BigInt(100000);

function createSDK() {
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org"),
  });
  return new LiquidSDK({ publicClient });
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = "auctions_active";
    const cached = getCached<AuctionState[]>(cacheKey, CACHE_TTL);
    if (cached) {
      return NextResponse.json(cached);
    }

    const sdk = createSDK();
    const publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org"),
    });
    const currentBlock = await publicClient.getBlockNumber();

    // Get tokens using SDK (event-based, fast)
    const allTokens: { poolId: string; name: string; symbol: string }[] = [];
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
            name: token.tokenName,
            symbol: token.tokenSymbol,
          });
        }
      } catch (error) {
        console.error(`Error reading blocks ${fromBlock}-${toBlock}:`, error);
      }

      fromBlock = toBlock + BigInt(1);
    }

    // Check auction state for recent tokens (last 100)
    const recentTokens = allTokens.slice(-100);
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
