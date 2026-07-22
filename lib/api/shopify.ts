import { shopifyApi } from "../axios-instances";

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

    console.log("====== Shopify Products ======");
    console.log(JSON.stringify(res.data, null, 2));

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
    const res = await shopifyApi.delete(`${BASE}/products/${productId}.json`);
    return res.data;
  },

  // 5. 재고 수정 (inventory_item_id, location_id 필요)
  updateStock: async (
    inventoryItemId: number,
    locationId: number,
    quantity: number,
  ) => {
    console.log("Shopify 요청", {
      inventoryItemId,
      locationId,
      quantity,
    });

    const res = await shopifyApi.post(`${BASE}/inventory_levels/set.json`, {
      location_id: locationId,
      inventory_item_id: inventoryItemId,
      available: quantity,
    });

    console.log("Shopify 응답");
    console.log(JSON.stringify(res.data, null, 2));

    return res.data;
  },
};
