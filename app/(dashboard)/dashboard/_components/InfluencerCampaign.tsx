"use client";

import { Sparkles } from "lucide-react";

const campaigns = [
  {
    name: "여름 오가닉 콜렉션",
    handle: "@minjae.style",
    followers: "128K",
    status: "촬영중",
    progress: 62,
  },
  {
    name: "리사이클 데님 챌린지",
    handle: "@seoyoon_daily",
    followers: "86K",
    status: "업로드 대기",
    progress: 84,
  },
  {
    name: "린넨 라이프 스타일",
    handle: "@hanul.editorial",
    followers: "214K",
    status: "성과 집계",
    progress: 96,
  },
];

export default function InfluencerCampaign() {
  return (
    <div className="bg-[#143617] p-6 rounded-2xl w-full text-white">
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#d4a373] mb-1">
            <Sparkles size={14} />
            <span className="text-[10px] font-bold tracking-widest uppercase">
              INFLUENCER CAMPAIGN
            </span>
          </div>
          <h2 className="text-lg font-bold">인플루언서 캠페인 현황</h2>
        </div>
        <div className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold">
          진행중 3개
        </div>
      </div>

      {/* 요약 카드 (디테일 유지) */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 p-4 rounded-xl">
          <p className="text-[13px] text-gray-300 mb-0.5">누적 도달 수</p>
          <p className="text-xl font-bold">139.4K</p>
          <p className="text-[12px] text-gray-400 mt-1">지난 30일</p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl">
          <p className="text-[13px] text-gray-300 mb-0.5">캠페인 예산 집행</p>
          <p className="text-xl font-bold">540만원</p>
          <p className="text-[12px] text-gray-400 mt-1">잔여 예산 340만원</p>
        </div>
      </div>

      {/* 캠페인 리스트 (디테일 유지) */}
      <div className="space-y-3 mb-6">
        {campaigns.map((item, i) => (
          <div key={i} className="bg-white/5 p-4 rounded-xl">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-sm">{item.name}</p>
                <p className="text-[13px] text-gray-400 mt-0.5">
                  {item.handle} · {item.followers} 팔로워
                </p>
              </div>
              <span className="bg-white/10 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap ml-2">
                {item.status}
              </span>
            </div>

            {/* 프로그레스 바 */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#d4a373] rounded-full"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <span className="text-xs font-bold w-8 text-right">
                {item.progress}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 액션 버튼 */}
      <button className="w-full bg-[#d4a373] py-3 rounded-lg text-sm font-bold text-[#143617] hover:bg-[#b88c5a] transition-all">
        캠페인 성과 리포트 보기
      </button>
    </div>
  );
}
