export interface ShopifyOrderCustomer {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface ShopifyOrderAddress {
  name?: string | null;
  phone?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export interface ShopifyOrderLineItem {
  title: string;
  quantity: number;
  product_id?: number | null;
  price?: string | null;
}

export interface ShopifyOrderFulfillment {
  tracking_number?: string | null;
  tracking_company?: string | null;
  status?: string | null;
}

export interface ShopifyOrderListItem {
  id: number;
  name: string;
  email?: string | null;
  created_at: string;
  cancelled_at?: string | null;
  financial_status?: string | null;
  fulfillment_status?: string | null;
  total_price?: string | null;
  currency?: string | null;
  customer?: ShopifyOrderCustomer | null;
  billing_address?: ShopifyOrderAddress | null;
  shipping_address?: ShopifyOrderAddress | null;
  line_items?: ShopifyOrderLineItem[];
  fulfillments?: ShopifyOrderFulfillment[];
}
