"use client";

import { ArrowUp, ArrowDown, ChevronRight } from "lucide-react";

const bestProducts = [
  {
    rank: "01",
    name: "오가닉 코튼 오버셔츠",
    category: "여성 · 상의",
    sales: 428,
    revenue: "3,809.2만원",
    trend: "up",
    percent: "32%",
  },
  {
    rank: "02",
    name: "리사이클 데님 크롭 자켓",
    category: "여성 · 아우터",
    sales: 312,
    revenue: "4,929.6만원",
    trend: "up",
    percent: "18%",
  },
  {
    rank: "03",
    name: "린넨 와이드 팬츠",
    category: "여성 · 하의",
    sales: 286,
    revenue: "2,059.2만원",
    trend: "up",
    percent: "9%",
  },
  {
    rank: "04",
    name: "니트 카디건 세트",
    category: "여성 · 상의",
    sales: 248,
    revenue: "3,075.2만원",
    trend: "down",
    percent: "4%",
  },
  {
    rank: "05",
    name: "실크 블라우스",
    category: "여성 · 상의",
    sales: 192,
    revenue: "2,265.6만원",
    trend: "up",
    percent: "14%",
  },
];

export default function BestSellers() {
  return (
    <div className="bg-white p-6 rounded-[24px] border border-[#e2e2e2] w-full h-full flex flex-col">
      {/* 헤더 및 토글 */}
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
          <button className="px-3 py-1">조회</button>
        </div>
      </div>

      {/* 리스트 영역 (flex-1으로 남은 공간 점유) */}
      <div className="space-y-6 flex-1">
        {bestProducts.map((item) => (
          <div key={item.rank} className="flex items-center gap-4">
            <span className="text-2xl font-black text-gray-200">
              {item.rank}
            </span>
            <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">
                {item.name}
              </p>
              <p className="text-[12px] text-gray-400">{item.category}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">{item.sales}</p>
              <p className="text-[11px] text-gray-400">{item.revenue}</p>
            </div>
            <div
              className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-[12px] font-bold ${item.trend === "up" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
            >
              {item.trend === "up" ? (
                <ArrowUp size={10} />
              ) : (
                <ArrowDown size={10} />
              )}
              {item.percent}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
