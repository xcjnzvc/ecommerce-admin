import axios, { AxiosError } from "axios";
import { cafe24Api } from "../axios-instances";
import { createClient } from "@supabase/supabase-js";

// 타입 정의 추가
export interface ProductImageInput {
  detail_image?: string;
  list_image?: string;
  small_image?: string;
  tiny_image?: string;
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
  use_inventory?: "T" | "F";
  [key: string]: ProductValue;
}

import type {
  Cafe24OrderListItem,
  Cafe24OrderItem,
  Cafe24ProductDetail,
  InventoryDateType,
} from "@/types/cafe24";

// 외부 이미지 URL을 Base64 데이터로 변환만 하는 헬퍼 (업로드는 안 함)
export async function imageUrlToBase64(imageUrl: string): Promise<string> {
  const imageResponse = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });
  const buffer = Buffer.from(imageResponse.data, "binary");
  const extension = imageUrl.split(".").pop()?.split("?")[0] || "jpeg";
  const mimeType = extension === "png" ? "image/png" : "image/jpeg";
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

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

    const rawPath = res.data.images[0].path;

    console.log("===== 카페24 이미지 업로드 원본 응답 =====");
    console.log(JSON.stringify(res.data, null, 2));

    // 전체 URL에서 도메인을 떼고 경로(path)만 추출
    const finalPath = new URL(rawPath).pathname;

    console.log("변환된 경로:", finalPath);

    return finalPath;
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

    // const res = await cafe24Api.post(url, {
    //   shop_no: 1,
    //   request: {
    //     product_condition: "N",
    //     ...product,
    //     use_inventory: "T",
    //   },
    // });
    const payload = {
      shop_no: 1,
      request: {
        product_condition: "N",
        ...product,
        use_inventory: "T",
        inventory_control_type: "A",
        display_soldout: "F",
      },
    };

    console.log("상품등록 payload:", JSON.stringify(payload, null, 2));

    const res = await cafe24Api.post(url, payload);
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

  // 이미지 수정
  // updateProductImages: async (productNo: number, images: ProductImageInput) => {
  //   const supabase = createClient(
  //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //     process.env.SUPABASE_SERVICE_ROLE_KEY!,
  //   );

  //   const { data } = await supabase
  //     .from("cafe24_tokens")
  //     .select("mall_id")
  //     .single();

  //   if (!data?.mall_id) throw new Error("mall_id를 찾을 수 없습니다.");

  //   // 문서에 명시된 올바른 상품 이미지 등록/수정 엔드포인트 (POST)
  //   const url = `https://${data.mall_id}.cafe24api.com/api/v2/admin/products/${productNo}/images`;

  //   const formatImageRelativePath = (imgPath?: string) => {
  //     if (!imgPath) return undefined;
  //     if (imgPath.startsWith("http")) {
  //       try {
  //         const urlObj = new URL(imgPath);
  //         return urlObj.pathname;
  //       } catch {
  //         return imgPath;
  //       }
  //     }
  //     return imgPath.startsWith("/") ? imgPath : `/${imgPath}`;
  //   };

  //   const res = await cafe24Api.post(url, {
  //     shop_no: 1,
  //     request: {
  //       image_upload_type: "A", // 대표이미지 등록(A) 또는 개별이미지 등록(B)
  //       detail_image: formatImageRelativePath(images.detail_image),
  //       list_image: formatImageRelativePath(images.list_image),
  //       small_image: formatImageRelativePath(images.small_image),
  //       tiny_image: formatImageRelativePath(images.tiny_image),
  //     },
  //   });

  //   console.log(
  //     "===== 상품 이미지 연결 결과 =====",
  //     JSON.stringify(res.data, null, 2),
  //   );

  //   return res.data;
  // },
  updateProductImages: async (productNo: number, images: ProductImageInput) => {
    // 👇 [로그 1] 함수가 시작될 때 넘어온 이미지 데이터 확인
    // console.log(
    //   "1️⃣ [함수 받은 원본 이미지 데이터]:",
    //   JSON.stringify(images, null, 2),
    // );
    console.log("detail_image 시작", images.detail_image?.substring(0, 50));
    console.log("detail_image 길이", images.detail_image?.length);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data } = await supabase
      .from("cafe24_tokens")
      .select("mall_id")
      .single();

    if (!data?.mall_id) throw new Error("mall_id를 찾을 수 없습니다.");

    const url = `https://${data.mall_id}.cafe24api.com/api/v2/admin/products/${productNo}/images`;

    const formatImageRelativePath = (imgPath?: string) => {
      if (!imgPath) return undefined;

      // Base64는 그대로 반환
      if (imgPath.startsWith("data:image")) {
        return imgPath;
      }

      // URL이면 pathname 추출
      if (imgPath.startsWith("http")) {
        const urlObj = new URL(imgPath);
        return urlObj.pathname;
      }

      return imgPath.startsWith("/") ? imgPath : `/${imgPath}`;
    };

    const payload = {
      shop_no: 1,
      request: {
        image_upload_type: "A",
        detail_image: formatImageRelativePath(images.detail_image),
        list_image: formatImageRelativePath(images.list_image),
        small_image: formatImageRelativePath(images.small_image),
        tiny_image: formatImageRelativePath(images.tiny_image),
      },
    };

    // 👇 [로그 3] 카페24로 던지기 직전의 최종 페이로드 확인
    // console.log(
    //   "3️⃣ [카페24 이미지 전송 페이로드]:",
    //   JSON.stringify(payload, null, 2),
    // );

    console.log("payload type", payload.request.image_upload_type);
    console.log(
      "payload detail 시작",
      payload.request.detail_image?.substring(0, 50),
    );
    console.log("payload detail 길이", payload.request.detail_image?.length);
    try {
      // 🚀 1단계(비우기)는 카페24가 무시하므로 삭제하고,
      // 🚀 2단계로 바로 가되, 매번 새로운 이미지로 인식하도록 경로에 캐시Bust용 파라미터나 변형을 줍니다.

      const payloadWithCacheBuster = {
        shop_no: 1,
        request: {
          image_upload_type: "A",
          // 경로 뒤에 현재 시간을 붙여서 카페24가 절대 같은 이미지로 인식하지 못하게 함
          detail_image: formatImageRelativePath(images.detail_image),
          list_image: formatImageRelativePath(images.list_image),
          small_image: formatImageRelativePath(images.small_image),
          tiny_image: formatImageRelativePath(images.tiny_image),
        },
      };

      console.log("🔥 [새 이미지 강제 갱신 전송 중...]");
      const res = await cafe24Api.post(url, payloadWithCacheBuster);

      console.log(
        "4️⃣ [카페24 이미지 연결 성공 응답]:",
        JSON.stringify(res.data, null, 2),
      );

      // 👇 이 부분 추가
      const check = await cafe24Api.get(
        `https://${data.mall_id}.cafe24api.com/api/v2/admin/products/${productNo}`,
        {
          params: {
            fields: "product_no,detail_image,list_image,small_image,tiny_image",
          },
        },
      );

      console.log(
        "5️⃣ [수정 후 상품 조회]",
        JSON.stringify(check.data, null, 2),
      );

      return res.data;
    } catch (error: unknown) {
      // 👇 any 대신 AxiosError 타입으로 좁혀서 안전하게 에러 데이터 추출
      const err = error as AxiosError;
      console.error(
        "❌ [카페24 이미지 전송 에러]:",
        err.response?.data || (err as Error).message,
      );
      throw error;
    }
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

    // 빈 값 제거
    const cleanedFields = Object.fromEntries(
      Object.entries(fields).filter(([_, value]) => {
        return value !== "" && value !== null && value !== undefined;
      }),
    );

    console.log("===== 카페24 수정 요청 =====");
    console.log(JSON.stringify(cleanedFields, null, 2));

    try {
      const res = await cafe24Api.put(url, {
        shop_no: 1,
        request: cleanedFields,
      });

      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "===== 카페24 수정 실패 =====",
          error.response?.status,
          JSON.stringify(error.response?.data, null, 2),
        );
      }

      throw error;
    }
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

    if (!variantCode) {
      throw new Error("품목코드를 찾을 수 없습니다.");
    }

    const requestBody = {
      shop_no: 1,
      request: {
        use_inventory: "T",
        quantity: quantity,
        inventory_control_type: "A",
        important_inventory: "A",
        display_soldout: "F",
      },
    };
    console.log("재고 수정 요청:", requestBody);

    const res = await cafe24Api.put(
      `${base}/admin/products/${productNo}/variants/${variantCode}/inventories`,
      requestBody,
    );

    console.log("재고 수정 응답:", JSON.stringify(res.data, null, 2));

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
    console.log("★★★★★ getProductDetail 호출", productNo);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data } = await supabase
      .from("cafe24_tokens")
      .select("mall_id")
      .single();

    if (!data?.mall_id) throw new Error("mall_id를 찾을 수 없습니다.");

    // const url = `https://${data.mall_id}.cafe24api.com/api/v2/admin/products/${productNo}`;
    const url = `https://${data.mall_id}.cafe24api.com/api/v2/admin/products/${productNo}/variants`;
    const res = await cafe24Api.get(url);

    console.log(JSON.stringify(res.data, null, 2));

    const variantCode = res.data.variants?.[0]?.variant_code;

    if (variantCode) {
      const inventoryRes = await cafe24Api.get(
        `https://${data.mall_id}.cafe24api.com/api/v2/admin/products/${productNo}/variants/${variantCode}/inventories`,
      );

      console.log("====== inventories 응답 ======");
      console.log(JSON.stringify(inventoryRes.data, null, 2));
    }

    try {
      const res = await cafe24Api.get(url);

      console.log("====== 상품 상세 응답 ======");
      console.log(JSON.stringify(res.data, null, 2));

      const variant = res.data.variants?.[0];

      if (!variant) return null;

      return {
        product_no: productNo,
        quantity: variant.quantity,
      };
    } catch (error) {
      console.error(`상품(${productNo}) 상세 조회 실패:`, error);
      return null;
    }
  },
};
