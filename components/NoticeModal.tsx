"use client";

import React from "react";
import { Info, X, AlertCircle } from "lucide-react";

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NoticeModal({ isOpen, onClose }: NoticeModalProps) {
  // 1. 오늘 날짜 확인 (서버사이드 렌더링 방지)
  const isHiddenToday = () => {
    if (typeof window === "undefined") return false;
    const today = new Date().toISOString().split("T")[0];
    return localStorage.getItem("noticeModalHideUntil") === today;
  };

  // 2. 모달을 보여줄지 결정:
  // 부모가 열라고 했어도(isOpen), 오늘 안 보기(isHiddenToday)라면 표시하지 않음
  const shouldShow = isOpen && !isHiddenToday();

  const handleDontShowToday = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("noticeModalHideUntil", today);
    onClose();
  };

  if (!shouldShow) return null;

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
            {/* <Info size={20} /> */}
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
              현재 대시보드에 표시된 지표들은{" "}
              <strong>테스트용 목(Mock) 데이터</strong>입니다. 실제 데이터와는
              차이가 있을 수 있습니다.
            </p>
          </div>

          <div className="text-[14px] text-gray-600 leading-relaxed">
            <p className="mb-2 font-semibold text-gray-800">
              현재 연동된 실제 기능:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>상품 관리 리스트 조회</li>
              <li>상품 등록 API</li>
            </ul>
          </div>

          <p className="text-[13px] text-gray-400">
            나머지 기능들도 순차적으로 연동 중에 있습니다. 원활한 이용을 위해
            참고 부탁드립니다.
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
