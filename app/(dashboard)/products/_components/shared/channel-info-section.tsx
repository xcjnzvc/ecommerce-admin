"use client";

import { FormField, Section } from "./form-ui";

interface ChannelInfoSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  errors: {
    channels?: { message?: string };
    channelData?: {
      shopify?: {
        productType?: { message?: string };
        vendor?: { message?: string };
        tags?: { message?: string };
      };
      cafe24?: {
        shippingPolicy?: { message?: string };
      };
    };
  };
  shopifyChecked: boolean;
  cafe24Checked: boolean;
  onChannelToggle: (channel: "shopify" | "cafe24", checked: boolean) => void;
}

export function ChannelInfoSection({
  register,
  errors,
  shopifyChecked,
  cafe24Checked,
  onChannelToggle,
}: ChannelInfoSectionProps) {
  return (
    <Section title="4. 채널 선택 및 정보">
      {errors.channels && (
        <p className="text-xs text-red-600 -mt-2">
          {errors.channels.message as string}
        </p>
      )}
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={shopifyChecked}
            onChange={(e) => onChannelToggle("shopify", e.target.checked)}
          />
          Shopify
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={cafe24Checked}
            onChange={(e) => onChannelToggle("cafe24", e.target.checked)}
          />
          카페24
        </label>
      </div>

      {shopifyChecked && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm mb-4">
          <p className="font-semibold text-blue-900 mb-3">Shopify 전용 정보</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Product Type"
              error={errors.channelData?.shopify?.productType?.message}
            >
              <input
                className="input"
                placeholder="예: 과자, 건강기능식품"
                {...register("channelData.shopify.productType")}
              />
            </FormField>
            <FormField
              label="Vendor (브랜드명)"
              error={errors.channelData?.shopify?.vendor?.message}
            >
              <input
                className="input"
                placeholder="예: 가꾸기"
                {...register("channelData.shopify.vendor")}
              />
            </FormField>
            <FormField
              label="태그 (콤마로 구분)"
              error={errors.channelData?.shopify?.tags?.message}
            >
              <input
                className="input"
                placeholder="예: 신상품, 베스트"
                {...register("channelData.shopify.tags")}
              />
            </FormField>
            <FormField label="공개 상태">
              <select
                className="input bg-white"
                {...register("channelData.shopify.publishStatus")}
              >
                <option value="draft">임시저장 (draft)</option>
                <option value="active">공개 (active)</option>
              </select>
            </FormField>
          </div>
        </div>
      )}

      {cafe24Checked && (
        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-sm">
          <p className="font-semibold text-emerald-900 mb-3">카페24 전용 정보</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="배송 정책"
              error={errors.channelData?.cafe24?.shippingPolicy?.message}
            >
              <input
                className="input"
                {...register("channelData.cafe24.shippingPolicy")}
              />
            </FormField>
            <FormField label="진열 상태">
              <select
                className="input bg-white"
                {...register("channelData.cafe24.displayStatus")}
              >
                <option value="진열함">진열함</option>
                <option value="진열안함">진열안함</option>
              </select>
            </FormField>
            <FormField label="판매 상태">
              <select
                className="input bg-white"
                {...register("channelData.cafe24.sellingStatus")}
              >
                <option value="판매함">판매함</option>
                <option value="판매안함">판매안함</option>
              </select>
            </FormField>
          </div>
        </div>
      )}
    </Section>
  );
}
