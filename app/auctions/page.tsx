"use client";

import { useAuctions, useTokens } from "@/lib/hooks";
import AuctionCard from "@/components/AuctionCard";
import Loading from "@/components/Loading";

export default function AuctionsPage() {
  const { auctions, isLoading: auctionsLoading } = useAuctions();
  const { tokens, isLoading: tokensLoading } = useTokens(1, 100);

  const isLoading = auctionsLoading || tokensLoading;

  // Map token info to auctions
  const auctionsWithTokens = auctions.map((auction) => {
    const token = tokens.find((t) => t.address === auction.round.toString());
    return {
      ...auction,
      tokenName: token?.name,
      tokenSymbol: token?.symbol,
    };
  });

  const activeAuctions = auctionsWithTokens.filter(
    (a) => a.status === "active"
  );
  const endedAuctions = auctionsWithTokens.filter(
    (a) => a.status === "ended"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Sniper Auctions</h1>
        <p className="text-gray-400 mt-2">
          Monitor MEV protection auctions with descending fees
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <p className="text-sm text-gray-400">Active Auctions</p>
          <p className="text-2xl font-bold text-green-400">
            {activeAuctions.length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <p className="text-sm text-gray-400">Ended Auctions</p>
          <p className="text-2xl font-bold text-gray-400">
            {endedAuctions.length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <p className="text-sm text-gray-400">Total Auctions</p>
          <p className="text-2xl font-bold text-white">
            {auctions.length}
          </p>
        </div>
      </div>

      {isLoading ? (
        <Loading text="Loading auctions..." />
      ) : auctions.length === 0 ? (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <p className="text-gray-400 text-lg">No active auctions</p>
          <p className="text-sm text-gray-500 mt-2">
            Auctions start when new tokens are deployed
          </p>
        </div>
      ) : (
        <>
          {/* Active Auctions */}
          {activeAuctions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                Active Auctions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeAuctions.map((auction, i) => (
                  <AuctionCard key={i} auction={auction} />
                ))}
              </div>
            </div>
          )}

          {/* Ended Auctions */}
          {endedAuctions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Ended Auctions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {endedAuctions.map((auction, i) => (
                  <AuctionCard key={i} auction={auction} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Info */}
      <div className="mt-12 bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          How Sniper Auctions Work
        </h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>
            • Fees start at max (up to 80%) and decrease over ~2 minutes
          </li>
          <li>• Parabolic decay curve for fair price discovery</li>
          <li>• Protects against MEV bots and snipers</li>
          <li>• Fee decreases to normal level after auction ends</li>
        </ul>
      </div>
    </div>
  );
}
