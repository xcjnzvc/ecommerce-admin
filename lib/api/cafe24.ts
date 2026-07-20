import axios from "axios";
import { cafe24Api } from "../axios-instances";
import { createClient } from "@supabase/supabase-js";

// 타입 정의 추가
export interface ProductImageInput {
  detail_image?: string;
  list_image?: string;
  small_image?: string;
  tiny_image?: string;
  additional_image_1?: string;
  additional_image_2?: string;
  additional_image_3?: string;
}

// 유연하면서도 안전한 값 타입 정의
type ProductValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | null
  | undefined;

export interface ProductInput {
  product_name: string;
  price: number;
  supply_price: number;
  description?: string;
  display: "T" | "F";
  selling: "T" | "F";
  [key: string]: ProductValue;
}

import type {
  Cafe24OrderListItem,
  Cafe24OrderItem,
  Cafe24ProductDetail,
  InventoryDateType,
} from "@/types/cafe24";

export const cafe24 = {
  // 1. 상품 리스트 조회
  getProducts: async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data } = await supabase
      .from("cafe24_tokens")
      .select("mall_id")
      .single();
    if (!data?.mall_id) throw new Error("mall_id를 찾을 수 없습니다.");

    const url = `https://${data.mall_id}.cafe24api.com/api/v2/admin/products`;
    const res = await cafe24Api.get(url, {
      params: {
        fields:
          "shop_no,product_no,product_code,product_name,price,supply_price,detail_image,list_image,small_image,tiny_image,display,selling,created_date",
      },
    });
    return res.data;
  },

  // 2. 이미지 업로드
  uploadImage: async (imageUrl: string): Promise<string> => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data } = await supabase
      .from("cafe24_tokens")
      .select("mall_id")
      .single();
    if (!data?.mall_id) throw new Error("mall_id를 찾을 수 없습니다.");

    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(imageResponse.data, "binary");
    const extension = imageUrl.split(".").pop()?.split("?")[0] || "jpeg";
    const mimeType = extension === "png" ? "image/png" : "image/jpeg";
    const base64Image = `data:${mimeType};base64,${buffer.toString("base64")}`;

    const url = `https://${data.mall_id}.cafe24api.com/api/v2/admin/products/images`;
    const res = await cafe24Api.post(url, {
      shop_no: 1,
      requests: [{ image: base64Image }],
    });
    return res.data.images[0].path;
  },

  // 3. 상품 이미지 연결
  uploadProductImages: async (productNo: number, images: ProductImageInput) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data } = await supabase
      .from("cafe24_tokens")
      .select("mall_id")
      .single();
    if (!data?.mall_id) throw new Error("mall_id를 찾을 수 없습니다.");

    const url = `https://${data.mall_id}.cafe24api.com/api/v2/admin/products/${productNo}`;
    const res = await cafe24Api.put(url, {
      shop_no: 1,
      request: {
        image_upload_type: "A",
        ...images,
      },
    });
    return res.data;
  },

  // 4. 새 상품 등록
  createProduct: async (product: ProductInput) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data } = await supabase
      .from("cafe24_tokens")
      .select("mall_id")
      .single();
    if (!data?.mall_id) throw new Error("mall_id를 찾을 수 없습니다.");

    const url = `https://${data.mall_id}.cafe24api.com/api/v2/admin/products`;
    const res = await cafe24Api.post(url, {
      shop_no: 1,
      request: { product_condition: "N", ...product },
    });
    return res.data;
  },

  // 5. 카테고리 목록 조회
  getCategories: async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data } = await supabase
      .from("cafe24_tokens")
      .select("mall_id")
      .single();
    if (!data?.mall_id) throw new Error("mall_id를 찾을 수 없습니다.");

    const url = `https://${data.mall_id}.cafe24api.com/api/v2/admin/categories`;
    const res = await cafe24Api.get(url);
    return res.data;
  },

  // 6. 카테고리에 상품 등록
  assignCategory: async (productNo: number, categoryNo: number) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data } = await supabase
      .from("cafe24_tokens")
      .select("mall_id")
      .single();
    if (!data?.mall_id) throw new Error("mall_id를 찾을 수 없습니다.");

    const url = `https://${data.mall_id}.cafe24api.com/api/v2/admin/categories/${categoryNo}/products`;
    const res = await cafe24Api.post(url, {
      shop_no: 1,
      request: { product_no: [productNo] },
    });
    return res.data;
  },

  // 7. 상품 수정
  updateProduct: async (productNo: number, fields: Partial<ProductInput>) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data } = await supabase
      .from("cafe24_tokens")
      .select("mall_id")
      .single();
    if (!data?.mall_id) throw new Error("mall_id를 찾을 수 없습니다.");

    const url = `https://${data.mall_id}.cafe24api.com/api/v2/admin/products/${productNo}`;
    const res = await cafe24Api.put(url, { shop_no: 1, request: fields });
    return res.data;
  },

  // 8. 상품 삭제
  deleteProduct: async (productNo: number) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data } = await supabase
      .from("cafe24_tokens")
      .select("mall_id")
      .single();
    if (!data?.mall_id) throw new Error("mall_id를 찾을 수 없습니다.");

    const url = `https://${data.mall_id}.cafe24api.com/api/v2/admin/products/${productNo}`;
    const res = await cafe24Api.delete(url);
    return res.data;
  },

  // 9. 재고 수정
  updateStock: async (productNo: number, quantity: number) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data } = await supabase
      .from("cafe24_tokens")
      .select("mall_id")
      .single();
    if (!data?.mall_id) throw new Error("mall_id를 찾을 수 없습니다.");

    const base = `https://${data.mall_id}.cafe24api.com/api/v2`;
    const variantsRes = await cafe24Api.get(
      `${base}/admin/products/${productNo}/variants`,
    );
    const variantCode = variantsRes.data?.variants?.[0]?.variant_code;
    if (!variantCode) throw new Error("품목코드를 찾을 수 없습니다.");

    const res = await cafe24Api.put(
      `${base}/admin/products/${productNo}/variants/${variantCode}/inventories`,
      {
        shop_no: 1,
        requests: [{ quantity }],
      },
    );
    return res.data;
  },

  // 10. 주문 목록 조회 (재고 동기화용 - 특정 date_type 기준)
  getOrders: async (params: {
    startDate: string;
    endDate: string;
    dateType: InventoryDateType;
  }): Promise<Cafe24OrderListItem[]> => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data } = await supabase
      .from("cafe24_tokens")
      .select("mall_id")
      .single();
    if (!data?.mall_id) throw new Error("mall_id를 찾을 수 없습니다.");

    const url = `https://${data.mall_id}.cafe24api.com/api/v2/admin/orders`;

    try {
      const res = await cafe24Api.get(url, {
        params: {
          start_date: params.startDate,
          end_date: params.endDate,
          date_type: params.dateType,
          limit: 500,
        },
      });
      return res.data.orders ?? [];
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(
          `[${params.dateType}] 카페24 주문 조회 실패:`,
          err.response?.status,
          JSON.stringify(err.response?.data),
        );
      } else {
        console.error(`[${params.dateType}] 알 수 없는 오류:`, err);
      }
      throw err; // sync-inventory.ts의 catch에서 계속 처리하도록 그대로 던짐
    }
  },

  // 11. 특정 주문의 품주(items) 조회 - product_no, quantity 추출용
  getOrderItems: async (orderId: string): Promise<Cafe24OrderItem[]> => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data } = await supabase
      .from("cafe24_tokens")
      .select("mall_id")
      .single();
    if (!data?.mall_id) throw new Error("mall_id를 찾을 수 없습니다.");

    const url = `https://${data.mall_id}.cafe24api.com/api/v2/admin/orders/${orderId}/items`;
    const res = await cafe24Api.get(url);
    return res.data.items ?? [];
  },

  // 12. 상품 상세 조회 (재고 진짜 최신값 확보용) - 기존 getProducts와 별개로,
  //     단건 조회는 fields를 quantity 포함해서 명시적으로 요청
  getProductDetail: async (
    productNo: number,
  ): Promise<Cafe24ProductDetail | null> => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data } = await supabase
      .from("cafe24_tokens")
      .select("mall_id")
      .single();
    if (!data?.mall_id) throw new Error("mall_id를 찾을 수 없습니다.");

    const url = `https://${data.mall_id}.cafe24api.com/api/v2/admin/products/${productNo}`;
    try {
      const res = await cafe24Api.get(url);
      return res.data.product ?? null;
    } catch (error) {
      console.error(`상품(${productNo}) 상세 조회 실패:`, error);
      return null;
    }
  },
};
