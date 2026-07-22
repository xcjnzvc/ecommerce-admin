"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Package,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Edit3,
  History,
  X,
  Check,
  AlertCircle,
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  warehouse_stock: number; // 실제 보유 재고 (창고)
  reserved_stock: number; // 주문 처리중
  available_stock: number; // 판매 가능 재고 (warehouse - reserved)
  cafe24_stock: number; // 카페24 판매 가능 재고
  shopify_stock: number; // Shopify 판매 가능 재고
  status: "정상" | "부족" | "품절" | "동기화오류";
  last_synced_at: string;
  images: string[] | null;
}

interface InventoryLog {
  id: string;
  product_name: string;
  change_detail: string;
  modifier: string;
  created_at: string;
}

const getInventoryStatusStyle = (status: string) => {
  switch (status) {
    case "정상":
      return "bg-[#e8f8f0] text-[#0f8a5f]";
    case "부족":
      return "bg-[#fff8e1] text-[#b78103]";
    case "품절":
      return "bg-[#ffebee] text-[#c62828]";
    case "동기화오류":
      return "bg-purple-50 text-purple-700";
    default:
      return "bg-[#f5f5f5] text-[#616161]";
  }
};

export default function InventoryManagement() {
  /* STREAMING_CHUNK:Initializing advanced inventory state... */
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: "1",
      name: "스페셜티 시그니처 원두 200g",
      sku: "SKU-BND-001",
      warehouse_stock: 100,
      reserved_stock: 10,
      available_stock: 90,
      cafe24_stock: 45,
      shopify_stock: 45,
      status: "정상",
      last_synced_at: new Date().toISOString(),
      images: [],
    },
    {
      id: "2",
      name: "핸드드립 콜드브루 텀블러",
      sku: "SKU-TMB-002",
      warehouse_stock: 8,
      reserved_stock: 5,
      available_stock: 3,
      cafe24_stock: 1,
      shopify_stock: 2,
      status: "부족",
      last_synced_at: new Date().toISOString(),
      images: [],
    },
    {
      id: "3",
      name: "유기농 수제 쿠키 선물세트",
      sku: "SKU-CK-003",
      warehouse_stock: 0,
      reserved_stock: 0,
      available_stock: 0,
      cafe24_stock: 0,
      shopify_stock: 0,
      status: "품절",
      last_synced_at: new Date().toISOString(),
      images: [],
    },
    {
      id: "4",
      name: "프리미엄 드립백 기프트",
      sku: "SKU-DB-004",
      warehouse_stock: 50,
      reserved_stock: 2,
      available_stock: 48,
      cafe24_stock: 20,
      shopify_stock: 25, // 합계(45)와 창고 가용(48) 불일치 시뮬레이션
      status: "동기화오류",
      last_synced_at: new Date().toISOString(),
      images: [],
    },
  ]);

  const [logs, setLogs] = useState<InventoryLog[]>([
    {
      id: "l1",
      product_name: "스페셜티 시그니처 원두 200g",
      change_detail: "창고 실제 재고 수정: 100 → 120",
      modifier: "관리자",
      created_at: "2026-07-22 18:30",
    },
    {
      id: "l2",
      product_name: "핸드드립 콜드브루 텀블러",
      change_detail: "카페24 주문 발생 (주문 처리중 3 → 5)",
      modifier: "시스템 자동",
      created_at: "2026-07-22 17:20",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("전체");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // 독립 수정용 상태
  const [editWarehouseStock, setEditWarehouseStock] = useState<number>(0);
  const [editReservedStock, setEditReservedStock] = useState<number>(0);
  const [editCafe24Stock, setEditCafe24Stock] = useState<number>(0);
  const [editShopifyStock, setEditShopifyStock] = useState<number>(0);

  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const totalProducts = items.length;
  const totalWarehouseStock = items.reduce(
    (acc, cur) => acc + cur.warehouse_stock,
    0,
  );
  const outOfStockCount = items.filter((i) => i.status === "품절").length;
  const syncErrorCount = items.filter((i) => i.status === "동기화오류").length;

  const summary = [
    {
      label: "관리 상품 수",
      count: totalProducts,
      unit: "개",
      icon: <Package size={18} className="text-[#143617]" />,
      iconBg: "bg-[#143617]/10",
    },
    {
      label: "총 보유 재고",
      count: totalWarehouseStock,
      unit: "개",
      icon: <CheckCircle2 size={18} className="text-[#1b5e20]" />,
      iconBg: "bg-[#e8f5e9]",
    },
    {
      label: "품절 상품",
      count: outOfStockCount,
      unit: "개",
      icon: <XCircle size={18} className="text-red-600" />,
      iconBg: "bg-red-50",
    },
    {
      label: "동기화 오류",
      count: syncErrorCount,
      unit: "개",
      icon: <AlertCircle size={18} className="text-purple-600" />,
      iconBg: "bg-purple-50",
    },
  ];

  const filteredItems = items.filter((item) => {
    const matchesStatus =
      selectedStatus === "전체" ||
      (selectedStatus === "정상" && item.status === "정상") ||
      (selectedStatus === "부족" && item.status === "부족") ||
      (selectedStatus === "품절" && item.status === "품절") ||
      (selectedStatus === "동기화오류" && item.status === "동기화오류");

    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setEditWarehouseStock(item.warehouse_stock);
    setEditReservedStock(item.reserved_stock);
    setEditCafe24Stock(item.cafe24_stock);
    setEditShopifyStock(item.shopify_stock);
    setIsEditModalOpen(true);
  };

  const handleSaveInventory = () => {
    if (!editingItem) return;

    const newAvailable = Math.max(0, editWarehouseStock - editReservedStock);
    let updatedStatus: "정상" | "부족" | "품절" | "동기화오류" = "정상";

    if (editWarehouseStock === 0) updatedStatus = "품절";
    else if (newAvailable <= 5) updatedStatus = "부족";
    else if (editCafe24Stock + editShopifyStock !== newAvailable) {
      updatedStatus = "동기화오류";
    }

    const updatedItems = items.map((i) =>
      i.id === editingItem.id
        ? {
            ...i,
            warehouse_stock: editWarehouseStock,
            reserved_stock: editReservedStock,
            available_stock: newAvailable,
            cafe24_stock: editCafe24Stock,
            shopify_stock: editShopifyStock,
            status: updatedStatus,
            last_synced_at: new Date().toISOString(),
          }
        : i,
    );

    setItems(updatedItems);

    const newLog: InventoryLog = {
      id: Date.now().toString(),
      product_name: editingItem.name,
      change_detail: `창고재고: ${editWarehouseStock}, 예약: ${editReservedStock}, 카페24: ${editCafe24Stock}, 쇼피파이: ${editShopifyStock}`,
      modifier: "관리자",
      created_at: new Date().toISOString().replace("T", " ").substring(0, 16),
    };
    setLogs([newLog, ...logs]);

    setToastMessage(`'${editingItem.name}' 재고 설정이 저장되었습니다.`);
    setIsEditModalOpen(false);
  };

  const handleFullSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setItems((prev) =>
        prev.map((i) => {
          const avail = Math.max(0, i.warehouse_stock - i.reserved_stock);
          const half = Math.floor(avail / 2);
          return {
            ...i,
            available_stock: avail,
            cafe24_stock: half,
            shopify_stock: avail - half,
            status:
              i.warehouse_stock === 0 ? "품절" : avail <= 5 ? "부족" : "정상",
            last_synced_at: new Date().toISOString(),
          };
        }),
      );
      setIsSyncing(false);
      setToastMessage("채널별 재고 대사 및 API 전체 동기화가 완료되었습니다.");
    }, 1000);
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full p-8 bg-[#f8f9fa] min-h-screen font-sans relative pb-28">
      {/* 1. 상단 타이틀 영역 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            재고 관리
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            창고 실물 보유량, 주문 처리중 수량 및 카페24/Shopify 판매 채널별
            수량을 정밀 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* 채널 연결 상태 위젯 */}
          <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-white border border-[#e2e2e2] rounded-xl text-xs font-semibold text-gray-700 shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>카페24 정상 연결</span>
            </div>
            <div className="h-3 w-px bg-gray-200"></div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Shopify 정상 연결</span>
            </div>
          </div>

          <button
            onClick={handleFullSync}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#143617] text-white rounded-xl text-sm font-semibold hover:bg-[#0d240f] transition-all shadow-sm w-full md:w-auto disabled:opacity-70 cursor-pointer"
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "동기화 중..." : "전체 재고 동기화"}
          </button>
        </div>
      </div>

      {/* 2. 대시보드 요약 카드 영역 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {summary.map((item) => (
          <div
            key={item.label}
            onClick={() =>
              setSelectedStatus(
                item.label === "관리 상품 수" || item.label === "총 보유 재고"
                  ? "전체"
                  : item.label === "품절 상품"
                    ? "품절"
                    : "동기화 오류",
              )
            }
            className="cursor-pointer p-5 rounded-2xl border border-[#e2e2e2] bg-white text-gray-900 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md shadow-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {item.label}
              </span>
              <div className={`p-1.5 rounded-lg ${item.iconBg}`}>
                {item.icon}
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight">
                {item.count.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. 통합 검색 및 필터 컨트롤러 */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-transparent">
          <div className="inline-flex items-center p-1 bg-[#eceff1]/50 border border-gray-200/40 rounded-xl w-fit flex-wrap">
            {["전체", "정상", "부족", "품절", "동기화오류"].map((status) => {
              const isActive = selectedStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
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
                placeholder="상품명 또는 SKU 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#143617] focus:border-[#143617] transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. 재고 목록 테이블 영역 */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden mb-10">
        {filteredItems.length === 0 ? (
          <div className="p-20 text-center text-gray-400">
            <Package className="mx-auto mb-3 text-gray-300" size={36} />
            <p className="text-sm font-medium">
              일치하는 재고 데이터가 존재하지 않습니다.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm text-left border-collapse">
              <thead className="bg-[#fcfdfe] border-b border-gray-100/80 text-[#5e6e82] text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    상품명 / SKU
                  </th>
                  <th className="px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    실제 창고 재고
                  </th>
                  <th className="px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    판매 가능 재고
                  </th>
                  <th className="px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    카페24 재고
                  </th>
                  <th className="px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    Shopify 재고
                  </th>
                  <th className="px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    상태
                  </th>
                  <th className="px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    마지막 동기화
                  </th>
                  <th className="w-24 px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/70">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleOpenEditModal(item)}
                    className="hover:bg-[#f8f9fa]/70 transition-all cursor-pointer group"
                  >
                    <td className="px-8 py-6 text-left">
                      <div className="flex items-center gap-4.5 max-w-md">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100/80 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                          <Package size={20} className="text-gray-300" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-gray-900 group-hover:text-[#143617] transition-colors leading-snug text-[13px]">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-gray-400 mt-0.5 font-mono">
                            {item.sku}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6 text-left font-extrabold text-gray-900 text-sm">
                      {item.warehouse_stock.toLocaleString()}개
                      <span className="block text-[10px] font-normal text-gray-400">
                        (주문대기 {item.reserved_stock})
                      </span>
                    </td>

                    <td className="px-8 py-6 text-left font-bold text-[#143617]">
                      {item.available_stock.toLocaleString()}개
                    </td>

                    <td className="px-8 py-6 text-left font-semibold text-emerald-700">
                      {item.cafe24_stock.toLocaleString()}개
                    </td>

                    <td className="px-8 py-6 text-left font-semibold text-indigo-700">
                      {item.shopify_stock.toLocaleString()}개
                    </td>

                    <td className="px-8 py-6 text-left">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-lg border border-transparent ${getInventoryStatusStyle(
                          item.status,
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80"></span>
                        {item.status}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-left text-gray-400 font-medium text-xs">
                      {new Date(item.last_synced_at).toLocaleString("ko-KR", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td
                      className="px-8 py-6 text-left"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-100 hover:bg-[#143617] hover:text-white rounded-xl text-xs font-bold text-gray-700 transition-all cursor-pointer"
                      >
                        <Edit3 size={13} />
                        수정
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. 재고 변경 이력 로그 섹션 */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <History size={18} className="text-[#143617]" />
          <h3 className="text-base font-bold text-gray-900">재고 변경 이력</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {logs.map((log) => (
            <div
              key={log.id}
              className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">
                  {log.product_name}
                </span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-mono font-bold">
                  {log.change_detail}
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-400">
                <span>변경자: {log.modifier}</span>
                <span className="font-mono">{log.created_at}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. 재고 수정 모달 (창고 재고와 채널 재고를 각각 독립적이고 안전하게 관리) */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="text-[#143617]" size={18} /> 재고 상세 수정
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-5 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="text-xs font-semibold text-gray-400">
                대상 상품
              </span>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {editingItem.name}
              </p>
              <span className="text-[11px] text-gray-500 font-mono">
                SKU: {editingItem.sku}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-gray-200 bg-white">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    실제 보유 재고 (창고)
                  </label>
                  <input
                    type="number"
                    value={editWarehouseStock}
                    onChange={(e) =>
                      setEditWarehouseStock(Number(e.target.value))
                    }
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none"
                  />
                </div>
                <div className="p-3 rounded-xl border border-gray-200 bg-white">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    주문 처리중 (예약)
                  </label>
                  <input
                    type="number"
                    value={editReservedStock}
                    onChange={(e) =>
                      setEditReservedStock(Number(e.target.value))
                    }
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/50 flex justify-between items-center text-xs">
                <span className="font-bold text-blue-900">
                  판매 가능 재고 (계산됨)
                </span>
                <span className="font-extrabold text-blue-900 text-sm">
                  {Math.max(0, editWarehouseStock - editReservedStock)}개
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50">
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                    카페24 연동 재고
                  </label>
                  <input
                    type="number"
                    value={editCafe24Stock}
                    onChange={(e) => setEditCafe24Stock(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-bold text-emerald-900 focus:outline-none"
                  />
                </div>
                <div className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/50">
                  <label className="block text-[11px] font-bold text-indigo-800 mb-1">
                    Shopify 연동 재고
                  </label>
                  <input
                    type="number"
                    value={editShopifyStock}
                    onChange={(e) =>
                      setEditShopifyStock(Number(e.target.value))
                    }
                    className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs font-bold text-indigo-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleSaveInventory}
                className="px-4 py-2 bg-[#143617] hover:bg-[#0d240f] rounded-xl text-xs font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={14} /> 저장 및 API 동기화
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
