import { NextRequest, NextResponse } from "next/server";
import { getPublicClient, ADDRESSES, FACTORY_ABI } from "@/lib/liquid";
import { getCached, setCache } from "@/lib/cache";
import { getTokenPrice } from "@/lib/geckoterminal";
import type { TokenInfo, TokenPrice } from "@/lib/types";

const CACHE_TTL = 30 * 1000; // 30 seconds

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ addr: string }> }
) {
  try {
    const { addr } = await params;

    if (!addr || addr.length < 10) {
      return NextResponse.json(
        { error: "Invalid token address" },
        { status: 400 }
      );
    }

    const cacheKey = `token_detail_${addr}`;
    const cached = getCached<TokenInfo>(cacheKey, CACHE_TTL);
    if (cached) {
      return NextResponse.json(cached);
    }

    const client = getPublicClient();

    // Get token info from factory
    const tokenEvent = await client.readContract({
      address: ADDRESSES.FACTORY as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: "getTokenEvent",
      args: [addr as `0x${string}`],
    });

    if (!tokenEvent) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    const tokenInfo: TokenInfo = {
      name: tokenEvent.name,
      symbol: tokenEvent.symbol,
      image: tokenEvent.image,
      poolId: tokenEvent.poolId,
      hook: tokenEvent.hook,
      rewardRecipient: tokenEvent.rewardRecipient,
      creator: tokenEvent.creator,
      deployTimestamp: tokenEvent.deployTimestamp,
      supply: tokenEvent.supply.toString(),
      metadata: tokenEvent.metadata,
      context: tokenEvent.context,
      rewards: tokenEvent.rewards,
      extensions: [],
    };

    setCache(cacheKey, tokenInfo);
    return NextResponse.json(tokenInfo);
  } catch (error) {
    console.error("Token detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch token details" },
      { status: 500 }
    );
  }
}
