"use client";

import React from "react";
import { Construction, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export default function ComingSoon({
  title = "페이지 준비 중",
  description = "현재 해당 기능을 개발하고 있습니다.\n빠른 시일 내에 멋진 모습으로 찾아뵙겠습니다.",
}: ComingSoonProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-100px)] p-6 text-center">
      {/* min-h-[calc(100vh-100px)]
      {/* 아이콘 영역 */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50 animate-pulse" />
        <div className="relative bg-white p-6 rounded-[28px] shadow-sm border border-gray-100">
          <Construction size={48} className="text-[#143617]" />
        </div>
      </div>

      {/* 텍스트 영역 */}
      <h1 className="text-[24px] md:text-[28px] font-black text-gray-950 mb-4 tracking-tight">
        {title}
      </h1>
      <p className="text-[15px] md:text-[16px] text-gray-500 leading-relaxed mb-10 whitespace-pre-wrap">
        {description}
      </p>

      {/* 이전 페이지로 돌아가기 버튼  */}
      <div className="w-full max-w-[200px]">
        <Button
          text="메인으로 돌아가기"
          onClick={() => router.push("/dashboard")}
        />
      </div>
    </div>
  );
}
