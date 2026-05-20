"use client";

import { useTokens } from "@/lib/hooks";
import Link from "next/link";

export default function TopVolumePage() {
  const { tokens, isLoading } = useTokens(1, 100);

  // Sort by deploy timestamp for now (will be volume when GeckoTerminal integration is complete)
  const sortedTokens = [...tokens].sort(
    (a, b) => Number(b.deployTimestamp) - Number(a.deployTimestamp)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Top Volume</h1>
        <p className="text-gray-400 mt-2">
          Tokens ranked by 24h trading volume
        </p>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    24h Volume
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Market Cap
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sortedTokens.map((token, index) => (
                  <tr
                    key={token.address}
                    className="hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-400">#{index + 1}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/tokens/${token.address}`}
                        className="flex items-center hover:text-blue-400"
                      >
                        {token.image && (
                          <img
                            src={token.image}
                            alt={token.name}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        )}
                        <span className="text-sm font-medium text-white">
                          {token.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded">
                        {token.symbol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-white">-</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-white">-</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-white">-</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Volume data from GeckoTerminal (coming soon)
        </p>
      </div>
    </div>
  );
}
