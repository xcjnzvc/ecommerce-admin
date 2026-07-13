"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "자사몰", value: 14372, color: "#143617" },
  { name: "네이버 스마트스토어", value: 8894, color: "#2d6a4f" },
  { name: "쿠팡", value: 4789, color: "#52b788" },
  //   { name: "카카오톡스토어", value: 3418, color: "#d99645" },
  //   { name: "무신사", value: 2745, color: "#fca311" },
];

export default function ChannelMixChart() {
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
          <p className="text-xl font-bold">3.42억</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center text-sm">
            <div
              className="w-3 h-3 rounded-sm mr-3"
              style={{ backgroundColor: item.color }}
            />
            <span className="flex-1 text-gray-600">{item.name}</span>
            <span className="text-gray-400 text-xs w-10">
              {Math.round((item.value / 34218) * 100)}%
            </span>
            <span className="font-bold w-20 text-right">{item.value}만</span>
          </div>
        ))}
      </div>
    </div>
  );
}
