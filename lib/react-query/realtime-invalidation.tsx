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

    // #region agent log
    fetch("http://127.0.0.1:7576/ingest/47ab9bd0-3423-4f30-bd64-318d03377f9f", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "cd9a7b",
      },
      body: JSON.stringify({
        sessionId: "cd9a7b",
        runId: "pre-fix",
        hypothesisId: "A",
        location: "realtime-invalidation.tsx:mount",
        message: "RealtimeQueryInvalidation mounted",
        data: {},
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    const channel = supabase
      .channel("admin-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          // #region agent log
          fetch(
            "http://127.0.0.1:7576/ingest/47ab9bd0-3423-4f30-bd64-318d03377f9f",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Debug-Session-Id": "cd9a7b",
              },
              body: JSON.stringify({
                sessionId: "cd9a7b",
                runId: "pre-fix",
                hypothesisId: "B",
                location: "realtime-invalidation.tsx:orders-change",
                message: "orders postgres_changes received",
                data: {
                  eventType: payload.eventType,
                  table: payload.table,
                  hasNew: !!payload.new,
                  hasOld: !!payload.old,
                },
                timestamp: Date.now(),
              }),
            },
          ).catch(() => {});
          // #endregion
          void queryClient.invalidateQueries({ queryKey: queryKeys.orders });
          void queryClient.invalidateQueries({
            queryKey: queryKeys.dashboardSummary,
          });
          void queryClient.invalidateQueries({
            queryKey: queryKeys.bestSellers,
          });
          // #region agent log
          fetch(
            "http://127.0.0.1:7576/ingest/47ab9bd0-3423-4f30-bd64-318d03377f9f",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Debug-Session-Id": "cd9a7b",
              },
              body: JSON.stringify({
                sessionId: "cd9a7b",
                runId: "pre-fix",
                hypothesisId: "D",
                location: "realtime-invalidation.tsx:invalidate",
                message: "orders invalidateQueries called",
                data: {},
                timestamp: Date.now(),
              }),
            },
          ).catch(() => {});
          // #endregion
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
      .subscribe((status, err) => {
        // #region agent log
        fetch(
          "http://127.0.0.1:7576/ingest/47ab9bd0-3423-4f30-bd64-318d03377f9f",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Debug-Session-Id": "cd9a7b",
            },
            body: JSON.stringify({
              sessionId: "cd9a7b",
              runId: "pre-fix",
              hypothesisId: "A",
              location: "realtime-invalidation.tsx:subscribe",
              message: "realtime channel status",
              data: {
                status,
                errorMessage:
                  err instanceof Error
                    ? err.message
                    : err
                      ? String(err)
                      : null,
              },
              timestamp: Date.now(),
            }),
          },
        ).catch(() => {});
        // #endregion
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return null;
}
