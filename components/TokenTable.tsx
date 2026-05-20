"use client";

import Link from "next/link";
import type { TokenListItem } from "@/lib/types";

interface TokenTableProps {
  tokens: TokenListItem[];
  isLoading?: boolean;
}

function formatBlockAge(blockNumber: string): string {
  const block = parseInt(blockNumber);
  if (isNaN(block)) return blockNumber;
  // Approximate age: Base block time ~2s, current block ~54M
  const approxCurrentBlock = 54_000_000;
  const ageSeconds = (approxCurrentBlock - block) * 2;
  const minutes = Math.floor(ageSeconds / 60);
  const hours = Math.floor(ageSeconds / 3600);
  const days = Math.floor(ageSeconds / 86400);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export default function TokenTable({ tokens, isLoading }: TokenTableProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
        <p className="text-gray-400">No tokens found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Token
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Creator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Age
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {tokens.map((token) => (
              <tr
                key={token.address}
                className="hover:bg-gray-750 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {token.image && (
                      <img
                        src={token.image}
                        alt={token.name}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-white">
                        {token.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {token.address.slice(0, 6)}...{token.address.slice(-4)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded">
                    {token.symbol}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-400">
                    {token.creator.slice(0, 6)}...{token.creator.slice(-4)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-400">
                    {formatBlockAge(token.deployTimestamp)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link
                    href={`/tokens/${token.address}`}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
