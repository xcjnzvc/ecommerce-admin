import axios from "axios";
import { createClient } from "@supabase/supabase-js";

// baseURL을 아예 제거하여 URL 오염을 방지합니다.
export const cafe24Api = axios.create({
  headers: {
    "Content-Type": "application/json",
    "X-Cafe24-Api-Version": "2026-03-01",
  },
});

async function getValidAccessToken() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabase
    .from("cafe24_tokens")
    .select("access_token, refresh_token, expires_at, mall_id")
    .single();

  if (error || !data) throw new Error("저장된 카페24 토큰이 없습니다.");

  const isExpired = new Date(data.expires_at).getTime() < Date.now() + 60_000;

  if (!isExpired) {
    return data.access_token;
  }

  // 만료 시 토큰 갱신 로직
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", data.refresh_token);

  const response = await axios.post(
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

  const { access_token, refresh_token, expires_in } = response.data;
  await supabase
    .from("cafe24_tokens")
    .update({
      access_token,
      refresh_token,
      expires_at: new Date(
        Date.now() + Number(expires_in) * 1000,
      ).toISOString(),
    })
    .eq("mall_id", data.mall_id);

  return access_token;
}

cafe24Api.interceptors.request.use(async (config) => {
  const token = await getValidAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
