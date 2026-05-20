export interface TokenInfo {
  name: string;
  symbol: string;
  image: string;
  poolId: string;
  hook: string;
  rewardRecipient: string;
  creator: string;
  deployTimestamp: string;
  supply: string;
  metadata: string;
  context: string;
  extensions: string[];
}

export interface TokenListItem {
  address: string;
  name: string;
  symbol: string;
  image: string;
  creator: string;
  deployTimestamp: string;
}

export interface TokenPrice {
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
}

export interface AuctionState {
  round: number;
  gasPeg: boolean;
  currentFee: number;
  nextBlock: number;
  status: "active" | "ended" | "upcoming";
}

export interface AuctionDetail extends AuctionState {
  feeConfig: AuctionFeeConfig;
  decayStartTime: number | null;
  unlockTime: number | null;
}

export interface AuctionFeeConfig {
  baseFee: number;
  maxFee: number;
  duration: number;
}

export interface PoolConfig {
  hook: string;
  fee: number;
  tickSpacing: number;
}

export interface PoolFeeState {
  fee: number;
  blockTimestamp: bigint;
}

export interface ContractInfo {
  name: string;
  address: string;
  category: string;
  description: string;
}

export interface DashboardStats {
  totalTokens: number;
  volume24h: number;
  totalLiquidity: number;
  activeAuctions: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
