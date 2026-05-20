import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { LiquidSDK } from "liquid-sdk";
import { getCached, setCache } from "@/lib/cache";
import { getTokenPrice } from "@/lib/geckoterminal";
import type { TopVolumeToken } from "@/lib/types";

const CACHE_TTL = 60 * 1000; // 1 minute
const DEPLOY_BLOCK = BigInt(43327823);
const CHUNK_SIZE = BigInt(100000);
const BATCH_SIZE = 5; // GeckoTerminal requests per batch
const BATCH_DELAY = 2000; // 2s between batches to respect rate limit

function createSDK() {
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org"),
  });
  return new LiquidSDK({ publicClient });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET() {
  try {
    const cacheKey = "top_volume_tokens";
    const cached = getCached<TopVolumeToken[]>(cacheKey, CACHE_TTL);
    if (cached) {
      return NextResponse.json(cached);
    }

    const sdk = createSDK();
    const publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org"),
    });
    const currentBlock = await publicClient.getBlockNumber();

    // Scan all tokens
    const allTokens: {
      address: string;
      name: string;
      symbol: string;
      image: string;
      creator: string;
      deployTimestamp: string;
    }[] = [];

    let fromBlock = DEPLOY_BLOCK;
    while (fromBlock < currentBlock) {
      const toBlock =
        fromBlock + CHUNK_SIZE > currentBlock
          ? currentBlock
          : fromBlock + CHUNK_SIZE;

      try {
        const tokens = await sdk.getTokens({ fromBlock, toBlock });
        for (const token of tokens) {
          const block = token.blockNumber ?? BigInt(0);
          allTokens.push({
            address: token.tokenAddress,
            name: token.tokenName,
            symbol: token.tokenSymbol,
            image: token.tokenImage,
            creator: token.msgSender,
            deployTimestamp: block.toString(),
          });
        }
      } catch (error) {
        console.error(`Error reading blocks ${fromBlock}-${toBlock}:`, error);
      }

      fromBlock = toBlock + BigInt(1);
    }

    // Fetch price data from GeckoTerminal in batches (rate limit: 30/min)
    const tokensWithPrice: TopVolumeToken[] = [];

    for (let i = 0; i < allTokens.length; i += BATCH_SIZE) {
      const batch = allTokens.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((token) => getTokenPrice(token.address))
      );

      for (let j = 0; j < batch.length; j++) {
        const result = results[j];
        const token = batch[j];
        const price =
          result.status === "fulfilled" && result.value ? result.value : null;

        tokensWithPrice.push({
          ...token,
          price: price?.price ?? 0,
          priceChange24h: price?.priceChange24h ?? 0,
          marketCap: price?.marketCap ?? 0,
          volume24h: price?.volume24h ?? 0,
          liquidity: price?.liquidity ?? 0,
        });
      }

      // Rate limit: wait between batches
      if (i + BATCH_SIZE < allTokens.length) {
        await sleep(BATCH_DELAY);
      }
    }

    // Sort by volume descending
    tokensWithPrice.sort((a, b) => b.volume24h - a.volume24h);

    // Return top 50
    const top50 = tokensWithPrice.slice(0, 50);

    setCache(cacheKey, top50);
    return NextResponse.json(top50);
  } catch (error) {
    console.error("Top volume API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch top volume tokens" },
      { status: 500 }
    );
  }
}
