"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
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
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number; // 추가
  status: "임시저장" | "판매중";
  created_at: string;
  images: string[] | null;
  cafe24_product_no: number | null;
  shopify_product_id: number | null;
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case "판매중":
      return "bg-[#e8f8f0] text-[#0f8a5f]";
    case "임시저장":
      return "bg-[#f5f5f5] text-[#616161]";
    default:
      return "bg-[#f5f5f5] text-[#616161]";
  }
};

export default function ProductList() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("전체");

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("products")
          .select(
            "id, name, price, stock, status, created_at, images, cafe24_product_no, shopify_product_id",
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        setProducts(data ?? []);
      } catch (error) {
        setLoadError("상품 목록을 불러오는 중 오류가 발생했습니다.");
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

  const totalCount = products.length;
  const activeCount = products.filter((p) => p.status === "판매중").length;
  const draftCount = products.filter((p) => p.status === "임시저장").length;
  const multiChannelCount = products.filter(
    (p) => p.cafe24_product_no && p.shopify_product_id,
  ).length;

  const summary = [
    {
      label: "전체 상품",
      count: totalCount,
      icon: <Package size={18} className="text-[#143617]" />,
      iconBg: "bg-[#143617]/10",
    },
    {
      label: "판매중",
      count: activeCount,
      icon: <CheckCircle2 size={18} className="text-[#1b5e20]" />,
      iconBg: "bg-[#e8f5e9]",
    },
    {
      label: "임시저장",
      count: draftCount,
      icon: <FileEdit size={18} className="text-[#616161]" />,
      iconBg: "bg-[#f5f5f5]",
    },
    {
      label: "멀티채널",
      count: multiChannelCount,
      icon: <Package size={18} className="text-indigo-600" />,
      iconBg: "bg-indigo-50",
    },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesStatus =
      selectedStatus === "전체" || product.status === selectedStatus;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectProduct = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(
        selectedProductIds.filter((id) => id !== productId),
      );
    } else {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  // 삭제
  const handleSingleDelete = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("삭제 실패");

      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setToastMessage("선택한 상품이 정상적으로 삭제되었습니다.");
    } catch {
      setToastMessage("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const targets = products.filter((p) => selectedProductIds.includes(p.id));

      await Promise.all(
        targets.map((p) =>
          fetch(`/api/products/${p.id}`, { method: "DELETE" }).catch(
            () => null,
          ),
        ),
      );

      setProducts((prev) =>
        prev.filter((p) => !selectedProductIds.includes(p.id)),
      );
      setToastMessage("선택하신 상품이 목록에서 정상 삭제되었습니다.");
    } catch (error) {
      setToastMessage("일부 상품 삭제 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setSelectedProductIds([]);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full p-8 bg-[#f8f9fa] min-h-screen font-sans relative pb-28">
      {/* 1. 상단 타이틀 영역 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            상품 관리
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            실시간 상품 등록 정보 및 판매 현황을 한 눈에 확인하고 편집합니다.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#e2e2e2] rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm w-full md:w-auto">
            <Download size={16} className="text-gray-500" /> 템플릿 다운로드
          </button>

          <Link href="/products/new" className="w-full md:w-auto">
            <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#143617] text-white rounded-xl text-sm font-semibold hover:bg-[#0d240f] transition-colors shadow-sm w-full">
              <Plus size={16} /> 상품 등록
            </button>
          </Link>
        </div>
      </div>

      {/* 2. 대시보드 스타일 핵심 요약 카드 영역 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {summary.map((item) => (
          <div
            key={item.label}
            onClick={() =>
              setSelectedStatus(
                item.label === "전체 상품" || item.label === "멀티채널"
                  ? "전체"
                  : item.label,
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
                {isLoading ? "-" : item.count.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">건</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. 통합 검색 및 필터 컨트롤러 */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-transparent">
          <div className="inline-flex items-center p-1 bg-[#eceff1]/50 border border-gray-200/40 rounded-xl w-fit self-start">
            {["전체", "판매중", "임시저장"].map((status) => {
              const isActive = selectedStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
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
            <div className="relative min-w-[200px] flex-1 md:flex-initial">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={14}
              />
              <input
                type="text"
                placeholder="검색어 입력..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-[#5e6e82] shadow-sm transition-all">
              <Download size={13} className="text-gray-400" />
              다운로드
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
              상품 정보를 불러오고 있습니다...
            </p>
          </div>
        ) : loadError ? (
          <div className="p-20 text-center text-red-500">
            <AlertCircle className="mx-auto mb-3 text-red-400" size={32} />
            <p className="text-sm font-semibold">{loadError}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-20 text-center text-gray-400">
            <Package className="mx-auto mb-3 text-gray-300" size={36} />
            <p className="text-sm font-medium">
              일치하는 상품 데이터가 존재하지 않습니다.
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
                        filteredProducts.length > 0 &&
                        selectedProductIds.length === filteredProducts.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-[#143617] focus:ring-[#143617] w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    상품명
                  </th>
                  <th className="px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    채널
                  </th>
                  <th className="px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    가격
                  </th>
                  <th className="px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    상태
                  </th>
                  <th className="px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    재고
                  </th>
                  <th className="px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    등록일
                  </th>
                  <th className="w-24 px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/70">
                {filteredProducts.map((product) => {
                  const isChecked = selectedProductIds.includes(product.id);
                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-[#f8f9fa]/70 transition-all cursor-pointer group ${
                        isChecked ? "bg-[#143617]/5 hover:bg-[#143617]/10" : ""
                      }`}
                    >
                      {/* 체크박스 */}
                      <td
                        className="px-6 py-8.5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectProduct(product.id)}
                          className="rounded border-gray-300 text-[#143617] focus:ring-[#143617] w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* 상품명 + 이미지 */}
                      <td className="px-8 py-8.5 text-left">
                        <div className="flex items-center gap-4.5 max-w-md">
                          <div className="w-13 h-13 rounded-xl bg-gray-50 border border-gray-100/80 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package size={20} className="text-gray-300" />
                            )}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-gray-900 group-hover:text-[#143617] transition-colors leading-snug text-[14px]">
                              {product.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 채널 태그 */}
                      <td className="px-8 py-8.5 text-left">
                        <div className="flex gap-1.5">
                          {product.cafe24_product_no && (
                            <span
                              title="카페24"
                              className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 text-[11px] font-bold"
                            >
                              카
                            </span>
                          )}
                          {product.shopify_product_id && (
                            <span
                              title="Shopify"
                              className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 text-[11px] font-bold"
                            >
                              쇼
                            </span>
                          )}
                          {!product.cafe24_product_no &&
                            !product.shopify_product_id && (
                              <span className="text-gray-300 text-xs">-</span>
                            )}
                        </div>
                      </td>

                      {/* 가격 */}
                      <td className="px-8 py-8.5 text-left font-extrabold text-gray-900 text-sm md:text-base">
                        {Number(product.price).toLocaleString()}원
                      </td>

                      {/* 상태 배지 */}
                      <td className="px-8 py-8.5 text-left">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg border border-transparent ${getStatusStyle(product.status)}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80 animate-pulse"></span>
                          {product.status}
                        </span>
                      </td>

                      {/* 재고 */}
                      <td className="px-8 py-8.5 text-left">
                        <span
                          className={`font-semibold text-sm ${
                            product.stock === 0
                              ? "text-red-600"
                              : product.stock <= 5
                                ? "text-amber-600"
                                : "text-gray-700"
                          }`}
                        >
                          {product.stock.toLocaleString()}개
                        </span>
                      </td>

                      {/* 등록일 */}
                      <td className="px-8 py-8.5 text-left text-gray-400 font-semibold text-xs">
                        {new Date(product.created_at).toLocaleDateString(
                          "ko-KR",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          },
                        )}
                      </td>

                      {/* 액션 메뉴 */}
                      <td
                        className="px-8 py-8.5 text-left relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setActiveDropdownId(
                                activeDropdownId === product.id
                                  ? null
                                  : product.id,
                              )
                            }
                            className="p-2 hover:bg-gray-100 rounded-full transition-all text-[#5e6e82] hover:text-[#143617]"
                          >
                            <MoreHorizontal size={18} />
                          </button>

                          {activeDropdownId === product.id && (
                            <div className="absolute left-0 mt-1.5 w-24 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-20 animate-in fade-in duration-100">
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  router.push(`/products/${product.id}/edit`);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#143617] transition-all"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  handleSingleDelete(product);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-all"
                              >
                                삭제
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
          </div>
        )}
      </div>

      {/* 하단 플로팅 액션 바 */}
      {selectedProductIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-gray-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.12)] px-6 py-4.5 rounded-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#143617]"></span>
            <span className="text-sm font-extrabold text-gray-900">
              {selectedProductIds.length}개 상품 선택됨
            </span>
          </div>

          <div className="h-4 w-px bg-gray-200"></div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setToastMessage(
                  `${selectedProductIds.length}개 상품이 선택되었습니다.`,
                );
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all"
            >
              <Copy size={13} className="text-gray-400" />
              선택 복사
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all"
            >
              <Trash2 size={13} className="text-red-400" />
              일괄 삭제
            </button>
          </div>

          <button
            onClick={() => setSelectedProductIds([])}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* 토스트 */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
              <AlertCircle className="text-red-500" size={18} /> 상품 일괄 삭제
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              선택하신 {selectedProductIds.length}개의 상품을 정말로 목록에서
              삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-xs font-bold text-white transition-colors"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
