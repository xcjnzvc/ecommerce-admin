"use client";

import { ArrowUpDown, Download, Filter, Search } from "lucide-react";

export interface StatusTab {
  label: string;
  value: string;
}

export interface ListFilterBarProps {
  statusTabs: StatusTab[];
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchMinWidth?: string;
  showFilter?: boolean;
  showSort?: boolean;
  showDownload?: boolean;
  onFilterClick?: () => void;
  onSortClick?: () => void;
  onDownloadClick?: () => void;
  className?: string;
}

const actionButtonClassName =
  "inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-[#5e6e82] shadow-sm transition-all";

export default function ListFilterBar({
  statusTabs,
  selectedStatus,
  onStatusChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = "검색어 입력...",
  searchMinWidth = "min-w-[200px]",
  showFilter = false,
  showSort = false,
  showDownload = false,
  onFilterClick,
  onSortClick,
  onDownloadClick,
  className = "",
}: ListFilterBarProps) {
  return (
    <div className={`flex flex-col gap-4 mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-transparent">
        <div className="inline-flex items-center p-1 bg-[#eceff1]/50 border border-gray-200/40 rounded-xl w-fit self-start overflow-x-auto flex-wrap">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onStatusChange(tab.value)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#143617] text-white shadow-sm"
                    : "text-[#5e6e82] hover:text-[#143617] bg-transparent"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-transparent">
          <div
            className={`relative ${searchMinWidth} flex-1 md:flex-initial`}
          >
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#143617] focus:border-[#143617] transition-all"
            />
          </div>

          {showFilter && (
            <button
              type="button"
              onClick={onFilterClick}
              className={actionButtonClassName}
            >
              <Filter size={13} className="text-gray-400" />
              필터
            </button>
          )}

          {showSort && (
            <button
              type="button"
              onClick={onSortClick}
              className={actionButtonClassName}
            >
              <ArrowUpDown size={13} className="text-gray-400" />
              정렬
            </button>
          )}

          {showDownload && (
            <button
              type="button"
              onClick={onDownloadClick}
              className={actionButtonClassName}
            >
              <Download size={13} className="text-gray-400" />
              다운로드
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
