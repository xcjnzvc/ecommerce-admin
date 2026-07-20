// import { SalesCardTypes } from "@/types/dashboard";
// import SalesCard from "./_components/SalesCard";
// import SalesTrendChart from "./_components/SalesTrendChart";
// import ChannelMixChart from "./_components/ChannelMixChart";
// import OrderStatus from "./_components/OrderStatus";
// import InventoryAlert from "./_components/InventoryAlert";
// import BestSellers from "./_components/BestSellers";
// import ReviewStats from "./_components/ReviewStats";
// import InfluencerCampaign from "./_components/InfluencerCampaign";
// import LatestOrders from "./_components/LatestOrders";
// import { createClient } from "@/lib/supabase/server";

// const salesData: SalesCardTypes[] = [
//   {
//     id: 1,
//     title: "today",
//     date: "2026.07.08",
//     price: "12,480,000",
//     order: "148",
//     percent: "12.4",
//   },
//   {
//     id: 2,
//     title: "week",
//     date: "07.02 - 07.08",
//     price: "84,320,000",
//     order: "1,024",
//     percent: "8.2",
//   },
//   {
//     id: 3,
//     title: "month",
//     date: "2026.07",
//     price: "84,320,000",
//     order: "1,024",
//     percent: "20.2",
//   },
// ] as const;

// export default async function DashboardPage() {
//   const supabase = await createClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   return (
//     <div className="grid grid-cols-1 gap-[20px]">
//       {/* 1. 헤더 영역 */}
//       <div className="mb-[20px]">
//         <h1 className="text-[24px] font-bold text-gray-800">대시보드</h1>
//         <div className="text-gray-500 mt-1">{user?.email}님 환영합니다</div>
//         <p className="text-gray-500">
//           실시간 매출과 운영 지표를 한 눈에 확인하세요
//         </p>
//       </div>

//       {/* 2. 카드 영역 (3개 1줄 유지) */}
//       <div className="grid grid-cols-[1fr_1fr_1fr_2fr] gap-[20px]">
//         <SalesCard data={salesData[0]} />
//         <SalesCard data={salesData[1]} />
//         <SalesCard data={salesData[2]} />
//         <OrderStatus />
//       </div>

//       {/* 3. 차트 영역 (좌우 2열 배치) */}
//       <div className="grid grid-cols-[1fr_350px] gap-[20px]">
//         <SalesTrendChart />
//         <ChannelMixChart />
//       </div>

//       {/* 4. 카드 영역 (3개 1줄)) */}
//       <div className="grid grid-cols-[1fr_1fr_1fr] gap-[20px] items-start">
//         <InventoryAlert />
//         <BestSellers />
//         <ReviewStats />
//       </div>

//       <div className="grid grid-cols-[2fr_1fr] gap-[20px] items-start">
//         <LatestOrders />
//         <InfluencerCampaign />
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SalesCardTypes } from "@/types/dashboard";
import SalesCard from "./_components/SalesCard";
import SalesTrendChart from "./_components/SalesTrendChart";
import ChannelMixChart from "./_components/ChannelMixChart";
import OrderStatus from "./_components/OrderStatus";
import InventoryAlert from "./_components/InventoryAlert";
import BestSellers from "./_components/BestSellers";
import ReviewStats from "./_components/ReviewStats";
import InfluencerCampaign from "./_components/InfluencerCampaign";
import LatestOrders from "./_components/LatestOrders";
import NoticeModal from "@/components/NoticeModal";

const salesData: SalesCardTypes[] = [
  {
    id: 1,
    title: "today",
    date: "2026.07.08",
    price: "12,480,000",
    order: "148",
    percent: "12.4",
  },
  {
    id: 2,
    title: "week",
    date: "07.02 - 07.08",
    price: "84,320,000",
    order: "1,024",
    percent: "8.2",
  },
  {
    id: 3,
    title: "month",
    date: "2026.07",
    price: "84,320,000",
    order: "1,024",
    percent: "20.2",
  },
] as const;

export default function DashboardPage() {
  // 1. 상태 초기값을 true로 설정하여 컴포넌트 마운트 시 모달이 즉시 열리게 함
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // 2. useEffect에서는 오직 비동기 작업(데이터 가져오기)만 수행
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    };

    fetchUser();
  }, []); // 의존성 배열이 비어있으므로 컴포넌트 마운트 시 1회만 실행됨

  return (
    <div className="grid grid-cols-1 gap-[20px]">
      <div className="mb-[20px]">
        <h1 className="text-[24px] font-bold text-gray-800">대시보드</h1>
        <div className="text-gray-500 mt-1">
          {userEmail || "사용자"}님 환영합니다
        </div>
        <p className="text-gray-500">
          실시간 매출과 운영 지표를 한 눈에 확인하세요
        </p>
      </div>

      <div className="grid grid-cols-[1fr_1fr_1fr_2fr] gap-[20px]">
        <SalesCard data={salesData[0]} />
        <SalesCard data={salesData[1]} />
        <SalesCard data={salesData[2]} />
        <OrderStatus />
      </div>

      <div className="grid grid-cols-[1fr_350px] gap-[20px]">
        <SalesTrendChart />
        <ChannelMixChart />
      </div>

      <div className="grid grid-cols-[1fr_1fr_1fr] gap-[20px] items-start">
        <InventoryAlert />
        <BestSellers />
        <ReviewStats />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-[20px] items-start">
        <LatestOrders />
        <InfluencerCampaign />
      </div>

      <NoticeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
