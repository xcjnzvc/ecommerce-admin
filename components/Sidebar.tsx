"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Star,
  Megaphone,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const menus = [
  { label: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { label: "상품관리", href: "/products", icon: Package },
  { label: "주문관리", href: "/orders", icon: ShoppingCart },
  { label: "재고관리", href: "/inventory", icon: Warehouse },
  { label: "리뷰관리", href: "/reviews", icon: Star },
  { label: "마케팅", href: "/marketing", icon: Megaphone },
  { label: "설정", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="w-[220px] min-h-screen bg-white shadow-[4px_0_10px_rgba(0,0,0,0.05)] z-10 flex flex-col">
      {/* 로고 영역 */}
      <div className="px-[24px] py-[32px]">
        <h1 className="text-[#143617] text-[20px] font-black tracking-tight">
          ADMIN
        </h1>
      </div>

      {/* 메뉴 영역 */}
      <nav className="flex flex-col gap-[4px] px-[12px] flex-1">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const isActive = pathname === menu.href;
          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-[12px] px-[12px] py-[10px] rounded-[8px] text-[14px] transition-all duration-200 ${
                isActive
                  ? "bg-[#143617] text-white font-semibold shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-[#143617]"
              }`}
            >
              <Icon size={18} />
              {menu.label}
            </Link>
          );
        })}
      </nav>

      {/* 로그아웃 버튼 영역 */}
      <div className="px-[12px] py-[24px]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-[12px] w-full px-[12px] py-[10px] rounded-[8px] text-[14px] text-gray-500 hover:bg-gray-100 hover:text-[#143617] transition-all duration-200"
        >
          <LogOut size={18} />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
