import type { Order, OrderItem } from "@/lib/orders/types";
import { isInternalOrderStatus } from "@/lib/orders/types";

export interface OrderRow {
  id: string;
  channel: "cafe24" | "shopify";
  channel_order_id: string;
  items: OrderItem[];
  total_price: number;
  status: string;
  tracking_number: string | null;
  courier_company: string | null;
  created_at: string;
  synced_at?: string;
}

export function orderToRow(order: Order): Omit<OrderRow, "synced_at"> {
  return {
    id: order.id,
    channel: order.channel,
    channel_order_id: order.channel_order_id,
    items: order.items,
    total_price: order.total_price,
    status: order.status,
    tracking_number: order.tracking_number,
    courier_company: order.courier_company,
    created_at: order.created_at,
  };
}

export function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    channel: row.channel,
    channel_order_id: row.channel_order_id,
    items: Array.isArray(row.items) ? row.items : [],
    total_price: Number(row.total_price),
    status: isInternalOrderStatus(row.status) ? row.status : "결제완료",
    tracking_number: row.tracking_number,
    courier_company: row.courier_company,
    created_at: row.created_at,
  };
}
