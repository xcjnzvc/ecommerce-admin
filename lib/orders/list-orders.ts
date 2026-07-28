import { createAdminClient } from "@/lib/supabase/admin";
import { rowToOrder, type OrderRow } from "@/lib/orders/db";
import type { Order } from "@/lib/orders/types";

export async function listOrdersFromDb(options?: {
  startDate?: string;
  endDate?: string;
}): Promise<Order[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select(
      "id, channel, channel_order_id, items, total_price, status, tracking_number, courier_company, created_at",
    )
    .order("created_at", { ascending: false });

  if (options?.startDate) {
    query = query.gte("created_at", `${options.startDate}T00:00:00.000Z`);
  }
  if (options?.endDate) {
    query = query.lte("created_at", `${options.endDate}T23:59:59.999Z`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`주문 DB 조회 실패: ${error.message}`);
  }

  return ((data ?? []) as OrderRow[]).map(rowToOrder);
}

export async function hasCafe24OrdersInDb(): Promise<boolean> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("channel", "cafe24");

  if (error) {
    console.error("카페24 주문 존재 여부 조회 실패:", error);
    return false;
  }
  return (count ?? 0) > 0;
}
