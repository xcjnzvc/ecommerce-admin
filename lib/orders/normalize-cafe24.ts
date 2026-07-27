import type { Cafe24OrderListItem } from "@/types/cafe24";
import type { Order } from "./types";

function mapOrderStatus(status?: string): Order["status"] {
  if (!status) return "결제완료";
  if (status.startsWith("C")) return "취소";
  if (status.startsWith("R")) return "반품";
  if (status.startsWith("E")) return "교환";
  if (status === "N30") return "배송중";
  if (status === "N40" || status === "N50") return "배송완료";
  if (["N20", "N21", "N22"].includes(status)) return "배송준비중";
  return "결제완료";
}

export function normalizeCafe24Order(o: Cafe24OrderListItem): Order {
  return {
    id: o.order_id,
    channel: "cafe24",
    channel_order_id: o.order_id,
    buyer_name: o.billing_name ?? o.buyer?.name ?? "",
    buyer_phone: o.buyer?.cellphone || o.buyer?.phone || "",
    items: (o.items ?? []).map((item) => ({
      name: item.product_name,
      quantity: item.quantity,
      product_id: item.product_no,
      price: null,
    })),
    total_price: Number(o.payment_amount ?? 0),
    status: mapOrderStatus(o.order_status),
    tracking_number: null,
    courier_company: null,
    created_at: o.order_date,
  };
}
