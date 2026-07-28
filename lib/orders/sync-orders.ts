import { cafe24 } from "@/lib/api/cafe24";
import { shopify } from "@/lib/api/shopify";
import { normalizeCafe24Order } from "@/lib/orders/normalize-cafe24";
import { normalizeShopifyOrder } from "@/lib/orders/normalize-shopify";
import type { Order } from "@/lib/orders/types";
import { upsertOrdersToDb } from "@/lib/orders/upsert-orders";

export interface SyncOrdersResult {
  upsertedCount: number;
  cafe24Count: number;
  shopifyCount: number;
  cafe24Error: string | null;
  shopifyError: string | null;
}

function defaultDateRange(): { startDate: string; endDate: string } {
  const endDate = new Date().toISOString().slice(0, 10);
  const startDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 60)
    .toISOString()
    .slice(0, 10);
  return { startDate, endDate };
}

async function fetchCafe24Orders(
  startDate: string,
  endDate: string,
): Promise<{ orders: Order[]; error: string | null }> {
  try {
    const raw = await cafe24.getOrders({
      startDate,
      endDate,
      dateType: "order_date",
      embed: "items",
    });
    return { orders: raw.map(normalizeCafe24Order), error: null };
  } catch (err) {
    console.error("카페24 주문 동기화 실패:", err);
    const message =
      err && typeof err === "object" && "response" in err
        ? `카페24 주문 조회 실패 (${(err as { response?: { status?: number } }).response?.status ?? "?"})`
        : "카페24 주문 조회 실패";
    return { orders: [], error: message };
  }
}

async function fetchShopifyOrders(
  startDate: string,
  endDate: string,
): Promise<{ orders: Order[]; error: string | null }> {
  try {
    const raw = await shopify.getOrders({
      status: "any",
      createdAtMin: `${startDate}T00:00:00Z`,
      createdAtMax: `${endDate}T23:59:59Z`,
    });
    return { orders: raw.map(normalizeShopifyOrder), error: null };
  } catch (err) {
    console.error("Shopify 주문 동기화 실패:", err);
    return { orders: [], error: "Shopify 주문 조회 실패" };
  }
}

export async function syncOrders(options?: {
  startDate?: string;
  endDate?: string;
}): Promise<SyncOrdersResult> {
  const { startDate, endDate } = {
    ...defaultDateRange(),
    ...options,
  };

  const [cafe24Result, shopifyResult] = await Promise.all([
    fetchCafe24Orders(startDate, endDate),
    fetchShopifyOrders(startDate, endDate),
  ]);

  const orders = [...cafe24Result.orders, ...shopifyResult.orders];

  const upsertedCount = await upsertOrdersToDb(orders);

  return {
    upsertedCount,
    cafe24Count: cafe24Result.orders.length,
    shopifyCount: shopifyResult.orders.length,
    cafe24Error: cafe24Result.error,
    shopifyError: shopifyResult.error,
  };
}
