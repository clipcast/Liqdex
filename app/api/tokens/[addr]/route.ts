import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { LiquidSDK } from "liquid-sdk";
import { getCached, setCache } from "@/lib/cache";
import { getBlockTimestamp } from "@/lib/basescan";
import type { TokenInfo } from "@/lib/types";

const CACHE_TTL = 5 * 60 * 1000;

function createSDK() {
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org"),
  });
  return new LiquidSDK({ publicClient });
}

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

    const sdk = createSDK();
    const tokenEvent = await sdk.getTokenEvent(addr as `0x${string}`);

    if (!tokenEvent) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    const rewards = await sdk
      .getTokenRewards(addr as `0x${string}`)
      .catch(() => null);

    // Get actual timestamp
    const blockNumber = Number(tokenEvent.blockNumber ?? 0);
    let deployTimestamp = blockNumber.toString();

    if (blockNumber > 0) {
      const timestamp = await getBlockTimestamp(blockNumber);
      if (timestamp) {
        deployTimestamp = timestamp.toString();
      }
    }

    const tokenResult: TokenInfo = {
      name: tokenEvent.tokenName,
      symbol: tokenEvent.tokenSymbol,
      image: tokenEvent.tokenImage,
      poolId: tokenEvent.poolId,
      hook: tokenEvent.poolHook,
      rewardRecipient: rewards?.rewardRecipients?.[0] ?? "",
      creator: tokenEvent.msgSender,
      deployTimestamp,
      supply: "100000000000000000000000000000",
      metadata: "",
      context: "",
      extensions: [],
    };

    setCache(cacheKey, tokenResult, CACHE_TTL);
    return NextResponse.json(tokenResult);
  } catch (error) {
    console.error("Token detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch token details" },
      { status: 500 }
    );
  }
}
