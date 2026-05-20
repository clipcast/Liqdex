import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { LiquidSDK } from "liquid-sdk";
import { getCached, setCache } from "./cache";

export const DEPLOY_BLOCK = BigInt(43327823);
const CHUNK_SIZE = BigInt(50000); // Smaller chunks to avoid RPC timeout
const CONCURRENCY = 3; // Parallel chunk scans
const TOKEN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface ScannedToken {
  address: string;
  name: string;
  symbol: string;
  image: string;
  poolId: string;
  hook: string;
  creator: string;
  blockNumber: bigint;
}

function createSDK() {
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org"),
  });
  return new LiquidSDK({ publicClient });
}

export function getPublicClient() {
  return createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org"),
  });
}

async function scanChunk(
  sdk: ReturnType<typeof createSDK>,
  fromBlock: bigint,
  toBlock: bigint
): Promise<ScannedToken[]> {
  try {
    const tokens = await sdk.getTokens({ fromBlock, toBlock });
    return tokens.map((token) => ({
      address: token.tokenAddress,
      name: token.tokenName,
      symbol: token.tokenSymbol,
      image: token.tokenImage,
      poolId: token.poolId,
      hook: token.poolHook,
      creator: token.msgSender,
      blockNumber: token.blockNumber ?? BigInt(0),
    }));
  } catch (error) {
    console.error(`Chunk ${fromBlock}-${toBlock} failed:`, error);
    return [];
  }
}

export async function scanAllTokens(): Promise<ScannedToken[]> {
  // Check cache first
  const cached = getCached<ScannedToken[]>("all_tokens", TOKEN_CACHE_TTL);
  if (cached) return cached;

  const sdk = createSDK();
  const publicClient = getPublicClient();
  const currentBlock = await publicClient.getBlockNumber();

  // Build chunk ranges
  const chunks: { from: bigint; to: bigint }[] = [];
  let fromBlock = DEPLOY_BLOCK;

  while (fromBlock < currentBlock) {
    const toBlock =
      fromBlock + CHUNK_SIZE > currentBlock
        ? currentBlock
        : fromBlock + CHUNK_SIZE;
    chunks.push({ from: fromBlock, to: toBlock });
    fromBlock = toBlock + BigInt(1);
  }

  // Scan in parallel with concurrency limit
  const allTokens: ScannedToken[] = [];

  for (let i = 0; i < chunks.length; i += CONCURRENCY) {
    const batch = chunks.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map((chunk) => scanChunk(sdk, chunk.from, chunk.to))
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        allTokens.push(...result.value);
      }
    }
  }

  // Sort by block number (newest first)
  allTokens.sort((a, b) => Number(b.blockNumber - a.blockNumber));

  // Cache the result
  setCache("all_tokens", allTokens, TOKEN_CACHE_TTL);

  return allTokens;
}
