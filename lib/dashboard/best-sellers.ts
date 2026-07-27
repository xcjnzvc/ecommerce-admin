import type { Order, OrderItem } from "@/lib/orders/types";

export interface BestSellerItem {
  rank: number;
  name: string;
  quantity: number;
  /** 카페24는 price가 null이라 0일 수 있음 */
  revenue: number;
}

interface Accumulator {
  name: string;
  quantity: number;
  revenue: number;
}

function itemKey(item: OrderItem): string {
  return String(item.product_id ?? item.name);
}

function itemRevenue(item: OrderItem): number {
  // 카페24: price null → revenue 기여 0
  if (item.price == null) return 0;
  return item.price * item.quantity;
}

/**
 * 주문 아이템을 product_id(없으면 name) 기준으로 집계해
 * 판매수량 상위 N개를 반환한다.
 */
export function aggregateBestSellers(
  orders: Order[],
  limit = 5,
): BestSellerItem[] {
  const map = new Map<string, Accumulator>();

  for (const item of orders.flatMap((o) => o.items)) {
    const key = itemKey(item);
    const prev = map.get(key);

    if (prev) {
      prev.quantity += item.quantity;
      prev.revenue += itemRevenue(item);
    } else {
      map.set(key, {
        name: item.name,
        quantity: item.quantity,
        revenue: itemRevenue(item),
      });
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
    .map((item, index) => ({
      rank: index + 1,
      name: item.name,
      quantity: item.quantity,
      revenue: item.revenue,
    }));
}
