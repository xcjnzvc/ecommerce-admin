import Button from "@/components/Button";
import { ServerStatus } from "@/types/auth";

interface ServerStatusBannerProps {
  status: ServerStatus;
  onRetry: () => void;
  color: string;
}

export default function ServerStatusBanner({
  status,
  onRetry,
  color,
}: ServerStatusBannerProps) {
  const serverBanner = {
    checking: {
      dot: "bg-amber-400 animate-pulse",
      text: "서버 연결 확인 중... 잠시만 기다려주세요",
      showRetry: false,
    },
    ok: {
      dot: "bg-green-500",
      text: "서버가 준비됐어요. 로그인해주세요",
      showRetry: false,
    },
    fail: {
      dot: "bg-red-500",
      text: "서버 연결에 실패했어요. 잠시 후 다시 시도해주세요",
      showRetry: true,
    },
  }[status];

  return (
    <div className="w-full flex items-center gap-[12px] px-[16px]  rounded-[8px] ">
      <div
        className={`w-[10px] h-[10px] rounded-full flex-shrink-0 ${serverBanner.dot}`}
      />
      <p className="flex-1 text-[14px] text-[#666]">{serverBanner.text}</p>
      {serverBanner.showRetry && (
        <Button
          size="sm"
          text="재요청"
          onClick={onRetry}
          style={{ color: color, borderColor: color }}
          className="bg-transparent  border hover:bg-[#F6FAFF] h-[30px] w-auto px-[10px]"
        />
      )}
    </div>
  );
}
