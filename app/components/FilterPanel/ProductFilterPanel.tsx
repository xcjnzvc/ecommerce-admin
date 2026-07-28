"use client";

import { useEffect, useState } from "react";
import DateRangePicker from "./DateRangePicker";
import FilterPanelFooter from "./FilterPanelFooter";
import {
  DEFAULT_PRODUCT_FILTERS,
  type ProductFilters,
} from "./types";

export interface ProductFilterPanelProps {
  value: ProductFilters;
  onApply: (filters: ProductFilters) => void;
  onClose: () => void;
}

const CHANNEL_OPTIONS: {
  value: ProductFilters["channel"];
  label: string;
}[] = [
  { value: "all", label: "전체" },
  { value: "cafe24", label: "카페24만" },
  { value: "shopify", label: "Shopify만" },
  { value: "both", label: "양쪽 다" },
  { value: "none", label: "어느 쪽도 없음" },
];

export default function ProductFilterPanel({
  value,
  onApply,
  onClose,
}: ProductFilterPanelProps) {
  const [draft, setDraft] = useState<ProductFilters>(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleReset = () => {
    setDraft(DEFAULT_PRODUCT_FILTERS);
  };

  return (
    <div className="w-[300px] max-w-[calc(100vw-2rem)] p-4 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-gray-900">상품 필터</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">
          조건을 설정한 뒤 적용을 눌러주세요.
        </p>
      </div>

      <DateRangePicker
        label="등록일 기간"
        startDate={draft.startDate}
        endDate={draft.endDate}
        onChange={({ startDate, endDate }) =>
          setDraft((prev) => ({ ...prev, startDate, endDate }))
        }
      />

      <div className="space-y-2">
        <p className="text-[11px] font-bold text-gray-700">채널 등록 상태</p>
        <div className="flex flex-wrap gap-1.5">
          {CHANNEL_OPTIONS.map((option) => {
            const isActive = draft.channel === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setDraft((prev) => ({ ...prev, channel: option.value }))
                }
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                  isActive
                    ? "bg-[#143617] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <FilterPanelFooter onReset={handleReset} onApply={handleApply} />
    </div>
  );
}
