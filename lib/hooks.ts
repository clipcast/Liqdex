import useSWR from "swr";
import type {
  TokenListItem,
  TokenInfo,
  TokenPrice,
  AuctionState,
  AuctionDetail,
  PaginatedResponse,
} from "./types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTokens(page: number = 1, pageSize: number = 50) {
  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<TokenListItem>
  >(`/api/tokens?page=${page}&pageSize=${pageSize}`, fetcher, {
    refreshInterval: 30000,
  });

  return {
    tokens: data?.data || [],
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTokenInfo(address: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<TokenInfo>(
    address ? `/api/tokens/${address}` : null,
    fetcher,
    { refreshInterval: 10000 }
  );

  return {
    token: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTokenPrice(address: string | undefined) {
  const { data, error, isLoading } = useSWR<TokenPrice>(
    address ? `/api/tokens/${address}/price` : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  return {
    price: data,
    isLoading,
    isError: error,
  };
}

export function useAuctions() {
  const { data, error, isLoading, mutate } = useSWR<AuctionState[]>(
    "/api/auctions",
    fetcher,
    { refreshInterval: 5000 }
  );

  return {
    auctions: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useAuctionDetail(poolId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<AuctionDetail>(
    poolId ? `/api/auctions/${poolId}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  return {
    auction: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useDashboardStats() {
  const { data, error, isLoading } = useSWR("/api/stats", fetcher, {
    refreshInterval: 60000,
  });

  return {
    stats: data,
    isLoading,
    isError: error,
  };
}
