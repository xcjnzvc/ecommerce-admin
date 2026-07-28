import { NextRequest, NextResponse } from "next/server";
import { syncOrders } from "@/lib/orders/sync-orders";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

/** 관리자 수동 주문 동기화 (채널 API → orders 테이블) */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    start_date?: string;
    end_date?: string;
  };

  try {
    const result = await syncOrders({
      startDate: body.start_date,
      endDate: body.end_date,
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("주문 수동 동기화 실패:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 },
    );
  }
}
