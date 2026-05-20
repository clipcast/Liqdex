"use client";

import { useState } from "react";
import { useTokens } from "@/lib/hooks";
import TokenTable from "@/components/TokenTable";

export default function TokensPage() {
  const [page, setPage] = useState(1);
  const { tokens, total, hasMore, isLoading } = useTokens(page, 50);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Tokens</h1>
        <p className="text-gray-400 mt-2">
          All tokens deployed via Liquid Protocol on Base
        </p>
      </div>

      {/* Stats */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Total: {total.toLocaleString()} tokens
          </span>
          <span className="text-sm text-gray-400">
            Page {page} of {Math.ceil(total / 50)}
          </span>
        </div>
      </div>

      {/* Token Table */}
      <TokenTable tokens={tokens} isLoading={isLoading} />

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <span className="text-sm text-gray-400">
          Page {page}
        </span>

        <button
          onClick={() => setPage((p) => (hasMore ? p + 1 : p))}
          disabled={!hasMore}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
