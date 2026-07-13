"use client";

import { Download, ChevronRight } from "lucide-react";

const orders = [
  {
    id: "VD-20260708-1428",
    customer: "김소연",
    product: "오가닉 코튼 셔츠 · 아이보리 / M",
    channel: "자사몰",
    price: "89,000원",
    status: "결제완료",
    time: "방금 전",
  },
  {
    id: "VD-20260708-1427",
    customer: "이지훈",
    product: "리사이클 데님 자켓 · 인디고 / L",
    channel: "네이버",
    price: "158,000원",
    status: "상품준비중",
    time: "3분 전",
  },
  {
    id: "VD-20260708-1426",
    customer: "박서율",
    product: "린넨 와이드 팬츠 · 샌드 / S",
    channel: "쿠팡",
    price: "72,000원",
    status: "배송중",
    time: "11분 전",
  },
  {
    id: "VD-20260708-1425",
    customer: "정하윤",
    product: "니트 카디건 세트 · 올리브 / M",
    channel: "자사몰",
    price: "124,000원",
    status: "결제완료",
    time: "24분 전",
  },
  {
    id: "VD-20260708-1424",
    customer: "최도현",
    product: "울 코트 · 카멜 / L",
    channel: "카카오",
    price: "289,000원",
    status: "취소/환불",
    time: "38분 전",
  },
  {
    id: "VD-20260708-1423",
    customer: "한유리",
    product: "실크 블라우스 · 크림 / S",
    channel: "자사몰",
    price: "118,000원",
    status: "배송완료",
    time: "52분 전",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "결제완료":
      return "bg-emerald-100 text-emerald-700";
    case "상품준비중":
      return "bg-amber-100 text-amber-700";
    case "배송중":
      return "bg-blue-100 text-blue-700";
    case "취소/환불":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function LatestOrders() {
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
                className={`px-4 py-1.5 rounded-full ${tab === "전체" ? "bg-white shadow-sm text-gray-900" : ""}`}
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
            <th className="pb-4 font-medium">고객</th>
            <th className="pb-4 font-medium">상품</th>
            <th className="pb-4 font-medium">채널</th>
            <th className="pb-4 font-medium">금액</th>
            <th className="pb-4 font-medium">상태</th>
            <th className="pb-4 font-medium text-right">시간</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => (
            <tr
              key={order.id}
              className="text-gray-800 hover:bg-gray-50/50 transition-colors"
            >
              <td className="py-5 font-medium">{order.id}</td>
              <td className="py-5 text-gray-600">{order.customer}</td>
              <td className="py-5 text-gray-600">{order.product}</td>
              <td className="py-5">
                <span className="bg-gray-100 px-2 py-1 rounded-md text-[11px] text-gray-600 font-medium">
                  {order.channel}
                </span>
              </td>
              {/* 분리된 금액 셀 */}
              <td className="py-5 font-bold text-gray-900">{order.price}</td>
              {/* 분리된 상태 셀 */}
              <td className="py-5">
                <span
                  className={`px-2 py-1 rounded-md text-[11px] font-medium ${getStatusColor(order.status)}`}
                >
                  {order.status}
                </span>
              </td>
              <td className="py-5 text-right text-gray-400">{order.time}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 푸터 */}
      <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
        <p className="text-[14px] text-gray-400">
          총 <span className="font-bold text-gray-900">148</span>건 중 6건 표시
        </p>
        <button className="text-sm font-semibold text-gray-900 flex items-center gap-1 hover:gap-2 transition-all">
          전체 주문 보기 <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
