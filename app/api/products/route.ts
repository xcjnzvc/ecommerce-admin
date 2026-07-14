import { NextRequest, NextResponse } from "next/server";
import { cafe24 } from "@/lib/api/cafe24";

export async function GET() {
  try {
    const products = await cafe24.getProducts();
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await cafe24.createProduct(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error("카페24 상품 등록 실패:", err);
    return NextResponse.json({ error: "카페24 등록 실패" }, { status: 500 });
  }
}
