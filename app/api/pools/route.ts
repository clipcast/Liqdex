import { NextResponse } from "next/server";
import { scanAllTokens } from "@/lib/scanner";
import { getCached, setCache } from "@/lib/cache";
import { getTokenPrice } from "@/lib/geckoterminal";
import type { PoolListItem } from "@/lib/types";

const CACHE_TTL = 5 * 60 * 1000;
const BATCH_SIZE = 5;
const BATCH_DELAY = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET() {
  try {
    const cacheKey = "pools_list";
    const cached = getCached<PoolListItem[]>(cacheKey, CACHE_TTL);
    if (cached) {
      return NextResponse.json(cached);
    }

    const allTokens = await scanAllTokens();

    // Fetch price/volume data from GeckoTerminal in batches
    const poolsWithPrice: PoolListItem[] = [];

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

        poolsWithPrice.push({
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          image: token.image,
          poolId: token.poolId,
          hook: token.hook,
          creator: token.creator,
          deployTimestamp: token.blockNumber.toString(),
          liquidity: price?.liquidity ?? 0,
          volume24h: price?.volume24h ?? 0,
          priceChange24h: price?.priceChange24h ?? 0,
        });
      }

      if (i + BATCH_SIZE < allTokens.length) {
        await sleep(BATCH_DELAY);
      }
    }

    // Sort by liquidity descending
    poolsWithPrice.sort((a, b) => b.liquidity - a.liquidity);

    setCache(cacheKey, poolsWithPrice, CACHE_TTL);
    return NextResponse.json(poolsWithPrice);
  } catch (error) {
    console.error("Pools API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pools" },
      { status: 500 }
    );
  }
}
