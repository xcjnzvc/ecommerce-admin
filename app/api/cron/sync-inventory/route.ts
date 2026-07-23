import { NextRequest, NextResponse } from "next/server";
import { syncInventory } from "@/lib/inventory/sync-inventory";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncInventory();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("재고 동기화 실패:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 },
    );
  }
}
