import { NextRequest, NextResponse } from "next/server";
import { shopify } from "@/lib/api/shopify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await shopify.createProduct(body);

    const product = result?.product;
    const variant = product?.variants?.[0];

    return NextResponse.json({
      product,
      shopify_product_id: product?.id ?? null,
      shopify_inventory_item_id: variant?.inventory_item_id ?? null,
    });
  } catch (error) {
    console.error("Shopify 상품 등록 실패:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "알 수 없는 에러" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const result = await shopify.getProducts();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Shopify 상품 조회 실패:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "알 수 없는 에러" },
      { status: 500 },
    );
  }
}
