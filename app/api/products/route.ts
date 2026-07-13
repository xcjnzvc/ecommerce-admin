import { NextResponse } from "next/server";
import { cafe24 } from "@/lib/api/cafe24";

export async function GET() {
  try {
    const products = await cafe24.getProducts();
    return NextResponse.json(products);
  } catch (err) {
    console.error("카페24 상품 조회 실패:", err);
    return NextResponse.json({ error: "상품 조회 실패" }, { status: 500 });
  }
}
