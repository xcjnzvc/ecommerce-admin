import { NextRequest, NextResponse } from "next/server";
import { shopify } from "@/lib/api/shopify";
import { normalizeShopifyOrder } from "@/lib/orders/normalize-shopify";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startDate =
    searchParams.get("start_date") ??
    new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10);
  const endDate =
    searchParams.get("end_date") ?? new Date().toISOString().slice(0, 10);

  try {
    const raw = await shopify.getOrders({
      status: "any",
      createdAtMin: `${startDate}T00:00:00Z`,
      createdAtMax: `${endDate}T23:59:59Z`,
    });

    return NextResponse.json({ orders: raw.map(normalizeShopifyOrder) });
  } catch (err) {
    console.error("Shopify 주문 목록 조회 실패:", err);
    return NextResponse.json(
      { error: "Shopify 주문 목록 조회 실패" },
      { status: 500 },
    );
  }
}
