import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

const SYNC_ID = "cafe24_inventory_sync";

export async function getLastSyncedAt(): Promise<string> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("sync_state")
    .select("last_synced_at")
    .eq("id", SYNC_ID)
    .maybeSingle();

  if (error) console.error("sync_state 조회 실패:", error);

  if (!data) {
    // 최초 실행: 최근 1시간부터 시작 (과거로 너무 잡으면 호출량 폭증 위험)
    return new Date(Date.now() - 60 * 60 * 1000).toISOString();
  }

  return data.last_synced_at;
}

export async function updateLastSyncedAt(timestamp: string): Promise<void> {
  const supabase = getServiceClient();

  const { error } = await supabase.from("sync_state").upsert({
    id: SYNC_ID,
    last_synced_at: timestamp,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("sync_state 업데이트 실패:", error);
    throw error;
  }
}

export async function logSyncError(params: {
  orderId?: string;
  productNo?: number;
  errorMessage: string;
}): Promise<void> {
  const supabase = getServiceClient();

  await supabase.from("sync_error_log").insert({
    order_id: params.orderId ?? null,
    product_no: params.productNo ?? null,
    error_message: params.errorMessage,
  });
}
