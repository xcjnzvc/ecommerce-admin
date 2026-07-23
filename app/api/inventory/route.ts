import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type InventoryStatus = "정상" | "부족" | "품절" | "동기화오류";

function resolveStatus(
  stock: number | null,
  cafe24ProductNo: number | null,
  errorProductNos: Set<number>,
): InventoryStatus {
  if (
    cafe24ProductNo != null &&
    errorProductNos.has(Number(cafe24ProductNo))
  ) {
    return "동기화오류";
  }

  const qty = stock ?? 0;
  if (qty === 0) return "품절";
  if (qty <= 5) return "부족";
  return "정상";
}

export async function GET() {
  try {
    const [productsResult, errorLogsResult] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id, name, stock, stock_synced_at, cafe24_product_no, shopify_inventory_item_id, images",
        ),
      supabase
        .from("sync_error_log")
        .select("product_no")
        .eq("resolved", false),
    ]);

    if (productsResult.error) throw productsResult.error;
    if (errorLogsResult.error) throw errorLogsResult.error;

    const errorProductNos = new Set(
      (errorLogsResult.data ?? [])
        .map((e) => e.product_no)
        .filter((n): n is number => n != null)
        .map(Number),
    );

    const items = (productsResult.data ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      stock: product.stock ?? 0,
      stock_synced_at: product.stock_synced_at,
      cafe24_product_no: product.cafe24_product_no,
      shopify_inventory_item_id: product.shopify_inventory_item_id,
      images: product.images ?? null,
      status: resolveStatus(
        product.stock,
        product.cafe24_product_no,
        errorProductNos,
      ),
    }));

    return NextResponse.json({ items });
  } catch (err) {
    console.error("재고 목록 조회 실패:", err);
    return NextResponse.json(
      { error: "재고 목록 조회 실패" },
      { status: 500 },
    );
  }
}
