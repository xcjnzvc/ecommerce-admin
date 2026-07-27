"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface ChartData {
  date: string;
  sales: number;
}

interface SalesTrendChartProps {
  data?: ChartData[];
  isLoading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-xl shadow-lg">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-bold text-sm text-[#143617]">
          매출 : {Number(payload[0].value).toLocaleString()}원
        </p>
      </div>
    );
  }
  return null;
};

function formatChartDate(date: string): string {
  // YYYY-MM-DD → MM/DD
  const parts = date.split("-");
  if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
  return date;
}

export default function SalesTrendChart({
  data = [],
  isLoading = false,
}: SalesTrendChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    date: formatChartDate(d.date),
  }));

  const maxSales = chartData.reduce((max, d) => Math.max(max, d.sales), 0);
  const avgSales =
    chartData.length > 0
      ? chartData.reduce((sum, d) => sum + d.sales, 0) / chartData.length
      : 0;
  const yMax = maxSales > 0 ? Math.ceil(maxSales * 1.1) : 1000;

  return (
    <div className="w-full bg-white p-6 rounded-[20px] border border-[#e2e2e2]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xs text-gray-400 font-bold tracking-wider">
            SALES TREND
          </h3>
          <h2 className="text-lg font-bold text-gray-800">일별 매출 추이</h2>
          <div className="flex gap-4 text-sm mt-2 text-gray-600">
            <span>
              일 평균{" "}
              <span className="font-bold text-[#143617]">
                {isLoading ? "-" : `${Math.round(avgSales).toLocaleString()}원`}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-4 text-xs font-medium">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-[#143617] rounded-sm"></span>매출
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-[#d4a373] rounded-sm"></span>일 평균
            </div>
          </div>
        </div>
      </div>

      <div className="h-[250px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            매출 추이를 불러오는 중...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            표시할 매출 데이터가 없습니다.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#143617" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#143617" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#999" }}
              />
              <YAxis hide domain={[0, yMax]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={avgSales}
                stroke="#d4a373"
                strokeDasharray="3 3"
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#143617"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSales)"
                dot={{ r: 4, fill: "#143617", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{
                  r: 6,
                  fill: "#d4a373",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
