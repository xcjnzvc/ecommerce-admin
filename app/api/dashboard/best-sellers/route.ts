import { NextRequest, NextResponse } from "next/server";
import { aggregateBestSellers } from "@/lib/dashboard/best-sellers";
import { listOrdersFromDb } from "@/lib/orders/list-orders";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const startDate =
    searchParams.get("start_date") ??
    new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10);
  const endDate =
    searchParams.get("end_date") ?? new Date().toISOString().slice(0, 10);

  try {
    const orders = await listOrdersFromDb({ startDate, endDate });
    const bestSellers = aggregateBestSellers(orders, 5);
    return NextResponse.json({ bestSellers });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "베스트셀러 조회 실패",
      },
      { status: 500 },
    );
  }
}
