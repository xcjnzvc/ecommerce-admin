"use client";

import { useBestSellers } from "@/lib/dashboard/queries";

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

export default function BestSellers() {
  const { data: bestProducts = [], isLoading } = useBestSellers();

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

        <div className="bg-gray-100 p-1 rounded-full flex text-[12px] font-medium text-gray-500">
          <button className="px-3 py-1 bg-white shadow-sm rounded-full text-gray-900">
            판매량
          </button>
          <button className="px-3 py-1">매출</button>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {isLoading ? (
          <p className="text-sm text-gray-400 py-10 text-center">
            인기 상품을 불러오는 중...
          </p>
        ) : bestProducts.length === 0 ? (
          <p className="text-sm text-gray-400 py-10 text-center">
            표시할 인기 상품이 없습니다.
          </p>
        ) : (
          bestProducts.map((item) => (
            <div key={`${item.rank}-${item.name}`} className="flex items-center gap-4">
              <span className="text-2xl font-black text-gray-200">
                {formatRank(item.rank)}
              </span>
              <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">
                  {item.name}
                </p>
                <p className="text-[12px] text-gray-400">
                  판매 {item.quantity.toLocaleString()}개
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  {item.quantity.toLocaleString()}
                </p>
                <p className="text-[11px] text-gray-400">
                  {formatRevenue(item.revenue)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
