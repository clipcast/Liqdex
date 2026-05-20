"use client";

import Link from "next/link";
import type { TokenListItem } from "@/lib/types";

interface TokenTableProps {
  tokens: TokenListItem[];
  isLoading?: boolean;
}

function formatAge(timestampStr: string): string {
  const timestamp = parseInt(timestampStr);
  if (isNaN(timestamp)) return timestampStr;

  // Check if it's a Unix timestamp (seconds since epoch) or block number
  // Unix timestamps for 2024+ are > 1.7 billion
  // Block numbers on Base are ~54 million
  if (timestamp < 1_000_000_000) {
    // It's likely a block number, use approximation
    const approxCurrentBlock = 54_000_000;
    const ageSeconds = (approxCurrentBlock - timestamp) * 2;
    const minutes = Math.floor(ageSeconds / 60);
    const hours = Math.floor(ageSeconds / 3600);
    const days = Math.floor(ageSeconds / 86400);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "just now";
  }

  // It's a Unix timestamp
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Age
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-400 font-mono">
                    {token.creator.slice(0, 6)}...{token.creator.slice(-4)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm text-gray-400">
                    {formatAge(token.deployTimestamp)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
