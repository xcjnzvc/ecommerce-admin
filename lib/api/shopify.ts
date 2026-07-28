import { shopifyApi } from "../axios-instances";
import type { ShopifyOrderListItem } from "@/types/shopify";
import { logAxiosError } from "./errors";

const BASE = `https://${process.env.SHOPIFY_SHOP}/admin/api/2026-07`;

export interface ShopifyProductInput {
  title: string;
  body_html?: string;
  price: number;
  sku?: string;
  inventory_quantity: number;
  images?: string[];
}

export const shopify = {
  // 1. 상품 목록 조회
  getProducts: async () => {
    const res = await shopifyApi.get(`${BASE}/products.json`);

    return res.data;
  },

  // 2. 새 상품 등록
  createProduct: async (product: ShopifyProductInput) => {
    const res = await shopifyApi.post(`${BASE}/products.json`, {
      product: {
        title: product.title,
        body_html: product.body_html ?? "",
        images: product.images?.map((src) => ({ src })),
        variants: [
          {
            price: product.price,
            sku: product.sku,
            inventory_quantity: product.inventory_quantity,
            inventory_management: "shopify",
          },
        ],
      },
    });
    return res.data;
  },

  // 3. 상품 수정
  updateProduct: async (
    productId: number,
    fields: Partial<ShopifyProductInput>,
  ) => {
    const res = await shopifyApi.put(`${BASE}/products/${productId}.json`, {
      product: {
        id: productId,
        ...fields,
        ...(fields.images && {
          images: fields.images.map((src) => ({ src })),
        }),
      },
    });

    return res.data;
  },

  // 4. 상품 삭제
  deleteProduct: async (productId: number) => {
    try {
      const res = await shopifyApi.delete(`${BASE}/products/${productId}.json`);

      return res.data;
    } catch (err) {
      logAxiosError("shopify", "deleteProduct", err, { productId });
      throw err; // 상위 라우트에서 처리하도록 다시 던짐
    }
  },

  // 5. 재고 수정 (inventory_item_id, location_id 필요)
  updateStock: async (
    inventoryItemId: number,
    locationId: number,
    quantity: number,
  ) => {
    const res = await shopifyApi.post(`${BASE}/inventory_levels/set.json`, {
      location_id: locationId,
      inventory_item_id: inventoryItemId,
      available: quantity,
    });

    return res.data;
  },

  // 6. 주문 목록 조회
  // fields로 고객 PII(customer, email, shipping/billing_address 등)를 제외해
  // Protected Customer Data 미승인 앱의 403을 방지한다.
  getOrders: async (params?: {
    status?: string;
    limit?: number;
    createdAtMin?: string;
    createdAtMax?: string;
  }): Promise<ShopifyOrderListItem[]> => {
    const query = new URLSearchParams({
      status: params?.status ?? "any", // open, closed, cancelled, any
      limit: String(params?.limit ?? 50),
      fields: [
        "id",
        "name",
        "created_at",
        "cancelled_at",
        "financial_status",
        "fulfillment_status",
        "total_price",
        "currency",
        "line_items",
        "fulfillments",
      ].join(","),
    });

    if (params?.createdAtMin) {
      query.set("created_at_min", params.createdAtMin);
    }
    if (params?.createdAtMax) {
      query.set("created_at_max", params.createdAtMax);
    }

    const res = await shopifyApi.get<{ orders: ShopifyOrderListItem[] }>(
      `${BASE}/orders.json?${query}`,
    );

    return res.data.orders ?? [];
  },

  // 7. 주문 단건 조회
  getOrder: async (orderId: number) => {
    const res = await shopifyApi.get(`${BASE}/orders/${orderId}.json`);
    return res.data;
  },

  // 8. 배송(Fulfillment) 등록 → 송장번호 입력
  createFulfillment: async (
    orderId: number,
    trackingNumber: string,
    trackingCompany: string,
    lineItemIds?: number[],
  ) => {
    // fulfillment_orders 먼저 조회해서 fulfillment_order_id 확보 (2022-07+ 필수)
    const foRes = await shopifyApi.get(
      `${BASE}/orders/${orderId}/fulfillment_orders.json`,
    );
    const fulfillmentOrderId = foRes.data.fulfillment_orders[0]?.id;

    const res = await shopifyApi.post(`${BASE}/fulfillments.json`, {
      fulfillment: {
        line_items_by_fulfillment_order: [
          {
            fulfillment_order_id: fulfillmentOrderId,
            ...(lineItemIds && {
              fulfillment_order_line_items: lineItemIds.map((id) => ({
                id,
              })),
            }),
          },
        ],
        tracking_info: {
          number: trackingNumber,
          company: trackingCompany,
        },
        notify_customer: true,
      },
    });

    return res.data;
  },

  // 9. 주문 상태 변경 (취소)
  cancelOrder: async (orderId: number, reason?: string) => {
    const res = await shopifyApi.post(`${BASE}/orders/${orderId}/cancel.json`, {
      reason: reason ?? "other",
    });
    return res.data;
  },
};
