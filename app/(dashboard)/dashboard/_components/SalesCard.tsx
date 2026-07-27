import { SalesCardTypes } from "@/types/dashboard";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";

interface SalesCardProps {
  data: SalesCardTypes;
  isLoading?: boolean;
}

const SalesCard = ({ data, isLoading = false }: SalesCardProps) => {
  const titleMap = {
    today: "오늘 매출",
    week: "이번 주 매출",
    month: "이번 달 매출",
  };

  const isDark = data.id === 1;
  const growth = Number(data.percent);
  const isUp = Number.isFinite(growth) ? growth >= 0 : true;

  const bgColor = isDark ? "bg-[#143617]" : "bg-white";
  const textColor = isDark ? "text-white/70" : "text-gray-500";
  const mainTextColor = isDark ? "text-white" : "text-black";

  return (
    <div
      className={`flex flex-col px-[30px] py-[20px] rounded-[20px] w-full border ${isDark ? "border-transparent" : "border-[#e2e2e2]"} ${bgColor}`}
    >
      <div className="flex justify-between items-start mb-[14px]">
        <div>
          <h5 className={`text-[14px] font-medium ${textColor}`}>
            {titleMap[data.title]}
          </h5>
          <span className={`text-[14px]  ${textColor}`}>
            {isLoading ? "-" : data.date}
          </span>
        </div>

        <div
          className={`flex items-center gap-1 px-[10px] py-[4px] rounded-full text-[14px] font-medium 
          ${isDark ? "bg-orange-400/20 text-orange-200" : "bg-gray-100 text-gray-700"}`}
        >
          {isUp ? <FiArrowUp /> : <FiArrowDown />}
          {isLoading ? "-" : `${Math.abs(growth)}%`}
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-6">
        <span className={`text-[24px] font-bold ${mainTextColor}`}>
          {isLoading ? "-" : data.price}
        </span>
        <span className={`text-[14px] ${mainTextColor}`}>원</span>
      </div>

      <div
        className={`border-b ${isDark ? "border-white/10" : "border-[#e2e2e2]"} mb-4`}
      ></div>

      <div className="flex justify-between text-[14px]">
        <span className={textColor}>주문</span>
        <span className={`font-medium ${mainTextColor}`}>
          {isLoading ? "-" : `${data.order}건`}
        </span>
      </div>
    </div>
  );
};

export default SalesCard;
