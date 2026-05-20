"use client";

import { usePools } from "@/lib/hooks";
import Link from "next/link";
import Loading from "@/components/Loading";

export default function PoolsPage() {
  const { pools, isLoading } = usePools();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Uniswap V4 Pools</h1>
        <p className="text-gray-400 mt-2">
          All liquidity pools created via Liquid Protocol
        </p>
      </div>

      {/* Stats */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <span className="text-sm text-gray-400">
          {pools.length} pools
        </span>
      </div>

      {isLoading ? (
        <Loading text="Loading pools..." />
      ) : pools.length === 0 ? (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <p className="text-gray-400 text-lg">No pools found</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Pool ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Hook
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Pair
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Liquidity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Volume 24h
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {pools.map((pool) => (
                  <tr
                    key={pool.address}
                    className="hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/tokens/${pool.address}`}
                        className="flex items-center hover:text-blue-400"
                      >
                        {pool.image && (
                          <img
                            src={pool.image}
                            alt={pool.name}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-white">
                            {pool.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {pool.symbol}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-400 font-mono">
                        {pool.poolId.slice(0, 10)}...{pool.poolId.slice(-6)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-400 font-mono">
                        {pool.hook.slice(0, 8)}...{pool.hook.slice(-6)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded">
                        WETH
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-white">
                        {pool.liquidity > 0
                          ? `$${pool.liquidity.toLocaleString()}`
                          : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-white">
                        {pool.volume24h > 0
                          ? `$${pool.volume24h.toLocaleString()}`
                          : "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
