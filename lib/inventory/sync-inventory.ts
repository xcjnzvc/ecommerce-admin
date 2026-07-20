import { createClient } from "@supabase/supabase-js";
import { cafe24 } from "@/lib/api/cafe24";
import {
  getLastSyncedAt,
  updateLastSyncedAt,
  logSyncError,
} from "@/lib/supabase/sync-state";
import { INVENTORY_DATE_TYPES } from "@/types/cafe24";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// 동시 호출 제한 (카페24 호출건수 제한 40건 대비 여유있게)
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
  errorCount: number;
}> {
  const now = new Date().toISOString();
  const lastSyncedAt = await getLastSyncedAt();

  const startDate = lastSyncedAt.slice(0, 10);
  const endDate = now.slice(0, 10);

  // ── 1단계: 재고에 영향 준 주문 수집 (신규/취소/반품/교환 각각) ──
  const orderLists = await Promise.all(
    INVENTORY_DATE_TYPES.map((dateType) =>
      cafe24.getOrders({ startDate, endDate, dateType }).catch((err) => {
        console.error(`${dateType} 주문 조회 실패:`, err);
        return [];
      }),
    ),
  );

  const uniqueOrderIds = Array.from(
    new Set(orderLists.flat().map((o) => o.order_id)),
  );

  if (uniqueOrderIds.length === 0) {
    await updateLastSyncedAt(now);
    return { syncedProductCount: 0, errorCount: 0 };
  }

  // ── 2단계: 각 주문의 품주 조회 → 영향받은 product_no 수집 ──
  let errorCount = 0;

  const itemsPerOrder = await runWithConcurrencyLimit(
    uniqueOrderIds,
    5,
    async (orderId) => {
      try {
        return await cafe24.getOrderItems(orderId);
      } catch (error) {
        errorCount++;
        await logSyncError({
          orderId,
          errorMessage:
            error instanceof Error ? error.message : "알 수 없는 오류",
        });
        return [];
      }
    },
  );

  const affectedProductNos = Array.from(
    new Set(itemsPerOrder.flat().map((item) => item.product_no)),
  );

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

  // ── 4단계: Supabase 업데이트 ──
  const supabase = getServiceClient();

  for (const product of validProducts) {
    const { error } = await supabase
      .from("products")
      .update({
        stock: product.quantity,
        stock_synced_at: new Date().toISOString(),
      })
      .eq("cafe24_product_no", product.product_no);

    if (error) {
      errorCount++;
      await logSyncError({
        productNo: product.product_no,
        errorMessage: `Supabase 업데이트 실패: ${error.message}`,
      });
    }
  }

  // ── 5단계: 커서 갱신 ──
  await updateLastSyncedAt(now);

  return { syncedProductCount: validProducts.length, errorCount };
}
