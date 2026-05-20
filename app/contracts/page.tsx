"use client";

import { ADDRESSES } from "@/lib/liquid";

interface ContractEntry {
  name: string;
  address: string;
  category: string;
  description: string;
}

const contracts: ContractEntry[] = [
  {
    name: "Liquid (Factory)",
    address: ADDRESSES.FACTORY,
    category: "Core",
    description: "Token factory - orchestrates deployment, pool init, and module coordination",
  },
  {
    name: "LiquidFeeLocker",
    address: ADDRESSES.FEE_LOCKER,
    category: "Core",
    description: "Escrow for LP fees with per-depositor allowlist",
  },
  {
    name: "LiquidPoolExtensionAllowlist",
    address: ADDRESSES.EXTENSION_ALLOWLIST,
    category: "Core",
    description: "Per-pool extension allowlist management",
  },
  {
    name: "LiquidHookDynamicFeeV2",
    address: ADDRESSES.HOOK_DYNAMIC_FEE,
    category: "Hooks",
    description: "Dynamic fee hook - adaptive fees based on market conditions",
  },
  {
    name: "LiquidHookStaticFeeV2",
    address: ADDRESSES.HOOK_STATIC_FEE,
    category: "Hooks",
    description: "Static fee hook - fixed 1% fee on buy/sell",
  },
  {
    name: "LiquidLpLockerFeeConversion",
    address: ADDRESSES.LP_LOCKER,
    category: "LP Lockers",
    description: "LP locker with fee conversion to ETH",
  },
  {
    name: "LiquidAirdropV2",
    address: ADDRESSES.AIRDROP,
    category: "Extensions",
    description: "Merkle tree airdrop for token distribution",
  },
  {
    name: "LiquidVault",
    address: ADDRESSES.VAULT,
    category: "Extensions",
    description: "Linear token vesting with configurable duration",
  },
  {
    name: "LiquidUniv4EthDevBuy",
    address: ADDRESSES.DEV_BUY_V4,
    category: "Extensions",
    description: "Dev buy extension for Uniswap V4 pools",
  },
  {
    name: "LiquidUniv3EthDevBuy",
    address: ADDRESSES.DEV_BUY_V3,
    category: "Extensions",
    description: "Dev buy extension for Uniswap V3 pools",
  },
  {
    name: "LiquidPresaleEthToCreator",
    address: ADDRESSES.PRESALE_ETH,
    category: "Extensions",
    description: "Presale extension - ETH sent to creator",
  },
  {
    name: "LiquidPresaleAllowlist",
    address: ADDRESSES.PRESALE_ALLOWLIST,
    category: "Extensions",
    description: "Presale with allowlist for restricted participation",
  },
  {
    name: "LiquidSniperAuctionV2",
    address: ADDRESSES.SNIPER_AUCTION,
    category: "MEV Modules",
    description: "Descending fee auction for MEV protection",
  },
  {
    name: "PoolManager (Uniswap V4)",
    address: ADDRESSES.POOL_MANAGER,
    category: "External",
    description: "Uniswap V4 pool manager on Base",
  },
  {
    name: "WETH",
    address: ADDRESSES.WETH,
    category: "External",
    description: "Wrapped ETH on Base",
  },
];

const categories = [...new Set(contracts.map((c) => c.category))];

export default function ContractsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Contracts</h1>
        <p className="text-gray-400 mt-2">
          All Liquid Protocol contracts deployed on Base
        </p>
      </div>

      {/* Stats */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <span className="text-sm text-gray-400">
          {contracts.length} contracts across {categories.length} categories
        </span>
      </div>

      {/* Contracts by Category */}
      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">{category}</h2>
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-700">
              {contracts
                .filter((c) => c.category === category)
                .map((contract) => (
                  <div
                    key={contract.address}
                    className="p-4 hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-white">
                          {contract.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {contract.description}
                        </p>
                      </div>
                      <a
                        href={`https://basescan.org/address/${contract.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm font-mono ml-4 flex-shrink-0"
                      >
                        {contract.address.slice(0, 8)}...
                        {contract.address.slice(-6)}
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}

      {/* BaseScan Link */}
      <div className="mt-8 text-center">
        <a
          href="https://basescan.org/address/0x04F1a284168743759BE6554f607a10CEBdB77760"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          View Factory on BaseScan →
        </a>
      </div>
    </div>
  );
}
