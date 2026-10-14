import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

import { filterByDateRange, sumSales } from "@/lib/dashboard/aggregate";
import { listOrdersFromDb } from "@/lib/orders/list-orders";

async function generateAnalysis(ai: GoogleGenAI, contents: string) {
  return ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents,
    config: {
      maxOutputTokens: 600,
      temperature: 0.2,
      httpOptions: {
        timeout: 15_000,
      },
    },
  });
}

export const runtime = "nodejs";

function toDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

export async function POST() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API 키가 설정되지 않았습니다." },
        { status: 500 },
      );
    }

    const now = new Date();

    // 오늘 포함 최근 30일
    const currentStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 29,
    );

    // 직전 30일
    const previousStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 59,
    );

    const previousEnd = new Date(currentStart.getTime() - 1);

    const orders = await listOrdersFromDb({
      startDate: toDateParam(previousStart),
      endDate: toDateParam(now),
    });

    const currentOrders = filterByDateRange(orders, currentStart, now);

    const previousOrders = filterByDateRange(
      orders,
      previousStart,
      previousEnd,
    );

    const current = sumSales(currentOrders);
    const previous = sumSales(previousOrders);

    const growthRate =
      previous.total === 0
        ? null
        : Math.round(
            ((current.total - previous.total) / previous.total) * 10000,
          ) / 100;

    const averageOrderValue =
      current.count > 0 ? Math.round(current.total / current.count) : 0;

    // 고객 개인정보 없이 집계 통계만 전달
    const salesData = {
      period: "최근 30일",
      totalRevenue: current.total,
      orderCount: current.count,
      previousRevenue: previous.total,
      previousOrderCount: previous.count,
      growthRate,
      growthDescription:
        previous.total === 0
          ? current.total > 0
            ? "이전 기간 매출이 0원이므로 성장률 계산 불가 (신규 매출 발생)"
            : "양 기간 모두 매출 0원 (성장률 계산 불가)"
          : `${growthRate}%`,
      averageOrderValue,
    };

    const ai = new GoogleGenAI({ apiKey });

    const response = await generateAnalysis(
      ai,
      `
      이커머스 매출 분석가로서 아래 데이터를 분석해.
      
      ${JSON.stringify(salesData)}
      
      한국어 Markdown으로 300자 이내 작성:
      1. 매출 및 주문 요약
      2. 이전 기간 대비 변화
      3. 운영 개선 제안 2가지
      
      규칙:
      - 제공된 데이터만 사용
      - 이전 매출이 0원이면 성장률 계산 불가로 표시
      - 주문 1건이면 분석의 한계 언급
      - 불필요한 서론과 결론 생략
        `,
    );

    return NextResponse.json({
      success: true,
      salesData,
      analysis: response.text ?? "",
    });
  } catch (error) {
    console.error("AI 매출 분석 오류:", error);

    const status =
      typeof error === "object" && error !== null && "status" in error
        ? error.status
        : undefined;

    if (status === 404) {
      return NextResponse.json(
        {
          error:
            "현재 설정된 AI 모델을 사용할 수 없습니다. 관리자에게 문의해 주세요.",
        },
        { status: 502 },
      );
    }

    if (
      error instanceof Error &&
      (error.name === "AbortError" ||
        error.message === "AI_TIMEOUT" ||
        /timeout|timed out|deadline|aborted/i.test(error.message))
    ) {
      return NextResponse.json(
        {
          error:
            "AI 응답이 지연되어 요청이 종료되었습니다. 잠시 후 다시 시도해 주세요.",
        },
        { status: 504 },
      );
    }

    if (status === 503) {
      return NextResponse.json(
        {
          error:
            "현재 AI 요청이 많아 분석할 수 없습니다. 잠시 후 다시 시도해 주세요.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "AI 매출 분석에 실패했습니다." },
      { status: 500 },
    );
  }
}
