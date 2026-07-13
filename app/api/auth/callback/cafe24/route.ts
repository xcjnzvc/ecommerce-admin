import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const mallId = searchParams.get("mall_id");

  if (!code) {
    return NextResponse.json(
      { error: "인증 코드가 없습니다." },
      { status: 400 },
    );
  }

  const response = await axios.post(
    `https://${mallId}.cafe24api.com/api/v2/oauth/token`,
    {
      grant_type: "authorization_code",
      code: code,
      redirect_uri: process.env.NEXT_PUBLIC_CAFE24_REDIRECT_URI,
    },
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

  const { access_token, refresh_token } = response.data;
  // 이제 이 access_token을 가지고 상품 정보를 조회할 수 있습니다!

  return NextResponse.json({ message: "인증 코드 수신 성공!", code, mallId });
}
