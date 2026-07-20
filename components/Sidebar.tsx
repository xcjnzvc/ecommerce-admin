"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Star,
  Megaphone,
  Settings,
  LogOut,
  User as UserIcon,
  ChevronUp,
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

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // 사용자 정보 가져오기 및 외부 클릭 감지 설정
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email ?? null);
      }
    };
    fetchUser();
  }, []);

  // 로그아웃 로직
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="w-[220px] h-screen sticky top-0 bg-white shadow-[4px_0_10px_rgba(0,0,0,0.05)] z-10 flex flex-col">
      {/* 로고 영역 */}
      <div className="px-[24px] py-[32px] shrink-0">
        <h1 className="text-[#143617] text-[20px] font-black tracking-tight">
          ADMIN
        </h1>
      </div>

      {/* 메뉴 영역 */}
      <nav className="flex flex-col gap-[4px] px-[12px] flex-1 overflow-y-auto">
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

      {/* 사용자 프로필 영역 */}
      <div className="px-[12px] py-[24px] relative shrink-0" ref={popupRef}>
        {/* 팝업 */}
        {isPopupOpen && (
          <div className="absolute bottom-[80px] left-[12px] right-[12px] bg-white border border-gray-100 rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-[8px] animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-[12px] w-full px-[12px] py-[10px] rounded-[8px] text-[14px] text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut size={16} />
              로그아웃
            </button>
          </div>
        )}

        {/* 프로필 버튼 */}
        <button
          onClick={() => setIsPopupOpen(!isPopupOpen)}
          className="flex items-center justify-between w-full px-[12px] py-[10px] rounded-[8px] hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <UserIcon size={16} className="text-[#143617]" />
            </div>
            <p className="text-[13px] font-bold text-gray-700 truncate">
              {userEmail || "사용자"}
            </p>
          </div>
          <ChevronUp
            size={14}
            className={`text-gray-400 transition-transform ${isPopupOpen ? "" : "rotate-180"}`}
          />
        </button>
      </div>
    </aside>
  );
}
