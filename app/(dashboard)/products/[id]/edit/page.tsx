"use client";

import React from "react";
import { useParams } from "next/navigation";
import { FoodProductFormInput } from "../../new/food-product.schema";
import FoodProductForm from "../../_components/food-product-form";

export default function FoodProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const [initialValues, setInitialValues] =
    React.useState<FoodProductFormInput | null>(null);
  const [productNo, setProductNo] = React.useState<number | null>(null);
  const [shopifyProductId, setShopifyProductId] = React.useState<number | null>(
    null,
  );

  const [shopifyInventoryItemId, setShopifyInventoryItemId] = React.useState<
    number | null
  >(null);

  const [shopifyLocationId, setShopifyLocationId] = React.useState<
    number | null
  >(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("상품을 불러오지 못했습니다.");
        return res.json();
      })
      .then(({ product }) => {
        setProductNo(product.cafe24_product_no ?? null);
        setInitialValues({
          name: product.name,
          categoryNos: product.category_nos ?? [],
          price: product.price,
          cost: product.cost,
          stock: product.stock,
          description: product.description ?? "",
          options: product.options ?? [],
          legalInfo: product.legal_info,
          channels: product.channels,
          channelData: product.channel_data ?? {},
          status: product.status,
          images: product.images ?? [],
        });
        setShopifyProductId(product.shopify_product_id ?? null);
        setShopifyInventoryItemId(product.shopify_inventory_item_id ?? null);
        setShopifyLocationId(product.shopify_location_id ?? null);
      })
      .catch((e) => setLoadError(e.message));
  }, [id]);

  if (loadError) return <div className="p-8 text-red-600">{loadError}</div>;
  if (!initialValues)
    return <div className="p-8 text-slate-400">불러오는 중...</div>;

  return (
    <FoodProductForm
      mode="edit"
      id={id ?? undefined}
      productRowId={id}
      initialValues={initialValues}
      shopifyProductId={shopifyProductId ?? undefined}
      shopifyInventoryItemId={shopifyInventoryItemId ?? undefined}
      shopifyLocationId={shopifyLocationId ?? undefined}
    />
  );
}
