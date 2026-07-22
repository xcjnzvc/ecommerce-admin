import { NextRequest, NextResponse } from "next/server";
import { shopify } from "@/lib/api/shopify";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("shopify_product_id", Number(productId))
    .single();

  if (error || !data) {
    console.error("Shopify 상품 조회 실패:", error);
    return NextResponse.json(
      { error: "상품을 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  return NextResponse.json({ product: data });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId: productIdParam } = await params;
  const productId = Number(productIdParam);
  const body = await req.json();
  const { inventory_item_id, location_id, stock, ...productFields } = body;

  try {
    if (Object.keys(productFields).length > 0) {
      await shopify.updateProduct(productId, productFields);
    }

    if (typeof stock === "number" && inventory_item_id && location_id) {
      await shopify.updateStock(inventory_item_id, location_id, stock);
    }

    await supabase
      .from("products")
      .update({
        ...productFields,
        stock,
        shopify_synced_at: new Date().toISOString(),
      })
      .eq("shopify_product_id", productId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Shopify 상품 수정 실패:", err);
    return NextResponse.json({ error: "상품 수정 실패" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId: productIdParam } = await params;
  const productId = Number(productIdParam);

  try {
    try {
      await shopify.deleteProduct(productId);
    } catch (shopifyError) {
      console.warn(
        "Shopify 상품 삭제 실패 (이미 삭제되었을 수 있음):",
        shopifyError,
      );
    }

    const { error: dbError } = await supabase
      .from("products")
      .delete()
      .eq("shopify_product_id", productId);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Shopify 상품 삭제 실패:", err);
    return NextResponse.json({ error: "상품 삭제 실패" }, { status: 500 });
  }
}
