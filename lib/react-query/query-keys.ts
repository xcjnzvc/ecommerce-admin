export const queryKeys = {
  dashboardSummary: ["dashboard-summary"] as const,
  bestSellers: ["best-sellers"] as const,
  orders: ["orders"] as const,
  orderDetail: (id: string) => ["orders", id] as const,
  inventory: ["inventory"] as const,
  inventoryLogs: ["inventory-logs"] as const,
  products: ["products"] as const,
};
