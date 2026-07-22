import axios from "axios";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

export const cafe24Api = axios.create({
  headers: {
    "Content-Type": "application/json",
    "X-Cafe24-Api-Version": "2026-03-01",
  },
});

if (!process.env.CAFE24_CLIENT_ID) {
  console.error("CRITICAL ERROR: CAFE24_CLIENT_ID is not defined!");
}

let refreshPromise: Promise<string> | null = null;

async function getValidAccessToken(): Promise<string> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabase
    .from("cafe24_tokens")
    .select("access_token, refresh_token, expires_at, mall_id")
    .single();

  if (error || !data) throw new Error("저장된 카페24 토큰이 없습니다.");

  // ── 디버깅 로그 ──
  console.log("=== 토큰 조회 결과 ===");
  console.log("mall_id:", data.mall_id);
  console.log("access_token (앞 10자):", data.access_token?.slice(0, 10));
  console.log("refresh_token (앞 10자):", data.refresh_token?.slice(0, 10));
  console.log("expires_at:", data.expires_at);
  console.log("현재 시각:", new Date().toISOString());

  const isExpired = new Date(data.expires_at).getTime() < Date.now() + 60_000;
  console.log("만료 여부:", isExpired);

  if (!isExpired) {
    return data.access_token;
  }

  if (refreshPromise) {
    console.log("이미 갱신 진행 중 → 기존 요청 결과 대기");
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const params = new URLSearchParams();
      params.append("grant_type", "refresh_token");
      params.append("refresh_token", data.refresh_token);

      console.log("=== 리프레시 토큰 요청 시작 ===");
      console.log(
        "사용할 refresh_token (앞 10자):",
        data.refresh_token?.slice(0, 10),
      );

      let response;
      try {
        response = await axios.post(
          `https://${data.mall_id}.cafe24api.com/api/v2/oauth/token`,
          params,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization:
                "Basic " +
                Buffer.from(
                  `${process.env.CAFE24_CLIENT_ID}:${process.env.CAFE24_CLIENT_SECRET}`,
                ).toString("base64"),
            },
          },
        );
      } catch (e) {
        if (axios.isAxiosError(e)) {
          console.error("=== 리프레시 실패 (카페24 응답) ===");
          console.error("status:", e.response?.status);
          console.error("data:", JSON.stringify(e.response?.data));
        } else {
          console.error("=== 리프레시 실패 (알 수 없는 에러) ===", e);
        }
        throw e;
      }

      console.log("=== 리프레시 성공 응답 ===");
      console.log(JSON.stringify(response.data));
      console.log("=== 부여된 스코프 ===", response.data.scopes);
      fs.writeFileSync(
        "/tmp/cafe24-scopes.json",
        JSON.stringify(response.data.scopes, null, 2),
      );

      const { access_token, refresh_token, expires_in } = response.data;
      const validExpiresIn = expires_in ? Number(expires_in) : 3600;
      const newExpiresAt = new Date(Date.now() + validExpiresIn * 1000);

      if (isNaN(newExpiresAt.getTime())) {
        throw new Error("토큰 갱신 후 만료시간 계산 실패");
      }

      const { error: updateError } = await supabase
        .from("cafe24_tokens")
        .update({
          access_token,
          refresh_token,
          expires_at: newExpiresAt.toISOString(),
        })
        .eq("mall_id", data.mall_id);

      if (updateError) {
        console.error("=== DB 업데이트 실패 ===", updateError.message);
        throw new Error("토큰 DB 업데이트 실패: " + updateError.message);
      }

      console.log(
        "=== DB 업데이트 성공, 새 expires_at:",
        newExpiresAt.toISOString(),
      );

      return access_token;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

cafe24Api.interceptors.request.use(async (config) => {
  const token = await getValidAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Shopify

export const shopifyApi = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

if (!process.env.SHOPIFY_CLIENT_ID) {
  console.error("CRITICAL ERROR: SHOPIFY_CLIENT_ID is not defined!");
}

let shopifyTokenCache: { token: string; expiresAt: number } | null = null;
let shopifyRefreshPromise: Promise<string> | null = null;

async function getValidShopifyAccessToken(): Promise<string> {
  if (shopifyTokenCache && shopifyTokenCache.expiresAt > Date.now()) {
    return shopifyTokenCache.token;
  }

  if (shopifyRefreshPromise) {
    return shopifyRefreshPromise;
  }

  shopifyRefreshPromise = (async () => {
    try {
      const response = await axios.post(
        `https://${process.env.SHOPIFY_SHOP}/admin/oauth/access_token`,
        {
          client_id: process.env.SHOPIFY_CLIENT_ID,
          client_secret: process.env.SHOPIFY_CLIENT_SECRET,
          grant_type: "client_credentials",
        },
        { headers: { "Content-Type": "application/json" } },
      );

      const { access_token, expires_in } = response.data;
      shopifyTokenCache = {
        token: access_token,
        expiresAt: Date.now() + (expires_in - 60) * 1000,
      };

      return access_token;
    } finally {
      shopifyRefreshPromise = null;
    }
  })();

  return shopifyRefreshPromise;
}

shopifyApi.interceptors.request.use(async (config) => {
  const token = await getValidShopifyAccessToken();
  config.headers["X-Shopify-Access-Token"] = token;
  return config;
});
