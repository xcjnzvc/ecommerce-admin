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
  foodProductCreateSchema,
  type FoodProductCreateValues,
  type FoodProductCreateInput,
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

const emptyDefaults: FoodProductCreateInput = {
  name: "",
  categoryNos: [],
  price: 0,
  cost: 0,
  stock: 0,
  description: "",
  options: [],
  legalInfo: {
    foodType: "",
    ingredients: "",
    netWeight: "",
    expiryDate: "",
    storageMethod: "",
    manufacturer: "",
    consumerServicePhone: "",
    allergens: [],
    isGMO: "해당없음",
    nutritionRequired: false,
    isImported: false,
  },
  channels: { shopify: false, cafe24: false },
  channelData: {},
  status: "임시저장",
};

export default function FoodProductCreateForm() {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FoodProductCreateInput, unknown, FoodProductCreateValues>({
    resolver: zodResolver(
      foodProductCreateSchema,
    ) as Resolver<FoodProductCreateInput, unknown, FoodProductCreateValues>,
    defaultValues: emptyDefaults,
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
  } = useProductImageUpload();

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
    data: FoodProductCreateValues,
    submitStatus: "임시저장" | "판매중" = "판매중",
  ) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const { finalImages } = await resolveFinalImages();
      const fullDescription = buildFullDescription(
        data.description,
        data.legalInfo,
      );

      const payload = {
        name: data.name,
        category_nos: data.categoryNos,
        price: data.price,
        cost: data.cost,
        stock: data.stock,
        description: fullDescription,
        images: finalImages,
        options: data.options,
        legal_info: data.legalInfo,
        channels: data.channels,
        channel_data: data.channelData,
        status: submitStatus,
      };

      const { data: inserted, error } = await supabase
        .from("products")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      const insertedRowId = inserted.id;

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
            detail_image: finalImages[0] || "",
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
          // stock 라우트가 cafe24_product_no를 조회하므로 먼저 저장
          await supabase
            .from("products")
            .update({
              cafe24_product_no: newProductNo,
              cafe24_synced_at: new Date().toISOString(),
            })
            .eq("id", insertedRowId);

          // 이 시점엔 shopify_inventory_item_id가 없어 Shopify updateStock은 호출되지 않음
          await fetch(`/api/products/${insertedRowId}/stock`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stock: data.stock }),
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
            images: finalImages,
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
              shopify_inventory_item_id:
                shopifyResult.shopify_inventory_item_id,
              shopify_synced_at: new Date().toISOString(),
            })
            .eq("id", insertedRowId);
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
            상품 등록 (식품)
          </h1>
          <p className="text-slate-500 text-sm">
            Shopify와 카페24 채널별 정보를 한 번에 입력하고 등록하세요.
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
            showStockInput
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
              <Save size={18} /> {isSaving ? "저장 중..." : "상품 등록"}
            </button>
          </div>
        </form>
      </div>

      <FormInputStyles />
    </div>
  );
}
