"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  type DashboardSummary,
  type SalesCardTypes,
} from "@/types/dashboard";
import { useDashboardSummary } from "@/lib/dashboard/queries";
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

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatDotDate(d: Date): string {
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
}

function formatWeekRange(d: Date): string {
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff);
  return `${pad2(start.getMonth() + 1)}.${pad2(start.getDate())} - ${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
}

function formatMonth(d: Date): string {
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}`;
}

function buildSalesCards(summary: DashboardSummary): SalesCardTypes[] {
  const now = new Date();
  return [
    {
      id: 1,
      title: "today",
      date: formatDotDate(now),
      price: summary.today.total.toLocaleString(),
      order: summary.today.count.toLocaleString(),
      percent: String(summary.today.growthRate),
    },
    {
      id: 2,
      title: "week",
      date: formatWeekRange(now),
      price: summary.week.total.toLocaleString(),
      order: summary.week.count.toLocaleString(),
      percent: String(summary.week.growthRate),
    },
    {
      id: 3,
      title: "month",
      date: formatMonth(now),
      price: summary.month.total.toLocaleString(),
      order: summary.month.count.toLocaleString(),
      percent: String(summary.month.growthRate),
    },
  ];
}

const EMPTY_SALES_CARDS: SalesCardTypes[] = [
  {
    id: 1,
    title: "today",
    date: "-",
    price: "-",
    order: "-",
    percent: "0",
  },
  {
    id: 2,
    title: "week",
    date: "-",
    price: "-",
    order: "-",
    percent: "0",
  },
  {
    id: 3,
    title: "month",
    date: "-",
    price: "-",
    order: "-",
    percent: "0",
  },
];

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { data: summary, isLoading: isSummaryLoading } = useDashboardSummary();

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    };

    fetchUser();
  }, []);

  const salesCards = summary ? buildSalesCards(summary) : EMPTY_SALES_CARDS;

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
        <SalesCard data={salesCards[0]} isLoading={isSummaryLoading} />
        <SalesCard data={salesCards[1]} isLoading={isSummaryLoading} />
        <SalesCard data={salesCards[2]} isLoading={isSummaryLoading} />
        <OrderStatus
          orderStatusCounts={summary?.orderStatusCounts}
          todayCount={summary?.today.count}
          todayGrowthRate={summary?.today.growthRate}
          isLoading={isSummaryLoading}
        />
      </div>

      <div className="grid grid-cols-[1fr_350px] gap-[20px]">
        <SalesTrendChart
          data={summary?.salesTrend}
          isLoading={isSummaryLoading}
        />
        <ChannelMixChart
          channelMix={summary?.channelMix}
          cafe24Available={summary?.cafe24Available}
          isLoading={isSummaryLoading}
        />
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
