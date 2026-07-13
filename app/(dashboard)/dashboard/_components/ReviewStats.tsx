"use client";

import { ChevronRight } from "lucide-react";

const reviewData = [
  { star: 5, count: 2384 },
  { star: 4, count: 742 },
  { star: 3, count: 186 },
  { star: 2, count: 74 },
  { star: 1, count: 42 },
];

const totalReviews = 3428;

export default function ReviewStats() {
  return (
    <div className="bg-white p-6 rounded-[24px] border border-[#e2e2e2] w-full">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xs text-gray-400 font-bold tracking-wider">
            REVIEWS
          </h3>
          <h2 className="text-lg font-bold text-gray-900">리뷰 현황</h2>
        </div>
      </div>

      {/* 종합 점수 */}
      <div className="mb-6">
        <div className="text-4xl font-black text-gray-900">4.7</div>
        <div className="flex text-yellow-400 my-1">★★★★★</div>
        <p className="text-sm text-gray-400">
          총 {totalReviews.toLocaleString()}개 리뷰
        </p>
      </div>

      {/* 별점 분포 그래프 */}
      <div className="space-y-2 mb-8">
        {reviewData.map((item) => (
          <div key={item.star} className="flex items-center gap-3 text-[12px]">
            <span className="font-bold w-4 text-gray-600">{item.star}★</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-800 rounded-full"
                style={{ width: `${(item.count / totalReviews) * 100}%` }}
              />
            </div>
            <span className="w-10 text-right font-medium text-gray-600">
              {item.count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* 하단 요약 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#fffcf5] border border-[#fcefd8] p-4 rounded-xl">
          <p className="text-[11px] font-bold text-[#b88c5a] mb-1">
            지금 답변해야 할 리뷰
          </p>
          <p className="text-2xl font-bold text-gray-900">
            18 <span className="text-sm font-normal text-gray-500">건</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-1">24시간 이상 미답변</p>
        </div>
        <div className="bg-[#f0f9f4] border border-[#dcf2e6] p-4 rounded-xl">
          <p className="text-[11px] font-bold text-emerald-700 mb-1">
            오늘 새 리뷰
          </p>
          <p className="text-2xl font-bold text-gray-900">
            24 <span className="text-sm font-normal text-gray-500">건</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-1">평균 별점 4.8</p>
        </div>
      </div>
    </div>
  );
}
