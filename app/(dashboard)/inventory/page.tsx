"use client";

import { useCallback, useEffect, useState } from "react";
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
import Pagination, { paginateItems } from "@/app/components/Pagination";
import SummaryCards from "@/app/components/SummaryCards";
import ChannelBadges from "@/app/components/ChannelBadges";

const PAGE_SIZE = 10;
const LOG_PAGE_SIZE = 10;

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  stock_synced_at: string | null;
  cafe24_product_no: number | null;
  shopify_inventory_item_id: number | null;
  status: "정상" | "부족" | "품절" | "동기화오류";
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
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("전체");
  const [page, setPage] = useState(1);
  const [logPage, setLogPage] = useState(1);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    const res = await fetch("/api/inventory");
    if (!res.ok) throw new Error("재고 목록 조회 실패");
    const data = await res.json();
    setItems(data.items ?? []);
  }, []);

  const fetchLogs = useCallback(async () => {
    const res = await fetch("/api/inventory/logs");
    if (!res.ok) throw new Error("재고 변경 이력 조회 실패");
    const data = await res.json();
    setLogs(data.logs ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchInventory(), fetchLogs()]);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setToastMessage("재고 데이터를 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchInventory, fetchLogs]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const totalProducts = items.length;
  const totalStock = items.reduce((acc, cur) => acc + cur.stock, 0);
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
      count: totalStock,
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

    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const itemsTotalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, itemsTotalPages);
  const pagedItems = paginateItems(filteredItems, currentPage, PAGE_SIZE);

  const logsTotalPages = Math.max(1, Math.ceil(logs.length / LOG_PAGE_SIZE));
  const currentLogPage = Math.min(logPage, logsTotalPages);
  const pagedLogs = paginateItems(logs, currentLogPage, LOG_PAGE_SIZE);

  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setEditStock(item.stock);
    setIsEditModalOpen(true);
  };

  const handleSaveInventory = async () => {
    if (!editingItem) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/products/${editingItem.id}/stock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: editStock }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "재고 저장 실패");
      }

      await Promise.all([fetchInventory(), fetchLogs()]);
      setToastMessage(`'${editingItem.name}' 재고 설정이 저장되었습니다.`);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      setToastMessage(
        err instanceof Error ? err.message : "재고 저장에 실패했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleFullSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/cron/sync-inventory");
      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || "전체 재고 동기화 실패");
      }

      await fetchInventory();
      setToastMessage(
        `동기화 완료 — 상품 ${data.syncedProductCount ?? 0}개, 오류 ${data.errorCount ?? 0}건`,
      );
    } catch (err) {
      console.error(err);
      setToastMessage(
        err instanceof Error ? err.message : "전체 재고 동기화에 실패했습니다.",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full p-8 bg-[#f8f9fa] min-h-screen font-sans relative pb-28">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            재고 관리
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            상품 재고와 카페24/Shopify 채널 동기화 상태를 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
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

      <SummaryCards
        items={summary}
        onItemClick={(item) => {
          setSelectedStatus(
            item.label === "관리 상품 수" || item.label === "총 보유 재고"
              ? "전체"
              : item.label === "품절 상품"
                ? "품절"
                : "동기화오류",
          );
          setPage(1);
        }}
      />

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-transparent">
          <div className="inline-flex items-center p-1 bg-[#eceff1]/50 border border-gray-200/40 rounded-xl w-fit flex-wrap">
            {["전체", "정상", "부족", "품절", "동기화오류"].map((status) => {
              const isActive = selectedStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => {
                    setSelectedStatus(status);
                    setPage(1);
                  }}
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
                placeholder="상품명 검색..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#143617] focus:border-[#143617] transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden mb-10">
        {isLoading ? (
          <div className="p-20 text-center text-gray-400">
            <RefreshCw
              className="mx-auto mb-3 text-gray-300 animate-spin"
              size={36}
            />
            <p className="text-sm font-medium">재고 데이터를 불러오는 중...</p>
          </div>
        ) : filteredItems.length === 0 ? (
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
                    상품명
                  </th>
                  <th className="px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    채널
                  </th>
                  <th className="px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    재고수량
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
                {pagedItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleOpenEditModal(item)}
                    className="hover:bg-[#f8f9fa]/70 transition-all cursor-pointer group"
                  >
                    <td className="px-8 py-6 text-left">
                      <div className="flex items-center gap-4.5 max-w-md">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100/80 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                          {item.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={20} className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-gray-900 group-hover:text-[#143617] transition-colors leading-snug text-sm">
                            {item.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6 text-left">
                      <ChannelBadges
                        cafe24={!!item.cafe24_product_no}
                        shopify={!!item.shopify_inventory_item_id}
                      />
                    </td>

                    <td className="px-8 py-6 text-left font-bold text-gray-900 text-sm">
                      {item.stock.toLocaleString()}개
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
                      {item.stock_synced_at
                        ? new Date(item.stock_synced_at).toLocaleString(
                            "ko-KR",
                            {
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "-"}
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
            <Pagination
              page={currentPage}
              totalItems={filteredItems.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <History size={18} className="text-[#143617]" />
          <h3 className="text-base font-bold text-gray-900">재고 변경 이력</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {logs.length === 0 ? (
            <p className="py-6 text-xs text-gray-400 text-center">
              아직 재고 변경 이력이 없습니다.
            </p>
          ) : (
            pagedLogs.map((log) => (
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
                  <span className="font-mono">
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString("ko-KR", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        <Pagination
          page={currentLogPage}
          totalItems={logs.length}
          pageSize={LOG_PAGE_SIZE}
          onPageChange={setLogPage}
          className="!border-t-0 mt-2 px-0"
        />
      </div>

      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="text-[#143617]" size={18} /> 재고 수정
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
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-3 rounded-xl border border-gray-200 bg-white">
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  재고수량
                </label>
                <input
                  type="number"
                  min={0}
                  value={editStock}
                  onChange={(e) => setEditStock(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleSaveInventory}
                disabled={isSaving}
                className="px-4 py-2 bg-[#143617] hover:bg-[#0d240f] rounded-xl text-xs font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check size={14} />{" "}
                {isSaving ? "저장 중..." : "저장 및 API 동기화"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
