"use client";

import type { UseFieldArrayRemove } from "react-hook-form";
import { FormField, Section } from "./form-ui";

interface ProductOptionsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  append: (...args: any[]) => void;
  remove: UseFieldArrayRemove;
  isOpen: boolean;
  onToggle: () => void;
  errors?: {
    options?: Array<{
      name?: { message?: string };
      value?: { message?: string };
      stock?: { message?: string };
    }> | { message?: string };
  };
}

export function ProductOptionsSection({
  register,
  fields,
  append,
  remove,
  isOpen,
  onToggle,
  errors,
}: ProductOptionsSectionProps) {
  return (
    <Section
      title="2. 옵션"
      id="product-section-options"
      collapsible
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-3">
        {fields.map((field, index) => {
          const optionErrors = Array.isArray(errors?.options)
            ? errors.options[index]
            : undefined;

          return (
          <div
            key={field.id}
            className="grid grid-cols-5 gap-2 items-end bg-slate-50 p-3 rounded-lg border"
          >
            <FormField
              label="옵션명"
              error={optionErrors?.name?.message}
            >
              <input
                className="input"
                {...register(`options.${index}.name` as const)}
              />
            </FormField>
            <FormField
              label="옵션값"
              error={optionErrors?.value?.message}
            >
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
            <FormField
              label="재고"
              error={optionErrors?.stock?.message}
            >
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
          );
        })}

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
  );
}
