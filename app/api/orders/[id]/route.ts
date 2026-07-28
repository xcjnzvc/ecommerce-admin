import { NextRequest, NextResponse } from "next/server";
import { getOrderDetail } from "@/lib/orders/get-order";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const orderId = decodeURIComponent(id);

  if (!orderId) {
    return NextResponse.json(
      { error: "주문 ID가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const order = await getOrderDetail(orderId);
    if (!order) {
      return NextResponse.json(
        { error: "주문을 찾을 수 없습니다." },
        { status: 404 },
      );
    }
    return NextResponse.json({ order });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "주문 상세 조회 실패",
      },
      { status: 500 },
    );
  }
}
