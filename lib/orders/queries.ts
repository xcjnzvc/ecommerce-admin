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

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: fetchOrders,
  });
}
