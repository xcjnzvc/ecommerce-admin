import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Shopify 웹훅 HMAC 검증 (X-Shopify-Hmac-SHA256).
 * Custom App의 API secret (SHOPIFY_CLIENT_SECRET) 사용.
 */
export function verifyShopifyWebhook(
  rawBody: string,
  hmacHeader: string | null,
): boolean {
  const secret =
    process.env.SHOPIFY_WEBHOOK_SECRET ?? process.env.SHOPIFY_CLIENT_SECRET;

  if (!secret) {
    console.error("Shopify 웹훅 secret이 설정되지 않았습니다.");
    return false;
  }

  if (!hmacHeader) return false;

  const digest = createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  const digestBuf = Buffer.from(digest, "utf8");
  const hmacBuf = Buffer.from(hmacHeader, "utf8");

  if (digestBuf.length !== hmacBuf.length) return false;

  return timingSafeEqual(digestBuf, hmacBuf);
}
