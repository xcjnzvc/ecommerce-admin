import { NextRequest, NextResponse } from "next/server";
import { cafe24 } from "@/lib/api/cafe24";
import { shopify } from "@/lib/api/shopify";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { stock } = await req.json();

  if (typeof stock !== "number") {
    return NextResponse.json(
      { error: "stock은 number여야 합니다." },
      { status: 400 },
    );
  }

  const { data: row, error: rowError } = await supabase
    .from("products")
    .select("name, stock, cafe24_product_no, shopify_inventory_item_id")
    .eq("id", id)
    .single();

  if (rowError || !row) {
    return NextResponse.json(
      { error: "상품을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const old_stock = row.stock ?? 0;

  try {
    if (row.cafe24_product_no) {
      await cafe24.updateStock(row.cafe24_product_no, stock);
    }

    if (row.shopify_inventory_item_id && process.env.SHOPIFY_LOCATION_ID) {
      await shopify.updateStock(
        row.shopify_inventory_item_id,
        Number(process.env.SHOPIFY_LOCATION_ID),
        stock,
      );
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({
        stock,
        stock_synced_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) throw updateError;

    // service role이므로 RLS 우회 — 클라이언트 직접 insert는 별도 RLS 정책 필요
    const { error: logError } = await supabase.from("inventory_logs").insert({
      product_id: id,
      product_name: row.name,
      old_stock,
      new_stock: stock,
    });

    if (logError) throw logError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("재고 수정 실패:", err);
    return NextResponse.json({ error: "재고 수정 실패" }, { status: 500 });
  }
}
