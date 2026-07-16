import { NextRequest, NextResponse } from "next/server";
import { cafe24 } from "@/lib/api/cafe24";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productNo: string }> },
) {
  const { productNo } = await params;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("cafe24_product_no", Number(productNo))
    .single();

  if (error || !data) {
    console.error("상품 조회 실패:", error);
    return NextResponse.json(
      { error: "상품을 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  return NextResponse.json({ product: data });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ productNo: string }> },
) {
  const { productNo: productNoParam } = await params;
  const productNo = Number(productNoParam);
  const body = await req.json();
  const { stock, ...productFields } = body;

  try {
    if (Object.keys(productFields).length > 0) {
      await cafe24.updateProduct(productNo, productFields);
    }
    if (typeof stock === "number") {
      await cafe24.updateStock(productNo, stock);
    }

    await supabase
      .from("products")
      .update({
        ...productFields,
        stock,
        cafe24_synced_at: new Date().toISOString(),
      })
      .eq("cafe24_product_no", productNo);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("상품 수정 실패:", err);
    return NextResponse.json({ error: "상품 수정 실패" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ productNo: string }> },
) {
  const { productNo: productNoParam } = await params;
  const productNo = Number(productNoParam);

  try {
    // 1. 카페24에서 삭제 시도 (실패하더라도 catch에서 무시하거나 로그만 기록하도록 처리)
    try {
      await cafe24.deleteProduct(productNo);
    } catch (cafe24Error) {
      console.warn(
        "카페24 상품 삭제 실패 (이미 삭제되었을 수 있음):",
        cafe24Error,
      );
    }

    // 2. 카페24 성공 여부와 관계없이, Supabase 데이터는 무조건 정리 대상이므로 지워줍니다.
    const { error: dbError } = await supabase
      .from("products")
      .delete()
      .eq("cafe24_product_no", productNo);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("상품 삭제 실패:", err);
    return NextResponse.json({ error: "상품 삭제 실패" }, { status: 500 });
  }
}
