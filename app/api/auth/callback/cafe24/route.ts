import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const rawMallId = searchParams.get("mall_id");
    const mallId = rawMallId || "rkdenrjd";

    if (!code) {
      return NextResponse.json(
        { error: "인증 코드가 없습니다." },
        { status: 400 },
      );
    }

    // 1. 토큰 발급 요청
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

    const { access_token } = tokenResponse.data;
    console.log("토큰 발급 성공!");

    // 2. 발급받은 토큰으로 상품 목록 조회
    const productResponse = await axios.get(
      `https://${mallId}.cafe24api.com/api/v2/admin/products`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("상품 목록 불러오기 성공");

    return NextResponse.json({
      message: "토큰 발급 및 상품 목록 조회 성공!",
      access_token,
      products: productResponse.data,
    });
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data || axiosError.message;

    console.error("API 에러 상세:", errorData);

    return NextResponse.json(
      { error: "API 요청 실패", details: errorData },
      { status: 500 },
    );
  }
}
