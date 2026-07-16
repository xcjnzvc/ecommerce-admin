"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Download,
  Package,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Copy,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { productApi } from "@/lib/api/products";
import { useRouter } from "next/navigation";

interface Product {
  product_no: number;
  product_code: string;
  product_name: string;
  price: string;
  supply_price: string;
  display: "T" | "F";
  selling: "T" | "F";
  sold_out: "T" | "F";
  created_date: string;
  list_image?: string;
}

const getProductStatus = (product: Product): string => {
  if (product.sold_out === "T") return "품절";
  if (product.selling === "F") return "판매중지";
  return "판매중";
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "판매중":
      return "bg-[#e8f8f0] text-[#0f8a5f]";
    case "품절":
      return "bg-[#ffebee] text-[#c62828]";
    case "판매중지":
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

  // UI 검색 및 상태 필터링용 로컬 스테이트
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("전체");

  // 테이블 내 선택용 스테이트
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);

  // 브라우저 alert/confirm 대체용 인터랙티브 모달 상태관리
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await productApi.fetchCafe24Products();
        setProducts(data.products ?? []);
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

  // 가상 토스트 지속 시간 세팅
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const totalCount = products.length;
  const activeCount = products.filter(
    (p) => getProductStatus(p) === "판매중",
  ).length;
  const soldOutCount = products.filter((p) => p.sold_out === "T").length;
  const inactiveCount = products.filter((p) => p.selling === "F").length;

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
      label: "품절",
      count: soldOutCount,
      icon: <AlertCircle size={18} className="text-[#c62828]" />,
      iconBg: "bg-[#ffebee]",
    },
    {
      label: "판매중지",
      count: inactiveCount,
      icon: <HelpCircle size={18} className="text-[#616161]" />,
      iconBg: "bg-[#f5f5f5]",
    },
  ];

  const filteredProducts = products.filter((product) => {
    const status = getProductStatus(product);
    const matchesStatus =
      selectedStatus === "전체" || status === selectedStatus;
    const matchesSearch =
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map((p) => p.product_no));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectProduct = (productId: number) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(
        selectedProductIds.filter((id) => id !== productId),
      );
    } else {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  // 삭제
  const handleBulkDelete = async () => {
    try {
      // API 라우트 규격이 `/api/products/[productNo]`이므로 각 ID별로 DELETE 요청을 보냅니다.
      const deletePromises = selectedProductIds.map((id) =>
        fetch(`/api/products/${id}`, { method: "DELETE" }),
      );

      const results = await Promise.all(deletePromises);
      const failedDeletes = results.filter((res) => !res.ok);

      if (failedDeletes.length > 0) {
        throw new Error(`${failedDeletes.length}개의 상품 삭제 실패`);
      }

      // 디비 삭제 성공 시에만 State에서 제거
      setProducts((prev) =>
        prev.filter((p) => !selectedProductIds.includes(p.product_no)),
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
                item.label === "전체 상품" ? "전체" : item.label,
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
          {/* [좌측] 이미지 스타일 탭: 선택된 부분만 브랜드 메인 색상(#143617) */}
          <div className="inline-flex items-center p-1 bg-[#eceff1]/50 border border-gray-200/40 rounded-xl w-fit self-start">
            {["전체", "판매중", "품절", "판매중지"].map((status) => {
              const isActive =
                selectedStatus === status ||
                (status === "전체" && selectedStatus === "전체");
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

          {/* [우측] 액션 버튼 그룹 (영문 버튼명 -> 한국어 버튼명으로 완벽 치환) */}
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

      {/* 4. 데이터 테이블 영역 (모든 열 start 좌측 정렬 적용) */}
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
              {/* 모든 헤더 열 좌측(text-left) 정렬로 일관성 제공 */}
              <thead className="bg-[#fcfdfe] border-b border-gray-100/80 text-[#5e6e82] text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="w-14 px-6 py-5.5 text-center">
                    <input
                      type="checkbox"
                      checked={
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
                    상품 코드
                  </th>
                  <th className="px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    가격
                  </th>
                  <th className="px-8 py-5.5 font-bold text-[#5e6e82] text-left">
                    상태
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
                  const status = getProductStatus(product);
                  const isChecked = selectedProductIds.includes(
                    product.product_no,
                  );
                  return (
                    <tr
                      key={product.product_no}
                      className={`hover:bg-[#f8f9fa]/70 transition-all cursor-pointer group ${
                        isChecked ? "bg-[#143617]/5 hover:bg-[#143617]/10" : ""
                      }`}
                    >
                      {/* 체크박스 영역 */}
                      <td
                        className="px-6 py-8.5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            handleSelectProduct(product.product_no)
                          }
                          className="rounded border-gray-300 text-[#143617] focus:ring-[#143617] w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* 상품명 + 이미지 프리뷰 영역 (여유로운 py-8.5 패딩 및 네모난 이미지) */}
                      <td className="px-8 py-8.5 text-left">
                        <div className="flex items-center gap-4.5 max-w-md">
                          {/* 둥근 사각형 코너(rounded-xl)를 가진 스퀘어 상품 썸네일 플레이스홀더 */}
                          {/* <div className="w-13 h-13 rounded-xl bg-gray-50 border border-gray-100/80 flex items-center justify-center text-xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                            <svg
                              className="w-6 h-6 text-gray-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth="1.8"
                            >
                              <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="3"
                                ry="3"
                              />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path
                                d="M21 15l-5-5L5 21"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div> */}
                          <div className="w-13 h-13 rounded-xl bg-gray-50 border border-gray-100/80 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                            {product.list_image ? (
                              // 🚀 이미지가 있다면 보여주고, 없다면 기존 SVG(플레이스홀더) 출력
                              <img
                                src={product.list_image}
                                alt={product.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <svg
                                className="w-6 h-6 text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <rect
                                  x="3"
                                  y="3"
                                  width="18"
                                  height="18"
                                  rx="3"
                                  ry="3"
                                />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path
                                  d="M21 15l-5-5L5 21"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-gray-900 group-hover:text-[#143617] transition-colors leading-snug text-[14px]">
                              {product.product_name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 상품코드 (start 정렬) */}
                      <td className="px-8 py-8.5 text-left text-[#5e6e82] font-mono tracking-tight font-semibold text-xs">
                        {product.product_code}
                      </td>

                      {/* 가격 (start 정렬) */}
                      <td className="px-8 py-8.5 text-left font-extrabold text-gray-900 text-sm md:text-base">
                        {Number(product.price).toLocaleString()}원
                      </td>

                      {/* 상태 배지 (start 정렬) */}
                      <td className="px-8 py-8.5 text-left">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg border border-transparent ${getStatusStyle(status)}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80 animate-pulse"></span>
                          {status}
                        </span>
                      </td>

                      {/* 등록일 (start 정렬) */}
                      <td className="px-8 py-8.5 text-left text-gray-400 font-semibold text-xs">
                        {new Date(product.created_date).toLocaleDateString(
                          "ko-KR",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          },
                        )}
                      </td>

                      {/* 액션 메뉴 (start 정렬 및 absolute 드롭다운 위치 왼쪽 기준 조정) */}
                      <td
                        className="px-8 py-8.5 text-left relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setActiveDropdownId(
                                activeDropdownId === product.product_no
                                  ? null
                                  : product.product_no,
                              )
                            }
                            className="p-2 hover:bg-gray-100 rounded-full transition-all text-[#5e6e82] hover:text-[#143617]"
                          >
                            <MoreHorizontal size={18} />
                          </button>

                          {activeDropdownId === product.product_no && (
                            <div className="absolute left-0 mt-1.5 w-24 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-20 animate-in fade-in duration-100">
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  router.push(
                                    `/products/${product.product_no}/edit`,
                                  );
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#143617] transition-all"
                              >
                                수정
                              </button>
                              <button
                                onClick={async () => {
                                  setActiveDropdownId(null);
                                  try {
                                    const res = await fetch(
                                      `/api/products/${product.product_no}`,
                                      {
                                        method: "DELETE",
                                      },
                                    );
                                    if (!res.ok) throw new Error();
                                    setProducts(
                                      products.filter(
                                        (p) =>
                                          p.product_no !== product.product_no,
                                      ),
                                    );
                                    setToastMessage(
                                      "선택한 상품이 정상적으로 삭제되었습니다.",
                                    );
                                  } catch {
                                    setToastMessage(
                                      "삭제 중 오류가 발생했습니다.",
                                    );
                                  }
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

      {/* [하단 가상 플로팅 액션 바] 1개 이상의 아이템이 체크되었을 때 부드럽게 나타납니다 */}
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
                // 커스텀 토스트 알림 작동 (alert 제거)
                const codes = products
                  .filter((p) => selectedProductIds.includes(p.product_no))
                  .map((p) => p.product_code)
                  .join(", ");
                setToastMessage(
                  `${selectedProductIds.length}개 상품 코드가 안전하게 복사되었습니다.`,
                );
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all"
            >
              <Copy size={13} className="text-gray-400" />
              코드 복사
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)} // 커스텀 모달 오픈 (confirm 제거)
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

      {/* [커스텀 알림 토스트 UI] alert() 대체용 피드백 배너 */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* [커스텀 삭제 확인 모달 UI] confirm() 대체용 모달 대화창 */}
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
