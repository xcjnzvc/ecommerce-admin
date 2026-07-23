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
  console.log("syncInventory 실행");
  console.log("########## 내가 수정한 코드 실행 ##########");
  const now = new Date().toISOString();
  let errorCount = 0;
  const supabase = getServiceClient();

  // ── [동적 조회 우회] Supabase에 등록된 모든 상품의 cafe24_product_no 가져오기 ──
  const { data: dbProducts, error: dbError } = await supabase
    .from("products")
    .select("cafe24_product_no");

  if (dbError || !dbProducts) {
    console.error("Supabase 상품 목록 조회 실패:", dbError);
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
      console.log(product.product_no);
      console.log(product.quantity);
      return product;
    },
  );

  const validProducts = productResults.filter(
    (p): p is NonNullable<typeof p> => p !== null,
  );

  console.log("validProducts 개수:", validProducts.length);

  // ── 4단계: Supabase 업데이트 + Shopify 재고 동기화 ──
  let shopifySyncedCount = 0;

  await runWithConcurrencyLimit(validProducts, 5, async (product) => {
    const numericProductNo = Number(product.product_no);

    // 4-1. 해당 상품의 Supabase row 조회
    const { data: row, error: selectError } = await supabase
      .from("products")
      .select("id, shopify_inventory_item_id")
      .eq("cafe24_product_no", numericProductNo)
      .maybeSingle();

    console.log("Supabase row:", row);

    if (selectError) {
      errorCount++;
      await logSyncError({
        productNo: numericProductNo,
        errorMessage: `Supabase 조회 실패: ${selectError.message}`,
      });
      return;
    }

    // 4-2. Supabase stock 업데이트
    console.log("업데이트 전", numericProductNo, product.quantity);

    const { error: updateError } = await supabase
      .from("products")
      .update({
        stock: product.quantity,
        stock_synced_at: new Date().toISOString(),
      })
      .eq("cafe24_product_no", numericProductNo);

    console.log("업데이트 결과", updateError);

    if (updateError) {
      errorCount++;
      await logSyncError({
        productNo: numericProductNo,
        errorMessage: `Supabase 업데이트 실패: ${updateError.message}`,
      });
      return;
    }

    await supabase
      .from("sync_error_log")
      .update({ resolved: true })
      .eq("product_no", numericProductNo)
      .eq("resolved", false);

    console.log({
      row,
      inventoryItemId: row?.shopify_inventory_item_id,
      locationId: process.env.SHOPIFY_LOCATION_ID,
    });

    // 4-3. Shopify 재고 동기화
    if (row?.shopify_inventory_item_id && process.env.SHOPIFY_LOCATION_ID) {
      try {
        console.log("Shopify 보낼 값", {
          inventoryItemId: row?.shopify_inventory_item_id,
          locationId: process.env.SHOPIFY_LOCATION_ID,
          quantity: product.quantity,
        });
        await shopify.updateStock(
          row.shopify_inventory_item_id,
          Number(process.env.SHOPIFY_LOCATION_ID),
          product.quantity,
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
