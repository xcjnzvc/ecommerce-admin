import { NextResponse } from "next/server";
import { cafe24 } from "@/lib/api/cafe24";

export async function GET() {
  try {
    const result = await cafe24.getCategories();
    return NextResponse.json({ categories: result.categories });
  } catch (err) {
    console.error("카테고리 조회 실패:", err);
    return NextResponse.json({ error: "카테고리 조회 실패" }, { status: 500 });
  }
}
