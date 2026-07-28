"use client";

import { useQuery } from "@tanstack/react-query";
import {
  isInternalOrderStatus,
  type Order,
} from "@/lib/orders/types";
import { queryKeys } from "@/lib/react-query/query-keys";

function normalizeOrder(raw: Order): Order {
  return {
    ...raw,
    status: isInternalOrderStatus(raw.status) ? raw.status : "결제완료",
    items: raw.items ?? [],
  };
}

async function fetchOrders(): Promise<Order[]> {
  const res = await fetch("/api/orders");
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("주문 목록 조회 실패", res.status, body);
    throw new Error(`주문 목록 조회 실패 (${res.status})`);
  }
  const data = (await res.json()) as { orders?: Order[] };
  return (data.orders ?? [])
    .map(normalizeOrder)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
}

async function fetchOrderDetail(id: string): Promise<Order> {
  const res = await fetch(`/api/orders/${encodeURIComponent(id)}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `주문 상세 조회 실패 (${res.status})`);
  }
  const data = (await res.json()) as { order?: Order };
  if (!data.order) {
    throw new Error("주문 상세 응답이 비어 있습니다.");
  }
  return normalizeOrder(data.order);
}

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: fetchOrders,
  });
}

export function useOrderDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.orderDetail(id ?? ""),
    queryFn: () => fetchOrderDetail(id!),
    enabled: Boolean(id),
  });
}
