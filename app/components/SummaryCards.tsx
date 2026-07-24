"use client";

import type { ReactNode } from "react";

export interface SummaryCardItem {
  label: string;
  count: number;
  icon: ReactNode;
  iconBg: string;
  unit?: string;
}

export interface SummaryCardsProps<T extends SummaryCardItem = SummaryCardItem> {
  items: T[];
  onItemClick?: (item: T, index: number) => void;
  isLoading?: boolean;
}

export default function SummaryCards<T extends SummaryCardItem>({
  items,
  onItemClick,
  isLoading = false,
}: SummaryCardsProps<T>) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {items.map((item, index) => (
        <div
          key={item.label}
          onClick={() => onItemClick?.(item, index)}
          className="cursor-pointer p-5 rounded-2xl border border-[#e2e2e2] bg-white text-gray-900 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md shadow-sm"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {item.label}
            </span>
            <div className={`p-1.5 rounded-lg ${item.iconBg}`}>{item.icon}</div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight">
              {isLoading ? "-" : item.count.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">{item.unit ?? "건"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
