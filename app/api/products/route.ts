import { NextResponse } from "next/server";
import { cafe24 } from "@/lib/api/cafe24";

export async function GET() {
  try {
    // 딱 한 줄이면 끝!
    // const products = await cafe24.getProducts("rkdenrjd");
    const products = await cafe24.getProducts(process.env.CAFE24_MALL_ID!);
    return NextResponse.json(products);
  } catch (err) {
    console.error("카페24 상품 조회 실패:", err);
    return NextResponse.json({ error: "상품 조회 실패" }, { status: 500 });
  }
}
