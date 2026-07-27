import { NextRequest, NextResponse } from "next/server";
import { aggregateBestSellers } from "@/lib/dashboard/best-sellers";
import type { Order } from "@/lib/orders/types";

function extractOrders(
  result: PromiseSettledResult<{ orders?: Order[]; error?: string }>,
): Order[] {
  if (result.status !== "fulfilled") return [];
  return result.value.orders ?? [];
}

export async function GET(req: NextRequest) {
  const { origin, searchParams } = new URL(req.url);

  const startDate =
    searchParams.get("start_date") ??
    new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10);
  const endDate =
    searchParams.get("end_date") ?? new Date().toISOString().slice(0, 10);
  const qs = `start_date=${startDate}&end_date=${endDate}`;

  const [cafe24Res, shopifyRes] = await Promise.allSettled([
    fetch(`${origin}/api/orders/cafe24?${qs}`).then((r) => r.json()),
    fetch(`${origin}/api/orders/shopify?${qs}`).then((r) => r.json()),
  ]);

  const orders = [
    ...extractOrders(cafe24Res),
    ...extractOrders(shopifyRes),
  ];

  const bestSellers = aggregateBestSellers(orders, 5);

  return NextResponse.json({ bestSellers });
}
