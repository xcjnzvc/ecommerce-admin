"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/react-query/query-keys";

/**
 * Supabase Realtime → React Query 캐시 무효화.
 * 주문/상품/재고 테이블이 바뀌면 관련 화면이 새로고침 없이 갱신됩니다.
 * (재고 숫자는 기존 Cafe24→Supabase 동기화로만 바뀌며, 여기서는 그 변경을 UI에 반영합니다.)
 */
export function RealtimeQueryInvalidation() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("admin-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.orders });
          void queryClient.invalidateQueries({
            queryKey: queryKeys.dashboardSummary,
          });
          void queryClient.invalidateQueries({
            queryKey: queryKeys.bestSellers,
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.inventory,
          });
          void queryClient.invalidateQueries({
            queryKey: queryKeys.products,
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory_logs" },
        () => {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.inventoryLogs,
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return null;
}
