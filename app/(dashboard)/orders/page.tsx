"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Download,
  Package,
  CheckCircle2,
  FileEdit,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Copy,
  Trash2,
  X,
  AlertCircle,
  Truck,
  Clock,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import SummaryCards from "@/app/components/SummaryCards";
import ChannelBadges from "@/app/components/ChannelBadges";
import Pagination, { paginateItems } from "@/app/components/Pagination";

const PAGE_SIZE = 6;

type InternalOrderStatus =
  | "결제완료"
  | "배송준비중"
  | "배송중"
  | "배송완료"
  | "취소"
  | "반품"
  | "교환";

interface OrderItem {
  name: string;
  quantity: number;
}

interface Order {
  id: string;
  channel: "cafe24" | "shopify";
  channel_order_id: string;
  buyer_name: string;
  buyer_phone: string;
  items: OrderItem[];
  total_price: number;
  status: InternalOrderStatus;
  tracking_number: string | null;
  courier_company: string | null;
  created_at: string;
}

const getOrderStatusStyle = (status: InternalOrderStatus) => {
  switch (status) {
    case "결제완료":
      return "bg-amber-50 text-amber-700 border-amber-200/60";
    case "배송준비중":
      return "bg-blue-50 text-blue-700 border-blue-200/60";
    case "배송중":
      return "bg-indigo-50 text-indigo-700 border-indigo-200/60";
    case "배송완료":
      return "bg-[#e8f8f0] text-[#0f8a5f] border-[#c2ebd7]";
    case "취소":
      return "bg-red-50 text-red-600 border-red-200/60";
    case "반품":
      return "bg-purple-50 text-purple-700 border-purple-200/60";
    case "교환":
      return "bg-orange-50 text-orange-700 border-orange-200/60";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("전체");
  const [page, setPage] = useState(1);

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionModalType, setActionModalType] = useState<
    "status" | "tracking" | null
  >(null);
  const [targetStatus, setTargetStatus] =
    useState<InternalOrderStatus>("배송준비중");
  const [bulkTrackingNumber, setBulkTrackingNumber] = useState("");
  const [bulkCourier, setBulkCourier] = useState("CJ대한통운");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const mockOrders: Order[] = [
          {
            id: "ord-2026-001",
            channel: "cafe24",
            channel_order_id: "20260325-0001928",
            buyer_name: "김민준",
            buyer_phone: "010-1234-5678",
            items: [
              { name: "프리미엄 코튼 오버사이즈 셔츠 (베이지)", quantity: 1 },
              { name: "슬림핏 슬랙스", quantity: 1 },
            ],
            total_price: 84000,
            status: "결제완료",
            tracking_number: null,
            courier_company: null,
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: "ord-2026-002",
            channel: "shopify",
            channel_order_id: "SH-US-99281",
            buyer_name: "Sarah Jenkins",
            buyer_phone: "010-9876-5432",
            items: [{ name: "Eco Friendly Ceramic Tumbler", quantity: 2 }],
            total_price: 45000,
            status: "배송준비중",
            tracking_number: null,
            courier_company: null,
            created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          },
          {
            id: "ord-2026-003",
            channel: "cafe24",
            channel_order_id: "20260325-0001842",
            buyer_name: "이지은",
            buyer_phone: "010-5555-4444",
            items: [{ name: "시그니처 린넨 원피스", quantity: 1 }],
            total_price: 112000,
            status: "배송중",
            tracking_number: "68291029384",
            courier_company: "우체국택배",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          },
          {
            id: "ord-2026-004",
            channel: "shopify",
            channel_order_id: "SH-US-99275",
            buyer_name: "Alex Morgan",
            buyer_phone: "010-3333-2222",
            items: [{ name: "Minimalist Desk Mat (Large)", quantity: 1 }],
            total_price: 32000,
            status: "취소",
            tracking_number: null,
            courier_company: null,
            created_at: new Date(
              Date.now() - 1000 * 60 * 60 * 12,
            ).toISOString(),
          },
          {
            id: "ord-2026-005",
            channel: "cafe24",
            channel_order_id: "20260324-0009182",
            buyer_name: "박도현",
            buyer_phone: "010-7777-8888",
            items: [{ name: "블루투스 기계식 키보드", quantity: 1 }],
            total_price: 159000,
            status: "배송완료",
            tracking_number: "1283948576",
            courier_company: "CJ대한통운",
            created_at: new Date(
              Date.now() - 1000 * 60 * 60 * 36,
            ).toISOString(),
          },
          {
            id: "ord-2026-006",
            channel: "cafe24",
            channel_order_id: "20260324-0008291",
            buyer_name: "한소희",
            buyer_phone: "010-2468-1357",
            items: [{ name: "데일리 스니커즈 (White)", quantity: 1 }],
            total_price: 79000,
            status: "반품",
            tracking_number: "9982736451",
            courier_company: "로젠택배",
            created_at: new Date(
              Date.now() - 1000 * 60 * 60 * 48,
            ).toISOString(),
          },
        ];
        setOrders(mockOrders);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdownId(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const totalCount = orders.length;
  const newOrderCount = orders.filter((o) => o.status === "결제완료").length;
  const shippingCount = orders.filter((o) => o.status === "배송중").length;
  const csCount = orders.filter((o) =>
    ["취소", "반품", "교환"].includes(o.status),
  ).length;

  const cafe24Count = orders.filter((o) => o.channel === "cafe24").length;
  const shopifyCount = orders.filter((o) => o.channel === "shopify").length;

  const summary = [
    {
      label: "전체 주문",
      count: totalCount,
      icon: <Package size={18} className="text-[#143617]" />,
      iconBg: "bg-[#143617]/10",
      filterKey: "전체",
    },
    {
      label: "신규 주문 (미처리)",
      count: newOrderCount,
      icon: <Clock size={18} className="text-amber-600" />,
      iconBg: "bg-amber-50",
      filterKey: "결제완료",
      highlight: true,
    },
    {
      label: "배송중",
      count: shippingCount,
      icon: <Truck size={18} className="text-indigo-600" />,
      iconBg: "bg-indigo-50",
      filterKey: "배송중",
    },
    {
      label: "취소/반품/교환 요청",
      count: csCount,
      icon: <AlertCircle size={18} className="text-red-600" />,
      iconBg: "bg-red-50",
      filterKey: "CS",
      highlightCs: true,
    },
  ];

  const filteredOrders = orders.filter((order) => {
    let matchesStatus = true;
    if (
      selectedStatus === "신규 주문 (미처리)" ||
      selectedStatus === "결제완료"
    ) {
      matchesStatus = order.status === "결제완료";
    } else if (selectedStatus === "배송중") {
      matchesStatus = order.status === "배송중";
    } else if (
      selectedStatus === "취소/반품/교환 요청" ||
      selectedStatus === "CS"
    ) {
      matchesStatus = ["취소", "반품", "교환"].includes(order.status);
    } else if (selectedStatus !== "전체") {
      matchesStatus = order.status === selectedStatus;
    }

    const matchesSearch =
      order.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.channel_order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer_phone.includes(searchTerm) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedOrders = paginateItems(filteredOrders, currentPage, PAGE_SIZE);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(pagedOrders.map((o) => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOrder = (orderId: string) => {
    if (selectedOrderIds.includes(orderId)) {
      setSelectedOrderIds(selectedOrderIds.filter((id) => id !== orderId));
    } else {
      setSelectedOrderIds([...selectedOrderIds, orderId]);
    }
  };

  const handleBulkStatusChange = () => {
    setOrders((prev) =>
      prev.map((ord) =>
        selectedOrderIds.includes(ord.id)
          ? { ...ord, status: targetStatus }
          : ord,
      ),
    );
    setToastMessage(
      `선택하신 ${selectedOrderIds.length}개 주문 상태가 [${targetStatus}]로 변경되었습니다.`,
    );
    setSelectedOrderIds([]);
    setIsActionModalOpen(false);
  };

  const handleBulkTrackingRegister = () => {
    if (!bulkTrackingNumber.trim()) {
      return;
    }
    setOrders((prev) =>
      prev.map((ord) =>
        selectedOrderIds.includes(ord.id)
          ? {
              ...ord,
              tracking_number: bulkTrackingNumber,
              courier_company: bulkCourier,
              status: "배송중",
            }
          : ord,
      ),
    );
    setToastMessage(
      `선택하신 ${selectedOrderIds.length}개 주문에 송장번호가 일괄 등록되었습니다.`,
    );
    setSelectedOrderIds([]);
    setIsActionModalOpen(false);
    setBulkTrackingNumber("");
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full p-8 bg-[#f8f9fa] min-h-screen font-sans relative pb-28">
      {/* 1. 상단 타이틀 영역 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            주문 관리
            {/* <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-white border border-gray-200 rounded-lg text-gray-600">
              <span className="text-emerald-600 font-bold">
                카페24 {cafe24Count}
              </span>
              <span className="text-gray-300">/</span>
              <span className="text-indigo-600 font-bold">
                Shopify {shopifyCount}
              </span>
            </div> */}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            카페24 및 Shopify 멀티채널 주문을 실시간 동기화하여 통합 처리하고
            CS를 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() =>
              setToastMessage("주문 데이터 연동 요청이 전송되었습니다.")
            }
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#e2e2e2] rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm w-full md:w-auto"
          >
            <RefreshCw size={15} className="text-gray-500" /> 채널 주문 동기화
          </button>

          <button
            onClick={() =>
              setToastMessage("엑셀 주문 리스트 다운로드가 시작되었습니다.")
            }
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#143617] text-white rounded-xl text-sm font-semibold hover:bg-[#0d240f] transition-colors shadow-sm w-full md:w-auto"
          >
            <Download size={16} /> 주문 엑셀 다운로드
          </button>
        </div>
      </div>

      {/* 2. 대시보드 스타일 요약 카드 4개 영역 */}
      <SummaryCards
        items={summary}
        isLoading={isLoading}
        onItemClick={(item) => {
          setSelectedStatus(item.filterKey);
          setPage(1);
        }}
      />

      {/* 3. 통합 검색 및 필터 컨트롤러 */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-transparent">
          <div className="inline-flex items-center p-1 bg-[#eceff1]/50 border border-gray-200/40 rounded-xl w-fit self-start overflow-x-auto">
            {[
              "전체",
              "결제완료",
              "배송준비중",
              "배송중",
              "배송완료",
              "취소/반품/교환",
            ].map((status) => {
              const isActive =
                selectedStatus === status ||
                (status === "취소/반품/교환" && selectedStatus === "CS");
              return (
                <button
                  key={status}
                  onClick={() => {
                    setSelectedStatus(
                      status === "취소/반품/교환" ? "CS" : status,
                    );
                    setPage(1);
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#143617] text-white shadow-sm"
                      : "text-[#5e6e82] hover:text-[#143617] bg-transparent"
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-transparent">
            <div className="relative min-w-[240px] flex-1 md:flex-initial">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={14}
              />
              <input
                type="text"
                placeholder="주문자명, 연락처, 주문번호, 상품명 검색..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#143617] focus:border-[#143617] transition-all"
              />
            </div>

            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-[#5e6e82] shadow-sm transition-all">
              <Filter size={13} className="text-gray-400" />
              필터
            </button>

            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-[#5e6e82] shadow-sm transition-all">
              <ArrowUpDown size={13} className="text-gray-400" />
              정렬
            </button>
          </div>
        </div>
      </div>

      {/* 4. 데이터 테이블 영역 */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-[#143617] border-t-transparent rounded-full mb-3"></div>
            <p className="text-sm text-gray-400 font-medium">
              통합 주문 데이터를 불러오고 있습니다...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-20 text-center text-gray-400">
            <ShoppingBag className="mx-auto mb-3 text-gray-300" size={36} />
            <p className="text-sm font-medium">
              조건에 일치하는 주문 데이터가 존재하지 않습니다.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm text-left border-collapse">
              <thead className="bg-[#fcfdfe] border-b border-gray-100/80 text-[#5e6e82] text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="w-14 px-6 py-5.5 text-center">
                    <input
                      type="checkbox"
                      checked={
                        pagedOrders.length > 0 &&
                        pagedOrders.every((o) =>
                          selectedOrderIds.includes(o.id),
                        )
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-[#143617] focus:ring-[#143617] w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-5.5 font-bold text-[#5e6e82] text-left">
                    주문번호 / 채널
                  </th>
                  <th className="px-6 py-5.5 font-bold text-[#5e6e82] text-left">
                    채널
                  </th>
                  <th className="px-6 py-5.5 font-bold text-[#5e6e82] text-left">
                    주문자
                  </th>
                  <th className="px-6 py-5.5 font-bold text-[#5e6e82] text-left">
                    상품정보
                  </th>
                  <th className="px-6 py-5.5 font-bold text-[#5e6e82] text-left">
                    결제금액
                  </th>
                  <th className="px-6 py-5.5 font-bold text-[#5e6e82] text-left">
                    주문상태
                  </th>
                  <th className="px-6 py-5.5 font-bold text-[#5e6e82] text-left">
                    배송정보
                  </th>
                  <th className="px-6 py-5.5 font-bold text-[#5e6e82] text-left">
                    주문일시
                  </th>
                  <th className="w-24 px-6 py-5.5 font-bold text-[#5e6e82] text-left">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/70">
                {pagedOrders.map((order) => {
                  const isChecked = selectedOrderIds.includes(order.id);
                  const firstItemName = order.items[0]?.name || "상품";
                  const otherCount = order.items.length - 1;

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-[#f8f9fa]/70 transition-all cursor-pointer group ${
                        isChecked ? "bg-[#143617]/5 hover:bg-[#143617]/10" : ""
                      }`}
                    >
                      {/* 체크박스 */}
                      <td
                        className="px-6 py-5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOrder(order.id)}
                          className="rounded border-gray-300 text-[#143617] focus:ring-[#143617] w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* 주문번호 */}
                      <td className="px-6 py-5 text-left">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 group-hover:text-[#143617] transition-colors text-sm font-mono">
                            {order.id}
                          </span>
                          <span className="text-xs font-medium text-gray-400 font-mono mt-0.5">
                            원본: {order.channel_order_id}
                          </span>
                        </div>
                      </td>

                      {/* 채널 뱃지 */}
                      <td className="px-6 py-5 text-left">
                        <ChannelBadges
                          cafe24={order.channel === "cafe24"}
                          shopify={order.channel === "shopify"}
                        />
                      </td>

                      {/* 주문자 */}
                      <td className="px-6 py-5 text-left">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm">
                            {order.buyer_name}
                          </span>
                          <span className="text-xs font-medium text-gray-400 mt-0.5">
                            {order.buyer_phone}
                          </span>
                        </div>
                      </td>

                      {/* 상품정보 */}
                      <td className="px-6 py-5 text-left max-w-[220px]">
                        <div className="truncate font-bold text-gray-900 text-sm">
                          {firstItemName}
                          {otherCount > 0 && (
                            <span className="text-gray-400 ml-1 font-medium text-xs">
                              외 {otherCount}건
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 결제금액 */}
                      <td className="px-6 py-5 text-left font-bold text-gray-900 text-sm">
                        {order.total_price.toLocaleString()}원
                      </td>

                      {/* 주문상태 뱃지 */}
                      <td className="px-6 py-5 text-left">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg border ${getOrderStatusStyle(
                            order.status,
                          )}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
                          {order.status}
                        </span>
                      </td>

                      {/* 배송정보 */}
                      <td className="px-6 py-5 text-left">
                        {order.tracking_number ? (
                          <div className="flex flex-col">
                            <span className="font-mono text-[11px] text-gray-800 font-semibold">
                              {order.tracking_number}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {order.courier_company || "택배"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded w-fit">
                            미등록
                          </span>
                        )}
                      </td>

                      {/* 주문일시 */}
                      <td className="px-6 py-5 text-left text-gray-400 font-medium text-xs">
                        {new Date(order.created_at).toLocaleString("ko-KR", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* 관리 버튼 및 드롭다운 */}
                      <td
                        className="px-6 py-5 text-left relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setActiveDropdownId(
                                activeDropdownId === order.id ? null : order.id,
                              )
                            }
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-all text-[#5e6e82] hover:text-[#143617]"
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {activeDropdownId === order.id && (
                            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-20">
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  setToastMessage(
                                    `주문 상세정보 (${order.id}) 창을 엽니다.`,
                                  );
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#143617]"
                              >
                                상세보기
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  setSelectedOrderIds([order.id]);
                                  setActionModalType("tracking");
                                  setIsActionModalOpen(true);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#143617]"
                              >
                                송장등록
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  setSelectedOrderIds([order.id]);
                                  setActionModalType("status");
                                  setIsActionModalOpen(true);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                              >
                                상태변경
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <Pagination
              page={currentPage}
              totalItems={filteredOrders.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* 하단 플로팅 액션 바 */}
      {selectedOrderIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-gray-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.12)] px-6 py-4.5 rounded-2xl flex items-center gap-6 z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#143617]"></span>
            <span className="text-sm font-extrabold text-gray-900">
              {selectedOrderIds.length}개 주문 선택됨
            </span>
          </div>

          <div className="h-4 w-px bg-gray-200"></div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActionModalType("tracking");
                setIsActionModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
            >
              <Truck size={14} className="text-indigo-600" />
              송장 일괄 등록
            </button>
            <button
              onClick={() => {
                setActionModalType("status");
                setIsActionModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all"
            >
              <CheckCircle2 size={14} className="text-emerald-600" />
              상태 일괄 변경
            </button>
          </div>

          <button
            onClick={() => setSelectedOrderIds([])}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all ml-2"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* 액션 모달 */}
      {isActionModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full p-6 shadow-2xl">
            {actionModalType === "tracking" ? (
              <>
                <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <Truck className="text-indigo-600" size={18} /> 송장 번호 일괄
                  등록
                </h3>
                <p className="text-xs text-gray-500 mb-5">
                  선택한 {selectedOrderIds.length}개 주문에 대한 택배사 및
                  송장번호를 입력합니다.
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      택배사 선택
                    </label>
                    <select
                      value={bulkCourier}
                      onChange={(e) => setBulkCourier(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#143617]"
                    >
                      <option value="CJ대한통운">CJ대한통운</option>
                      <option value="우체국택배">우체국택배</option>
                      <option value="한진택배">한진택배</option>
                      <option value="로젠택배">로젠택배</option>
                      <option value="롯데택배">롯데택배</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      송장번호 입력
                    </label>
                    <input
                      type="text"
                      placeholder="예: 68291029384"
                      value={bulkTrackingNumber}
                      onChange={(e) => setBulkTrackingNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#143617]"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setIsActionModalOpen(false)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleBulkTrackingRegister}
                    className="px-5 py-2.5 bg-[#143617] hover:bg-[#0d240f] rounded-xl text-xs font-bold text-white transition-colors"
                  >
                    등록 및 채널 동기화
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-600" size={18} /> 주문
                  상태 일괄 변경
                </h3>
                <p className="text-xs text-gray-500 mb-5">
                  선택한 {selectedOrderIds.length}개 주문의 내부 통합 상태를
                  일괄 변경합니다.
                </p>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    변경할 주문 상태
                  </label>
                  <select
                    value={targetStatus}
                    onChange={(e) =>
                      setTargetStatus(e.target.value as InternalOrderStatus)
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#143617]"
                  >
                    <option value="결제완료">결제완료</option>
                    <option value="배송준비중">배송준비중</option>
                    <option value="배송중">배송중</option>
                    <option value="배송완료">배송완료</option>
                    <option value="취소">취소</option>
                    <option value="반품">반품</option>
                    <option value="교환">교환</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setIsActionModalOpen(false)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleBulkStatusChange}
                    className="px-5 py-2.5 bg-[#143617] hover:bg-[#0d240f] rounded-xl text-xs font-bold text-white transition-colors"
                  >
                    변경하기
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
