export interface OrderFilters {
  startDate: string | null;
  endDate: string | null;
  channel: "all" | "cafe24" | "shopify";
  minPrice: number | null;
  maxPrice: number | null;
  hasTracking: boolean | null; // true=등록됨, false=미등록, null=전체
}

export interface ProductFilters {
  startDate: string | null;
  endDate: string | null;
  channel: "all" | "cafe24" | "shopify" | "both" | "none";
}

export interface InventoryFilters {
  startDate: string | null;
  endDate: string | null;
  channel: "all" | "cafe24" | "shopify" | "both" | "none";
  unsyncedToday: boolean;
}

export const DEFAULT_ORDER_FILTERS: OrderFilters = {
  startDate: null,
  endDate: null,
  channel: "all",
  minPrice: null,
  maxPrice: null,
  hasTracking: null,
};

export const DEFAULT_PRODUCT_FILTERS: ProductFilters = {
  startDate: null,
  endDate: null,
  channel: "all",
};

export const DEFAULT_INVENTORY_FILTERS: InventoryFilters = {
  startDate: null,
  endDate: null,
  channel: "all",
  unsyncedToday: false,
};

export function countActiveOrderFilters(filters: OrderFilters): number {
  let count = 0;
  if (filters.startDate || filters.endDate) count += 1;
  if (filters.channel !== "all") count += 1;
  if (filters.minPrice != null || filters.maxPrice != null) count += 1;
  if (filters.hasTracking != null) count += 1;
  return count;
}

export function countActiveProductFilters(filters: ProductFilters): number {
  let count = 0;
  if (filters.startDate || filters.endDate) count += 1;
  if (filters.channel !== "all") count += 1;
  return count;
}

export function countActiveInventoryFilters(filters: InventoryFilters): number {
  let count = 0;
  if (filters.startDate || filters.endDate) count += 1;
  if (filters.channel !== "all") count += 1;
  if (filters.unsyncedToday) count += 1;
  return count;
}

/** YYYY-MM-DD 로컬 날짜 문자열 */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function startOfDay(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function endOfDay(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

export function isDateInRange(
  isoDate: string | null | undefined,
  startDate: string | null,
  endDate: string | null,
): boolean {
  if (!startDate && !endDate) return true;
  if (!isoDate) return false;
  const time = new Date(isoDate).getTime();
  if (Number.isNaN(time)) return false;
  if (startDate && time < startOfDay(startDate).getTime()) return false;
  if (endDate && time > endOfDay(endDate).getTime()) return false;
  return true;
}

export function isUnsyncedToday(isoDate: string | null | undefined): boolean {
  if (!isoDate) return true;
  const synced = new Date(isoDate);
  if (Number.isNaN(synced.getTime())) return true;
  const today = toDateInputValue(new Date());
  return toDateInputValue(synced) !== today;
}
