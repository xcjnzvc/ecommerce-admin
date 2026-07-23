"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Controller } from "react-hook-form";
import { Wand2 } from "lucide-react";
import { FormField, Section } from "./form-ui";

type Category = { category_no: number; category_name: string };

interface ProductBasicInfoSectionProps {
  // Shared across create/edit schemas — keep loose for reuse
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  errors: {
    name?: { message?: string };
    price?: { message?: string };
    cost?: { message?: string };
    stock?: { message?: string };
    categoryNos?: { message?: string };
  };
  categories: Category[];
  /** create 폼: 초기 재고 입력 항상 표시 */
  showStockInput?: boolean;
  /** edit 폼: 값이 있을 때만 읽기전용 재고 표시 */
  currentStock?: number;
  imageSlot?: ReactNode;
}

export function ProductBasicInfoSection({
  register,
  control,
  errors,
  categories,
  showStockInput = false,
  currentStock,
  imageSlot,
}: ProductBasicInfoSectionProps) {
  return (
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

        {showStockInput && (
          <FormField label="초기 재고수량" error={errors.stock?.message}>
            <input type="number" className="input" {...register("stock")} />
          </FormField>
        )}

        {currentStock != null && (
          <div className="col-span-2 flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            <span>
              현재 재고:{" "}
              <span className="font-semibold text-slate-900">
                {currentStock.toLocaleString()}개
              </span>
            </span>
            <span className="text-slate-400">·</span>
            <Link
              href="/inventory"
              className="text-indigo-600 font-medium hover:underline"
            >
              재고 관리에서 수정
            </Link>
          </div>
        )}
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
                              (n: number) => n !== c.category_no,
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

      {imageSlot}

      <div className="mt-4 border-t pt-4">
        <label className="block text-sm font-medium mb-2">상품 상세설명</label>
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
  );
}
