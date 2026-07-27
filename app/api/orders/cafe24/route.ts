import { NextRequest, NextResponse } from "next/server";
import { cafe24 } from "@/lib/api/cafe24";
import { normalizeCafe24Order } from "@/lib/orders/normalize-cafe24";

function getErrorStatus(err: unknown): number | undefined {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { status?: number } }).response;
    return response?.status;
  }
  return undefined;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startDate =
    searchParams.get("start_date") ??
    new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10);
  const endDate =
    searchParams.get("end_date") ?? new Date().toISOString().slice(0, 10);

  try {
    const raw = await cafe24.getOrders({
      startDate,
      endDate,
      dateType: "order_date",
      embed: "buyer,items",
    });
    return NextResponse.json({ orders: raw.map(normalizeCafe24Order) });
  } catch (err) {
    console.error("카페24 주문 목록 조회 실패:", err);
    const status = getErrorStatus(err);

    if (status === 403) {
      return NextResponse.json(
        {
          error:
            "카페24 주문 조회 권한이 없습니다. mall.read_order 스코프로 재인증이 필요합니다.",
        },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { error: "카페24 주문 목록 조회 실패" },
      { status: 500 },
    );
  }
}
