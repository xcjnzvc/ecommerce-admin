"use client";

import { toDateInputValue } from "./types";

export interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  onChange: (range: {
    startDate: string | null;
    endDate: string | null;
  }) => void;
  label?: string;
}

type Preset = "today" | "7days" | "30days";

function getPresetRange(preset: Preset): {
  startDate: string;
  endDate: string;
} {
  const today = new Date();
  const endDate = toDateInputValue(today);

  if (preset === "today") {
    return { startDate: endDate, endDate };
  }

  const start = new Date(today);
  start.setDate(start.getDate() - (preset === "7days" ? 6 : 29));
  return { startDate: toDateInputValue(start), endDate };
}

const PRESETS: { key: Preset; label: string }[] = [
  { key: "today", label: "오늘" },
  { key: "7days", label: "최근 7일" },
  { key: "30days", label: "최근 30일" },
];

const inputClassName =
  "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#143617] focus:border-[#143617]";

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  label = "기간",
}: DateRangePickerProps) {
  const activePreset = PRESETS.find(({ key }) => {
    const range = getPresetRange(key);
    return range.startDate === startDate && range.endDate === endDate;
  })?.key;

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold text-gray-700">{label}</p>

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map(({ key, label: presetLabel }) => {
          const isActive = activePreset === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(getPresetRange(key))}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                isActive
                  ? "bg-[#143617] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {presetLabel}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 mb-1">
            시작일
          </label>
          <input
            type="date"
            value={startDate ?? ""}
            onChange={(e) =>
              onChange({
                startDate: e.target.value || null,
                endDate,
              })
            }
            className={inputClassName}
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 mb-1">
            종료일
          </label>
          <input
            type="date"
            value={endDate ?? ""}
            onChange={(e) =>
              onChange({
                startDate,
                endDate: e.target.value || null,
              })
            }
            className={inputClassName}
          />
        </div>
      </div>
    </div>
  );
}
