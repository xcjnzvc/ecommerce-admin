import { NextRequest, NextResponse } from "next/server";
import { normalizeShopifyOrder } from "@/lib/orders/normalize-shopify";
import { upsertOrderToDb } from "@/lib/orders/upsert-orders";
import { verifyShopifyWebhookDetailed } from "@/lib/orders/verify-shopify-webhook";
import type { ShopifyOrderListItem } from "@/types/shopify";

const HANDLED_TOPICS = new Set([
  "orders/create",
  "orders/updated",
  "orders/cancelled",
  "orders/paid",
]);

/**
 * Shopify 주문 웹훅 (orders/create, orders/updated, orders/cancelled, orders/paid)
 * 등록 URL: https://<your-domain>/api/webhooks/shopify/orders
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const hmac = req.headers.get("x-shopify-hmac-sha256");
  const topic = req.headers.get("x-shopify-topic") ?? "unknown";
  const shopDomain = req.headers.get("x-shopify-shop-domain");

  console.log("Shopify webhook received:", {
    topic,
    shopDomain,
    bodyLength: rawBody.length,
    hasHmac: !!hmac,
  });

  const verification = verifyShopifyWebhookDetailed(rawBody, hmac);

  if (!verification.valid) {
    console.error("Shopify webhook HMAC rejected:", {
      reason: verification.reason,
      secretSource: verification.secretSource,
      topic,
      shopDomain,
    });
    return NextResponse.json(
      { error: "Invalid webhook signature", reason: verification.reason },
      { status: 401 },
    );
  }

  if (!HANDLED_TOPICS.has(topic)) {
    return NextResponse.json({ ok: true, skipped: true, topic });
  }

  try {
    const payload = JSON.parse(rawBody) as ShopifyOrderListItem;
    const order = normalizeShopifyOrder(payload);
    await upsertOrderToDb(order);

    // #region agent log
    fetch("http://127.0.0.1:7576/ingest/47ab9bd0-3423-4f30-bd64-318d03377f9f", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "cd9a7b",
      },
      body: JSON.stringify({
        sessionId: "cd9a7b",
        runId: "pre-fix",
        hypothesisId: "E",
        location: "webhooks/shopify/orders:upsert",
        message: "order upserted to db",
        data: { orderId: order.id, topic },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    return NextResponse.json({
      ok: true,
      topic,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Shopify 주문 웹훅 처리 실패:", topic, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 },
    );
  }
}
