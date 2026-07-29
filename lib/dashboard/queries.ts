"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  BestSellerItem,
  BestSellerSort,
} from "@/lib/dashboard/best-sellers";
import type { DashboardSummary } from "@/types/dashboard";
import { queryKeys } from "@/lib/react-query/query-keys";

async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch("/api/dashboard/summary");
  if (!res.ok) {
    throw new Error(`대시보드 요약 조회 실패 (${res.status})`);
  }
  return (await res.json()) as DashboardSummary;
}

async function fetchBestSellers(
  sortBy: BestSellerSort,
): Promise<BestSellerItem[]> {
  const res = await fetch(
    `/api/dashboard/best-sellers?sort=${encodeURIComponent(sortBy)}`,
  );
  if (!res.ok) {
    throw new Error(`베스트셀러 조회 실패 (${res.status})`);
  }
  const data = (await res.json()) as { bestSellers?: BestSellerItem[] };
  return data.bestSellers ?? [];
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboardSummary,
    queryFn: fetchDashboardSummary,
  });
}

export function useBestSellers(sortBy: BestSellerSort = "quantity") {
  return useQuery({
    queryKey: queryKeys.bestSellersBySort(sortBy),
    queryFn: () => fetchBestSellers(sortBy),
  });
}
