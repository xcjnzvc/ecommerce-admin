"use client";

import React from "react";
import { createClient } from "@/lib/supabase/client";

export function useProductImageUpload(initialImages?: string[]) {
  const supabase = createClient();

  const [mainImageFile, setMainImageFile] = React.useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = React.useState<string | null>(
    initialImages?.[0] || null,
  );

  const [detailImageFiles, setDetailImageFiles] = React.useState<File[]>([]);
  const [detailImagePreviews, setDetailImagePreviews] = React.useState<
    string[]
  >(initialImages?.slice(1) || []);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      if (mainImagePreview && !mainImagePreview.startsWith("http")) {
        URL.revokeObjectURL(mainImagePreview);
      }
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDetailImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setDetailImageFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setDetailImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeDetailImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setDetailImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      const fileIndexOffset = detailImagePreviews.filter((url) =>
        url.startsWith("http"),
      ).length;
      const fileIndex = index - fileIndexOffset;

      setDetailImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      setDetailImagePreviews((prev) => {
        const target = prev[index];
        if (target && !target.startsWith("http")) URL.revokeObjectURL(target);
        return prev.filter((_, i) => i !== index);
      });
    }
  };

  const uploadToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Storage 업로드 에러: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath);

    return publicUrl;
  };

  const resolveFinalImages = async (): Promise<{
    finalImages: string[];
    mainImageUrl: string | null;
  }> => {
    let mainImageUrl = mainImagePreview;

    if (mainImageFile) {
      mainImageUrl = await uploadToStorage(mainImageFile);
    }

    const uploadedDetailUrls = await Promise.all(
      detailImageFiles.map((file) => uploadToStorage(file)),
    );

    const existingDetailUrls = detailImagePreviews.filter((url) =>
      url.startsWith("http"),
    );
    const finalDetailUrls = [...existingDetailUrls, ...uploadedDetailUrls];

    const finalImages: string[] = [];
    if (mainImageUrl) finalImages.push(mainImageUrl);
    finalImages.push(...finalDetailUrls);

    return { finalImages, mainImageUrl };
  };

  return {
    mainImageFile,
    mainImagePreview,
    detailImageFiles,
    detailImagePreviews,
    handleMainImageChange,
    handleDetailImagesChange,
    removeDetailImage,
    uploadToStorage,
    resolveFinalImages,
  };
}
