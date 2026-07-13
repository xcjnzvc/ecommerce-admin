import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import { createClient } from "@supabase/supabase-js";

// 1. Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // 반드시 서버 측(Service Role) 키를 사용하세요
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const mallId = searchParams.get("mall_id") || "rkdenrjd";

    if (!code) {
      return NextResponse.json(
        { error: "인증 코드가 없습니다." },
        { status: 400 },
      );
    }

    // 2. 카페24에 토큰 발급 요청
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", process.env.CAFE24_REDIRECT_URI || "");

    const tokenResponse = await axios.post(
      `https://${mallId}.cafe24api.com/api/v2/oauth/token`,
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

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // 3. 만료 시간 계산 (확실하게 숫자형으로 변환)
    const expiresInSeconds = Number(expires_in); // 문자열로 올 경우를 대비해 숫자로 변환
    const expiresAt = new Date(
      Date.now() + expiresInSeconds * 1000,
    ).toISOString();

    // 4. Supabase DB에 저장
    const { error: dbError } = await supabase.from("cafe24_tokens").upsert({
      mall_id: mallId,
      access_token,
      refresh_token,
      expires_at: expiresAt, // ISO 형식(YYYY-MM-DDTHH:MM:SSZ)으로 저장
    });

    if (dbError) throw new Error("DB 저장 실패: " + dbError.message);

    console.log("토큰 발급 및 DB 저장 성공!");

    return NextResponse.json({
      message: "인증 완료 및 토큰이 DB에 저장되었습니다.",
    });
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data || axiosError.message;
    console.error("오류 상세:", errorData);

    return NextResponse.json(
      { error: "인증 처리 실패", details: errorData },
      { status: 500 },
    );
  }
}
