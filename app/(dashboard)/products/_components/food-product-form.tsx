"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, Save, Upload, Wand2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { buildLegalInfoHtml } from "@/lib/build-legal-info-html";
import {
  foodProductSchema,
  type FoodProductFormInput,
  type FoodProductFormValues,
  ALLERGEN_OPTIONS,
} from "../new/food-product.schema";

const emptyDefaults: FoodProductFormInput = {
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

interface FoodProductFormProps {
  mode: "create" | "edit";
  id?: string; // edit일 때: cafe24_product_no
  productRowId?: string; // edit일 때: Supabase products.id
  shopifyProductId?: number;
  shopifyInventoryItemId?: number;
  shopifyLocationId?: number;
  initialValues?: FoodProductFormInput;
}

export default function FoodProductForm({
  mode,
  id,
  productRowId,
  shopifyProductId,
  shopifyInventoryItemId,
  shopifyLocationId,
  initialValues,
}: FoodProductFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FoodProductFormInput, unknown, FoodProductFormValues>({
    resolver: zodResolver(foodProductSchema),
    defaultValues: initialValues ?? emptyDefaults,
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

  // 대표 이미지 상태 (1장)
  const [mainImageFile, setMainImageFile] = React.useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = React.useState<string | null>(
    initialValues?.images?.[0] || null, // 수정 모드일 때 기존 등록된 이미지 노출용
  );

  // 상세 이미지 상태 (여러 장)
  const [detailImageFiles, setDetailImageFiles] = React.useState<File[]>([]);
  const [detailImagePreviews, setDetailImagePreviews] = React.useState<
    string[]
  >(
    initialValues?.images?.slice(1) || [], // 수정 모드일 때 두 번째 이미지부터 노출용
  );

  const [isOptionsOpen, setIsOptionsOpen] = React.useState(false);
  const [isLegalOpen, setIsLegalOpen] = React.useState(true);
  const [previewTab, setPreviewTab] = React.useState<"shopify" | "cafe24">(
    "shopify",
  );
  const [categories, setCategories] = React.useState<
    { category_no: number; category_name: string }[]
  >([]);

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

  // 대표 이미지 선택 핸들러
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      // 메모리 누수 방지를 위해 기존 preview URL 해제 후 새 preview URL 생성
      if (mainImagePreview && !mainImagePreview.startsWith("http")) {
        URL.revokeObjectURL(mainImagePreview);
      }
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  // 상세 이미지 추가 핸들러
  const handleDetailImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setDetailImageFiles((prev) => [...prev, ...files]);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setDetailImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // 상세 이미지 개별 제거 핸들러
  const removeDetailImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      // 이미 DB에 업로드되어 있던 이미지 제거
      setDetailImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // 새로 추가한 파일 리스트에서 제거
      const fileIndexOffset = detailImagePreviews.filter((url) =>
        url.startsWith("http"),
      ).length;
      const fileIndex = index - fileIndexOffset;

      setDetailImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      setDetailImagePreviews((prev) => {
        const target = prev[index];
        if (target && !target.startsWith("http")) URL.revokeObjectURL(target);
        return prev.filter((_, i) => i !== index);
      });
    }
  };

  const uploadToStorage = async (file: File): Promise<string> => {
    // 한글 파일명이나 중복 파일명 방지를 위해 고유한 파일 네이밍 적용
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { data, error } = await supabase.storage
      .from("product-images") // 버킷명
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Storage 업로드 에러: ${error.message}`);
    }

    // 업로드 성공 후 Public URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (
    data: FoodProductFormValues,
    submitStatus: "임시저장" | "판매중" = "판매중",
  ) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      // ── [1단계] 이미지 업로드 프로세스 실행 ──
      let mainImageUrl = mainImagePreview; // 기존 수정 모드일 때 보관된 URL 기본값 사용

      if (mainImageFile) {
        mainImageUrl = await uploadToStorage(mainImageFile);

        console.log("업로드 URL:", mainImageUrl);

        const res = await fetch(mainImageUrl);

        console.log("status:", res.status);
        console.log("content-type:", res.headers.get("content-type"));
      }

      // 상세 이미지 중 새로 추가된 파일들 업로드 진행
      const uploadedDetailUrls = await Promise.all(
        detailImageFiles.map((file) => uploadToStorage(file)),
      );

      // 기존 보관 중이던 URL들과 새로 업로드된 상세 이미지 URL들을 병합
      const existingDetailUrls = detailImagePreviews.filter((url) =>
        url.startsWith("http"),
      );
      const finalDetailUrls = [...existingDetailUrls, ...uploadedDetailUrls];

      // 대표 이미지(0번 인덱스) + 상세 이미지들을 하나의 images 배열로 구성
      const finalImages: string[] = [];
      if (mainImageUrl) finalImages.push(mainImageUrl);
      finalImages.push(...finalDetailUrls);

      // ── [2단계] 페이로드 조립 ──
      // 기존 description에서 법정 고시정보 블록이 있다면 그 이전까지만 가져옴 (중복 누적 방지)
      // 1. 기존 설명(data.description)에서 고시정보 시작 문구가 있는 위치를 찾습니다.
      const splitIndex =
        data.description.indexOf("식품 등의 표시·광고에 관한 법률");

      // 2. 만약 기존 설명에 고시정보가 이미 포함되어 있다면, 그 전까지만 깔끔하게 잘라냅니다.
      const cleanDescription =
        splitIndex !== -1
          ? data.description.substring(0, splitIndex).trim()
          : data.description.trim();

      // 3. 순수 설명 뒤에 최신 고시정보를 딱 한 번만 붙입니다.
      const fullDescription =
        cleanDescription + buildLegalInfoHtml(data.legalInfo);

      const payload = {
        name: data.name,
        category_nos: data.categoryNos,
        price: data.price,
        cost: data.cost,
        stock: data.stock,
        description: fullDescription,
        images: finalImages, // 👈 구성된 이미지 배열 주입
        options: data.options,
        legal_info: data.legalInfo,
        channels: data.channels,
        channel_data: data.channelData,
        status: submitStatus,
      };

      // ── [3단계] Supabase DB 저장 ──
      let insertedRowId = productRowId;

      if (mode === "create") {
        const { data: inserted, error } = await supabase
          .from("products")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        insertedRowId = inserted.id;

        // ── [4단계] 카페24 등록 ──
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
              // 필요 시 카페24 규격에 맞춰 대표 이미지 URL 전달 가능
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
            // 재고 세팅 (카페24 상품 등록 API는 재고를 안 받으므로 별도 호출)
            await fetch(`/api/products/${insertedRowId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ stock: data.stock }),
            });

            await supabase
              .from("products")
              .update({
                cafe24_product_no: newProductNo,
                cafe24_synced_at: new Date().toISOString(),
              })
              .eq("id", insertedRowId);
          }
        }

        // ── Shopify 등록 ──
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
      } else {
        // ── 수정 모드 처리 ──
        if (!insertedRowId) {
          throw new Error("수정할 상품 정보를 찾을 수 없습니다.");
        }

        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", insertedRowId);

        if (error) throw error;

        if (id && data.channels.cafe24) {
          console.log("현재 전송하는 상품 UUID (id):", id);
          const res = await fetch(`/api/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              product_name: data.name,
              price: data.price,
              description: fullDescription,
              stock: data.stock,
              display:
                data.channelData.cafe24?.displayStatus === "진열함" ? "T" : "F",
              selling:
                data.channelData.cafe24?.sellingStatus === "판매함" ? "T" : "F",
              detail_image: mainImageUrl || "", // 수정된 대표 이미지 전달
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
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: data.name,
              body_html: fullDescription,
              images: finalImages,
              stock: data.stock,
              inventory_item_id: shopifyInventoryItemId,
              location_id: shopifyLocationId,
            }),
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Shopify 수정 실패");
          }
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

  const buildPreviewPayload = (channel: "shopify" | "cafe24") => {
    const base = {
      name: formSnapshot.name,
      price: formSnapshot.price,
      stock: formSnapshot.stock,
      legalInfo: formSnapshot.legalInfo,
    };
    return channel === "shopify"
      ? { ...base, shopify: formSnapshot.channelData.shopify }
      : { ...base, cafe24: formSnapshot.channelData.cafe24 };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === "create" ? "상품 등록 (식품)" : "상품 수정 (식품)"}
          </h1>
          <p className="text-slate-500 text-sm">
            Shopify와 카페24 채널별 정보를 한 번에 입력하고{" "}
            {mode === "create" ? "등록" : "수정"}하세요.
          </p>
        </header>

        <form
          className="space-y-6"
          onSubmit={handleSubmit((data) => onSubmit(data, "판매중"))}
        >
          {/* 1. 기본 정보 */}
          <Section title="1. 기본 정보">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="상품명" error={errors.name?.message}>
                <input
                  className="input"
                  placeholder="상품명을 입력하세요"
                  {...register("name")}
                />
              </FormField>

              <FormField label="판매가 (원)" error={errors.price?.message}>
                <input type="number" className="input" {...register("price")} />
              </FormField>

              <FormField label="원가 (원)" error={errors.cost?.message}>
                <input type="number" className="input" {...register("cost")} />
              </FormField>

              <FormField label="재고수량" error={errors.stock?.message}>
                <input type="number" className="input" {...register("stock")} />
              </FormField>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700 block mb-2">
                상품분류 (카페24)
              </label>
              <Controller
                control={control}
                name="categoryNos"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => {
                      const checked = field.value?.includes(c.category_no);
                      return (
                        <label
                          key={c.category_no}
                          className={`px-3 py-1.5 text-xs rounded-full border cursor-pointer ${
                            checked
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-slate-600 border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={checked}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...(field.value ?? []), c.category_no]
                                : (field.value ?? []).filter(
                                    (n) => n !== c.category_no,
                                  );
                              field.onChange(next);
                            }}
                          />
                          {c.category_name}
                        </label>
                      );
                    })}
                  </div>
                )}
              />
              {errors.categoryNos && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.categoryNos.message}
                </p>
              )}
            </div>

            {/* 기존 이미지 영역 대체 */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* 대표 이미지 업로드 */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500">
                  대표 이미지 (1장)
                </label>
                <label className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 transition-all h-40 relative overflow-hidden">
                  {mainImagePreview ? (
                    // 대표 이미지 미리보기 활성화
                    <img
                      src={mainImagePreview}
                      alt="Main Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <Upload size={24} />
                      <span className="text-xs mt-2 font-medium">
                        클릭하여 대표 이미지 업로드
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleMainImageChange}
                  />
                </label>
              </div>

              {/* 상세 이미지 업로드 */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500">
                  상세 이미지 (여러 장 가능)
                </label>
                <div className="flex gap-2 items-center overflow-x-auto h-40 border-2 border-dashed rounded-xl p-4">
                  {/* 상세 이미지 추가 버튼 */}
                  <label className="w-24 h-24 border rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 shrink-0">
                    <Upload size={18} />
                    <span className="text-[10px] mt-1">추가</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleDetailImagesChange}
                    />
                  </label>

                  {/* 상세 이미지 리스트 미리보기 */}
                  {detailImagePreviews.map((url, idx) => {
                    const isExisting = url.startsWith("http");
                    return (
                      <div
                        key={url}
                        className="w-24 h-24 rounded-lg overflow-hidden relative shrink-0 border"
                      >
                        <img
                          src={url}
                          alt={`Detail ${idx}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeDetailImage(idx, isExisting)}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-all"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <label className="block text-sm font-medium mb-2">
                상품 상세설명
              </label>
              <textarea
                className="input h-32"
                placeholder="상품 상세 설명을 입력하세요"
                {...register("description")}
              />
              <button
                type="button"
                className="mt-2 flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100"
              >
                <Wand2 size={16} /> AI 상세설명 생성
              </button>
            </div>
          </Section>

          {/* 2. 옵션 */}
          <Section
            title="2. 옵션"
            collapsible
            isOpen={isOptionsOpen}
            onToggle={() => setIsOptionsOpen((v) => !v)}
          >
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-5 gap-2 items-end bg-slate-50 p-3 rounded-lg border"
                >
                  <FormField label="옵션명">
                    <input
                      className="input"
                      {...register(`options.${index}.name` as const)}
                    />
                  </FormField>
                  <FormField label="옵션값">
                    <input
                      className="input"
                      {...register(`options.${index}.value` as const)}
                    />
                  </FormField>
                  <FormField label="추가금액">
                    <input
                      type="number"
                      className="input"
                      {...register(`options.${index}.extraPrice` as const)}
                    />
                  </FormField>
                  <FormField label="재고">
                    <input
                      type="number"
                      className="input"
                      {...register(`options.${index}.stock` as const)}
                    />
                  </FormField>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-sm text-red-600 font-semibold h-10"
                  >
                    삭제
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  append({ name: "", value: "", extraPrice: 0, stock: 0 })
                }
                className="text-sm text-indigo-600 font-semibold"
              >
                + 옵션 추가하기
              </button>
            </div>
          </Section>

          {/* 3. 식품 법정 고시정보 */}
          <Section
            title="3. 식품 법정 고시정보"
            collapsible
            isOpen={isLegalOpen}
            onToggle={() => setIsLegalOpen((v) => !v)}
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="식품유형"
                error={errors.legalInfo?.foodType?.message}
              >
                <input
                  className="input"
                  placeholder="예: 과자"
                  {...register("legalInfo.foodType")}
                />
              </FormField>
              <FormField
                label="내용량"
                error={errors.legalInfo?.netWeight?.message}
              >
                <input
                  className="input"
                  placeholder="예: 150g"
                  {...register("legalInfo.netWeight")}
                />
              </FormField>

              <div className="col-span-2">
                <FormField
                  label="원재료명 및 함량"
                  error={errors.legalInfo?.ingredients?.message}
                >
                  <input
                    className="input"
                    {...register("legalInfo.ingredients")}
                  />
                </FormField>
              </div>

              <FormField
                label="소비기한"
                error={errors.legalInfo?.expiryDate?.message}
              >
                <input
                  type="date"
                  className="input"
                  {...register("legalInfo.expiryDate")}
                />
              </FormField>
              <FormField
                label="보관방법"
                error={errors.legalInfo?.storageMethod?.message}
              >
                <input
                  className="input"
                  {...register("legalInfo.storageMethod")}
                />
              </FormField>
              <FormField
                label="제조사/소재지"
                error={errors.legalInfo?.manufacturer?.message}
              >
                <input
                  className="input"
                  {...register("legalInfo.manufacturer")}
                />
              </FormField>
              <FormField
                label="소비자상담 전화번호"
                error={errors.legalInfo?.consumerServicePhone?.message}
              >
                <input
                  className="input"
                  {...register("legalInfo.consumerServicePhone")}
                />
              </FormField>

              {/* 알레르기 유발성분 */}
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  알레르기 유발성분
                </label>
                <Controller
                  control={control}
                  name="legalInfo.allergens"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {ALLERGEN_OPTIONS.map((allergen) => {
                        const checked = field.value?.includes(allergen);
                        return (
                          <label
                            key={allergen}
                            className={`px-3 py-1.5 text-xs rounded-full border cursor-pointer select-none ${
                              checked
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-slate-600 border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={checked}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...(field.value ?? []), allergen]
                                  : (field.value ?? []).filter(
                                      (a) => a !== allergen,
                                    );
                                field.onChange(next);
                              }}
                            />
                            {allergen}
                          </label>
                        );
                      })}
                    </div>
                  )}
                />
              </div>

              {/* GMO */}
              <FormField label="유전자변형식품 해당여부">
                <select
                  className="input bg-white"
                  {...register("legalInfo.isGMO")}
                >
                  <option value="해당없음">해당없음</option>
                  <option value="유전자재조합식품">유전자재조합식품</option>
                </select>
              </FormField>

              <div className="col-span-2 flex items-center gap-6 py-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    {...register("legalInfo.nutritionRequired")}
                  />
                  영양성분 표시대상
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    {...register("legalInfo.isImported")}
                  />
                  수입식품 여부
                </label>
              </div>

              {nutritionRequired && (
                <div className="col-span-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h4 className="text-sm font-bold text-indigo-900 mb-3">
                    영양성분 입력
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    <FormField
                      label="열량(kcal)"
                      error={errors.legalInfo?.nutrition?.calories?.message}
                    >
                      <input
                        type="number"
                        className="input"
                        {...register("legalInfo.nutrition.calories")}
                      />
                    </FormField>
                    <FormField
                      label="탄수화물(g)"
                      error={errors.legalInfo?.nutrition?.carbs?.message}
                    >
                      <input
                        type="number"
                        className="input"
                        {...register("legalInfo.nutrition.carbs")}
                      />
                    </FormField>
                    <FormField
                      label="단백질(g)"
                      error={errors.legalInfo?.nutrition?.protein?.message}
                    >
                      <input
                        type="number"
                        className="input"
                        {...register("legalInfo.nutrition.protein")}
                      />
                    </FormField>
                    <FormField
                      label="지방(g)"
                      error={errors.legalInfo?.nutrition?.fat?.message}
                    >
                      <input
                        type="number"
                        className="input"
                        {...register("legalInfo.nutrition.fat")}
                      />
                    </FormField>
                    <FormField
                      label="나트륨(mg)"
                      error={errors.legalInfo?.nutrition?.sodium?.message}
                    >
                      <input
                        type="number"
                        className="input"
                        {...register("legalInfo.nutrition.sodium")}
                      />
                    </FormField>
                  </div>
                  {errors.legalInfo?.nutrition &&
                    !errors.legalInfo.nutrition.calories && (
                      <p className="text-xs text-red-600 mt-2">
                        {errors.legalInfo.nutrition.message as string}
                      </p>
                    )}
                </div>
              )}

              {isImported && (
                <div className="col-span-2 grid grid-cols-3 gap-2 bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <FormField
                    label="수입업소명"
                    error={errors.legalInfo?.importInfo?.importerName?.message}
                  >
                    <input
                      className="input"
                      {...register("legalInfo.importInfo.importerName")}
                    />
                  </FormField>
                  <FormField
                    label="제조업소명"
                    error={
                      errors.legalInfo?.importInfo?.manufacturerName?.message
                    }
                  >
                    <input
                      className="input"
                      {...register("legalInfo.importInfo.manufacturerName")}
                    />
                  </FormField>
                  <FormField
                    label="수출국명"
                    error={errors.legalInfo?.importInfo?.exportCountry?.message}
                  >
                    <input
                      className="input"
                      {...register("legalInfo.importInfo.exportCountry")}
                    />
                  </FormField>
                </div>
              )}
            </div>
          </Section>

          {/* 4. 채널 선택 및 채널별 정보 */}
          <Section title="4. 채널 선택 및 정보">
            {errors.channels && (
              <p className="text-xs text-red-600 -mt-2">
                {errors.channels.message as string}
              </p>
            )}
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={shopifyChecked}
                  onChange={(e) =>
                    handleChannelToggle("shopify", e.target.checked)
                  }
                />
                Shopify
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={cafe24Checked}
                  onChange={(e) =>
                    handleChannelToggle("cafe24", e.target.checked)
                  }
                />
                카페24
              </label>
            </div>

            {shopifyChecked && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm mb-4">
                <p className="font-semibold text-blue-900 mb-3">
                  Shopify 전용 정보
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Product Type"
                    error={errors.channelData?.shopify?.productType?.message}
                  >
                    <input
                      className="input"
                      placeholder="예: 과자, 건강기능식품"
                      {...register("channelData.shopify.productType")}
                    />
                  </FormField>
                  <FormField
                    label="Vendor (브랜드명)"
                    error={errors.channelData?.shopify?.vendor?.message}
                  >
                    <input
                      className="input"
                      placeholder="예: 가꾸기"
                      {...register("channelData.shopify.vendor")}
                    />
                  </FormField>
                  <FormField
                    label="태그 (콤마로 구분)"
                    error={errors.channelData?.shopify?.tags?.message}
                  >
                    <input
                      className="input"
                      placeholder="예: 신상품, 베스트"
                      {...register("channelData.shopify.tags")}
                    />
                  </FormField>
                  <FormField label="공개 상태">
                    <select
                      className="input bg-white"
                      {...register("channelData.shopify.publishStatus")}
                    >
                      <option value="draft">임시저장 (draft)</option>
                      <option value="active">공개 (active)</option>
                    </select>
                  </FormField>
                </div>
              </div>
            )}

            {cafe24Checked && (
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-sm">
                <p className="font-semibold text-emerald-900 mb-3">
                  카페24 전용 정보
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="배송 정책"
                    error={errors.channelData?.cafe24?.shippingPolicy?.message}
                  >
                    <input
                      className="input"
                      {...register("channelData.cafe24.shippingPolicy")}
                    />
                  </FormField>
                  <FormField label="진열 상태">
                    <select
                      className="input bg-white"
                      {...register("channelData.cafe24.displayStatus")}
                    >
                      <option value="진열함">진열함</option>
                      <option value="진열안함">진열안함</option>
                    </select>
                  </FormField>
                  <FormField label="판매 상태">
                    <select
                      className="input bg-white"
                      {...register("channelData.cafe24.sellingStatus")}
                    >
                      <option value="판매함">판매함</option>
                      <option value="판매안함">판매안함</option>
                    </select>
                  </FormField>
                </div>
              </div>
            )}
          </Section>

          {/* 5. 미리보기 */}
          <Section title="5. 미리보기">
            <div className="flex gap-2 border-b mb-4">
              <button
                type="button"
                onClick={() => setPreviewTab("shopify")}
                className={`px-4 py-2 text-sm ${
                  previewTab === "shopify"
                    ? "border-b-2 border-indigo-600 font-semibold text-indigo-600"
                    : "text-slate-500"
                }`}
              >
                Shopify 미리보기
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("cafe24")}
                className={`px-4 py-2 text-sm ${
                  previewTab === "cafe24"
                    ? "border-b-2 border-indigo-600 font-semibold text-indigo-600"
                    : "text-slate-500"
                }`}
              >
                카페24 미리보기
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto max-h-80">
              {JSON.stringify(buildPreviewPayload(previewTab), null, 2)}
            </pre>
          </Section>

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
              <Save size={18} />{" "}
              {isSaving
                ? "저장 중..."
                : mode === "create"
                  ? "상품 등록"
                  : "상품 수정"}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          outline: none;
          width: 100%;
        }
        .input:focus {
          box-shadow: 0 0 0 2px #6366f1;
        }
      `}</style>
    </div>
  );
}

// ────────────────────────────────────────────────
// 재사용 컴포넌트
// ────────────────────────────────────────────────

interface SectionProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

const Section = ({
  title,
  children,
  collapsible = false,
  isOpen = true,
  onToggle,
}: SectionProps) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div
      className={`flex justify-between items-center ${collapsible ? "cursor-pointer" : ""}`}
      onClick={onToggle}
    >
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      {collapsible &&
        (isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />)}
    </div>
    {(!collapsible || isOpen) && (
      <div className="mt-4 space-y-4">{children}</div>
    )}
  </div>
);

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

const FormField = ({ label, error, children }: FormFieldProps) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-slate-700">{label}</label>
    {children}
    {error && <span className="text-xs text-red-600">{error}</span>}
  </div>
);
