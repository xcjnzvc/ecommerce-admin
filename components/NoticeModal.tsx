"use client";

import React, { useSyncExternalStore } from "react";
import { X, AlertCircle } from "lucide-react";

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // 클라이언트
    () => false, // 서버 + hydration 첫 렌더
  );
}

function getToday() {
  // toISOString은 UTC 기준이라 한국에선 00~09시에 날짜가 하루 전으로 나옴 → 로컬 기준으로
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function NoticeModal({ isOpen, onClose }: NoticeModalProps) {
  const isClient = useIsClient();

  if (!isClient || !isOpen) return null;

  const isHiddenToday =
    localStorage.getItem("noticeModalHideUntil") === getToday();
  if (isHiddenToday) return null;

  const handleDontShowToday = () => {
    localStorage.setItem("noticeModalHideUntil", getToday());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div
        className="bg-white rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-[420px] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
          <div className="flex items-center gap-2 text-[#143617]">
            <h2 className="text-[16px] font-black tracking-tight">
              시스템 안내
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Section */}
        <div className="px-6 py-6 space-y-5">
          <div className="flex flex-col text-center items-center gap-3 p-4 bg-amber-50 rounded-[12px] border border-amber-100">
            <AlertCircle className="text-amber-600" size={18} />
            <p className="text-[14px] text-amber-900 leading-relaxed">
              현재 대시보드의{" "}
              <strong>리뷰 현황 및 인플루언서 캠페인 현황</strong> 지표는{" "}
              <strong>테스트용 목(Mock) 데이터</strong>입니다. 실제 데이터와는
              차이가 있을 수 있습니다.
            </p>
          </div>

          <p className="text-[14px] text-gray-600 leading-relaxed">
            해당 항목을 제외한 나머지 기능들은 모두 정상적으로 실제 연동되어
            있습니다. 이용에 참고 부탁드립니다.
          </p>
        </div>

        {/* Footer Section */}
        <div className="px-6 py-4 bg-white flex flex-col gap-3">
          <button
            onClick={onClose}
            className="w-full py-[12px] bg-[#143617] text-white rounded-[10px] text-[14px] hover:bg-[#1f4e22] active:scale-[0.98] transition-all"
          >
            확인했습니다
          </button>
          <button
            onClick={handleDontShowToday}
            className="text-[13px] text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
          >
            오늘 하루 보지 않기
          </button>
        </div>
      </div>
    </div>
  );
}
