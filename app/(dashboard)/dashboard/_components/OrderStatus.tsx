"use client";

import {
  CheckCircle2,
  Package,
  Truck,
  RotateCcw,
  MailCheck,
} from "lucide-react";

const orderStats = [
  { label: "상품준비중", count: 28, icon: Package, highlight: true },
  { label: "배송완료", count: 118, icon: MailCheck },
  { label: "결제완료", count: 42, icon: CheckCircle2 },
  { label: "배송중", count: 64, icon: Truck },
  { label: "취소/환불", count: 7, icon: RotateCcw },
];

export default function OrderStatus() {
  return (
    <div className="bg-white p-5 rounded-[20px] border border-[#e2e2e2]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-[10px] text-gray-400 font-bold tracking-wider">
            ORDER STATUS
          </h3>
          <h2 className="text-base font-bold text-gray-800">주문 현황</h2>
        </div>
        <p className="text-xs font-medium text-gray-600">
          오늘 259건 <span className="text-green-600 ml-1">↑12</span>
        </p>
      </div>

      <div className="flex items-center divide-x divide-gray-200">
        {orderStats.map((stat, i) => {
          const Icon = stat.icon;
          const isHighlight = stat.highlight;

          return (
            <div
              key={i}
              className={`flex-1 flex flex-col items-center justify-center text-center gap-2 py-4
                ${
                  isHighlight ? "bg-[#143617] rounded-[16px]" : "bg-transparent"
                }`}
            >
              <Icon
                className={isHighlight ? "text-[#fff]" : "text-gray-400"}
                size={20}
              />
              <div>
                <p
                  className={`text-[12px] mb-1 ${isHighlight ? "text-[#fff] " : "text-gray-400"}`}
                >
                  {stat.label}
                </p>
                <h2
                  className={`text-2xl font-bold ${isHighlight ? "text-[#fff]" : "text-gray-800"}`}
                >
                  {stat.count}
                </h2>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
