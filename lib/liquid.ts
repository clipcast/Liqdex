import { createPublicClient, http, PublicClient, Chain } from "viem";
import { base } from "viem/chains";

// Liquid Protocol contract addresses on Base
export const ADDRESSES = {
  FACTORY: "0x04F1a284168743759BE6554f607a10CEBdB77760",
  FEE_LOCKER: "0xF7d3BE3FC0de76fA5550C29A8F6fa53667B876FF",
  EXTENSION_ALLOWLIST: "0xb614167d79aDBaA9BA35d05fE1d5542d7316Ccaa",
  HOOK_DYNAMIC_FEE: "0x80E2F7dC8C2C880BbC4BDF80A5Fb0eB8B1DB68CC",
  HOOK_STATIC_FEE: "0x9811f10Cd549c754Fa9E5785989c422A762c28cc",
  LP_LOCKER: "0x77247fCD1d5e34A3703AcA898A591Dc7422435f3",
  AIRDROP: "0x1423974d48f525462f1c087cBFdCC20BDBc33CdD",
  VAULT: "0xdFCCC93257c20519A9005A2281CFBdF84836d50E",
  DEV_BUY_V4: "0x5934097864dC487D21A7B4e4EEe201A39ceF728D",
  DEV_BUY_V3: "0x376028cfb6b9A120E24Aa14c3FAc4205179c0025",
  PRESALE_ETH: "0x3bca63EcB49d5f917092d10fA879Fdb422740163",
  PRESALE_ALLOWLIST: "0xCBb4ccC4B94E23233c14759f4F9629F7dD01f10B",
  SNIPER_AUCTION: "0x187e8627c02c58F31831953C1268e157d3BfCefd",
  MEV_BLOCK_DELAY: "0x0000000000000000000000000000000000000000",
  MEV_DESCENDING_FEES: "0x0000000000000000000000000000000000000000",
  POOL_MANAGER: "0x498581fF718922c3f8e6A244956aF099B2652b2b",
  WETH: "0x4200000000000000000000000000000000000006",
} as const;

export const CHAIN_ID = 8453;
export const DEFAULT_CHAIN: Chain = base;

let publicClient: PublicClient | null = null;

export function getPublicClient(): PublicClient {
  if (!publicClient) {
    publicClient = createPublicClient({
      chain: DEFAULT_CHAIN,
      transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org"),
    }) as PublicClient;
  }
  return publicClient;
}

// Factory ABI - minimal for reading
export const FACTORY_ABI = [
  {
    name: "getTokens",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "fromBlock", type: "uint256" },
      { name: "toBlock", type: "uint256" },
    ],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "name", type: "string" },
          { name: "symbol", type: "string" },
          { name: "image", type: "string" },
          { name: "poolId", type: "bytes20" },
          { name: "hook", type: "address" },
          { name: "rewardRecipient", type: "address" },
          { name: "creator", type: "address" },
          { name: "deployTimestamp", type: "uint256" },
          { name: "supply", type: "uint256" },
          { name: "metadata", type: "string" },
          { name: "context", type: "string" },
          { name: "rewards", type: "string" },
        ],
      },
    ],
  },
  {
    name: "getTokenEvent",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenAddress", type: "address" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "name", type: "string" },
          { name: "symbol", type: "string" },
          { name: "image", type: "string" },
          { name: "poolId", type: "bytes20" },
          { name: "hook", type: "address" },
          { name: "rewardRecipient", type: "address" },
          { name: "creator", type: "address" },
          { name: "deployTimestamp", type: "uint256" },
          { name: "supply", type: "uint256" },
          { name: "metadata", type: "string" },
          { name: "context", type: "string" },
          { name: "rewards", type: "string" },
        ],
      },
    ],
  },
] as const;

// Sniper Auction ABI
export const AUCTION_ABI = [
  {
    name: "getAuctionState",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "poolId", type: "bytes20" }],
    outputs: [
      { name: "round", type: "uint256" },
      { name: "gasPeg", type: "bool" },
      { name: "currentFee", type: "uint256" },
      { name: "nextBlock", type: "uint256" },
    ],
  },
  {
    name: "getAuctionFeeConfig",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "poolId", type: "bytes20" }],
    outputs: [
      { name: "baseFee", type: "uint256" },
      { name: "maxFee", type: "uint256" },
      { name: "duration", type: "uint256" },
    ],
  },
  {
    name: "getAuctionDecayStartTime",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "poolId", type: "bytes20" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getAuctionMaxRounds",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getPoolUnlockTime",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "poolId", type: "bytes20" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// Pool config ABI
export const POOL_ABI = [
  {
    name: "getPoolConfig",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "poolId", type: "bytes20" }],
    outputs: [
      { name: "hook", type: "address" },
      { name: "fee", type: "uint24" },
      { name: "tickSpacing", type: "int24" },
    ],
  },
  {
    name: "getPoolFeeState",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "poolId", type: "bytes20" }],
    outputs: [
      { name: "fee", type: "uint24" },
      { name: "blockTimestamp", type: "uint256" },
    ],
  },
  {
    name: "isLiquidToken0",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "poolId", type: "bytes20" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

// MEV config ABI
export const MEV_ABI = [
  {
    name: "getMevBlockDelay",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
