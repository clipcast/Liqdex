"use client";

import { useTokens, useDashboardStats } from "@/lib/hooks";
import StatsCard from "@/components/StatsCard";
import TokenTable from "@/components/TokenTable";
import Link from "next/link";

export default function DashboardPage() {
  const { tokens, isLoading: tokensLoading } = useTokens(1, 10);
  const { stats, isLoading: statsLoading } = useDashboardStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Liquid Protocol DEX Scanner + Sniper Auction Monitor
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Tokens"
          value={statsLoading ? "..." : stats?.totalTokens || 0}
          subtitle="Deployed on Base"
        />
        <StatsCard
          title="24h Volume"
          value={
            statsLoading
              ? "..."
              : `$${(stats?.volume24h || 0).toLocaleString()}`
          }
          subtitle="All pools"
        />
        <StatsCard
          title="Total Liquidity"
          value={
            statsLoading
              ? "..."
              : `$${(stats?.totalLiquidity || 0).toLocaleString()}`
          }
          subtitle="Locked in pools"
        />
        <StatsCard
          title="Active Auctions"
          value={statsLoading ? "..." : stats?.activeAuctions || 0}
          subtitle="Sniper auctions"
        />
      </div>

      {/* Recent Tokens */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Tokens</h2>
          <Link
            href="/tokens"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            View All →
          </Link>
        </div>
        <TokenTable tokens={tokens} isLoading={tokensLoading} />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/auctions"
          className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-blue-500 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white mb-2">
            Sniper Auctions
          </h3>
          <p className="text-sm text-gray-400">
            Monitor active auctions with descending fees
          </p>
        </Link>

        <Link
          href="/pools"
          className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-blue-500 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white mb-2">
            Uniswap V4 Pools
          </h3>
          <p className="text-sm text-gray-400">
            View all active liquidity pools
          </p>
        </Link>

        <Link
          href="/contracts"
          className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-blue-500 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white mb-2">Contracts</h3>
          <p className="text-sm text-gray-400">
            All 19 Liquid Protocol contracts
          </p>
        </Link>
      </div>
    </div>
  );
}
