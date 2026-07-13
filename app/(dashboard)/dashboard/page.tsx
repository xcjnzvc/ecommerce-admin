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
  return (
    // 전체 레이아웃을 grid로 설정 (gap으로 세로 간격 자동 조절)
    <div className="grid grid-cols-1 gap-[20px]">
      {/* 1. 헤더 영역 */}
      <div className="mb-[20px]">
        <h1 className="text-[24px] font-bold text-gray-800">대시보드</h1>
        <p className="text-gray-500 mt-1">
          실시간 매출과 운영 지표를 한 눈에 확인하세요
        </p>
      </div>

      {/* 2. 카드 영역 (3개 1줄 유지) */}
      <div className="grid grid-cols-[1fr_1fr_1fr_2fr] gap-[20px]">
        <SalesCard data={salesData[0]} />
        <SalesCard data={salesData[1]} />
        <SalesCard data={salesData[2]} />
        <OrderStatus />
      </div>

      {/* 3. 차트 영역 (좌우 2열 배치) */}
      <div className="grid grid-cols-[1fr_350px] gap-[20px]">
        <SalesTrendChart />
        <ChannelMixChart />
      </div>

      {/* 4. 카드 영역 (3개 1줄)) */}
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-[20px] items-start">
        <InventoryAlert />
        <BestSellers />
        <ReviewStats />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-[20px] items-start">
        <LatestOrders />
        <InfluencerCampaign />
      </div>
    </div>
  );
}
