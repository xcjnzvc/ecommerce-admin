interface ChannelBadgesProps {
  cafe24?: boolean;
  shopify?: boolean;
  showEmpty?: boolean;
}

export default function ChannelBadges({
  cafe24 = false,
  shopify = false,
  showEmpty = true,
}: ChannelBadgesProps) {
  return (
    <div className="flex gap-1.5">
      {cafe24 && (
        <span
          title="카페24"
          className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 text-[11px] font-bold"
        >
          카
        </span>
      )}
      {shopify && (
        <span
          title="Shopify"
          className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 text-[11px] font-bold"
        >
          쇼
        </span>
      )}
      {showEmpty && !cafe24 && !shopify && (
        <span className="text-gray-300 text-xs">-</span>
      )}
    </div>
  );
}
