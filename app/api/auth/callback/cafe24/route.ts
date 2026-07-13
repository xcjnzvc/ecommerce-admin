import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const rawMallId = searchParams.get("mall_id");
    const mallId = rawMallId || "rkdenrjd";

    if (rawMallId) {
      console.log(`[인증 성공] 전달받은 mall_id 사용: ${rawMallId}`);
    } else {
      console.log(`[인증 주의] mall_id가 없어 기본값 사용: ${mallId}`);
    }

    if (!code) {
      return NextResponse.json(
        { error: "인증 코드가 없습니다." },
        { status: 400 },
      );
    }

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append(
      "redirect_uri",
      process.env.NEXT_PUBLIC_CAFE24_REDIRECT_URI || "",
    );

    const response = await axios.post(
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

    const { access_token } = response.data;
    return NextResponse.json({ message: "토큰 발급 성공!", access_token });
  } catch (error: unknown) {
    // AxiosError를 사용하여 안전하게 response에 접근
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data || axiosError.message;

    console.error("토큰 발급 에러 상세:", errorData);

    return NextResponse.json(
      { error: "토큰 발급 실패", details: errorData },
      { status: 500 },
    );
  }
}
