const ETHERSCAN_V2_URL = "https://api.etherscan.io/v2/api";
const BASE_CHAIN_ID = "8453";

interface BlockTimestamp {
  blockNumber: number;
  timestamp: number;
}

// Cache for block timestamps to avoid repeated API calls
const timestampCache = new Map<string, number>();

export async function getBlockTimestamp(
  blockNumber: number
): Promise<number | null> {
  const cacheKey = blockNumber.toString();
  const cached = timestampCache.get(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.BASESCAN_API_KEY;
  if (!apiKey) {
    console.error("BASESCAN_API_KEY not set");
    return null;
  }

  try {
    const hexBlock = "0x" + blockNumber.toString(16);
    const url = `${ETHERSCAN_V2_URL}?chainid=${BASE_CHAIN_ID}&module=proxy&action=eth_getBlockByNumber&tag=${hexBlock}&boolean=true&apikey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.result && data.result.timestamp) {
      const timestamp = parseInt(data.result.timestamp, 16);
      timestampCache.set(cacheKey, timestamp);
      return timestamp;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching block ${blockNumber} timestamp:`, error);
    return null;
  }
}

export async function getBlockTimestamps(
  blockNumbers: number[]
): Promise<Map<number, number>> {
  const result = new Map<number, number>();
  const uncachedBlocks: number[] = [];

  // Check cache first
  for (const block of blockNumbers) {
    const cacheKey = block.toString();
    const cached = timestampCache.get(cacheKey);
    if (cached) {
      result.set(block, cached);
    } else {
      uncachedBlocks.push(block);
    }
  }

  // Fetch uncached blocks (with rate limiting)
  for (const block of uncachedBlocks) {
    const timestamp = await getBlockTimestamp(block);
    if (timestamp) {
      result.set(block, timestamp);
    }
    // Small delay to respect rate limits (5 calls/sec on free tier)
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return result;
}

export function formatTimestamp(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60);
  const hours = Math.floor(diff / 3600);
  const days = Math.floor(diff / 86400);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}
