import { createClient } from "@supabase/supabase-js";
import { cafe24 } from "@/lib/api/cafe24";
import { shopify } from "@/lib/api/shopify";
import { updateLastSyncedAt, logSyncError } from "@/lib/supabase/sync-state";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function runWithConcurrencyLimit<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    results.push(...(await Promise.all(batch.map(worker))));
  }
  return results;
}

export async function syncInventory(): Promise<{
  syncedProductCount: number;
  shopifySyncedCount: number;
  errorCount: number;
}> {
  const now = new Date().toISOString();
  let errorCount = 0;
  const supabase = getServiceClient();

  // ── [동적 조회 우회] Supabase에 등록된 모든 상품의 cafe24_product_no 가져오기 ──
  const { data: dbProducts, error: dbError } = await supabase
    .from("products")
    .select("cafe24_product_no");

  if (dbError || !dbProducts) {
    return { syncedProductCount: 0, shopifySyncedCount: 0, errorCount: 1 };
  }

  // 중복 제거 및 숫자형(`number`)으로 변환하여 배열 생성
  const affectedProductNos = Array.from(
    new Set(dbProducts.map((p) => Number(p.cafe24_product_no)).filter(Boolean)),
  );

  if (affectedProductNos.length === 0) {
    await updateLastSyncedAt(now);
    return { syncedProductCount: 0, shopifySyncedCount: 0, errorCount: 0 };
  }

  // ── 3단계: 영향받은 상품만 최신 재고 재조회 ──
  const productResults = await runWithConcurrencyLimit(
    affectedProductNos,
    5,
    async (productNo) => {
      const product = await cafe24.getProductDetail(productNo);
      if (!product) {
        errorCount++;
        await logSyncError({ productNo, errorMessage: "상품 재고 조회 실패" });
        return null;
      }

      return product;
    },
  );

  const validProducts = productResults.filter(
    (p): p is NonNullable<typeof p> => p !== null,
  );

  // ── 4단계: Supabase 업데이트 + Shopify 재고 동기화 ──
  let shopifySyncedCount = 0;

  await runWithConcurrencyLimit(validProducts, 5, async (product) => {
    const numericProductNo = Number(product.product_no);

    // 4-1. 해당 상품의 Supabase row 조회 (name도 같이 가져와서 재조회 줄임)
    const { data: row, error: selectError } = await supabase
      .from("products")
      .select("id, name, stock, shopify_inventory_item_id")
      .eq("cafe24_product_no", numericProductNo)
      .maybeSingle();

    if (selectError) {
      errorCount++;
      await logSyncError({
        productNo: numericProductNo,
        errorMessage: `Supabase 조회 실패: ${selectError.message}`,
      });
      return;
    }

    const oldStock = row?.stock ?? 0;
    const newStock = product.quantity;

    // 4-2. Supabase stock 업데이트
    const { error: updateError } = await supabase
      .from("products")
      .update({
        stock: newStock,
        stock_synced_at: new Date().toISOString(),
      })
      .eq("cafe24_product_no", numericProductNo);

    if (updateError) {
      errorCount++;
      await logSyncError({
        productNo: numericProductNo,
        errorMessage: `Supabase 업데이트 실패: ${updateError.message}`,
      });
      return;
    }

    // 4-3. 재고 변경 이력 기록 (실제 변경이 있을 때만, 노이즈 방지)
    if (row && oldStock !== newStock) {
      await supabase.from("inventory_logs").insert({
        product_id: row.id,
        product_name: row.name,
        old_stock: oldStock,
        new_stock: newStock,
        source: "sync",
        modifier: "system",
      });
    }

    await supabase
      .from("sync_error_log")
      .update({ resolved: true })
      .eq("product_no", numericProductNo)
      .eq("resolved", false);

    // 4-4. Shopify 재고 동기화
    if (row?.shopify_inventory_item_id && process.env.SHOPIFY_LOCATION_ID) {
      try {
        await shopify.updateStock(
          row.shopify_inventory_item_id,
          Number(process.env.SHOPIFY_LOCATION_ID),
          newStock,
        );
        shopifySyncedCount++;
      } catch (shopifyError) {
        errorCount++;
        await logSyncError({
          productNo: numericProductNo,
          errorMessage: `Shopify 재고 동기화 실패: ${
            shopifyError instanceof Error
              ? shopifyError.message
              : "알 수 없는 오류"
          }`,
        });
      }
    }
  });

  // ── 5단계: 커서 갱신 ──
  await updateLastSyncedAt(now);

  return {
    syncedProductCount: validProducts.length,
    shopifySyncedCount,
    errorCount,
  };
}
