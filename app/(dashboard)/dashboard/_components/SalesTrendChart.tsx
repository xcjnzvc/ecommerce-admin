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

const data: ChartData[] = [
  { date: "07/01", sales: 14000000 },
  { date: "07/02", sales: 14280000 },
  { date: "07/03", sales: 12800000 },
  { date: "07/04", sales: 15200000 },
  { date: "07/05", sales: 14800000 },
  { date: "07/06", sales: 13800000 },
  { date: "07/07", sales: 12500000 },
];

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

export default function SalesTrendChart() {
  return (
    <div className="w-full bg-white p-6 rounded-[20px] border border-[#e2e2e2]">
      {/* 상단 제목 및 필터 영역 */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xs text-gray-400 font-bold tracking-wider">
            SALES TREND
          </h3>
          <h2 className="text-lg font-bold text-gray-800">일별 매출 추이</h2>
          {/* 평균 대비/목표선 대비 요약 정보 추가 */}
          <div className="flex gap-4 text-sm mt-2 text-gray-600">
            <span>
              평균 대비 <span className="font-bold text-[#143617]">+18.4%</span>
            </span>
            <span>·</span>
            <span>
              목표선 대비{" "}
              <span className="font-bold text-[#d4a373]">+27% 초과 달성</span>
            </span>
          </div>
        </div>

        {/* 우측 기간 필터 버튼 및 범례 */}
        <div className="flex  items-center gap-3">
          <div className="flex gap-4 text-xs font-medium">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-[#143617] rounded-sm"></span>매출
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-[#d4a373] rounded-sm"></span>일 목표
            </div>
          </div>
          <div className="flex bg-gray-50 rounded-lg p-1 border">
            {["7일", "14일", "30일", "3개월"].map((period, idx) => (
              <button
                key={period}
                className={`px-3 py-1 text-xs rounded-md ${idx === 0 ? "bg-white shadow-sm font-bold" : "text-gray-500"}`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
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
            <YAxis hide domain={[0, 20000000]} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={9000000} stroke="#d4a373" strokeDasharray="3 3" />
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
      </div>
    </div>
  );
}
