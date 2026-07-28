"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Package,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Edit3,
  History,
  X,
  Check,
  AlertCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Pagination, { paginateItems } from "@/app/components/Pagination";
import SummaryCards from "@/app/components/SummaryCards";
import ChannelBadges from "@/app/components/ChannelBadges";
import ListFilterBar from "@/app/components/ListFilterBar";
import { createClient } from "@/lib/supabase/client";
import {
  useInventory,
  useInventoryLogs,
  type InventoryItem,
} from "@/lib/inventory/queries";
import { queryKeys } from "@/lib/react-query/query-keys";

const PAGE_SIZE = 10;
const LOG_PAGE_SIZE = 10;

const INVENTORY_STATUS_TABS = [
  { label: "전체", value: "전체" },
  { label: "정상", value: "정상" },
  { label: "부족", value: "부족" },
  { label: "품절", value: "품절" },
  { label: "동기화오류", value: "동기화오류" },
] as const;

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
  const queryClient = useQueryClient();
  const {
    data: items = [],
    isLoading: isInventoryLoading,
    isError: isInventoryError,
  } = useInventory();
  const {
    data: logs = [],
    isLoading: isLogsLoading,
    isError: isLogsError,
  } = useInventoryLogs();
  const isLoading = isInventoryLoading || isLogsLoading;
  const fetchErrorMessage =
    isInventoryError || isLogsError
      ? "재고 데이터를 불러오지 못했습니다."
      : null;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("전체");
  const [page, setPage] = useState(1);
  const [logPage, setLogPage] = useState(1);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editStockInput, setEditStockInput] = useState("0");
  const [isSaving, setIsSaving] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const displayToast = toastMessage ?? fetchErrorMessage;

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

  const syncEditStockValue = (nextStock: number) => {
    const sanitizedStock = Math.max(0, Math.floor(nextStock));
    setEditStock(sanitizedStock);
    setEditStockInput(String(sanitizedStock));
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    syncEditStockValue(item.stock);
    setIsEditModalOpen(true);
  };

  const handleEditStockInputChange = (value: string) => {
    if (value === "") {
      setEditStockInput("");
      return;
    }

    if (!/^\d+$/.test(value)) {
      return;
    }

    const normalizedValue = value.replace(/^0+(?=\d)/, "");
    setEditStock(Number(normalizedValue));
    setEditStockInput(normalizedValue);
  };

  const handleSaveInventory = async () => {
    if (!editingItem) return;

    const stockToSave = editStockInput.trim() === "" ? 0 : editStock;

    setIsSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // #region agent log
      fetch('http://127.0.0.1:7576/ingest/47ab9bd0-3423-4f30-bd64-318d03377f9f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b1b16a'},body:JSON.stringify({sessionId:'b1b16a',runId:'inventory-save',hypothesisId:'A',location:'inventory/page.tsx:196',message:'before stock save request',data:{productId:editingItem.id,stockToSave,editStock,editStockInput,hasSessionUser:Boolean(session?.user.email)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      const res = await fetch(`/api/products/${editingItem.id}/stock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock: stockToSave,
          modifier: session?.user.email ?? null,
        }),
      });

      // #region agent log
      fetch('http://127.0.0.1:7576/ingest/47ab9bd0-3423-4f30-bd64-318d03377f9f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b1b16a'},body:JSON.stringify({sessionId:'b1b16a',runId:'inventory-save',hypothesisId:'D',location:'inventory/page.tsx:208',message:'after stock save response',data:{productId:editingItem.id,responseOk:res.ok,status:res.status},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "재고 저장 실패");
      }

      const result = (await res.json()) as {
        success?: boolean;
        warnings?: string[];
      };

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventoryLogs }),
      ]);

      if (result.warnings?.length) {
        setToastMessage(
          `'${editingItem.name}' 재고는 저장됐지만 일부 채널 동기화에 실패했습니다.`,
        );
      } else {
        setToastMessage(`'${editingItem.name}' 재고 설정이 저장되었습니다.`);
      }
      syncEditStockValue(stockToSave);
      setIsEditModalOpen(false);
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7576/ingest/47ab9bd0-3423-4f30-bd64-318d03377f9f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b1b16a'},body:JSON.stringify({sessionId:'b1b16a',runId:'inventory-save',hypothesisId:'D',location:'inventory/page.tsx:224',message:'stock save threw on client',data:{productId:editingItem?.id ?? null,error:err instanceof Error ? err.message : String(err)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
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

      await queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
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

      <ListFilterBar
        statusTabs={[...INVENTORY_STATUS_TABS]}
        selectedStatus={selectedStatus}
        onStatusChange={(value) => {
          setSelectedStatus(value);
          setPage(1);
        }}
        searchValue={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setPage(1);
        }}
        searchPlaceholder="상품명 검색..."
        searchMinWidth="min-w-[240px]"
        showFilter
        showSort
        showDownload
      />

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
                      className="px-2 py-6 text-left"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-gray-100 hover:bg-[#143617] hover:text-white rounded-xl text-xs font-bold text-gray-700 transition-all cursor-pointer"
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
                <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editStockInput}
                    onChange={(e) => handleEditStockInputChange(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    onBlur={() => {
                      if (editStockInput.trim() === "") {
                        syncEditStockValue(0);
                      }
                    }}
                    className="w-full bg-transparent px-3 py-1.5 text-xs font-bold text-gray-900 focus:outline-none"
                  />
                  <div className="flex w-10 shrink-0 flex-col border-l border-gray-200 bg-white">
                    <button
                      type="button"
                      onClick={() => syncEditStockValue(editStock + 1)}
                      className="flex flex-1 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#143617]"
                      aria-label="재고 1 증가"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => syncEditStockValue(editStock - 1)}
                      className="flex flex-1 items-center justify-center border-t border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#143617]"
                      aria-label="재고 1 감소"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
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

      {displayToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-xs font-bold">{displayToast}</span>
        </div>
      )}
    </div>
  );
}
