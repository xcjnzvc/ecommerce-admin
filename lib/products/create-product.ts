import { createClient } from "@/lib/supabase/client";
import type { FoodProductCreateValues } from "@/app/(dashboard)/products/_components/food-product.schema";
import { buildFullDescription } from "@/app/(dashboard)/products/_components/hooks/use-legal-info-description";

export type CreateProductResult = {
  id: string;
  name: string;
};

/**
 * Supabase → 카페24 → Shopify 순서로 단일 상품을 등록합니다.
 * 단일 폼 등록과 엑셀 일괄 등록이 동일한 흐름을 공유합니다.
 */
export async function createProduct(
  data: FoodProductCreateValues,
  images: string[] = [],
  submitStatus: "임시저장" | "판매중" = "판매중",
): Promise<CreateProductResult> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const fullDescription = buildFullDescription(data.description, data.legalInfo);
  const finalStatus = submitStatus ?? data.status ?? "판매중";
  const modifierEmail = session?.user.email ?? null;

  const payload = {
    name: data.name,
    category_nos: data.categoryNos,
    price: data.price,
    cost: data.cost,
    stock: data.stock,
    description: fullDescription,
    images,
    options: data.options,
    legal_info: data.legalInfo,
    channels: data.channels,
    channel_data: data.channelData,
    status: finalStatus,
  };

  // #region agent log
  fetch('http://127.0.0.1:7576/ingest/47ab9bd0-3423-4f30-bd64-318d03377f9f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'69fb1b'},body:JSON.stringify({sessionId:'69fb1b',location:'create-product.ts:beforeInsert',message:'createProduct payload images',data:{productName:data.name,paramImages:images,valuesImages:data.images??[],payloadImages:payload.images},timestamp:Date.now(),hypothesisId:'B-C'})}).catch(()=>{});
  // #endregion

  const { data: inserted, error } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  const insertedRowId = inserted.id as string;

  // #region agent log
  fetch('http://127.0.0.1:7576/ingest/47ab9bd0-3423-4f30-bd64-318d03377f9f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'69fb1b'},body:JSON.stringify({sessionId:'69fb1b',location:'create-product.ts:afterInsert',message:'inserted product images from DB',data:{productId:insertedRowId,productName:data.name,insertedImages:inserted.images??null,insertedImagesType:typeof inserted.images},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  if (data.channels.cafe24) {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_name: data.name,
        price: data.price,
        supply_price: data.cost,
        description: fullDescription,
        category_nos: data.categoryNos,
        display:
          data.channelData.cafe24?.displayStatus === "진열함" ? "T" : "F",
        selling:
          data.channelData.cafe24?.sellingStatus === "판매함" ? "T" : "F",
        detail_image: images[0] || "",
        stock_quantity: data.stock,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "카페24 등록 실패");
    }

    const cafe24Result = await res.json();
    const newProductNo = cafe24Result?.product?.product_no;

    if (newProductNo && insertedRowId) {
      await supabase
        .from("products")
        .update({
          cafe24_product_no: newProductNo,
          cafe24_synced_at: new Date().toISOString(),
        })
        .eq("id", insertedRowId);

      await fetch(`/api/products/${insertedRowId}/stock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock: data.stock,
          modifier: modifierEmail,
        }),
      });
    }
  }

  if (data.channels.shopify) {
    const shopifyRes = await fetch("/api/shopify/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.name,
        body_html: fullDescription,
        price: data.price,
        sku: data.name.replace(/\s+/g, "-").toLowerCase(),
        inventory_quantity: data.stock,
        images,
      }),
    });

    if (!shopifyRes.ok) {
      const err = await shopifyRes.json();
      throw new Error(err.error || "Shopify 등록 실패");
    }

    const shopifyResult = await shopifyRes.json();

    if (shopifyResult.shopify_product_id && insertedRowId) {
      await supabase
        .from("products")
        .update({
          shopify_product_id: shopifyResult.shopify_product_id,
          shopify_inventory_item_id: shopifyResult.shopify_inventory_item_id,
          shopify_synced_at: new Date().toISOString(),
        })
        .eq("id", insertedRowId);
    }
  }

  return { id: insertedRowId, name: data.name };
}
