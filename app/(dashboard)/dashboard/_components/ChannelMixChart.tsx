"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ChannelMixChartProps {
  channelMix?: { cafe24: number; shopify: number };
  cafe24Available?: boolean;
  isLoading?: boolean;
}

const CHANNEL_META = [
  { key: "cafe24" as const, name: "카페24", color: "#143617" },
  { key: "shopify" as const, name: "Shopify", color: "#2d6a4f" },
];

function formatSales(value: number): string {
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(2)}억`;
  }
  if (value >= 10_000) {
    return `${Math.round(value / 10_000)}만`;
  }
  return value.toLocaleString();
}

export default function ChannelMixChart({
  channelMix = { cafe24: 0, shopify: 0 },
  cafe24Available = true,
  isLoading = false,
}: ChannelMixChartProps) {
  const data = CHANNEL_META.map((meta) => ({
    ...meta,
    value: channelMix[meta.key] ?? 0,
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white p-6 rounded-[20px] border w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xs text-gray-400 font-bold">CHANNEL MIX</h3>
          <h2 className="font-bold text-gray-800">채널별 매출 비교</h2>
        </div>
        <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
          이번 달
        </span>
      </div>

      <div className="h-[200px] relative">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            채널 매출을 불러오는 중...
          </div>
        ) : total === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            표시할 채널 매출이 없습니다.
          </div>
        ) : (
          <>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[10px] text-gray-400">TOTAL</p>
              <p className="text-xl font-bold">{formatSales(total)}</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {data.map((item) => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
          const showReviewBadge =
            item.key === "cafe24" && !cafe24Available;

          return (
            <div key={item.key} className="flex items-center text-sm">
              <div
                className="w-3 h-3 rounded-sm mr-3"
                style={{ backgroundColor: item.color }}
              />
              <span className="flex-1 text-gray-600 flex items-center gap-2">
                {item.name}
                {showReviewBadge && (
                  <span className="text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                    심사중
                  </span>
                )}
              </span>
              <span className="text-gray-400 text-xs w-10">{percent}%</span>
              <span className="font-bold w-20 text-right">
                {isLoading ? "-" : formatSales(item.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
