"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import Input from "@/components/Input";
import { loginSchema, LoginForm } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "@/components/Button";
import { ServerStatus } from "@/types/auth";
import ServerStatusBanner from "../_components/ServerStatusBanner";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import FloatingMenu from "@/components/FloatingMenu";

const ping = async (setServerStatus: (status: ServerStatus) => void) => {
  setServerStatus("checking");
  try {
    await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
      timeout: 15000,
    });
    setServerStatus("ok");
  } catch {
    setServerStatus("fail");
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus>("checking");
  const [isNavigating, setIsNavigating] = useState(false);

  const CLIENT_ID = process.env.CAFE24_CLIENT_ID;
  const REDIRECT_URI = process.env.CAFE24_REDIRECT_URI;
  const MALL_ID = "rkdenrjd"; // 카페24 관리자 페이지 주소창에 보이는 그 아이디

  const cafe24LoginUrl = `https://${MALL_ID}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI || "")}&scope=mall.read_product,mall.write_product,mall.read_category,mall.write_category`;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch,
    setValue,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  useEffect(() => {
    ping(setServerStatus);
  }, []);

  const onSubmit = async (data: LoginForm) => {
    console.log("전달된 데이터:", data);
    try {
      setIsNavigating(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) {
        setIsNavigating(false);
        toast.error("이메일 또는 비밀번호를 확인해주세요.");
        return;
      }
      router.push("/dashboard");
    } catch {
      setIsNavigating(false);
      toast.error("알 수 없는 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-[450px] w-full mx-auto flex gap-[40px] flex-col items-center px-4">
        <div className="flex flex-col items-center gap-[10px]">
          <h2 className="text-[42px] font-black text-[#143617]">ADMIN</h2>
        </div>
        {/* 
        <ServerStatusBanner
          status={serverStatus}
          onRetry={() => ping(setServerStatus)}
          color="#143617"
        /> */}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full flex-col"
        >
          <div className="flex flex-col gap-[18px]">
            <Input
              variant="floating"
              placeholder="이메일"
              type="email"
              {...register("email")}
            />
            <Input
              variant="floating"
              placeholder="비밀번호"
              type="password"
              {...register("password")}
            />
          </div>

          <div className="mt-[60px]">
            <Button
              type="submit"
              text="로그인"
              loadingText="잠시만요..."
              isLoading={isSubmitting || isNavigating}
              // disabled={!isValid || serverStatus !== "ok"}
              disabled={!isValid || isSubmitting || isNavigating}
            />
          </div>
        </form>
        {/* <div className="mt-10 pt-10 border-t">
          <a href={cafe24LoginUrl}>
            <button type="button" className="...">
              카페24와 내 어드민 연결하기 (최초 1회)
            </button>
          </a>
        </div> */}
      </div>
      <FloatingMenu />
    </div>
  );
}
