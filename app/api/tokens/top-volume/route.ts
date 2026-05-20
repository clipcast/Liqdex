import { NextResponse } from "next/server";
import { scanAllTokens } from "@/lib/scanner";
import { getCached, setCache } from "@/lib/cache";
import { getTokenPrice } from "@/lib/geckoterminal";
import type { TopVolumeToken } from "@/lib/types";

const CACHE_TTL = 5 * 60 * 1000;
const BATCH_SIZE = 5;
const BATCH_DELAY = 2000;

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

    const allTokens = await scanAllTokens();

    // Fetch price data from GeckoTerminal in batches
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
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          image: token.image,
          creator: token.creator,
          deployTimestamp: token.blockNumber.toString(),
          price: price?.price ?? 0,
          priceChange24h: price?.priceChange24h ?? 0,
          marketCap: price?.marketCap ?? 0,
          volume24h: price?.volume24h ?? 0,
          liquidity: price?.liquidity ?? 0,
        });
      }

      if (i + BATCH_SIZE < allTokens.length) {
        await sleep(BATCH_DELAY);
      }
    }

    // Sort by volume descending
    tokensWithPrice.sort((a, b) => b.volume24h - a.volume24h);

    // Return top 50
    const top50 = tokensWithPrice.slice(0, 50);

    setCache(cacheKey, top50, CACHE_TTL);
    return NextResponse.json(top50);
  } catch (error) {
    console.error("Top volume API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch top volume tokens" },
      { status: 500 }
    );
  }
}
