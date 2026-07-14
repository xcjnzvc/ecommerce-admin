import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import { createClient } from "@supabase/supabase-js";

// 1. Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

    // --- 수정된 부분 ---
    console.log("전체 응답 데이터:", JSON.stringify(tokenResponse.data));

    // 만료 시간 보정 (없으면 기본값 1시간)
    const validExpiresIn = expires_in ? Number(expires_in) : 3600;

    // 현재 시간으로부터 계산
    const calculatedDate = new Date(Date.now() + validExpiresIn * 1000);

    if (isNaN(calculatedDate.getTime())) {
      console.error("날짜 계산 실패! 입력값:", expires_in);
      return NextResponse.json({ error: "날짜 계산 실패" }, { status: 500 });
    }
    // ------------------

    // Supabase DB에 저장
    const { error: dbError } = await supabase.from("cafe24_tokens").upsert({
      mall_id: mallId,
      access_token,
      refresh_token,
      expires_at: calculatedDate.toISOString(),
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
