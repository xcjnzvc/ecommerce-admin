import { NextRequest, NextResponse } from "next/server";
import {
  calcGrowthRate,
  filterByDateRange,
  sumSales,
} from "@/lib/dashboard/aggregate";
import { fetchSalesTrendFromRpc } from "@/lib/dashboard/sales-trend";
import {
  hasCafe24OrdersInDb,
  listOrdersFromDb,
} from "@/lib/orders/list-orders";
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

export async function GET(req: NextRequest) {
  const now = new Date();
  const { searchParams } = new URL(req.url);

  // 카드/상태/채널용 — 전월 1일부터면 충분 (매출 추이는 RPC)
  const defaultStart = startOfMonth(
    new Date(now.getFullYear(), now.getMonth() - 1, 1),
  );
  const startDate = searchParams.get("start_date") ?? toDateParam(defaultStart);
  const endDate = searchParams.get("end_date") ?? toDateParam(now);

  const [orders, cafe24Available, salesTrend] = await Promise.all([
    listOrdersFromDb({ startDate, endDate }),
    hasCafe24OrdersInDb(),
    fetchSalesTrendFromRpc(),
  ]);

  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yesterdayStart = startOfDay(yesterday);
  const yesterdayEnd = endOfDay(yesterday);

  const weekStart = startOfWeek(now);
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekEnd = endOfDay(
    new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - 1),
  );

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
