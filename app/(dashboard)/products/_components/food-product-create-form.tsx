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
import {
  foodProductCreateSchema,
  foodProductDraftCreateSchema,
  sanitizeProductOptions,
  type FoodProductCreateValues,
  type FoodProductCreateInput,
} from "./food-product.schema";
import { useProductImageUpload } from "./hooks/use-product-image-upload";
import { createProduct } from "@/lib/products/create-product";
import { ProductBasicInfoSection } from "./shared/product-basic-info-section";
import { ProductImageSection } from "./shared/product-image-section";
import { ProductOptionsSection } from "./shared/product-options-section";
import { LegalInfoSection } from "./shared/legal-info-section";
import { ChannelInfoSection } from "./shared/channel-info-section";
import { ProductPreviewSection } from "./shared/product-preview-section";
import { FormInputStyles } from "./shared/form-ui";
import { FormValidationAlert } from "./form-validation-alert";
import {
  collectFormErrorMessages,
  focusFirstFormError,
  scrollToFormField,
  getSectionForFieldPath,
  type ProductFormSection,
} from "./hooks/use-form-scroll-to-error";
import { applyZodErrors } from "./hooks/apply-zod-errors";

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
    setError,
    clearErrors,
    getValues,
    setFocus,
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

  const [validationMessages, setValidationMessages] = React.useState<string[]>(
    [],
  );

  const openSectionForValidation = (section: ProductFormSection) => {
    if (section === "options") setIsOptionsOpen(true);
    if (section === "legal") setIsLegalOpen(true);
  };

  const handleInvalidSubmit = (
    fieldErrors: typeof errors = errors,
  ) => {
    const messages = collectFormErrorMessages(fieldErrors);
    setValidationMessages(messages);
    focusFirstFormError(fieldErrors, setFocus, openSectionForValidation);
  };

  const handleDraftSubmit = async () => {
    clearErrors();
    setValidationMessages([]);
    setSaveError(null);

    const parsed = foodProductDraftCreateSchema.safeParse(getValues());
    if (!parsed.success) {
      applyZodErrors(parsed.error, setError);
      const messages = parsed.error.issues.map((issue) => issue.message);
      setValidationMessages(messages);

      const firstPath = parsed.error.issues[0]?.path.join(".");
      if (firstPath) {
        openSectionForValidation(getSectionForFieldPath(firstPath));
        scrollToFormField(firstPath, setFocus);
      }
      return;
    }

    await onSubmit(
      sanitizeProductOptions(parsed.data) as FoodProductCreateValues,
      "임시저장",
    );
  };

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
      await createProduct(data, finalImages, submitStatus);
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
          onSubmit={handleSubmit(
            (data) => {
              setValidationMessages([]);
              return onSubmit(sanitizeProductOptions(data), "판매중");
            },
            handleInvalidSubmit,
          )}
        >
          <FormValidationAlert messages={validationMessages} />

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
            errors={errors}
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
              onClick={handleDraftSubmit}
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
