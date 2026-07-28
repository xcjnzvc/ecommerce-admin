"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpDown, Download, Filter, Search } from "lucide-react";

export interface StatusTab {
  label: string;
  value: string;
}

export interface SortOption {
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
  /** 정렬 드롭다운 옵션. showSort=true 일 때 사용 */
  sortOptions?: SortOption[];
  selectedSort?: string;
  onSortChange?: (value: string) => void;
  /** 필터 팝오버 내용. showFilter=true 일 때 사용 */
  filterPanel?: ReactNode;
  isFilterOpen?: boolean;
  onFilterOpenChange?: (open: boolean) => void;
  filterActiveCount?: number;
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
  sortOptions = [],
  selectedSort,
  onSortChange,
  filterPanel,
  isFilterOpen = false,
  onFilterOpenChange,
  filterActiveCount = 0,
  onDownloadClick,
  className = "",
}: ListFilterBarProps) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const selectedSortLabel =
    sortOptions.find((option) => option.value === selectedSort)?.label ??
    "정렬";

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (sortRef.current && !sortRef.current.contains(target)) {
        setIsSortOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(target)) {
        onFilterOpenChange?.(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [onFilterOpenChange]);

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
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => {
                  setIsSortOpen(false);
                  onFilterOpenChange?.(!isFilterOpen);
                }}
                className={`${actionButtonClassName} ${
                  isFilterOpen || filterActiveCount > 0
                    ? "border-[#143617]/40 text-[#143617]"
                    : ""
                }`}
              >
                <Filter size={13} className="text-gray-400" />
                필터
                {filterActiveCount > 0 && (
                  <span className="ml-0.5 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-[#143617] text-white text-[10px] font-bold">
                    {filterActiveCount}
                  </span>
                )}
              </button>

              {isFilterOpen && filterPanel && (
                <div className="absolute right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-30">
                  {filterPanel}
                </div>
              )}
            </div>
          )}

          {showSort && sortOptions.length > 0 && (
            <div className="relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => {
                  onFilterOpenChange?.(false);
                  setIsSortOpen((prev) => !prev);
                }}
                className={`${actionButtonClassName} ${
                  isSortOpen ? "border-[#143617]/40 text-[#143617]" : ""
                }`}
              >
                <ArrowUpDown size={13} className="text-gray-400" />
                {selectedSortLabel}
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-30">
                  {sortOptions.map((option) => {
                    const isActive = option.value === selectedSort;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          onSortChange?.(option.value);
                          setIsSortOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-semibold transition-colors ${
                          isActive
                            ? "bg-[#143617]/5 text-[#143617]"
                            : "text-gray-700 hover:bg-gray-50 hover:text-[#143617]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
