"use client";

import { useEffect, useState } from "react";
import DateRangePicker from "./DateRangePicker";
import FilterPanelFooter from "./FilterPanelFooter";
import {
  DEFAULT_ORDER_FILTERS,
  type OrderFilters,
} from "./types";

export interface OrderFilterPanelProps {
  value: OrderFilters;
  onApply: (filters: OrderFilters) => void;
  onClose: () => void;
}

const CHANNEL_OPTIONS: {
  value: OrderFilters["channel"];
  label: string;
}[] = [
  { value: "all", label: "전체" },
  { value: "cafe24", label: "카페24" },
  { value: "shopify", label: "Shopify" },
];

const TRACKING_OPTIONS: {
  value: boolean | null;
  label: string;
}[] = [
  { value: null, label: "전체" },
  { value: true, label: "송장 등록됨" },
  { value: false, label: "송장 미등록" },
];

const inputClassName =
  "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#143617] focus:border-[#143617]";

function parseOptionalNumber(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

export default function OrderFilterPanel({
  value,
  onApply,
  onClose,
}: OrderFilterPanelProps) {
  const [draft, setDraft] = useState<OrderFilters>(value);
  const [minPriceInput, setMinPriceInput] = useState(
    value.minPrice != null ? String(value.minPrice) : "",
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    value.maxPrice != null ? String(value.maxPrice) : "",
  );

  useEffect(() => {
    setDraft(value);
    setMinPriceInput(value.minPrice != null ? String(value.minPrice) : "");
    setMaxPriceInput(value.maxPrice != null ? String(value.maxPrice) : "");
  }, [value]);

  const handleApply = () => {
    onApply({
      ...draft,
      minPrice: parseOptionalNumber(minPriceInput),
      maxPrice: parseOptionalNumber(maxPriceInput),
    });
    onClose();
  };

  const handleReset = () => {
    setDraft(DEFAULT_ORDER_FILTERS);
    setMinPriceInput("");
    setMaxPriceInput("");
  };

  return (
    <div className="w-[320px] max-w-[calc(100vw-2rem)] p-4 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-gray-900">주문 필터</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">
          조건을 설정한 뒤 적용을 눌러주세요.
        </p>
      </div>

      <DateRangePicker
        label="주문일 기간"
        startDate={draft.startDate}
        endDate={draft.endDate}
        onChange={({ startDate, endDate }) =>
          setDraft((prev) => ({ ...prev, startDate, endDate }))
        }
      />

      <div className="space-y-2">
        <p className="text-[11px] font-bold text-gray-700">채널</p>
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

      <div className="space-y-2">
        <p className="text-[11px] font-bold text-gray-700">결제금액 범위</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 mb-1">
              최소
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 mb-1">
              최대
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="제한 없음"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className={inputClassName}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-bold text-gray-700">배송(송장) 여부</p>
        <div className="flex flex-wrap gap-1.5">
          {TRACKING_OPTIONS.map((option) => {
            const isActive = draft.hasTracking === option.value;
            return (
              <button
                key={String(option.value)}
                type="button"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    hasTracking: option.value,
                  }))
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
