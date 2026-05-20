import { getCached, setCache } from "./cache";
import type { TokenPrice } from "./types";

const BASE_URL = "https://api.geckoterminal.com/api/v2";
const CACHE_TTL = 60 * 1000; // 1 minute

interface GeckoTokenData {
  id: string;
  attributes: {
    price_usd: string;
    price_change_percentage: {
      h24: string;
    };
    market_cap_usd: string;
    volume_usd: {
      h24: string;
    };
    total_reserve_in_usd: string;
  };
}

interface GeckoPoolData {
  id: string;
  attributes: {
    name: string;
    address: string;
    base_token_price_usd: string;
    quote_token_price_usd: string;
    price_change_percentage: {
      h24: string;
    };
    volume_usd: {
      h24: string;
    };
    reserve_in_usd: string;
    base_token: {
      address: string;
      name: string;
      symbol: string;
    };
  };
}

export async function getTokenPrice(
  tokenAddress: string
): Promise<TokenPrice | null> {
  const cacheKey = `price_${tokenAddress}`;
  const cached = getCached<TokenPrice>(cacheKey, CACHE_TTL);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${BASE_URL}/networks/base/tokens/${tokenAddress}`,
      {
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const token = data.data as GeckoTokenData;

    const price: TokenPrice = {
      price: parseFloat(token.attributes.price_usd) || 0,
      priceChange24h:
        parseFloat(token.attributes.price_change_percentage.h24) || 0,
      marketCap: parseFloat(token.attributes.market_cap_usd) || 0,
      volume24h: parseFloat(token.attributes.volume_usd.h24) || 0,
      liquidity: parseFloat(token.attributes.total_reserve_in_usd) || 0,
    };

    setCache(cacheKey, price);
    return price;
  } catch (error) {
    console.error("GeckoTerminal price error:", error);
    return null;
  }
}

export async function getPoolInfo(poolAddress: string) {
  const cacheKey = `pool_${poolAddress}`;
  const cached = getCached(cacheKey, CACHE_TTL);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${BASE_URL}/networks/base/pools/${poolAddress}`,
      {
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const pool = data.data as GeckoPoolData;

    const poolInfo = {
      name: pool.attributes.name,
      address: pool.attributes.address,
      baseTokenPrice: parseFloat(pool.attributes.base_token_price_usd),
      quoteTokenPrice: parseFloat(pool.attributes.quote_token_price_usd),
      priceChange24h: parseFloat(
        pool.attributes.price_change_percentage.h24
      ),
      volume24h: parseFloat(pool.attributes.volume_usd.h24),
      liquidity: parseFloat(pool.attributes.reserve_in_usd),
      baseToken: pool.attributes.base_token,
    };

    setCache(cacheKey, poolInfo);
    return poolInfo;
  } catch (error) {
    console.error("GeckoTerminal pool error:", error);
    return null;
  }
}

export async function getTopPools(limit: number = 20) {
  const cacheKey = `top_pools_${limit}`;
  const cached = getCached(cacheKey, CACHE_TTL);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${BASE_URL}/networks/base/pools?sort=h24_volume_usd_desc&limit=${limit}`,
      {
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    setCache(cacheKey, data.data);
    return data.data;
  } catch (error) {
    console.error("GeckoTerminal top pools error:", error);
    return null;
  }
}
