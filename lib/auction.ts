import { getPublicClient, ADDRESSES, AUCTION_ABI } from "./liquid";
import { getCached, setCache } from "./cache";
import type { AuctionState, AuctionFeeConfig } from "./types";

const CACHE_TTL = 5 * 1000; // 5 seconds for real-time auction data

export async function getAuctionState(
  poolId: string
): Promise<AuctionState | null> {
  const cacheKey = `auction_state_${poolId}`;
  const cached = getCached<AuctionState>(cacheKey, CACHE_TTL);
  if (cached) return cached;

  try {
    const client = getPublicClient();
    const result = await client.readContract({
      address: ADDRESSES.SNIPER_AUCTION as `0x${string}`,
      abi: AUCTION_ABI,
      functionName: "getAuctionState",
      args: [poolId as `0x${string}`],
    });

    const [round, gasPeg, currentFee, nextBlock] = result as [
      bigint,
      boolean,
      bigint,
      bigint
    ];

    const blockNumber = await client.getBlockNumber();
    const isActive = Number(nextBlock) > Number(blockNumber);
    const isEnded = !isActive && Number(round) > 0;

    const state: AuctionState = {
      round: Number(round),
      gasPeg,
      currentFee: Number(currentFee) / 10000, // Convert from basis points
      nextBlock: Number(nextBlock),
      status: isActive ? "active" : isEnded ? "ended" : "upcoming",
    };

    setCache(cacheKey, state);
    return state;
  } catch (error) {
    console.error("Auction state error:", error);
    return null;
  }
}

export async function getAuctionFeeConfig(
  poolId: string
): Promise<AuctionFeeConfig | null> {
  const cacheKey = `auction_fee_${poolId}`;
  const cached = getCached<AuctionFeeConfig>(cacheKey, CACHE_TTL * 10);
  if (cached) return cached;

  try {
    const client = getPublicClient();
    const result = await client.readContract({
      address: ADDRESSES.SNIPER_AUCTION as `0x${string}`,
      abi: AUCTION_ABI,
      functionName: "getAuctionFeeConfig",
      args: [poolId as `0x${string}`],
    });

    const [baseFee, maxFee, duration] = result as [bigint, bigint, bigint];

    const config: AuctionFeeConfig = {
      baseFee: Number(baseFee) / 10000,
      maxFee: Number(maxFee) / 10000,
      duration: Number(duration),
    };

    setCache(cacheKey, config);
    return config;
  } catch (error) {
    console.error("Auction fee config error:", error);
    return null;
  }
}

export async function getAuctionDecayStartTime(
  poolId: string
): Promise<number | null> {
  const cacheKey = `auction_decay_${poolId}`;
  const cached = getCached<number>(cacheKey, CACHE_TTL * 10);
  if (cached) return cached;

  try {
    const client = getPublicClient();
    const result = await client.readContract({
      address: ADDRESSES.SNIPER_AUCTION as `0x${string}`,
      abi: AUCTION_ABI,
      functionName: "getAuctionDecayStartTime",
      args: [poolId as `0x${string}`],
    });

    const timestamp = Number(result);
    setCache(cacheKey, timestamp);
    return timestamp;
  } catch (error) {
    console.error("Auction decay start time error:", error);
    return null;
  }
}

export async function getAuctionMaxRounds(): Promise<number | null> {
  const cacheKey = "auction_max_rounds";
  const cached = getCached<number>(cacheKey, 60 * 1000);
  if (cached) return cached;

  try {
    const client = getPublicClient();
    const result = await client.readContract({
      address: ADDRESSES.SNIPER_AUCTION as `0x${string}`,
      abi: AUCTION_ABI,
      functionName: "getAuctionMaxRounds",
      args: [],
    });

    const maxRounds = Number(result);
    setCache(cacheKey, maxRounds);
    return maxRounds;
  } catch (error) {
    console.error("Auction max rounds error:", error);
    return null;
  }
}

export async function getPoolUnlockTime(
  poolId: string
): Promise<number | null> {
  const cacheKey = `pool_unlock_${poolId}`;
  const cached = getCached<number>(cacheKey, CACHE_TTL * 10);
  if (cached) return cached;

  try {
    const client = getPublicClient();
    const result = await client.readContract({
      address: ADDRESSES.SNIPER_AUCTION as `0x${string}`,
      abi: AUCTION_ABI,
      functionName: "getPoolUnlockTime",
      args: [poolId as `0x${string}`],
    });

    const timestamp = Number(result);
    setCache(cacheKey, timestamp);
    return timestamp;
  } catch (error) {
    console.error("Pool unlock time error:", error);
    return null;
  }
}
