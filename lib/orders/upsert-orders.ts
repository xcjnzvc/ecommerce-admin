import { createAdminClient } from "@/lib/supabase/admin";
import { orderToRow } from "@/lib/orders/db";
import type { Order } from "@/lib/orders/types";

export async function upsertOrdersToDb(orders: Order[]): Promise<number> {
  if (orders.length === 0) return 0;

  const syncedAt = new Date().toISOString();
  const rows = orders.map((order) => ({
    ...orderToRow(order),
    synced_at: syncedAt,
  }));

  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").upsert(rows, {
    onConflict: "id",
  });

  if (error) {
    throw new Error(`주문 upsert 실패: ${error.message}`);
  }

  return rows.length;
}

export async function upsertOrderToDb(order: Order): Promise<void> {
  await upsertOrdersToDb([order]);
}
