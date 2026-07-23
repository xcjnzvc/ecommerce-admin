"use client";

import { Controller } from "react-hook-form";
import { ALLERGEN_OPTIONS } from "../food-product.schema";
import { FormField, Section } from "./form-ui";

interface LegalInfoSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  errors: {
    legalInfo?: {
      foodType?: { message?: string };
      netWeight?: { message?: string };
      ingredients?: { message?: string };
      expiryDate?: { message?: string };
      storageMethod?: { message?: string };
      manufacturer?: { message?: string };
      consumerServicePhone?: { message?: string };
      nutrition?: {
        message?: string;
        calories?: { message?: string };
        carbs?: { message?: string };
        protein?: { message?: string };
        fat?: { message?: string };
        sodium?: { message?: string };
      };
      importInfo?: {
        importerName?: { message?: string };
        manufacturerName?: { message?: string };
        exportCountry?: { message?: string };
      };
    };
  };
  nutritionRequired: boolean;
  isImported: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export function LegalInfoSection({
  register,
  control,
  errors,
  nutritionRequired,
  isImported,
  isOpen,
  onToggle,
}: LegalInfoSectionProps) {
  return (
    <Section
      title="3. 식품 법정 고시정보"
      collapsible
      isOpen={isOpen}
      onToggle={onToggle}
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
                                (a: string) => a !== allergen,
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

        <FormField label="유전자변형식품 해당여부">
          <select className="input bg-white" {...register("legalInfo.isGMO")}>
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
            <input type="checkbox" {...register("legalInfo.isImported")} />
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
              error={errors.legalInfo?.importInfo?.manufacturerName?.message}
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
  );
}
