import { createAdminClient } from "@/lib/supabase/admin";
import type { SalesTrendPoint, SalesTrendSeries } from "@/types/dashboard";

type DailySalesRow = {
  date: string;
  sales: number | string;
};

type WeeklySalesRow = {
  week_start: string;
  week_end: string;
  sales: number | string;
};

type MonthlySalesRow = {
  month: string;
  sales: number | string;
};

const SEOUL = "Asia/Seoul";

function toDateString(value: string): string {
  return value.slice(0, 10);
}

function todaySeoul(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SEOUL,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parseDateKey(key: string): { y: number; m: number; d: number } {
  const [y, m, d] = key.split("-").map(Number);
  return { y: y ?? 0, m: m ?? 1, d: d ?? 1 };
}

function toDateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** 이미 KST 날짜 키인 값에 일수를 더함 (캘린더 연산) */
function addDays(key: string, days: number): string {
  const { y, m, d } = parseDateKey(key);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return toDateKey(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

function mondayOf(key: string): string {
  const { y, m, d } = parseDateKey(key);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const day = dt.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  return addDays(key, -diff);
}

function addMonths(yearMonth: string, delta: number): string {
  const [y, m] = yearMonth.split("-").map(Number);
  const idx = (y ?? 0) * 12 + ((m ?? 1) - 1) + delta;
  const ny = Math.floor(idx / 12);
  const nm = (idx % 12) + 1;
  return `${ny}-${String(nm).padStart(2, "0")}`;
}

function currentYearMonthSeoul(): string {
  return todaySeoul().slice(0, 7);
}

/** RPC가 sparse여도 API에서 항상 고정 길이로 맞춤 (Asia/Seoul) */
function padDaily(
  rows: DailySalesRow[],
  daysBack: number,
): SalesTrendPoint[] {
  const map = new Map(
    rows.map((row) => [toDateString(String(row.date)), Number(row.sales)]),
  );
  const today = todaySeoul();
  const start = addDays(today, -(daysBack - 1));
  const points: SalesTrendPoint[] = [];

  for (let cursor = start; cursor <= today; cursor = addDays(cursor, 1)) {
    points.push({ date: cursor, sales: map.get(cursor) ?? 0 });
  }
  return points;
}

function padWeekly(
  rows: WeeklySalesRow[],
  monthsBack: number,
): SalesTrendPoint[] {
  const map = new Map(
    rows.map((row) => [
      toDateString(String(row.week_start)),
      Number(row.sales),
    ]),
  );

  const today = todaySeoul();
  const rangeStartMonth = addMonths(today.slice(0, 7), -monthsBack);
  const rangeStart = mondayOf(`${rangeStartMonth}-01`);
  const lastWeek = mondayOf(today);
  const points: SalesTrendPoint[] = [];

  for (
    let cursor = rangeStart;
    cursor <= lastWeek;
    cursor = addDays(cursor, 7)
  ) {
    points.push({
      date: cursor,
      sales: map.get(cursor) ?? 0,
      weekEnd: addDays(cursor, 6),
    });
  }
  return points;
}

function padMonthly(
  rows: MonthlySalesRow[],
  monthsBack: number,
): SalesTrendPoint[] {
  const map = new Map(
    rows.map((row) => [String(row.month).slice(0, 7), Number(row.sales)]),
  );
  const end = currentYearMonthSeoul();
  const start = addMonths(end, -(monthsBack - 1));
  const points: SalesTrendPoint[] = [];

  for (
    let cursor = start;
    cursor <= end;
    cursor = addMonths(cursor, 1)
  ) {
    points.push({ date: cursor, sales: map.get(cursor) ?? 0 });
  }
  return points;
}

/** Supabase RPC로 일별/주별/월별 매출 추이 조회 (서버 전용) */
export async function fetchSalesTrendFromRpc(): Promise<SalesTrendSeries> {
  const supabase = createAdminClient();

  const daysBack = 30;
  const weeksMonthsBack = 3;
  const monthsBack = 12;

  const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
    supabase.rpc("get_daily_sales", { days_back: daysBack }),
    supabase.rpc("get_weekly_sales", { months_back: weeksMonthsBack }),
    supabase.rpc("get_monthly_sales", { months_back: monthsBack }),
  ]);

  if (dailyRes.error) {
    console.error("일별 매출 조회 실패:", dailyRes.error);
  }
  if (weeklyRes.error) {
    console.error("주별 매출 조회 실패:", weeklyRes.error);
  }
  if (monthlyRes.error) {
    console.error("월별 매출 조회 실패:", monthlyRes.error);
  }

  return {
    daily: padDaily((dailyRes.data ?? []) as DailySalesRow[], daysBack),
    weekly: padWeekly(
      (weeklyRes.data ?? []) as WeeklySalesRow[],
      weeksMonthsBack,
    ),
    monthly: padMonthly(
      (monthlyRes.data ?? []) as MonthlySalesRow[],
      monthsBack,
    ),
  };
}
