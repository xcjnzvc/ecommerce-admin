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

function resolveBuyerName(o: ShopifyOrderListItem): string {
  if (o.billing_address?.name) return o.billing_address.name;
  if (o.shipping_address?.name) return o.shipping_address.name;

  const customer = o.customer;
  if (customer) {
    const fullName = [customer.first_name, customer.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (fullName) return fullName;
  }

  return o.email ?? "";
}

function resolveBuyerPhone(o: ShopifyOrderListItem): string {
  return (
    o.billing_address?.phone ||
    o.shipping_address?.phone ||
    o.customer?.phone ||
    ""
  );
}

export function normalizeShopifyOrder(o: ShopifyOrderListItem): Order {
  const latestFulfillment = o.fulfillments?.[o.fulfillments.length - 1];

  return {
    id: `shopify-${o.id}`,
    channel: "shopify",
    channel_order_id: o.name || String(o.id),
    buyer_name: resolveBuyerName(o),
    buyer_phone: resolveBuyerPhone(o),
    items: (o.line_items ?? []).map((item) => ({
      name: item.title,
      quantity: item.quantity,
    })),
    total_price: Number(o.total_price ?? 0),
    status: normalizeShopifyStatus(o),
    tracking_number: latestFulfillment?.tracking_number ?? null,
    courier_company: latestFulfillment?.tracking_company ?? null,
    created_at: o.created_at,
  };
}
