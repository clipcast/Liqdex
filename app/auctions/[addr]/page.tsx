"use client";

import { use } from "react";
import { useAuctionDetail } from "@/lib/hooks";
import Loading from "@/components/Loading";
import { ErrorMessage } from "@/components/ErrorBoundary";
import Link from "next/link";

export default function AuctionDetailPage({
  params,
}: {
  params: Promise<{ addr: string }>;
}) {
  const { addr } = use(params);
  const { auction, isLoading, isError } = useAuctionDetail(addr);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading text="Loading auction details..." />
      </div>
    );
  }

  if (isError || !auction) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage
          title="Auction Not Found"
          message="The auction you're looking for doesn't exist or couldn't be loaded."
        />
      </div>
    );
  }

  const statusColor =
    auction.status === "active"
      ? "text-green-400 bg-green-900/30 border-green-800"
      : auction.status === "ended"
      ? "text-gray-400 bg-gray-700/30 border-gray-600"
      : "text-yellow-400 bg-yellow-900/30 border-yellow-800";

  const feeColor =
    auction.currentFee > 50
      ? "text-red-400"
      : auction.currentFee > 20
      ? "text-yellow-400"
      : "text-green-400";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/auctions"
          className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block"
        >
          ← Back to Auctions
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Auction Details</h1>
            <p className="text-gray-400 mt-2 font-mono text-sm">{addr}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium border ${statusColor}`}
          >
            {auction.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <p className="text-sm text-gray-400">Current Fee</p>
          <p className={`text-3xl font-bold ${feeColor}`}>
            {auction.currentFee.toFixed(2)}%
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <p className="text-sm text-gray-400">Round</p>
          <p className="text-3xl font-bold text-white">{auction.round}</p>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <p className="text-sm text-gray-400">Gas Peg</p>
          <p className="text-3xl font-bold text-white">
            {auction.gasPeg ? (
              <span className="text-yellow-400">Active</span>
            ) : (
              <span className="text-gray-500">Inactive</span>
            )}
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <p className="text-sm text-gray-400">Next Block</p>
          <p className="text-3xl font-bold text-white">
            {auction.nextBlock.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Fee Config */}
      {auction.feeConfig && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Fee Configuration
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm text-gray-400">Base Fee</dt>
              <dd className="text-lg font-medium text-white">
                {auction.feeConfig.baseFee.toFixed(2)}%
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-400">Max Fee</dt>
              <dd className="text-lg font-medium text-white">
                {auction.feeConfig.maxFee.toFixed(2)}%
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-400">Duration</dt>
              <dd className="text-lg font-medium text-white">
                {auction.feeConfig.duration} blocks
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Timing */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Timing</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {auction.decayStartTime && (
            <div>
              <dt className="text-sm text-gray-400">Decay Start Time</dt>
              <dd className="text-lg font-medium text-white">
                {new Date(auction.decayStartTime * 1000).toLocaleString()}
              </dd>
            </div>
          )}
          {auction.unlockTime && (
            <div>
              <dt className="text-sm text-gray-400">Pool Unlock Time</dt>
              <dd className="text-lg font-medium text-white">
                {new Date(auction.unlockTime * 1000).toLocaleString()}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Info */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          How This Auction Works
        </h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>• Fees start at max ({auction.feeConfig?.maxFee || 80}%)</li>
          <li>• Fees decrease over {auction.feeConfig?.duration || "~120"} blocks (~2 minutes)</li>
          <li>• Parabolic decay curve for fair price discovery</li>
          <li>• Gas peg activates when network is congested</li>
          <li>• Fee decreases to base level ({auction.feeConfig?.baseFee || 1}%) after auction ends</li>
        </ul>
      </div>
    </div>
  );
}
