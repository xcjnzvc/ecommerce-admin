"use client";

import React from "react";
import { useParams } from "next/navigation";
import { FoodProductEditInput } from "../../_components/food-product.schema";
import FoodProductEditForm from "../../_components/food-product-edit-form";

export default function FoodProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const [initialValues, setInitialValues] =
    React.useState<FoodProductEditInput | null>(null);
  const [currentStock, setCurrentStock] = React.useState<number | undefined>(
    undefined,
  );
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
        setInitialValues({
          name: product.name,
          categoryNos: product.category_nos ?? [],
          price: product.price,
          cost: product.cost,
          description: product.description ?? "",
          options: product.options ?? [],
          legalInfo: product.legal_info,
          channels: product.channels,
          channelData: product.channel_data ?? {},
          status: product.status,
          images: product.images ?? [],
        });
        if (typeof product.stock === "number") {
          setCurrentStock(product.stock);
        }
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
    <FoodProductEditForm
      id={id ?? undefined}
      productRowId={id}
      initialValues={initialValues}
      currentStock={currentStock}
      shopifyProductId={shopifyProductId ?? undefined}
      shopifyInventoryItemId={shopifyInventoryItemId ?? undefined}
      shopifyLocationId={shopifyLocationId ?? undefined}
    />
  );
}
