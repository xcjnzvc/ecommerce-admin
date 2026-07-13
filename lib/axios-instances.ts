import axios from "axios";
import { createClient } from "@supabase/supabase-js";

export const cafe24Api = axios.create({
  headers: {
    "Content-Type": "application/json",
    "X-Cafe24-Api-Version": "2024-06-18",
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

  if (error || !data) {
    throw new Error("저장된 카페24 토큰이 없습니다.");
  }

  const isExpired = new Date(data.expires_at).getTime() < Date.now() + 60_000;

  if (!isExpired) {
    return { token: data.access_token, mallId: data.mall_id };
  }

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
  const newExpiresAt = new Date(Date.now() + Number(expires_in) * 1000);

  await supabase
    .from("cafe24_tokens")
    .update({
      access_token,
      refresh_token,
      expires_at: newExpiresAt.toISOString(),
    })
    .eq("mall_id", data.mall_id);

  return { token: access_token, mallId: data.mall_id };
}

cafe24Api.interceptors.request.use(async (config) => {
  const { token, mallId } = await getValidAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  config.baseURL = `https://${mallId}.cafe24api.com`;
  return config;
});
