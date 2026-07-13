export interface SalesCardTypes {
  id: number;
  title: "today" | "week" | "month";
  date: string;
  percent: string;
  price: string;
  order: string;
}
