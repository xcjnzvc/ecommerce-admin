export const INTERNAL_ORDER_STATUSES = [
  "결제완료",
  "배송준비중",
  "배송중",
  "배송완료",
  "취소",
  "반품",
  "교환",
] as const;

export type InternalOrderStatus = (typeof INTERNAL_ORDER_STATUSES)[number];

export interface OrderItem {
  name: string;
  quantity: number;
  /** 카페24: product_no, 쇼피파이: product_id */
  product_id: string | number | null;
  /** 단가. 카페24는 미지원(null), 쇼피파이는 line_item.price */
  price: number | null;
}

export interface Order {
  id: string;
  channel: "cafe24" | "shopify";
  channel_order_id: string;
  buyer_name: string;
  buyer_phone: string;
  items: OrderItem[];
  total_price: number;
  status: InternalOrderStatus;
  tracking_number: string | null;
  courier_company: string | null;
  created_at: string;
}

export function isInternalOrderStatus(
  value: string,
): value is InternalOrderStatus {
  return (INTERNAL_ORDER_STATUSES as readonly string[]).includes(value);
}
