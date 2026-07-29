"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import PillTabs from "@/app/components/PillTabs";
import { useBestSellers } from "@/lib/dashboard/queries";
import type { BestSellerSort } from "@/lib/dashboard/best-sellers";

const DISPLAY_LIMIT = 5;

const SORT_TABS: Array<{ label: string; value: BestSellerSort }> = [
  { label: "판매량", value: "quantity" },
  { label: "매출", value: "revenue" },
];

function formatRank(rank: number): string {
  return String(rank).padStart(2, "0");
}

function formatRevenue(revenue: number): string {
  if (revenue <= 0) return "-";
  if (revenue >= 10_000) {
    return `${(revenue / 10_000).toLocaleString(undefined, {
      maximumFractionDigits: 1,
    })}만원`;
  }
  return `${revenue.toLocaleString()}원`;
}

function ProductThumb({ image, name }: { image: string | null; name: string }) {
  return (
    <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-100/80 flex items-center justify-center">
      {image ? (
        <img src={image} alt={name} className="w-full h-full object-cover" />
      ) : (
        <Package size={20} className="text-gray-300" />
      )}
    </div>
  );
}

export default function BestSellers() {
  const [sortBy, setSortBy] = useState<BestSellerSort>("quantity");
  const { data: bestProducts = [], isLoading } = useBestSellers(sortBy);

  const emptyRowCount = Math.max(0, DISPLAY_LIMIT - bestProducts.length);

  return (
    <div className="bg-white p-6 rounded-[24px] border border-[#e2e2e2] w-full h-full flex flex-col">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h3 className="text-xs text-gray-400 font-bold tracking-wider">
            BESTSELLERS
          </h3>
          <h2 className="text-lg font-bold text-gray-900 mt-1">
            인기 상품 TOP 5
          </h2>
        </div>

        <PillTabs options={SORT_TABS} value={sortBy} onChange={setSortBy} />
      </div>

      <div className="space-y-6 flex-1">
        {isLoading ? (
          Array.from({ length: DISPLAY_LIMIT }, (_, i) => (
            <div
              key={`loading-${i}`}
              className="flex items-center gap-4 min-h-14"
            >
              <span className="text-2xl font-black text-gray-200">
                {formatRank(i + 1)}
              </span>
              <ProductThumb image={null} name="" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-400">
                  {i === 2 ? "인기 상품을 불러오는 중..." : "\u00A0"}
                </p>
              </div>
            </div>
          ))
        ) : bestProducts.length === 0 ? (
          Array.from({ length: DISPLAY_LIMIT }, (_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center gap-4 min-h-14"
            >
              <span className="text-2xl font-black text-gray-200">
                {formatRank(i + 1)}
              </span>
              <ProductThumb image={null} name="" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-400">
                  {i === 2 ? "표시할 인기 상품이 없습니다." : "\u00A0"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <>
            {bestProducts.map((item) => (
              <div
                key={`${sortBy}-${item.rank}-${item.name}`}
                className="flex items-center gap-4 min-h-14"
              >
                <span className="text-2xl font-black text-gray-200">
                  {formatRank(item.rank)}
                </span>
                <ProductThumb image={item.image} name={item.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-semibold text-gray-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-[12px] text-gray-400 truncate">
                    {item.category ?? "-"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-[16px] ">
                    {sortBy === "quantity"
                      ? item.quantity.toLocaleString()
                      : formatRevenue(item.revenue)}
                  </p>
                  <p className="text-[12px] text-gray-400">
                    {sortBy === "quantity"
                      ? formatRevenue(item.revenue)
                      : `${item.quantity.toLocaleString()}개`}
                  </p>
                </div>
              </div>
            ))}
            {Array.from({ length: emptyRowCount }, (_, i) => (
              <div
                key={`pad-${i}`}
                className="flex items-center gap-4 min-h-14"
                aria-hidden
              >
                <span className="text-2xl font-black text-transparent">
                  {formatRank(bestProducts.length + i + 1)}
                </span>
                <div className="w-14 h-14 rounded-xl shrink-0" />
                <div className="flex-1" />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
