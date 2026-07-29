import type { Order } from "@/lib/orders/types";

export interface SalesSummary {
  total: number;
  count: number;
}

export interface DailySales {
  date: string;
  sales: number;
  /** 주별 집계 시 주 종료일(일요일) YYYY-MM-DD */
  weekEnd?: string;
}

function toTimestamp(value: Date | string): number {
  return new Date(value).getTime();
}

/** created_at 기준 로컬 날짜 키 (YYYY-MM-DD) */
function toDateKey(createdAt: string): string {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return createdAt.slice(0, 10);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** created_at이 [start, end] 구간에 속하는 주문만 반환 */
export function filterByDateRange(
  orders: Order[],
  start: Date | string,
  end: Date | string,
): Order[] {
  const startMs = toTimestamp(start);
  const endMs = toTimestamp(end);

  return orders.filter((order) => {
    const t = toTimestamp(order.created_at);
    return t >= startMs && t <= endMs;
  });
}

/** total_price 합산과 주문 건수 반환 */
export function sumSales(orders: Order[]): SalesSummary {
  return orders.reduce<SalesSummary>(
    (acc, order) => {
      acc.total += order.total_price;
      acc.count += 1;
      return acc;
    },
    { total: 0, count: 0 },
  );
}

/**
 * 증감률(%) 계산.
 * previous가 0이면 current > 0 → 100, 아니면 0.
 */
export function calcGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function mapToSortedSales(
  map: Map<string, number>,
): DailySales[] {
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, sales]) => ({ date, sales }));
}

/** 날짜별 sales 합산 → SalesTrendChart용 { date, sales }[] (오름차순) */
export function groupByDate(orders: Order[]): DailySales[] {
  const map = new Map<string, number>();

  for (const order of orders) {
    const key = toDateKey(order.created_at);
    map.set(key, (map.get(key) ?? 0) + order.total_price);
  }

  return mapToSortedSales(map);
}

/** 해당 날짜가 속한 주(월~일)의 월요일을 YYYY-MM-DD로 반환 */
export function toWeekKey(createdAt: string): string {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return createdAt.slice(0, 10);

  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, "0");
  const dayNum = String(monday.getDate()).padStart(2, "0");
  return `${y}-${m}-${dayNum}`;
}

/** YYYY-MM-DD에 days를 더한 날짜 키 반환 */
function addDaysToDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) return dateKey;
  const next = new Date(y, m - 1, d + days);
  const yy = next.getFullYear();
  const mm = String(next.getMonth() + 1).padStart(2, "0");
  const dd = String(next.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** 주별 sales 합산 (date = 월요일, weekEnd = 일요일) */
export function groupByWeek(orders: Order[]): DailySales[] {
  const map = new Map<string, number>();

  for (const order of orders) {
    const key = toWeekKey(order.created_at);
    map.set(key, (map.get(key) ?? 0) + order.total_price);
  }

  return mapToSortedSales(map).map((point) => ({
    ...point,
    weekEnd: addDaysToDateKey(point.date, 6),
  }));
}

/** 월별 sales 합산 (키 = YYYY-MM) */
export function groupByMonth(orders: Order[]): DailySales[] {
  const map = new Map<string, number>();

  for (const order of orders) {
    const dayKey = toDateKey(order.created_at);
    const key = dayKey.slice(0, 7);
    map.set(key, (map.get(key) ?? 0) + order.total_price);
  }

  return mapToSortedSales(map);
}
