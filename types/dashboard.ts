export interface SalesCardTypes {
  id: number;
  title: "today" | "week" | "month";
  date: string;
  percent: string;
  price: string;
  order: string;
}

export interface PeriodSummary {
  total: number;
  count: number;
  growthRate: number;
}

export interface DashboardSummary {
  today: PeriodSummary;
  week: PeriodSummary;
  month: PeriodSummary;
  orderStatusCounts: Record<string, number>;
  channelMix: {
    cafe24: number;
    shopify: number;
  };
  salesTrend: Array<{ date: string; sales: number }>;
  cafe24Available: boolean;
}
