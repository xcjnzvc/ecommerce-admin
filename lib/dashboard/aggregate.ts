import type { Order } from "@/lib/orders/types";

export interface SalesSummary {
  total: number;
  count: number;
}

export interface DailySales {
  date: string;
  sales: number;
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

/** 날짜별 sales 합산 → SalesTrendChart용 { date, sales }[] (오름차순) */
export function groupByDate(orders: Order[]): DailySales[] {
  const map = new Map<string, number>();

  for (const order of orders) {
    const key = toDateKey(order.created_at);
    map.set(key, (map.get(key) ?? 0) + order.total_price);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, sales]) => ({ date, sales }));
}
