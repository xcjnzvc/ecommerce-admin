export interface Cafe24OrderListItem {
  order_id: string;
}

export interface Cafe24OrderItem {
  product_no: number;
  product_code: string;
  quantity: number;
}

export interface Cafe24ProductDetail {
  product_no: number;
  quantity: number;
}

// 재고에 영향을 주는 주문 이벤트 기준 날짜 유형
export const INVENTORY_DATE_TYPES = [
  "order_date",
  "cancel_complete_date",
  "return_complete_date",
  "exchange_complete_date",
] as const;

export type InventoryDateType = (typeof INVENTORY_DATE_TYPES)[number];
