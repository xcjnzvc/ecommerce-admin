import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.url;
  const [cafe24Res, shopifyRes] = await Promise.allSettled([
    fetch(url.replace("/api/orders", "/api/orders/cafe24")).then((r) =>
      r.json(),
    ),
    fetch(url.replace("/api/orders", "/api/orders/shopify")).then((r) =>
      r.json(),
    ),
  ]);

  const orders = [
    ...(cafe24Res.status === "fulfilled" ? (cafe24Res.value.orders ?? []) : []),
    ...(shopifyRes.status === "fulfilled"
      ? (shopifyRes.value.orders ?? [])
      : []),
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return NextResponse.json({ orders });
}
