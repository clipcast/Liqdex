import { NextRequest, NextResponse } from "next/server";
import { getAuctionState, getAuctionFeeConfig, getAuctionDecayStartTime, getPoolUnlockTime } from "@/lib/auction";
import { getCached, setCache } from "@/lib/cache";

const CACHE_TTL = 3 * 1000; // 3 seconds

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ addr: string }> }
) {
  try {
    const { addr } = await params;

    if (!addr || addr.length < 10) {
      return NextResponse.json(
        { error: "Invalid pool ID" },
        { status: 400 }
      );
    }

    const cacheKey = `auction_detail_${addr}`;
    const cached = getCached(cacheKey, CACHE_TTL);
    if (cached) {
      return NextResponse.json(cached);
    }

    const [state, feeConfig, decayStart, unlockTime] = await Promise.all([
      getAuctionState(addr),
      getAuctionFeeConfig(addr),
      getAuctionDecayStartTime(addr),
      getPoolUnlockTime(addr),
    ]);

    if (!state) {
      return NextResponse.json(
        { error: "Auction not found" },
        { status: 404 }
      );
    }

    const detail = {
      ...state,
      feeConfig,
      decayStartTime: decayStart,
      unlockTime,
    };

    setCache(cacheKey, detail);
    return NextResponse.json(detail);
  } catch (error) {
    console.error("Auction detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch auction details" },
      { status: 500 }
    );
  }
}
