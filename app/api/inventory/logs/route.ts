import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("inventory_logs")
      .select("id, product_name, old_stock, new_stock, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    const logs = (data ?? []).map((row) => ({
      id: row.id,
      product_name: row.product_name,
      change_detail: `${row.old_stock ?? 0}개 → ${row.new_stock ?? 0}개`,
      modifier: "관리자",
      created_at: row.created_at,
    }));

    return NextResponse.json({ logs });
  } catch (err) {
    console.error("재고 변경 이력 조회 실패:", err);
    return NextResponse.json(
      { error: "재고 변경 이력 조회 실패" },
      { status: 500 },
    );
  }
}
