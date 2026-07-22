import { NextRequest, NextResponse } from "next/server";
import { cafe24, imageUrlToBase64 } from "@/lib/api/cafe24";
import { shopify } from "@/lib/api/shopify";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
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
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const {
    stock,
    detail_image,
    list_image,
    small_image,
    tiny_image,
    ...productFields
  } = body;

  // row 조회해서 각 채널 연동 정보 확보 (필요한 컬럼만 조회)
  const { data: row, error: rowError } = await supabase
    .from("products")
    .select("cafe24_product_no, shopify_inventory_item_id")
    .eq("id", id)
    .single();

  if (rowError || !row) {
    return NextResponse.json(
      { error: "상품을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  try {
    // ── 카페24 반영 ──
    if (row.cafe24_product_no) {
      // 상품 정보 수정
      if (Object.keys(productFields).length > 0) {
        await cafe24.updateProduct(row.cafe24_product_no, productFields);
      }

      // [핵심] 프론트에서 넘어온 새 이미지 주소로 카페24 이미지 강제 갱신
      if (detail_image) {
        console.log("🔥 카페24에 새로 업로드할 이미지 URL:", detail_image);

        // Supabase 이미지를 Base64로 변환
        const base64 = await imageUrlToBase64(detail_image);

        // Base64를 바로 카페24에 전송
        await cafe24.updateProductImages(row.cafe24_product_no, {
          detail_image: base64,
          list_image: base64,
          small_image: base64,
          tiny_image: base64,
        });
      }

      // 재고 수정
      if (typeof stock === "number") {
        await cafe24.updateStock(row.cafe24_product_no, stock);
      }
    }

    // ── Shopify 반영 ──
    if (
      typeof stock === "number" &&
      row.shopify_inventory_item_id &&
      process.env.SHOPIFY_LOCATION_ID
    ) {
      await shopify.updateStock(
        row.shopify_inventory_item_id,
        Number(process.env.SHOPIFY_LOCATION_ID),
        stock,
      );
    }

    // ── Supabase 반영 ──
    await supabase
      .from("products")
      .update({
        ...productFields,
        ...(detail_image && { detail_image }),
        stock,
        cafe24_synced_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("===== 상품 수정 에러 =====");
    console.error(err);

    return NextResponse.json(
      {
        error: "상품 수정 실패",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data: row } = await supabase
    .from("products")
    .select("cafe24_product_no, shopify_product_id")
    .eq("id", id)
    .single();

  try {
    if (row?.cafe24_product_no) {
      try {
        await cafe24.deleteProduct(row.cafe24_product_no);
      } catch (cafe24Error) {
        console.warn("카페24 상품 삭제 실패:", cafe24Error);
      }
    }
    if (row?.shopify_product_id) {
      try {
        await shopify.deleteProduct(row.shopify_product_id);
      } catch (shopifyError) {
        console.warn("Shopify 상품 삭제 실패:", shopifyError);
      }
    }

    const { error: dbError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("상품 삭제 실패:", err);
    return NextResponse.json({ error: "상품 삭제 실패" }, { status: 500 });
  }
}
