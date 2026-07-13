import { useState, forwardRef, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps {
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  isLoginMode?: boolean;
  variant?: "floating" | "static";
  name?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      placeholder,
      type = "text",
      value,
      onChange,
      onBlur,
      className = "",
      isLoginMode = true,
      variant = "floating",
      name,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const innerRef = useRef<HTMLInputElement>(null);

    // ref 병합 — 외부 ref(react-hook-form)랑 내부 ref 둘 다 연결
    const setRef = (el: HTMLInputElement | null) => {
      (innerRef as React.MutableRefObject<HTMLInputElement | null>).current =
        el;
      if (typeof ref === "function") ref(el);
      else if (ref)
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
    };

    // input 실제 값 기반으로 hasValue 업데이트
    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      const observer = new MutationObserver(() => {
        setHasValue(el.value.length > 0);
      });
      const handleInput = () => setHasValue(el.value.length > 0);
      el.addEventListener("input", handleInput);
      return () => el.removeEventListener("input", handleInput);
    }, []);

    const isPassword = type === "password";
    const isFloating = variant === "floating" ? isFocused || hasValue : true;

    const borderColor = isLoginMode
      ? isFloating
        ? "#143617"
        : "#ddd"
      : isFloating
        ? "#ffffff"
        : "#828282";

    return (
      <div
        className={`relative w-full rounded-[10px] border transition-all  duration-200 ${
          isLoginMode
            ? `bg-white ${isFloating ? "border-[#143617]" : "border-[#ddd]"}`
            : `bg-[#171717] ${isFloating ? "border-white" : "border-[#828282]"}`
        } ${className}`}
      >
        <label
          className={`pointer-events-none absolute left-[12px] px-[4px] transition-all duration-200 ease-in-out ${
            isLoginMode ? "bg-white" : "bg-[#171717]"
          } ${
            variant === "floating"
              ? isFloating
                ? `top-[-10px] text-[12px] ${isLoginMode ? "text-[#143617]" : "text-white"}`
                : "top-[50%] -translate-y-1/2 text-[14px]"
              : `top-[-20px] text-[16px] font-medium ${isLoginMode ? "text-[#143617]" : "text-white"}`
          } ${!isFloating && variant === "floating" ? (isLoginMode ? "text-[#999]" : "text-[#828282]") : ""}`}
        >
          {placeholder}
        </label>

        <input
          ref={setRef}
          name={name}
          type={isPassword && showPassword ? "text" : type}
          onChange={(e) => {
            setHasValue(e.target.value.length > 0);
            onChange?.(e);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className={`w-full bg-transparent py-[12px] px-[15px] text-[14px] focus:outline-none ${
            isLoginMode
              ? "[&:-webkit-autofill]:shadow-[0_0_0px_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#000]"
              : "[&:-webkit-autofill]:shadow-[0_0_0px_1000px_#171717_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#fff]"
          } ${isLoginMode ? "text-black" : "text-white"} ${isPassword ? "pr-[44px]" : ""}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-[50%] right-[12px] -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff size={20} color={borderColor} />
            ) : (
              <Eye size={20} color={borderColor} />
            )}
          </button>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
