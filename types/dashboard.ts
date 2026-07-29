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

export interface SalesTrendPoint {
  /** 일별: YYYY-MM-DD / 주별: 주 시작(월) YYYY-MM-DD / 월별: YYYY-MM */
  date: string;
  sales: number;
  /** 주별만: 주 종료(일) YYYY-MM-DD */
  weekEnd?: string;
}

export interface SalesTrendSeries {
  daily: SalesTrendPoint[];
  weekly: SalesTrendPoint[];
  monthly: SalesTrendPoint[];
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
  salesTrend: SalesTrendSeries;
  cafe24Available: boolean;
}
