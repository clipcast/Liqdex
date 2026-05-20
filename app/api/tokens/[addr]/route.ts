import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { LiquidSDK } from "liquid-sdk";
import { getCached, setCache } from "@/lib/cache";
import type { TokenInfo } from "@/lib/types";

const CACHE_TTL = 30 * 1000; // 30 seconds

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

    // Get token event from SDK (uses indexed event log — O(1))
    const tokenEvent = await sdk.getTokenEvent(addr as `0x${string}`);

    if (!tokenEvent) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    // Get additional info
    const [tokenInfo, rewards] = await Promise.all([
      sdk.getTokenInfo(addr as `0x${string}`),
      sdk.getTokenRewards(addr as `0x${string}`).catch(() => null),
    ]);

    const tokenResult = {
      name: tokenEvent.tokenName,
      symbol: tokenEvent.tokenSymbol,
      image: tokenEvent.tokenImage,
      poolId: tokenEvent.poolId,
      hook: tokenEvent.poolHook,
      rewardRecipient: rewards?.rewardRecipients?.[0] ?? "",
      creator: tokenEvent.msgSender,
      deployTimestamp: (tokenEvent.blockNumber ?? BigInt(0)).toString(),
      supply: tokenInfo.totalSupply.toString(),
      metadata: tokenEvent.tokenMetadata,
      context: tokenEvent.tokenContext,
      extensions: tokenEvent.extensions,
    };

    setCache(cacheKey, tokenResult);
    return NextResponse.json(tokenResult);
  } catch (error) {
    console.error("Token detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch token details" },
      { status: 500 }
    );
  }
}
