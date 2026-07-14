"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, Save, Upload, Wand2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  foodProductSchema,
  type FoodProductFormInput,
  type FoodProductFormValues,
  ALLERGEN_OPTIONS,
} from "./food-product.schema";

// ────────────────────────────────────────────────
// 기본값 (RHF는 optional 필드도 defaultValue를 명시해주는 게 안전합니다)
// defaultValues는 "입력 타입" 기준으로 채워줍니다 (숫자 필드에 number를 넣어도 무방합니다)
// ────────────────────────────────────────────────

const defaultValues: FoodProductFormInput = {
  name: "",
  category: "식품",
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
  channels: { coupang: false, cafe24: false },
  channelData: {},
  status: "임시저장",
};

export default function FoodProductNewPage() {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FoodProductFormInput, unknown, FoodProductFormValues>({
    resolver: zodResolver(foodProductSchema),
    defaultValues,
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
  const [previewTab, setPreviewTab] = React.useState<"coupang" | "cafe24">(
    "coupang",
  );

  const nutritionRequired = watch("legalInfo.nutritionRequired");
  const isImported = watch("legalInfo.isImported");
  const coupangChecked = watch("channels.coupang");
  const cafe24Checked = watch("channels.cafe24");
  const formSnapshot = watch();

  // 채널 체크박스 on/off 시, 그 채널의 하위 데이터 객체를 만들거나 지워줍니다.
  const handleChannelToggle = (
    channel: "coupang" | "cafe24",
    checked: boolean,
  ) => {
    setValue(`channels.${channel}`, checked, { shouldValidate: true });
    if (checked) {
      if (channel === "coupang") {
        setValue("channelData.coupang", {
          categoryMatch: "",
          isRocketDelivery: false,
          shippingFee: 0,
          returnAddress: "",
          shipFromAddress: "",
        });
      } else {
        setValue("channelData.cafe24", {
          displayCategory: "",
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
    data: FoodProductFormValues,
    submitStatus: "임시저장" | "판매중" = "판매중",
  ) => {
    setIsSaving(true);
    setSaveError(null);

    const payload = {
      name: data.name,
      category: data.category,
      price: data.price,
      cost: data.cost,
      stock: data.stock,
      description: data.description,
      images: [],
      options: data.options,
      legal_info: data.legalInfo,
      channels: data.channels,
      channel_data: data.channelData,
      status: submitStatus,
    };

    // 1. Supabase에 먼저 저장
    const { data: inserted, error } = await supabase
      .from("products")
      .insert(payload)
      .select()
      .single();

    if (error) {
      setIsSaving(false);
      console.error("저장 실패:", error);
      setSaveError(error.message);
      return;
    }

    // 2. 카페24 채널 선택 시, 카페24 API로 실제 등록
    if (data.channels.cafe24) {
      try {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_name: data.name,
            price: data.price,
            supply_price: data.cost,
            display:
              data.channelData.cafe24?.displayStatus === "진열함" ? "T" : "F",
            selling:
              data.channelData.cafe24?.sellingStatus === "판매함" ? "T" : "F",
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "카페24 등록 실패");
        }

        const cafe24Result = await res.json();
        const productNo = cafe24Result?.product?.product_no;

        // 3. 카페24 등록 성공 시, product_no를 다시 Supabase에 업데이트
        if (productNo) {
          await supabase
            .from("products")
            .update({
              cafe24_product_no: productNo,
              cafe24_synced_at: new Date().toISOString(),
            })
            .eq("id", inserted.id);
        }
      } catch (cafe24Error) {
        setIsSaving(false);
        // Supabase 저장은 성공했지만 카페24 등록은 실패한 상태
        setSaveError(
          `우리 DB에는 저장됐지만 카페24 등록에 실패했어요: ${
            cafe24Error instanceof Error
              ? cafe24Error.message
              : "알 수 없는 오류"
          }`,
        );
        return;
      }
    }

    setIsSaving(false);
    router.push("/products");
  };

  // 쿠팡/카페24 미리보기용으로 필요한 값만 추려서 보여줍니다.
  const buildPreviewPayload = (channel: "coupang" | "cafe24") => {
    const base = {
      name: formSnapshot.name,
      price: formSnapshot.price,
      stock: formSnapshot.stock,
      legalInfo: formSnapshot.legalInfo,
    };
    return channel === "coupang"
      ? { ...base, coupang: formSnapshot.channelData.coupang }
      : { ...base, cafe24: formSnapshot.channelData.cafe24 };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            상품 등록 (식품)
          </h1>
          <p className="text-slate-500 text-sm">
            쿠팡과 카페24 채널별 정보를 한 번에 입력하고 등록하세요.
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

              <FormField label="카테고리">
                <select className="input bg-white" disabled value="식품">
                  <option value="식품">식품 &gt; 가공식품 &gt; 과자류</option>
                </select>
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

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-slate-400">
                <Upload size={24} />
                <span className="text-xs mt-2">
                  대표 이미지 (1장) — Storage 연동 예정
                </span>
              </div>
              <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-slate-400">
                <Upload size={24} />
                <span className="text-xs mt-2">
                  상세 이미지 (여러 장) — Storage 연동 예정
                </span>
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
                  checked={coupangChecked}
                  onChange={(e) =>
                    handleChannelToggle("coupang", e.target.checked)
                  }
                />
                쿠팡
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

            {coupangChecked && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm mb-4">
                <p className="font-semibold text-blue-900 mb-3">
                  쿠팡 전용 정보
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="쿠팡 카테고리 매칭"
                    error={errors.channelData?.coupang?.categoryMatch?.message}
                  >
                    <input
                      className="input"
                      placeholder="예: 가공식품 > 과자류"
                      {...register("channelData.coupang.categoryMatch")}
                    />
                  </FormField>
                  <FormField
                    label="배송비 (원)"
                    error={errors.channelData?.coupang?.shippingFee?.message}
                  >
                    <input
                      type="number"
                      className="input"
                      {...register("channelData.coupang.shippingFee")}
                    />
                  </FormField>
                  <FormField
                    label="반품지 정보"
                    error={errors.channelData?.coupang?.returnAddress?.message}
                  >
                    <input
                      className="input"
                      {...register("channelData.coupang.returnAddress")}
                    />
                  </FormField>
                  <FormField
                    label="출고지 정보"
                    error={
                      errors.channelData?.coupang?.shipFromAddress?.message
                    }
                  >
                    <input
                      className="input"
                      {...register("channelData.coupang.shipFromAddress")}
                    />
                  </FormField>
                  <label className="flex items-center gap-2 text-sm col-span-2">
                    <input
                      type="checkbox"
                      {...register("channelData.coupang.isRocketDelivery")}
                    />
                    로켓배송 여부
                  </label>
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
                    label="진열 카테고리"
                    error={errors.channelData?.cafe24?.displayCategory?.message}
                  >
                    <input
                      className="input"
                      {...register("channelData.cafe24.displayCategory")}
                    />
                  </FormField>
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
                onClick={() => setPreviewTab("coupang")}
                className={`px-4 py-2 text-sm ${
                  previewTab === "coupang"
                    ? "border-b-2 border-indigo-600 font-semibold text-indigo-600"
                    : "text-slate-500"
                }`}
              >
                쿠팡 미리보기
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
              <Save size={18} /> {isSaving ? "저장 중..." : "상품 등록"}
            </button>
          </div>
        </form>
      </div>

      {/* 프로젝트 전역 CSS(globals.css)에 옮기셔도 되고, 지금은 편의상 여기 둡니다 */}
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
