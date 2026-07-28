import { NextRequest, NextResponse } from "next/server";
import { listOrdersFromDb } from "@/lib/orders/list-orders";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("start_date") ?? undefined;
  const endDate = searchParams.get("end_date") ?? undefined;

  try {
    const orders = await listOrdersFromDb({ startDate, endDate });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "주문 목록 조회 실패",
      },
      { status: 500 },
    );
  }
}
