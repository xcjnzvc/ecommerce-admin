import { NextResponse } from "next/server";
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
