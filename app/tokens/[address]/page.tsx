"use client";

import { use } from "react";
import { useTokenInfo } from "@/lib/hooks";
import Loading from "@/components/Loading";
import { ErrorMessage } from "@/components/ErrorBoundary";
import Link from "next/link";

export default function TokenDetailPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  const { token, isLoading, isError } = useTokenInfo(address);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading text="Loading token details..." />
      </div>
    );
  }

  if (isError || !token) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage
          title="Token Not Found"
          message="The token you're looking for doesn't exist or couldn't be loaded."
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/tokens"
          className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block"
        >
          ← Back to Tokens
        </Link>

        <div className="flex items-center gap-4">
          {token.image && (
            <img
              src={token.image}
              alt={token.name}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-white">{token.name}</h1>
            <span className="text-lg text-gray-400 bg-gray-800 px-3 py-1 rounded">
              {token.symbol}
            </span>
          </div>
        </div>
      </div>

      {/* Token Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Token Details
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-400">Address</dt>
              <dd className="text-white font-mono text-sm">
                {token.poolId}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Supply</dt>
              <dd className="text-white">
                {(Number(token.supply) / 1e18).toLocaleString()} tokens
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Creator</dt>
              <dd className="text-white font-mono text-sm">
                {token.creator}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Deployed</dt>
              <dd className="text-white text-sm">
                {Number(token.deployTimestamp) > 1_000_000_000
                  ? new Date(Number(token.deployTimestamp) * 1000).toLocaleString()
                  : `Block #${Number(token.deployTimestamp).toLocaleString()}`
                }
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Pool Configuration
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-400">Hook</dt>
              <dd className="text-white font-mono text-sm">
                {token.hook.slice(0, 10)}...{token.hook.slice(-8)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Reward Recipient</dt>
              <dd className="text-white font-mono text-sm">
                {token.rewardRecipient.slice(0, 10)}...
                {token.rewardRecipient.slice(-8)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Metadata */}
      {token.metadata && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Metadata</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{token.metadata}</p>
        </div>
      )}

      {/* Context */}
      {token.context && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Context</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{token.context}</p>
        </div>
      )}

      {/* Extensions */}
      {token.extensions.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Extensions</h3>
          <div className="flex flex-wrap gap-2">
            {token.extensions.map((ext, i) => (
              <span
                key={i}
                className="bg-gray-700 text-gray-300 px-3 py-1 rounded text-sm"
              >
                {ext}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
