"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, ChevronRight } from "lucide-react";
import { type Order } from "@/lib/orders/types";
import { useOrders } from "@/lib/orders/queries";

const DISPLAY_LIMIT = 6;

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return "-";

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;

  return new Date(iso).toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });
}

function formatProductLabel(order: Order): string {
  const first = order.items[0]?.name;
  if (!first) return "-";
  const otherCount = order.items.length - 1;
  return otherCount > 0 ? `${first} 외 ${otherCount}건` : first;
}

function channelLabel(channel: Order["channel"]): string {
  return channel === "cafe24" ? "카페24" : "Shopify";
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "결제완료":
      return "bg-emerald-100 text-emerald-700";
    case "배송준비중":
    case "상품준비중":
      return "bg-amber-100 text-amber-700";
    case "배송중":
      return "bg-blue-100 text-blue-700";
    case "취소":
    case "반품":
    case "교환":
    case "취소/환불":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function LatestOrders() {
  const { data: orders = [], isLoading } = useOrders();
  const [selectedTab, setSelectedTab] = useState("전체");

  const filteredOrders = orders.filter((order) => {
    if (selectedTab === "결제완료") return order.status === "결제완료";
    if (selectedTab === "배송중") return order.status === "배송중";
    if (selectedTab === "환불")
      return ["취소", "반품", "교환"].includes(order.status);
    return true;
  });

  const displayedOrders = filteredOrders.slice(0, DISPLAY_LIMIT);

  return (
    <div className="bg-white p-8 rounded-3xl border border-[#e2e2e2] w-full">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-[50px]">
        <div>
          <h3 className="text-xs text-gray-400 font-bold tracking-wider uppercase">
            Latest Orders
          </h3>
          <h2 className="text-lg font-bold text-gray-900 mt-1">
            최근 주문 목록
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-full flex text-[12px] font-medium text-gray-500">
            {["전체", "결제완료", "배송중", "환불"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-1.5 rounded-full ${tab === selectedTab ? "bg-white shadow-sm text-gray-900" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="p-2 border border-gray-200 rounded-full hover:bg-gray-50">
            <Download size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <table className="w-full text-sm">
        <thead className="text-gray-400 border-b border-gray-100">
          <tr className="text-left">
            <th className="pb-4 font-medium">주문번호</th>
            <th className="pb-4 font-medium">상품</th>
            <th className="pb-4 font-medium">채널</th>
            <th className="pb-4 font-medium">금액</th>
            <th className="pb-4 font-medium">상태</th>
            <th className="pb-4 font-medium text-right">시간</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {isLoading ? (
            <tr>
              <td colSpan={6} className="py-10 text-center text-gray-400">
                주문 데이터를 불러오는 중...
              </td>
            </tr>
          ) : displayedOrders.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-10 text-center text-gray-400">
                표시할 주문이 없습니다.
              </td>
            </tr>
          ) : (
            displayedOrders.map((order) => (
              <tr
                key={order.id}
                className="text-gray-800 hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-5 font-medium">{order.id}</td>
                <td className="py-5 text-gray-600">{formatProductLabel(order)}</td>
                <td className="py-5">
                  <span className="bg-gray-100 px-2 py-1 rounded-md text-[11px] text-gray-600 font-medium">
                    {channelLabel(order.channel)}
                  </span>
                </td>
                <td className="py-5 font-bold text-gray-900">
                  {order.total_price.toLocaleString()}원
                </td>
                <td className="py-5">
                  <span
                    className={`px-2 py-1 rounded-md text-[11px] font-medium ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-5 text-right text-gray-400">
                  {formatRelativeTime(order.created_at)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 푸터 */}
      <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
        <p className="text-[14px] text-gray-400">
          총{" "}
          <span className="font-bold text-gray-900">{filteredOrders.length}</span>
          건 중 {Math.min(DISPLAY_LIMIT, displayedOrders.length)}건 표시
        </p>
        <Link
          href="/orders"
          className="text-sm font-semibold text-gray-900 flex items-center gap-1 hover:gap-2 transition-all"
        >
          전체 주문 보기 <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
