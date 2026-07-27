"use client";

import {
  CheckCircle2,
  Package,
  Truck,
  RotateCcw,
  MailCheck,
  type LucideIcon,
} from "lucide-react";

interface OrderStatusProps {
  orderStatusCounts?: Record<string, number>;
  todayCount?: number;
  todayGrowthRate?: number;
  isLoading?: boolean;
}

const STATUS_CONFIG: Array<{
  key: string;
  label: string;
  icon: LucideIcon;
  highlight?: boolean;
  /** 여러 상태를 합산할 때 사용 */
  keys?: string[];
}> = [
  {
    key: "배송준비중",
    label: "배송준비중",
    icon: Package,
    highlight: true,
  },
  { key: "배송완료", label: "배송완료", icon: MailCheck },
  { key: "결제완료", label: "결제완료", icon: CheckCircle2 },
  { key: "배송중", label: "배송중", icon: Truck },
  {
    key: "취소/환불",
    label: "취소/환불",
    icon: RotateCcw,
    keys: ["취소", "반품", "교환"],
  },
];

export default function OrderStatus({
  orderStatusCounts = {},
  todayCount = 0,
  todayGrowthRate = 0,
  isLoading = false,
}: OrderStatusProps) {
  const orderStats = STATUS_CONFIG.map((config) => {
    const count = config.keys
      ? config.keys.reduce((sum, k) => sum + (orderStatusCounts[k] ?? 0), 0)
      : (orderStatusCounts[config.key] ?? 0);
    return { ...config, count };
  });

  const growthLabel =
    todayGrowthRate > 0
      ? `↑${todayGrowthRate}`
      : todayGrowthRate < 0
        ? `↓${Math.abs(todayGrowthRate)}`
        : "0";

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
          {isLoading ? (
            "불러오는 중..."
          ) : (
            <>
              오늘 {todayCount.toLocaleString()}건{" "}
              <span
                className={`ml-1 ${todayGrowthRate >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {growthLabel}
              </span>
            </>
          )}
        </p>
      </div>

      <div className="flex items-center divide-x divide-gray-200">
        {orderStats.map((stat) => {
          const Icon = stat.icon;
          const isHighlight = Boolean(stat.highlight);

          return (
            <div
              key={stat.key}
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
                  {isLoading ? "-" : stat.count}
                </h2>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
