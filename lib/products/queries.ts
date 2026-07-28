"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/react-query/query-keys";

export interface ProductListItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: "임시저장" | "판매중";
  created_at: string;
  images: string[] | null;
  cafe24_product_no: number | null;
  shopify_product_id: number | null;
}

async function fetchProducts(): Promise<ProductListItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, price, stock, status, created_at, images, cafe24_product_no, shopify_product_id",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ProductListItem[];
}

export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: fetchProducts,
  });
}
