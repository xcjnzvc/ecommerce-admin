import type { ShopifyOrderListItem } from "@/types/shopify";
import type { Order } from "./types";

function normalizeShopifyStatus(o: ShopifyOrderListItem): Order["status"] {
  if (o.cancelled_at) return "취소";
  if (o.financial_status === "refunded") return "반품";
  if (o.fulfillment_status === "fulfilled") return "배송완료";
  if (o.fulfillment_status === "partial") return "배송중";
  if (o.financial_status === "paid" && !o.fulfillment_status) {
    return "결제완료";
  }
  return "결제완료";
}

export function normalizeShopifyOrder(o: ShopifyOrderListItem): Order {
  const latestFulfillment = o.fulfillments?.[o.fulfillments.length - 1];

  return {
    id: `shopify-${o.id}`,
    channel: "shopify",
    channel_order_id: o.name || String(o.id),
    items: (o.line_items ?? []).map((item) => ({
      name: item.title,
      quantity: item.quantity,
      product_id: item.product_id ?? null,
      price: item.price != null ? Number(item.price) : null,
    })),
    total_price: Number(o.total_price ?? 0),
    status: normalizeShopifyStatus(o),
    tracking_number: latestFulfillment?.tracking_number ?? null,
    courier_company: latestFulfillment?.tracking_company ?? null,
    created_at: o.created_at,
  };
}
