"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  useForm,
  useFieldArray,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  foodProductEditSchema,
  type FoodProductEditValues,
  type FoodProductEditInput,
} from "./food-product.schema";
import { useProductImageUpload } from "./hooks/use-product-image-upload";
import { buildFullDescription } from "./hooks/use-legal-info-description";
import { ProductBasicInfoSection } from "./shared/product-basic-info-section";
import { ProductImageSection } from "./shared/product-image-section";
import { ProductOptionsSection } from "./shared/product-options-section";
import { LegalInfoSection } from "./shared/legal-info-section";
import { ChannelInfoSection } from "./shared/channel-info-section";
import { ProductPreviewSection } from "./shared/product-preview-section";
import { FormInputStyles } from "./shared/form-ui";

interface FoodProductEditFormProps {
  id?: string;
  productRowId?: string;
  shopifyProductId?: number;
  shopifyInventoryItemId?: number;
  shopifyLocationId?: number;
  initialValues: FoodProductEditInput;
  /** 재고 API 연동 후 값이 오면 읽기전용으로 표시 */
  currentStock?: number;
}

export default function FoodProductEditForm({
  id,
  productRowId,
  shopifyProductId,
  shopifyInventoryItemId,
  shopifyLocationId,
  initialValues,
  currentStock,
}: FoodProductEditFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FoodProductEditInput, unknown, FoodProductEditValues>({
    resolver: zodResolver(
      foodProductEditSchema,
    ) as Resolver<FoodProductEditInput, unknown, FoodProductEditValues>,
    defaultValues: initialValues,
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const router = useRouter();
  const supabase = createClient();
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = React.useState(false);
  const [isLegalOpen, setIsLegalOpen] = React.useState(true);
  const [previewTab, setPreviewTab] = React.useState<"shopify" | "cafe24">(
    "shopify",
  );
  const [categories, setCategories] = React.useState<
    { category_no: number; category_name: string }[]
  >([]);

  const {
    mainImagePreview,
    detailImagePreviews,
    handleMainImageChange,
    handleDetailImagesChange,
    removeDetailImage,
    resolveFinalImages,
  } = useProductImageUpload(initialValues.images);

  React.useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => setCategories([]));
  }, []);

  const nutritionRequired = watch("legalInfo.nutritionRequired");
  const isImported = watch("legalInfo.isImported");
  const shopifyChecked = watch("channels.shopify");
  const cafe24Checked = watch("channels.cafe24");
  const formSnapshot = watch();

  const handleChannelToggle = (
    channel: "shopify" | "cafe24",
    checked: boolean,
  ) => {
    setValue(`channels.${channel}`, checked, { shouldValidate: true });
    if (checked) {
      if (channel === "shopify") {
        setValue("channelData.shopify", {
          productType: "",
          vendor: "",
          tags: "",
          publishStatus: "draft",
        });
      } else {
        setValue("channelData.cafe24", {
          displayStatus: "진열함",
          sellingStatus: "판매함",
          shippingPolicy: "",
        });
      }
    } else {
      setValue(`channelData.${channel}`, undefined);
    }
  };

  const onSubmit = async (
    data: FoodProductEditValues,
    submitStatus: "임시저장" | "판매중" = "판매중",
  ) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      if (!productRowId) {
        throw new Error("수정할 상품 정보를 찾을 수 없습니다.");
      }

      const { finalImages, mainImageUrl } = await resolveFinalImages();
      const fullDescription = buildFullDescription(
        data.description,
        data.legalInfo,
      );

      const payload = {
        name: data.name,
        category_nos: data.categoryNos,
        price: data.price,
        cost: data.cost,
        description: fullDescription,
        images: finalImages,
        options: data.options,
        legal_info: data.legalInfo,
        channels: data.channels,
        channel_data: data.channelData,
        status: submitStatus,
      };

      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", productRowId);

      if (error) throw error;

      if (id && data.channels.cafe24) {
        const res = await fetch(`/api/products/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_name: data.name,
            price: data.price,
            description: fullDescription,
            display:
              data.channelData.cafe24?.displayStatus === "진열함" ? "T" : "F",
            selling:
              data.channelData.cafe24?.sellingStatus === "판매함" ? "T" : "F",
            detail_image: mainImageUrl || "",
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "카페24 수정 실패");
        }
      }

      if (data.channels.shopify && shopifyProductId) {
        const res = await fetch(`/api/shopify/products/${shopifyProductId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: data.name,
            body_html: fullDescription,
            images: finalImages,
            inventory_item_id: shopifyInventoryItemId,
            location_id: shopifyLocationId,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Shopify 수정 실패");
        }
      }

      setIsSaving(false);
      router.push("/products");
    } catch (error) {
      setIsSaving(false);
      console.error("저장 실패:", error);
      setSaveError(
        error instanceof Error
          ? error.message
          : "알 수 없는 에러가 발생했습니다.",
      );
    }
  };

  const previewPayload =
    previewTab === "shopify"
      ? {
          name: formSnapshot.name,
          price: formSnapshot.price,
          legalInfo: formSnapshot.legalInfo,
          shopify: formSnapshot.channelData.shopify,
        }
      : {
          name: formSnapshot.name,
          price: formSnapshot.price,
          legalInfo: formSnapshot.legalInfo,
          cafe24: formSnapshot.channelData.cafe24,
        };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            상품 수정 (식품)
          </h1>
          <p className="text-slate-500 text-sm">
            Shopify와 카페24 채널별 정보를 한 번에 입력하고 수정하세요.
          </p>
        </header>

        <form
          className="space-y-6"
          onSubmit={handleSubmit((data) => onSubmit(data, "판매중"))}
        >
          <ProductBasicInfoSection
            register={register}
            control={control}
            errors={errors}
            categories={categories}
            currentStock={currentStock}
            imageSlot={
              <ProductImageSection
                mainImagePreview={mainImagePreview}
                detailImagePreviews={detailImagePreviews}
                onMainImageChange={handleMainImageChange}
                onDetailImagesChange={handleDetailImagesChange}
                onRemoveDetailImage={removeDetailImage}
              />
            }
          />

          <ProductOptionsSection
            register={register}
            fields={fields}
            append={append}
            remove={remove}
            isOpen={isOptionsOpen}
            onToggle={() => setIsOptionsOpen((v) => !v)}
          />

          <LegalInfoSection
            register={register}
            control={control}
            errors={errors}
            nutritionRequired={!!nutritionRequired}
            isImported={!!isImported}
            isOpen={isLegalOpen}
            onToggle={() => setIsLegalOpen((v) => !v)}
          />

          <ChannelInfoSection
            register={register}
            errors={errors}
            shopifyChecked={!!shopifyChecked}
            cafe24Checked={!!cafe24Checked}
            onChannelToggle={handleChannelToggle}
          />

          <ProductPreviewSection
            previewTab={previewTab}
            onPreviewTabChange={setPreviewTab}
            previewPayload={previewPayload}
          />

          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              저장 중 문제가 발생했습니다: {saveError}
            </div>
          )}

          <div className="flex gap-4 justify-end pt-6">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSubmit((data) => onSubmit(data, "임시저장"))}
              className="px-6 py-2 border rounded-lg font-semibold hover:bg-slate-100 disabled:opacity-50"
            >
              임시저장
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} /> {isSaving ? "저장 중..." : "상품 수정"}
            </button>
          </div>
        </form>
      </div>

      <FormInputStyles />
    </div>
  );
}
