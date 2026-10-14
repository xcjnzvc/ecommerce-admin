"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AiSalesAnalysis() {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setAnalysis("");

    try {
      const response = await fetch("/api/ai-analysis", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "분석 실패");
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* 팝업 모달 / 에이전트 대화 창 */}
      {isOpen && (
        <div className="mb-3 w-[360px] sm:w-[400px] rounded-2xl bg-white p-5 shadow-2xl border border-gray-100 transition-all duration-200">
          {/* 헤더 */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-[#143617]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                AI 매출 분석 에이전트
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label="닫기"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 본문 영역 */}
          <div className="my-4 max-h-[420px] overflow-y-auto pr-1 text-sm text-gray-700 space-y-4">
            {/* AI 기본 인사 말풍선 */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#143617] to-[#2A5A30] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                AI
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3 text-gray-800 text-xs sm:text-sm leading-relaxed">
                안녕하세요! 최근 실시간 매출 데이터와 주문 현황을 기반으로
                인사이트를 분석해 드릴까요?
              </div>
            </div>

            {/* 에러 발생 시 */}
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100">
                {error}
              </div>
            )}

            {/* AI 분석 결과 출력 영역 */}
            {analysis && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#143617] to-[#2A5A30] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                  AI
                </div>
                {/* <div className="bg-[#143617]/5 border border-[#143617]/15 rounded-2xl rounded-tl-none p-3.5 text-gray-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {analysis}
                </div> */}
                <div className="min-w-0 flex-1 rounded-2xl rounded-tl-none border border-[#143617]/15 bg-[#143617]/5 p-3.5 text-xs leading-relaxed text-gray-800 sm:text-sm">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h3 className="mb-3 text-base font-bold">{children}</h3>
                      ),
                      h2: ({ children }) => (
                        <h3 className="mb-2 mt-4 font-bold">{children}</h3>
                      ),
                      h3: ({ children }) => (
                        <h4 className="mb-2 mt-3 font-semibold">{children}</h4>
                      ),
                      p: ({ children }) => (
                        <p className="my-2 leading-relaxed">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="my-2 list-disc space-y-1 pl-5">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="my-2 list-decimal space-y-2 pl-5">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => <li>{children}</li>,
                      strong: ({ children }) => (
                        <strong className="font-semibold text-[#143617]">
                          {children}
                        </strong>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="my-3 border-l-2 border-[#143617]/30 pl-3 text-gray-600">
                          {children}
                        </blockquote>
                      ),
                      hr: () => <hr className="my-4 border-gray-200" />,
                    }}
                  >
                    {analysis}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* 하단 액션 버튼 */}
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#143617] via-[#1d4821] to-[#2A5A30] hover:opacity-95 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>매출 분석 중...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 text-emerald-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span>{analysis ? "다시 분석하기" : "AI 매출 분석하기"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 우측 하단 플로팅 원형 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-[#143617] via-[#1d4821] to-[#2A5A30] hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-[#143617]/30 flex items-center justify-center text-white relative group shrink-0"
        aria-label="AI 매출 분석 에이전트 열기"
      >
        <svg
          className="w-6 h-6 text-white transition-transform group-hover:rotate-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>

        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
          </span>
        )}
      </button>
    </div>
  );
}
