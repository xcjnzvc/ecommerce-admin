// "use client";

// import React, { useState } from "react";
// import {
//   Search,
//   Plus,
//   Package,
//   MoreHorizontal,
//   Edit,
//   Trash2,
//   Settings,
//   ChevronLeft,
//   ChevronRight,
//   Download,
//   Filter,
// } from "lucide-react";
// import Link from "next/link";

// // --- 타입 정의 ---
// type ChannelStatus = { [key: string]: boolean };

// interface Product {
//   id: number;
//   name: string;
//   category: string;
//   price: string;
//   stock: number;
//   channels: ChannelStatus;
//   status: string;
// }

// const productsData: Product[] = [
//   {
//     id: 1,
//     name: "오가닉 코튼 오버셔츠",
//     category: "상의",
//     price: "89,000",
//     stock: 120,
//     channels: { 자사: true, 스토어: true, 쿠팡: false, 카페: false },
//     status: "판매중",
//   },
//   {
//     id: 2,
//     name: "리사이클 데님 자켓",
//     category: "아우터",
//     price: "158,000",
//     stock: 8,
//     channels: { 자사: true, 스토어: false, 쿠팡: true, 카페: false },
//     status: "품절임박",
//   },
//   {
//     id: 3,
//     name: "린넨 와이드 팬츠",
//     category: "하의",
//     price: "72,000",
//     stock: 0,
//     channels: { 자사: true, 스토어: true, 쿠팡: true, 카페: true },
//     status: "품절",
//   },
//   {
//     id: 4,
//     name: "니트 카디건 세트",
//     category: "상의",
//     price: "124,000",
//     stock: 45,
//     channels: { 자사: true, 스토어: false, 쿠팡: false, 카페: false },
//     status: "판매중",
//   },
//   {
//     id: 5,
//     name: "울 블레이저",
//     category: "아우터",
//     price: "289,000",
//     stock: 3,
//     channels: { 자사: true, 스토어: true, 쿠팡: true, 카페: false },
//     status: "품절임박",
//   },
// ];

// export default function ProductList() {
//   const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

//   // 채널별 설정 (로고 대신 명확한 컬러 뱃지 사용)
//   const channelConfig: Record<
//     string,
//     { label: string; active: string; inactive: string }
//   > = {
//     자사: {
//       label: "자",
//       active: "bg-blue-600 text-white",
//       inactive: "bg-gray-100 text-gray-300",
//     },
//     스토어: {
//       label: "스",
//       active: "bg-emerald-500 text-white",
//       inactive: "bg-gray-100 text-gray-300",
//     },
//     쿠팡: {
//       label: "쿠",
//       active: "bg-sky-500 text-white",
//       inactive: "bg-gray-100 text-gray-300",
//     },
//     카페: {
//       label: "24",
//       active: "bg-rose-500 text-white",
//       inactive: "bg-gray-100 text-gray-300",
//     },
//   };

//   const getStatusStyle = (status: string) => {
//     switch (status) {
//       case "판매중":
//         return "bg-emerald-50 text-emerald-700 border-emerald-200";
//       case "품절임박":
//         return "bg-amber-50 text-amber-700 border-amber-200";
//       case "품절":
//         return "bg-red-50 text-red-600 border-red-200";
//       default:
//         return "bg-gray-100 text-gray-700 border-gray-200";
//     }
//   };

//   return (
//     <div className="max-w-[1600px] mx-auto w-full p-6 bg-gray-50 min-h-screen">
//       {/* 1. 요약 카드 */}
//       <div className="grid grid-cols-4 gap-4 mb-6">
//         {[
//           { label: "전체 상품", count: "1,284" },
//           { label: "판매중", count: "892" },
//           { label: "품절임박", count: "45" },
//           { label: "품절", count: "12" },
//         ].map((item) => (
//           <div
//             key={item.label}
//             className="bg-white p-4 rounded-xl border border-[#e2e2e2] shadow-sm"
//           >
//             <p className="text-xs text-gray-500 mb-1">{item.label}</p>
//             <p className="text-2xl font-bold text-gray-900">{item.count}</p>
//           </div>
//         ))}
//       </div>

//       {/* 2. 헤더 및 액션 버튼 */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-xl font-bold text-gray-900">상품 관리</h1>
//         <div className="flex gap-2">
//           <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
//             <Download size={16} /> 엑셀 내보내기
//           </button>
//           <Link href="/products/new">
//             <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
//               <Plus size={16} /> 상품 등록
//             </button>
//           </Link>
//         </div>
//       </div>

//       {/* 3. 검색 및 필터 */}
//       <div className="bg-white p-4 rounded-xl border border-[#e2e2e2] mb-4 flex items-center justify-between">
//         <div className="flex items-center gap-3 flex-1">
//           <div className="relative w-80">
//             <Search
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//               size={16}
//             />
//             <input
//               type="text"
//               placeholder="상품명, SKU 검색"
//               className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
//             />
//           </div>
//           <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
//             <Filter size={14} /> 상세 필터
//           </button>
//         </div>
//         <div className="text-xs text-gray-500">
//           선택된 상품 <span className="font-bold text-gray-900">0개</span>
//         </div>
//       </div>

//       {/* 4. 테이블 영역 */}
//       <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
//             <tr>
//               <th className="px-4 py-3 w-10">
//                 <input type="checkbox" className="rounded" />
//               </th>
//               <th className="px-4 py-3 text-left">상품 정보</th>
//               <th className="px-4 py-3 text-left">판매가</th>
//               <th className="px-4 py-3 text-left">재고</th>
//               <th className="px-4 py-3 text-left">채널 현황</th>
//               <th className="px-4 py-3 text-left">상태</th>
//               <th className="px-4 py-3 text-right">관리</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100">
//             {productsData.map((product) => (
//               <tr
//                 key={product.id}
//                 className="hover:bg-gray-50/50 cursor-pointer text-gray-700"
//               >
//                 <td className="px-4 py-3">
//                   <input type="checkbox" className="rounded" />
//                 </td>
//                 <td className="px-4 py-3">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
//                       <Package size={18} />
//                     </div>
//                     <div>
//                       <p className="font-medium text-gray-900">
//                         {product.name}
//                       </p>
//                       <p className="text-[11px] text-gray-400">
//                         SKU: {1000 + product.id}
//                       </p>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-4 py-3 font-medium">{product.price}원</td>
//                 <td className="px-4 py-3">{product.stock}</td>

//                 {/* 개선된 채널 현황: 브랜드 컬러 뱃지 */}
//                 <td className="px-4 py-3">
//                   <div className="flex gap-1.5">
//                     {Object.entries(product.channels).map(([channel, reg]) => (
//                       <div
//                         key={channel}
//                         className={`w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-bold ${reg ? channelConfig[channel].active : channelConfig[channel].inactive}`}
//                       >
//                         {channelConfig[channel].label}
//                       </div>
//                     ))}
//                   </div>
//                 </td>

//                 {/* 개선된 상태 칩: 크기 확대 */}
//                 <td className="px-4 py-3">
//                   <span
//                     className={`px-3 py-1 text-[12px] font-bold rounded-full border ${getStatusStyle(product.status)}`}
//                   >
//                     {product.status}
//                   </span>
//                 </td>

//                 <td
//                   className="px-4 py-3 text-right"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   <button
//                     onClick={() =>
//                       setActiveMenuId(
//                         activeMenuId === product.id ? null : product.id,
//                       )
//                     }
//                     className="text-gray-400 hover:text-gray-900"
//                   >
//                     <MoreHorizontal size={16} />
//                   </button>
//                   {activeMenuId === product.id && (
//                     <div className="absolute right-10 mt-2 bg-white border border-gray-100 shadow-xl rounded-lg z-10 w-32 py-1">
//                       <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 w-full">
//                         <Edit size={12} /> 수정
//                       </button>
//                       <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 w-full">
//                         <Settings size={12} /> 설정
//                       </button>
//                       <hr className="my-1" />
//                       <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 w-full">
//                         <Trash2 size={12} /> 삭제
//                       </button>
//                     </div>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* 5. 페이지네이션 */}
//       <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
//         <div>
//           총 <span className="font-bold text-gray-900">5개</span>의 상품
//         </div>
//         <div className="flex items-center gap-1">
//           <button className="px-2 py-1 border rounded hover:bg-white" disabled>
//             <ChevronLeft size={14} />
//           </button>
//           <button className="px-2 py-1 bg-gray-900 text-white rounded">
//             1
//           </button>
//           <button className="px-2 py-1 border rounded hover:bg-white">
//             <ChevronRight size={14} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Package,
  MoreHorizontal,
  Edit,
  Trash2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/supabase";

// ────────────────────────────────────────────────
// 실제 저장 스키마에 맞춘 타입
// (create_products_table.sql의 컬럼과 1:1로 맞춥니다)
// ────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  channels: {
    coupang?: boolean;
    cafe24?: boolean;
  };
  status: string;
  created_at: string;
}

const channelConfig: Record<
  string,
  { label: string; active: string; inactive: string }
> = {
  coupang: {
    label: "쿠",
    active: "bg-sky-500 text-white",
    inactive: "bg-gray-100 text-gray-300",
  },
  cafe24: {
    label: "24",
    active: "bg-rose-500 text-white",
    inactive: "bg-gray-100 text-gray-300",
  },
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "판매중":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "품절임박":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "품절":
      return "bg-red-50 text-red-600 border-red-200";
    case "임시저장":
      return "bg-gray-100 text-gray-500 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export default function ProductList() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, category, price, stock, channels, status, created_at",
        )
        .order("created_at", { ascending: false });

      if (error) {
        setLoadError(error.message);
      } else {
        setProducts(data ?? []);
      }
      setIsLoading(false);
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 요약 카드는 실제 불러온 데이터 기준으로 집계합니다 (더 이상 하드코딩하지 않음)
  const summary = [
    { label: "전체 상품", count: products.length },
    {
      label: "판매중",
      count: products.filter((p) => p.status === "판매중").length,
    },
    {
      label: "품절임박",
      count: products.filter((p) => p.status === "품절임박").length,
    },
    {
      label: "품절",
      count: products.filter((p) => p.status === "품절").length,
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto w-full p-6 bg-gray-50 min-h-screen">
      {/* 1. 요약 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {summary.map((item) => (
          <div
            key={item.label}
            className="bg-white p-4 rounded-xl border border-[#e2e2e2] shadow-sm"
          >
            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
            <p className="text-2xl font-bold text-gray-900">{item.count}</p>
          </div>
        ))}
      </div>

      {/* 2. 헤더 및 액션 버튼 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">상품 관리</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Download size={16} /> 엑셀 내보내기
          </button>
          <Link href="/product/new">
            <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
              <Plus size={16} /> 상품 등록
            </button>
          </Link>
        </div>
      </div>

      {/* 3. 검색 및 필터 */}
      <div className="bg-white p-4 rounded-xl border border-[#e2e2e2] mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="상품명, SKU 검색"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Filter size={14} /> 상세 필터
          </button>
        </div>
        <div className="text-xs text-gray-500">
          선택된 상품 <span className="font-bold text-gray-900">0개</span>
        </div>
      </div>

      {/* 4. 테이블 영역 */}
      <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400">
            불러오는 중...
          </div>
        ) : loadError ? (
          <div className="p-10 text-center text-sm text-red-500">
            상품 목록을 불러오지 못했습니다: {loadError}
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            등록된 상품이 없습니다. 우측 상단의 &quot;상품 등록&quot; 버튼으로
            첫 상품을 등록해보세요.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-4 py-3 text-left">상품 정보</th>
                <th className="px-4 py-3 text-left">판매가</th>
                <th className="px-4 py-3 text-left">재고</th>
                <th className="px-4 py-3 text-left">채널 현황</th>
                <th className="px-4 py-3 text-left">상태</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50/50 cursor-pointer text-gray-700"
                >
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        <Package size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {product.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {product.price?.toLocaleString("ko-KR")}원
                  </td>
                  <td className="px-4 py-3">{product.stock}</td>

                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {Object.entries(channelConfig).map(
                        ([channel, config]) => {
                          const reg = Boolean(
                            product.channels?.[channel as "coupang" | "cafe24"],
                          );
                          return (
                            <div
                              key={channel}
                              className={`w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-bold ${
                                reg ? config.active : config.inactive
                              }`}
                            >
                              {config.label}
                            </div>
                          );
                        },
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 text-[12px] font-bold rounded-full border ${getStatusStyle(product.status)}`}
                    >
                      {product.status}
                    </span>
                  </td>

                  <td
                    className="px-4 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        setActiveMenuId(
                          activeMenuId === product.id ? null : product.id,
                        )
                      }
                      className="text-gray-400 hover:text-gray-900"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {activeMenuId === product.id && (
                      <div className="absolute right-10 mt-2 bg-white border border-gray-100 shadow-xl rounded-lg z-10 w-32 py-1">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 w-full">
                          <Edit size={12} /> 수정
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 w-full">
                          <Settings size={12} /> 설정
                        </button>
                        <hr className="my-1" />
                        <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 w-full">
                          <Trash2 size={12} /> 삭제
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 5. 페이지네이션 */}
      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <div>
          총{" "}
          <span className="font-bold text-gray-900">{products.length}개</span>의
          상품
        </div>
        <div className="flex items-center gap-1">
          <button className="px-2 py-1 border rounded hover:bg-white" disabled>
            <ChevronLeft size={14} />
          </button>
          <button className="px-2 py-1 bg-gray-900 text-white rounded">
            1
          </button>
          <button className="px-2 py-1 border rounded hover:bg-white">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
