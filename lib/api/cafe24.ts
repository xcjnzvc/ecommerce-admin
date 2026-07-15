import axios from "axios";
import { cafe24Api } from "../axios-instances";
import { createClient } from "@supabase/supabase-js";

export const cafe24 = {
  getProducts: async () => {
    // 1. Supabase에서 mall_id를 직접 조회
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data } = await supabase
      .from("cafe24_tokens")
      .select("mall_id")
      .single();

    if (!data?.mall_id) throw new Error("mall_id를 찾을 수 없습니다.");

    // 2. 완전한 URL을 명시적으로 생성
    const url = `https://${data.mall_id}.cafe24api.com/api/v2/admin/products`;

    // 3. 전체 URL을 그대로 전달
    try {
      const res = await cafe24Api.get(url);
      return res.data;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        throw new Error(JSON.stringify(e.response?.data));
      }

      throw e;
    }
  },

  // lib/api/cafe24.ts (기존 코드 아래에 추가)
  createProduct: async (product: {
    product_name: string;
    price: number;
    supply_price: number;
    display: "T" | "F";
    selling: "T" | "F";
  }) => {
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

    try {
      const res = await cafe24Api.post(url, {
        shop_no: 1,
        request: {
          product_name: product.product_name,
          price: product.price,
          supply_price: product.supply_price,
          display: product.display,
          selling: product.selling,
          product_condition: "N",
        },
      });
      return res.data;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        throw new Error(JSON.stringify(e.response?.data));
      }
      throw e;
    }
  },

  // 카테고리 목록 조회 (번호 확인용)
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

    try {
      const res = await cafe24Api.get(url);
      return res.data;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        throw new Error(JSON.stringify(e.response?.data));
      }
      throw e;
    }
  },
};
