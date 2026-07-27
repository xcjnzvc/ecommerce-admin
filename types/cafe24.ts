export interface Cafe24OrderBuyer {
  name: string;
  cellphone: string;
  phone: string;
  email: string;
}

export interface Cafe24OrderListItemEmbedded {
  product_name: string;
  quantity: number;
  order_item_code: string;
  product_no: number;
}

export interface Cafe24OrderListItem {
  order_id: string;
  order_status?: string;
  billing_name?: string;
  payment_amount?: string;
  order_date: string;
  shop_no?: number;
  currency?: string;
  member_id?: string | null;
  member_email?: string;
  paid?: "T" | "F";
  canceled?: "T" | "F";

  // embed=buyer 사용 시 채워짐
  buyer?: Cafe24OrderBuyer;

  // embed=items 사용 시 채워짐
  items?: Cafe24OrderListItemEmbedded[];
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
