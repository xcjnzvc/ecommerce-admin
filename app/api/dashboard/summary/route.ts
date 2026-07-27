import { NextRequest, NextResponse } from "next/server";
import {
  calcGrowthRate,
  filterByDateRange,
  groupByDate,
  sumSales,
} from "@/lib/dashboard/aggregate";
import {
  INTERNAL_ORDER_STATUSES,
  type Order,
} from "@/lib/orders/types";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date): Date {
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    23,
    59,
    59,
    999,
  );
}

/** 주 시작: 월요일 00:00 */
function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  return startOfDay(
    new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff),
  );
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function toDateParam(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function roundGrowthRate(rate: number): number {
  return Math.round(rate * 10) / 10;
}

function buildPeriodSummary(
  orders: Order[],
  currentStart: Date,
  currentEnd: Date,
  previousStart: Date,
  previousEnd: Date,
) {
  const current = sumSales(
    filterByDateRange(orders, currentStart, currentEnd),
  );
  const previous = sumSales(
    filterByDateRange(orders, previousStart, previousEnd),
  );

  return {
    total: current.total,
    count: current.count,
    growthRate: roundGrowthRate(
      calcGrowthRate(current.total, previous.total),
    ),
  };
}

function extractOrders(
  result: PromiseSettledResult<{ orders?: Order[]; error?: string }>,
): Order[] {
  if (result.status !== "fulfilled") return [];
  return result.value.orders ?? [];
}

export async function GET(req: NextRequest) {
  const now = new Date();
  const { origin, searchParams } = new URL(req.url);

  // 지난달 1일~오늘까지 조회 (증감률 비교용)
  const defaultStart = startOfMonth(
    new Date(now.getFullYear(), now.getMonth() - 1, 1),
  );
  const startDate = searchParams.get("start_date") ?? toDateParam(defaultStart);
  const endDate = searchParams.get("end_date") ?? toDateParam(now);
  const qs = `start_date=${startDate}&end_date=${endDate}`;

  const [cafe24Res, shopifyRes] = await Promise.allSettled([
    fetch(`${origin}/api/orders/cafe24?${qs}`).then((r) => r.json()),
    fetch(`${origin}/api/orders/shopify?${qs}`).then((r) => r.json()),
  ]);

  const cafe24Orders = extractOrders(cafe24Res);
  const shopifyOrders = extractOrders(shopifyRes);
  const orders = [...cafe24Orders, ...shopifyOrders];

  const cafe24Available =
    cafe24Res.status === "fulfilled" && cafe24Orders.length > 0;

  // 오늘 / 어제
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yesterdayStart = startOfDay(yesterday);
  const yesterdayEnd = endOfDay(yesterday);

  // 이번 주 / 지난 주 (월~일)
  const weekStart = startOfWeek(now);
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekEnd = endOfDay(
    new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - 1),
  );

  // 이번 달 / 지난 달
  const monthStart = startOfMonth(now);
  const prevMonthStart = startOfMonth(
    new Date(now.getFullYear(), now.getMonth() - 1, 1),
  );
  const prevMonthEnd = endOfDay(
    new Date(now.getFullYear(), now.getMonth(), 0),
  );

  const today = buildPeriodSummary(
    orders,
    todayStart,
    todayEnd,
    yesterdayStart,
    yesterdayEnd,
  );
  const week = buildPeriodSummary(
    orders,
    weekStart,
    todayEnd,
    prevWeekStart,
    prevWeekEnd,
  );
  const month = buildPeriodSummary(
    orders,
    monthStart,
    todayEnd,
    prevMonthStart,
    prevMonthEnd,
  );

  const orderStatusCounts = Object.fromEntries(
    INTERNAL_ORDER_STATUSES.map((status) => [
      status,
      orders.filter((o) => o.status === status).length,
    ]),
  ) as Record<(typeof INTERNAL_ORDER_STATUSES)[number], number>;

  const channelMix = orders.reduce(
    (acc, order) => {
      acc[order.channel] = (acc[order.channel] ?? 0) + order.total_price;
      return acc;
    },
    { cafe24: 0, shopify: 0 } as Record<"cafe24" | "shopify", number>,
  );

  const salesTrend = groupByDate(
    filterByDateRange(orders, monthStart, todayEnd),
  );

  return NextResponse.json({
    today,
    week,
    month,
    orderStatusCounts,
    channelMix,
    salesTrend,
    cafe24Available,
  });
}
