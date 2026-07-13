import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const mallId = searchParams.get("mall_id");

  if (!code) {
    return NextResponse.json(
      { error: "인증 코드가 없습니다." },
      { status: 400 },
    );
  }

  // 1. 카페24에 토큰 교환 요청
  const response = await fetch(
    `https://${mallId}.cafe24api.com/api/v2/oauth/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.CAFE24_CLIENT_ID}:${process.env.CAFE24_CLIENT_SECRET}`,
          ).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.CAFE24_REDIRECT_URI as string,
      }),
    },
  );

  const data = await response.json();

  if (data.access_token) {
    // 성공! 여기서 토큰을 DB에 저장하거나 세션에 담으면 됩니다.
    console.log("발급받은 토큰:", data.access_token);
    return NextResponse.json({
      message: "인증 성공!",
      token: data.access_token,
    });
  } else {
    return NextResponse.json(
      { error: "토큰 발급 실패", details: data },
      { status: 400 },
    );
  }
}
