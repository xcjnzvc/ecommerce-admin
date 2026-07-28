import { NextRequest, NextResponse } from "next/server";
import { cafe24 } from "@/lib/api/cafe24";
import { shopify } from "@/lib/api/shopify";
import { logAxiosError } from "@/lib/api/errors";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { logSyncError } from "@/lib/supabase/sync-state";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json()) as { stock?: unknown; modifier?: unknown };
  const stock = body.stock;
  const modifier =
    typeof body.modifier === "string" ? body.modifier.trim() : undefined;

  // #region agent log
  fetch('http://127.0.0.1:7576/ingest/47ab9bd0-3423-4f30-bd64-318d03377f9f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b1b16a'},body:JSON.stringify({sessionId:'b1b16a',runId:'inventory-save',hypothesisId:'A',location:'api/products/[id]/stock/route.ts:21',message:'stock route received request',data:{productId:id,stockType:typeof stock,stockValue:stock,hasModifier:Boolean(modifier)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (typeof stock !== "number") {
    return NextResponse.json(
      { error: "stock은 number여야 합니다." },
      { status: 400 },
    );
  }

  // 현재 로그인한 관리자 확인
  const serverSupabase = await createServerSupabase();
  const {
    data: { user },
  } = await serverSupabase.auth.getUser();
  const modifierName = user?.email ?? modifier ?? "알 수 없음";

  const { data: row, error: rowError } = await supabase
    .from("products")
    .select("name, stock, cafe24_product_no, shopify_inventory_item_id")
    .eq("id", id)
    .single();

  // #region agent log
  fetch('http://127.0.0.1:7576/ingest/47ab9bd0-3423-4f30-bd64-318d03377f9f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b1b16a'},body:JSON.stringify({sessionId:'b1b16a',runId:'inventory-save',hypothesisId:'C',location:'api/products/[id]/stock/route.ts:46',message:'stock route loaded product row',data:{productId:id,rowFound:Boolean(row),rowError:Boolean(rowError),oldStock:row?.stock ?? null,hasCafe24ProductNo:Boolean(row?.cafe24_product_no),hasShopifyInventoryItemId:Boolean(row?.shopify_inventory_item_id)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (rowError || !row) {
    return NextResponse.json(
      { error: "상품을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const old_stock = row.stock ?? 0;
  const channelErrors: string[] = [];

  try {
    if (row.cafe24_product_no) {
      // #region agent log
      fetch('http://127.0.0.1:7576/ingest/47ab9bd0-3423-4f30-bd64-318d03377f9f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b1b16a'},body:JSON.stringify({sessionId:'b1b16a',runId:'inventory-save',hypothesisId:'B',location:'api/products/[id]/stock/route.ts:59',message:'calling cafe24 stock update',data:{productId:id,stock},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      try {
        await cafe24.updateStock(row.cafe24_product_no, stock);
      } catch (cafe24Error) {
        logAxiosError("cafe24", "updateStock", cafe24Error, {
          productId: id,
          productNo: row.cafe24_product_no,
        });
        const message =
          cafe24Error instanceof Error
            ? cafe24Error.message
            : "카페24 재고 동기화 실패";
        channelErrors.push(`카페24: ${message}`);
        await logSyncError({
          productNo: row.cafe24_product_no,
          errorMessage: `수동 재고 조정 중 카페24 동기화 실패: ${message}`,
        });
      }
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({
        stock,
        stock_synced_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) throw updateError;

    const { error: logError } = await supabase.from("inventory_logs").insert({
      product_id: id,
      product_name: row.name,
      old_stock,
      new_stock: stock,
      source: "manual",
      modifier: modifierName,
    });

    if (logError) throw logError;

    if (row.shopify_inventory_item_id && process.env.SHOPIFY_LOCATION_ID) {
      // #region agent log
      fetch('http://127.0.0.1:7576/ingest/47ab9bd0-3423-4f30-bd64-318d03377f9f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b1b16a'},body:JSON.stringify({sessionId:'b1b16a',runId:'inventory-save',hypothesisId:'B',location:'api/products/[id]/stock/route.ts:66',message:'calling shopify stock update',data:{productId:id,stock,hasLocationId:Boolean(process.env.SHOPIFY_LOCATION_ID)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      try {
        await shopify.updateStock(
          row.shopify_inventory_item_id,
          Number(process.env.SHOPIFY_LOCATION_ID),
          stock,
        );
      } catch (shopifyError) {
        logAxiosError("shopify", "updateStock", shopifyError, {
          productId: id,
          inventoryItemId: row.shopify_inventory_item_id,
        });
        const message =
          shopifyError instanceof Error
            ? shopifyError.message
            : "Shopify 재고 동기화 실패";
        channelErrors.push(`Shopify: ${message}`);
        await logSyncError({
          productNo: row.cafe24_product_no ?? undefined,
          errorMessage: `수동 재고 조정 중 Shopify 동기화 실패: ${message}`,
        });
      }
    }

    // #region agent log
    fetch('http://127.0.0.1:7576/ingest/47ab9bd0-3423-4f30-bd64-318d03377f9f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b1b16a'},body:JSON.stringify({sessionId:'b1b16a',runId:'post-fix',hypothesisId:'D',location:'api/products/[id]/stock/route.ts:97',message:'stock route completed',data:{productId:id,oldStock:old_stock,newStock:stock,channelErrorCount:channelErrors.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    return NextResponse.json({
      success: true,
      warnings: channelErrors.length > 0 ? channelErrors : undefined,
    });
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7576/ingest/47ab9bd0-3423-4f30-bd64-318d03377f9f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b1b16a'},body:JSON.stringify({sessionId:'b1b16a',runId:'inventory-save',hypothesisId:'B',location:'api/products/[id]/stock/route.ts:101',message:'stock route caught error',data:{productId:id,error:err instanceof Error ? err.message : String(err)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    console.error("재고 수정 실패:", err);
    return NextResponse.json({ error: "재고 수정 실패" }, { status: 500 });
  }
}
