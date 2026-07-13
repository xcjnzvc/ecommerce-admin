import { twMerge } from "tailwind-merge";

interface ButtonProps {
  text?: string;
  icon?: React.ReactNode;
  loadingText?: string;
  isLoading?: boolean;
  size?: "default" | "sm" | "icon";
  width?: number;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function Button({
  text,
  icon,
  loadingText = "처리 중...",
  isLoading = false,
  size = "default",
  width,
  disabled,
  type = "button",
  onClick,
  className,
  style,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      style={{ ...style, width: width ? `${width}px` : undefined }}
      className={twMerge(
        "rounded-[12px]  transition-all flex items-center justify-center gap-2 px-6 active:scale-[0.98]",

        size === "default"
          ? "h-[46px] text-[16px]"
          : size === "sm"
            ? "text-[12px]"
            : "w-12 h-12",

        !width && size === "default" && "w-full",

        disabled || isLoading
          ? "bg-[#CCCCCC] text-[#666] cursor-not-allowed"
          : "bg-[#143617] text-white hover:bg-[#1e4d22]",

        className,
      )}
    >
      {isLoading ? (
        loadingText
      ) : (
        <>
          {text && <span className="pt-[4px]"> {text}</span>}
          {icon && <span className="flex items-center">{icon}</span>}
        </>
      )}
    </button>
  );
}
