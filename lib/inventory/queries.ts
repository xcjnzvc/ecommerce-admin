"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/query-keys";

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  stock_synced_at: string | null;
  cafe24_product_no: number | null;
  shopify_inventory_item_id: number | null;
  status: "정상" | "부족" | "품절" | "동기화오류";
  images: string[] | null;
}

export interface InventoryLog {
  id: string;
  product_name: string;
  change_detail: string;
  modifier: string;
  created_at: string;
}

async function fetchInventory(): Promise<InventoryItem[]> {
  const res = await fetch("/api/inventory");
  if (!res.ok) throw new Error("재고 목록 조회 실패");
  const data = (await res.json()) as { items?: InventoryItem[] };
  return data.items ?? [];
}

async function fetchInventoryLogs(): Promise<InventoryLog[]> {
  const res = await fetch("/api/inventory/logs");
  if (!res.ok) throw new Error("재고 변경 이력 조회 실패");
  const data = (await res.json()) as { logs?: InventoryLog[] };
  return data.logs ?? [];
}

export function useInventory() {
  return useQuery({
    queryKey: queryKeys.inventory,
    queryFn: fetchInventory,
  });
}

export function useInventoryLogs() {
  return useQuery({
    queryKey: queryKeys.inventoryLogs,
    queryFn: fetchInventoryLogs,
  });
}
