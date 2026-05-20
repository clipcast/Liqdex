"use client";

import { useTopVolume } from "@/lib/hooks";
import Link from "next/link";
import Loading from "@/components/Loading";

export default function TopVolumePage() {
  const { tokens, isLoading } = useTopVolume();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Top Volume</h1>
        <p className="text-gray-400 mt-2">
          Tokens ranked by 24h trading volume
        </p>
      </div>

      {isLoading ? (
        <Loading text="Loading volume data..." />
      ) : tokens.length === 0 ? (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <p className="text-gray-400 text-lg">No volume data available</p>
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
                {tokens.map((token, index) => (
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
                      <span className="text-sm text-white">
                        {token.volume24h > 0
                          ? `$${token.volume24h.toLocaleString()}`
                          : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-white">
                        {token.price > 0
                          ? `$${token.price.toFixed(6)}`
                          : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-white">
                        {token.marketCap > 0
                          ? `$${token.marketCap.toLocaleString()}`
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
