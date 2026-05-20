"use client";

import Link from "next/link";
import type { AuctionState } from "@/lib/types";

interface AuctionCardProps {
  auction: AuctionState;
  poolId?: string;
  tokenName?: string;
  tokenSymbol?: string;
}

export default function AuctionCard({
  auction,
  poolId,
  tokenName,
  tokenSymbol,
}: AuctionCardProps) {
  const statusColor =
    auction.status === "active"
      ? "bg-green-900/30 text-green-400 border-green-800"
      : auction.status === "ended"
      ? "bg-gray-700/30 text-gray-400 border-gray-600"
      : "bg-yellow-900/30 text-yellow-400 border-yellow-800";

  const feeColor =
    auction.currentFee > 50
      ? "text-red-400"
      : auction.currentFee > 20
      ? "text-yellow-400"
      : "text-green-400";

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          {tokenName && (
            <h3 className="text-lg font-semibold text-white">{tokenName}</h3>
          )}
          {tokenSymbol && (
            <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
              {tokenSymbol}
            </span>
          )}
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}
        >
          {auction.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-400">Current Fee</p>
          <p className={`text-xl font-bold ${feeColor}`}>
            {auction.currentFee.toFixed(2)}%
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-400">Round</p>
          <p className="text-xl font-bold text-white">{auction.round}</p>
        </div>

        <div>
          <p className="text-sm text-gray-400">Gas Peg</p>
          <p className="text-sm text-white">
            {auction.gasPeg ? (
              <span className="text-yellow-400">Active</span>
            ) : (
              <span className="text-gray-500">Inactive</span>
            )}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-400">Next Block</p>
          <p className="text-sm text-white">
            {auction.nextBlock.toLocaleString()}
          </p>
        </div>
      </div>

      {poolId && (
        <Link
          href={`/auctions/${poolId}`}
          className="block text-center text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          View Details →
        </Link>
      )}
    </div>
  );
}
