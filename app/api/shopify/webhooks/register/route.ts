import { NextResponse } from "next/server";
import { shopifyApi } from "@/lib/axios-instances";
import { createClient } from "@/lib/supabase/server";

const ORDER_WEBHOOK_TOPICS = [
  "orders/create",
  "orders/updated",
  "orders/cancelled",
] as const;

/**
 * Shopify Admin에 주문 웹훅을 등록합니다 (로그인한 관리자만).
 * 배포 URL이 SHOPIFY_APP_URL 또는 요청 origin과 일치해야 합니다.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl =
    process.env.SHOPIFY_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    new URL(req.url).origin;

  const callbackUrl = `${appUrl.replace(/\/$/, "")}/api/webhooks/shopify/orders`;

  const results: Array<{
    topic: string;
    ok: boolean;
    webhookId?: number;
    error?: string;
  }> = [];

  for (const topic of ORDER_WEBHOOK_TOPICS) {
    try {
      const res = await shopifyApi.post("/webhooks.json", {
        webhook: {
          topic,
          address: callbackUrl,
          format: "json",
        },
      });
      results.push({
        topic,
        ok: true,
        webhookId: res.data?.webhook?.id as number | undefined,
      });
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? JSON.stringify((err as { response?: { data?: unknown } }).response?.data)
          : String(err);
      console.error(`웹훅 등록 실패 (${topic}):`, message);
      results.push({ topic, ok: false, error: message });
    }
  }

  const allOk = results.every((r) => r.ok);

  return NextResponse.json({
    success: allOk,
    callbackUrl,
    results,
  });
}
