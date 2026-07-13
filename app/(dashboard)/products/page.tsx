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
import { productApi } from "@/lib/api/products"; // 새로 만든 API 도구 import

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
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // 서버 API를 통해 데이터를 가져옴
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
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e2e2] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400">
            불러오는 중...
          </div>
        ) : loadError ? (
          <div className="p-10 text-center text-sm text-red-500">
            {loadError}
          </div>
        ) : (
          <table className="w-full text-sm">
            {/* 테이블 헤더 및 바디 생략 (기존과 동일) */}
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50/50 cursor-pointer text-gray-700"
                >
                  {/* ... 기존 테이블 행 코드들 ... */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
