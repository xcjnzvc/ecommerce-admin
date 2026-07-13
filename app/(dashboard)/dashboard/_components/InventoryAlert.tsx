// "use client";

// import { ShoppingBag } from "lucide-react";

// const inventoryItems = [
//   {
//     name: "오가닉 코튼 오버셔츠 · 아이보리 / M",
//     sku: "VD-SH-IVR-M",
//     current: 4,
//     total: 20,
//     daysLeft: 2,
//     urgent: true,
//   },
//   {
//     name: "리사이클 데님 자켓 · 인디고 / L",
//     sku: "VD-DN-IND-L",
//     current: 8,
//     total: 25,
//     daysLeft: 4,
//     urgent: true,
//   },
//   {
//     name: "린넨 와이드 팬츠 · 샌드 / S",
//     sku: "VD-PT-SND-S",
//     current: 12,
//     total: 30,
//     daysLeft: 6,
//     urgent: false,
//   },
//   {
//     name: "니트 카디건 · 올리브 / M",
//     sku: "VD-KN-OLV-M",
//     current: 14,
//     total: 30,
//     daysLeft: 7,
//     urgent: false,
//   },
// ];

// export default function InventoryAlert() {
//   return (
//     <div className="bg-white p-6 rounded-[20px] border border-[#e2e2e2]">
//       {/* 헤더 */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <div className="flex items-center gap-2 mb-1">
//             <h3 className="text-xs text-gray-400 font-bold tracking-wider">
//               INVENTORY
//             </h3>
//             <span className="text-xs font-bold text-[#d4a373] bg-[#d4a373]/10 px-2 py-0.5 rounded-full">
//               4개 SKU 임박
//             </span>
//           </div>
//           <h2 className="text-lg font-bold text-gray-800">재고 알림</h2>
//         </div>
//         <button className="flex items-center gap-2 bg-[#d4a373] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b88c5a] transition-all">
//           <ShoppingBag size={16} /> 자동 재주문
//         </button>
//       </div>

//       {/* 리스트 영역 */}
//       <div className="space-y-4">
//         {inventoryItems.map((item, i) => {
//           const percentage = (item.current / item.total) * 100;
//           return (
//             <div key={i} className="p-4 border border-[#e2e2e2] rounded-[16px]">
//               <div className="flex justify-between items-start mb-3">
//                 <div>
//                   <p className="text-sm font-semibold text-gray-800">
//                     {item.name}
//                   </p>
//                   <p className="text-xs text-gray-400 mt-0.5">{item.sku}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm font-bold">
//                     <span
//                       className={
//                         item.urgent ? "text-red-500" : "text-[#d4a373]"
//                       }
//                     >
//                       {item.current}
//                     </span>
//                     <span className="text-gray-400 font-normal">
//                       {" "}
//                       / {item.total}
//                     </span>
//                   </p>
//                   <p className="text-xs text-gray-500 mt-0.5">
//                     소진 예상 {item.daysLeft}일
//                   </p>
//                 </div>
//               </div>

//               {/* 진행률 바 */}
//               <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
//                 <div
//                   className={`h-full rounded-full ${item.urgent ? "bg-red-500" : "bg-[#d4a373]"}`}
//                   style={{ width: `${percentage}%` }}
//                 />
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

"use client";

import { ShoppingBag, AlertCircle, Package } from "lucide-react";

const inventoryItems = [
  {
    name: "오가닉 코튼 오버셔츠 · 아이보리 / M",
    sku: "VD-SH-IVR-M",
    current: 4,
    daysLeft: 2,
    urgent: true,
  },
  {
    name: "리사이클 데님 자켓 · 인디고 / L",
    sku: "VD-DN-IND-L",
    current: 8,
    daysLeft: 4,
    urgent: true,
  },
  {
    name: "린넨 와이드 팬츠 · 샌드 / S",
    sku: "VD-PT-SND-S",
    current: 12,
    daysLeft: 6,
    urgent: false,
  },
  {
    name: "니트 카디건 · 올리브 / M",
    sku: "VD-KN-OLV-M",
    current: 14,
    daysLeft: 7,
    urgent: false,
  },
  {
    name: "양말은 얼룩말/ M",
    sku: "VD-KN-OLV-M",
    current: 14,
    daysLeft: 7,
    urgent: false,
  },
];

export default function InventoryAlert() {
  return (
    <div className="bg-white p-6 rounded-[20px] border border-[#e2e2e2] h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xs text-gray-400 font-bold tracking-wider">
              INVENTORY
            </h3>
            <span className="text-xs font-bold text-[#d4a373] bg-[#d4a373]/10 px-2 py-0.5 rounded-full">
              4개 SKU 임박
            </span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mt-1">재고 알림</h2>
        </div>
        <button className="flex items-center gap-2 bg-[#143617] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b88c5a] transition-all">
          <ShoppingBag size={16} /> 자동 재주문
        </button>
      </div>

      <div className="space-y-3">
        {inventoryItems.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-3 rounded-[12px] border ${
              item.urgent
                ? "bg-red-50/50 border-red-100"
                : "bg-gray-50 border-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${item.urgent ? "bg-red-100 text-red-600" : "bg-gray-200 text-gray-600"}`}
              >
                <Package size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {item.name}
                </p>
                <p className="text-[13px] text-gray-400">{item.sku}</p>
              </div>
            </div>

            <div className="text-right">
              <p
                className={`text-[14px] font-bold ${item.urgent ? "text-red-600" : "text-gray-900"}`}
              >
                {item.current}개 남음
              </p>
              <p className="text-[12px]  text-gray-500">
                {item.daysLeft}일 후 품절
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
