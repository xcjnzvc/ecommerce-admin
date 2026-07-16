"use client";

import React from "react";
import { useParams } from "next/navigation";
import FoodProductForm from "../../_components/food-product-form";
import type { FoodProductFormInput } from "../../new/food-product.schema";

export default function FoodProductEditPage() {
  const { productNo } = useParams<{ productNo: string }>();
  const [initialValues, setInitialValues] =
    React.useState<FoodProductFormInput | null>(null);
  const [rowId, setRowId] = React.useState<string | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(`/api/products/${productNo}`)
      .then((res) => {
        if (!res.ok) throw new Error("상품을 불러오지 못했습니다.");
        return res.json();
      })
      .then(({ product }) => {
        setRowId(product.id);
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
        });
      })
      .catch((e) => setLoadError(e.message));
  }, [productNo]);

  if (loadError) return <div className="p-8 text-red-600">{loadError}</div>;
  if (!initialValues)
    return <div className="p-8 text-slate-400">불러오는 중...</div>;

  return (
    <FoodProductForm
      mode="edit"
      productNo={Number(productNo)}
      productRowId={rowId ?? undefined}
      initialValues={initialValues}
    />
  );
}
