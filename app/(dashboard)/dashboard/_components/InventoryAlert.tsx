"use client";

import { ShoppingBag, Package } from "lucide-react";
import {
  useInventory,
  type InventoryItem,
} from "@/lib/inventory/queries";

interface AlertItem {
  id: string;
  name: string;
  sku: string;
  current: number;
  daysLeft: number;
  urgent: boolean;
}

function toAlertItem(item: InventoryItem): AlertItem {
  return {
    id: item.id,
    name: item.name,
    sku:
      item.cafe24_product_no != null
        ? `#${item.cafe24_product_no}`
        : item.id.slice(0, 8),
    current: item.stock,
    daysLeft: item.stock,
    urgent: item.status === "품절" || item.stock <= 2,
  };
}

export default function InventoryAlert() {
  const { data: items = [] } = useInventory();

  const inventoryItems = items
    .filter((item) => item.status === "부족" || item.status === "품절")
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)
    .map(toAlertItem);

  return (
    <div className="bg-white p-6 rounded-[20px] border border-[#e2e2e2] h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xs text-gray-400 font-bold tracking-wider">
              INVENTORY
            </h3>
            <span className="text-xs font-bold text-[#d4a373] bg-[#d4a373]/10 px-2 py-0.5 rounded-full">
              {inventoryItems.length}개 SKU 임박
            </span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mt-1">재고 알림</h2>
        </div>
        <button className="flex items-center gap-2 bg-[#143617] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b88c5a] transition-all">
          <ShoppingBag size={16} /> 자동 재주문
        </button>
      </div>

      <div className="space-y-3">
        {inventoryItems.map((item) => (
          <div
            key={item.id}
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
