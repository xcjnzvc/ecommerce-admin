import { cafe24 } from "@/lib/api/cafe24";
import { shopify } from "@/lib/api/shopify";
import { createAdminClient } from "@/lib/supabase/admin";
import { rowToOrder, type OrderRow } from "@/lib/orders/db";
import { normalizeCafe24Order } from "@/lib/orders/normalize-cafe24";
import { normalizeShopifyOrder } from "@/lib/orders/normalize-shopify";
import type { Order } from "@/lib/orders/types";

async function getOrderFromDb(id: string): Promise<Order | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, channel, channel_order_id, items, total_price, status, tracking_number, courier_company, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`주문 DB 조회 실패: ${error.message}`);
  }
  if (!data) return null;
  return rowToOrder(data as OrderRow);
}

async function fetchOrderFromChannel(dbOrder: Order): Promise<Order> {
  if (dbOrder.channel === "shopify") {
    const shopifyId = Number(dbOrder.id.replace(/^shopify-/, ""));
    if (!Number.isFinite(shopifyId)) {
      throw new Error(`잘못된 Shopify 주문 ID: ${dbOrder.id}`);
    }
    const raw = await shopify.getOrder(shopifyId);
    return normalizeShopifyOrder(raw);
  }

  const raw = await cafe24.getOrder(dbOrder.channel_order_id);
  return normalizeCafe24Order(raw);
}

/**
 * DB에서 채널을 확인한 뒤 채널 Admin API로 최신 상세를 조회한다.
 * 채널 조회 실패 시 DB 미러 데이터로 폴백한다.
 */
export async function getOrderDetail(id: string): Promise<Order | null> {
  const dbOrder = await getOrderFromDb(id);
  if (!dbOrder) return null;

  try {
    return await fetchOrderFromChannel(dbOrder);
  } catch (error) {
    console.error("채널 주문 상세 조회 실패, DB 데이터로 폴백:", error);
    return dbOrder;
  }
}
