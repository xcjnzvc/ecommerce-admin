import { createHmac, timingSafeEqual } from "node:crypto";

type VerifyShopifyWebhookResult = {
  valid: boolean;
  reason?: string;
  digest?: string;
  secretSource?: "SHOPIFY_WEBHOOK_SECRET" | "SHOPIFY_CLIENT_SECRET" | "none";
};

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

  // ↓↓↓ 임시 디버그 로그 (원인 파악 후 반드시 제거) ↓↓↓
  console.log("[webhook-debug]", {
    secretLength: secret.length,
    secretFirst4: secret.slice(0, 4),
    secretLast4: secret.slice(-4),
    rawBodyLength: rawBody.length,
    computedDigest: digest,
    receivedHmac: hmacHeader,
  });
  // ↑↑↑ 임시 디버그 로그 ↑↑↑

  const digestBuf = Buffer.from(digest, "utf8");
  const hmacBuf = Buffer.from(hmacHeader, "utf8");

  if (digestBuf.length !== hmacBuf.length) return false;

  return timingSafeEqual(digestBuf, hmacBuf);
}

export function verifyShopifyWebhookDetailed(
  rawBody: string,
  hmacHeader: string | null,
): VerifyShopifyWebhookResult {
  const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET?.trim();
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim();
  const secret = webhookSecret ?? clientSecret;
  const secretSource = webhookSecret
    ? "SHOPIFY_WEBHOOK_SECRET"
    : clientSecret
      ? "SHOPIFY_CLIENT_SECRET"
      : "none";

  if (!secret) {
    console.error("Shopify 웹훅 secret이 설정되지 않았습니다.");
    return { valid: false, reason: "missing_secret", secretSource };
  }

  if (!hmacHeader) {
    return { valid: false, reason: "missing_hmac_header", secretSource };
  }

  const digest = createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  // #region agent log — Vercel Function Logs에서 확인
  console.log("Shopify webhook HMAC check:", {
    secretExists: !!secret,
    secretLength: secret.length,
    secretTrimmed:
      secret.length === secret.trim().length ? "ok" : "had_whitespace",
    secretSource,
    rawBodyLength: rawBody.length,
    digest,
    receivedHmac: hmacHeader,
    digestLength: digest.length,
    hmacLength: hmacHeader.length,
  });
  // #endregion

  const digestBuf = Buffer.from(digest, "utf8");
  const hmacBuf = Buffer.from(hmacHeader, "utf8");

  if (digestBuf.length !== hmacBuf.length) {
    return {
      valid: false,
      reason: "hmac_length_mismatch",
      digest,
      secretSource,
    };
  }

  const valid = timingSafeEqual(digestBuf, hmacBuf);
  if (!valid) {
    return {
      valid: false,
      reason: "hmac_mismatch",
      digest,
      secretSource,
    };
  }

  return { valid: true, digest, secretSource };
}
