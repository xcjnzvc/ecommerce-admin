import { cafe24 } from "@/lib/api/cafe24";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order, OrderItem } from "@/lib/orders/types";

export type BestSellerSort = "quantity" | "revenue";

export interface BestSellerItem {
  rank: number;
  name: string;
  quantity: number;
  /** 카페24는 price가 null이라 0일 수 있음 */
  revenue: number;
  /** 주문 line의 product_id (카페24 product_no / Shopify product_id) */
  productId: string | number | null;
  /** products.images[0] */
  image: string | null;
  /** 카테고리 표시명 (여러 개면 · 로 연결) */
  category: string | null;
}

interface Accumulator {
  name: string;
  quantity: number;
  revenue: number;
  productId: string | number | null;
}

interface ProductMetaRow {
  name: string;
  images: string[] | null;
  category_nos: number[] | null;
  cafe24_product_no: number | null;
  shopify_product_id: number | null;
}

interface ProductMeta {
  image: string | null;
  categoryNos: number[];
}

function itemKey(item: OrderItem): string {
  return String(item.product_id ?? item.name);
}

function itemRevenue(item: OrderItem): number {
  // 카페24: price null → revenue 기여 0
  if (item.price == null) return 0;
  return item.price * item.quantity;
}

function firstImage(images: string[] | null | undefined): string | null {
  const url = images?.[0];
  return url && url.length > 0 ? url : null;
}

function normalizeCategoryNos(value: number[] | null | undefined): number[] {
  if (!Array.isArray(value)) return [];
  return value.filter((n) => typeof n === "number" && Number.isFinite(n));
}

/**
 * 주문 아이템을 product_id(없으면 name) 기준으로 집계해
 * 판매수량 또는 매출 상위 N개를 반환한다.
 */
export function aggregateBestSellers(
  orders: Order[],
  limit = 5,
  sortBy: BestSellerSort = "quantity",
): BestSellerItem[] {
  const map = new Map<string, Accumulator>();

  for (const item of orders.flatMap((o) => o.items)) {
    const key = itemKey(item);
    const prev = map.get(key);

    if (prev) {
      prev.quantity += item.quantity;
      prev.revenue += itemRevenue(item);
      if (prev.productId == null && item.product_id != null) {
        prev.productId = item.product_id;
      }
    } else {
      map.set(key, {
        name: item.name,
        quantity: item.quantity,
        revenue: itemRevenue(item),
        productId: item.product_id,
      });
    }
  }

  return Array.from(map.values())
    .sort((a, b) => {
      const primary =
        sortBy === "revenue"
          ? b.revenue - a.revenue
          : b.quantity - a.quantity;
      if (primary !== 0) return primary;
      return sortBy === "revenue"
        ? b.quantity - a.quantity
        : b.revenue - a.revenue;
    })
    .slice(0, limit)
    .map((item, index) => ({
      rank: index + 1,
      name: item.name,
      quantity: item.quantity,
      revenue: item.revenue,
      productId: item.productId,
      image: null,
      category: null,
    }));
}

async function loadCategoryNameMap(): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  try {
    const result = (await cafe24.getCategories()) as {
      categories?: Array<{ category_no: number; category_name: string }>;
    };
    for (const category of result.categories ?? []) {
      map.set(category.category_no, category.category_name);
    }
  } catch (error) {
    console.error("베스트셀러 카테고리 목록 조회 실패:", error);
  }
  return map;
}

function formatCategoryLabel(
  categoryNos: number[],
  nameByNo: Map<number, string>,
): string | null {
  if (categoryNos.length === 0) return null;
  const names = categoryNos
    .map((no) => nameByNo.get(no))
    .filter((name): name is string => Boolean(name));
  if (names.length === 0) return null;
  return names.join(" · ");
}

function rowKey(row: ProductMetaRow): string {
  return `${row.cafe24_product_no ?? ""}:${row.shopify_product_id ?? ""}:${row.name}`;
}

/** products 테이블 + 카페24 카테고리로 이미지/카테고리명을 붙인다 */
export async function enrichBestSellersWithImages(
  items: BestSellerItem[],
): Promise<BestSellerItem[]> {
  if (items.length === 0) return items;

  const numericIds = Array.from(
    new Set(
      items
        .map((item) =>
          item.productId == null ? null : Number(item.productId),
        )
        .filter((id): id is number => id != null && Number.isFinite(id)),
    ),
  );

  const supabase = createAdminClient();
  let rows: ProductMetaRow[] = [];
  const selectCols =
    "name, images, category_nos, cafe24_product_no, shopify_product_id";

  if (numericIds.length > 0) {
    const { data, error } = await supabase
      .from("products")
      .select(selectCols)
      .or(
        `cafe24_product_no.in.(${numericIds.join(",")}),shopify_product_id.in.(${numericIds.join(",")})`,
      );

    if (error) {
      console.error("베스트셀러 상품 메타 조회 실패:", error);
    } else {
      rows = (data ?? []) as ProductMetaRow[];
    }
  }

  const unmatchedNames = items
    .filter((item) => {
      if (item.productId == null) return true;
      const id = Number(item.productId);
      return !rows.some(
        (row) =>
          row.cafe24_product_no === id || row.shopify_product_id === id,
      );
    })
    .map((item) => item.name);

  if (unmatchedNames.length > 0) {
    const { data, error } = await supabase
      .from("products")
      .select(selectCols)
      .in("name", unmatchedNames);

    if (error) {
      console.error("베스트셀러 상품명 메타 조회 실패:", error);
    } else {
      const existing = new Set(rows.map(rowKey));
      for (const row of (data ?? []) as ProductMetaRow[]) {
        const key = rowKey(row);
        if (!existing.has(key)) {
          rows.push(row);
          existing.add(key);
        }
      }
    }
  }

  const categoryNameByNo = await loadCategoryNameMap();

  const byCafe24 = new Map<number, ProductMeta>();
  const byShopify = new Map<number, ProductMeta>();
  const byName = new Map<string, ProductMeta>();

  for (const row of rows) {
    const meta: ProductMeta = {
      image: firstImage(row.images),
      categoryNos: normalizeCategoryNos(row.category_nos),
    };
    if (row.cafe24_product_no != null) byCafe24.set(row.cafe24_product_no, meta);
    if (row.shopify_product_id != null) {
      byShopify.set(row.shopify_product_id, meta);
    }
    if (!byName.has(row.name)) byName.set(row.name, meta);
  }

  return items.map((item) => {
    let meta: ProductMeta | undefined;
    if (item.productId != null) {
      const id = Number(item.productId);
      if (Number.isFinite(id)) {
        meta = byCafe24.get(id) ?? byShopify.get(id);
      }
    }
    if (!meta) {
      meta = byName.get(item.name);
    }

    return {
      ...item,
      image: meta?.image ?? null,
      category: meta
        ? formatCategoryLabel(meta.categoryNos, categoryNameByNo)
        : null,
    };
  });
}
