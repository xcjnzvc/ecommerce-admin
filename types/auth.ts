import { z } from "zod";

export type ServerStatus = "checking" | "ok" | "fail";

export const loginSchema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다"),
  password: z.string().min(4, "비밀번호는 최소 4자 이상이어야 합니다"),
});

// 공통 베이스
const baseSignupSchema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다"),
  password: z.string().min(4, "비밀번호는 최소 4자 이상이어야 합니다"),
  passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해주세요"),
  name: z
    .string()
    .min(1, "이름을 입력해주세요")
    .regex(/^[가-힣a-zA-Z\s]+$/, "이름은 한글 또는 영문만 입력 가능합니다"),
  phone: z
    .string()
    .min(1, "연락처를 입력해주세요")
    .regex(/^\d{10,11}$/, "휴대폰번호는 10~11자리 숫자로 입력해주세요"),
});

// 비밀번호 확인 refine 재사용
const withPasswordConfirm = <
  T extends z.ZodObject<{
    password: z.ZodString;
    passwordConfirm: z.ZodString;
  }>,
>(
  schema: T,
) =>
  schema.refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordConfirm"],
  });

// OWNER용
export const signupSchema = withPasswordConfirm(
  baseSignupSchema.extend({
    companyName: z.string().min(1, "회사명을 입력해주세요"),
  }),
);

// 초대받은 사람용
export const invitedSignupSchema = withPasswordConfirm(baseSignupSchema);

export const inviteSchema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다"),
  role: z.enum(["ADMIN", "USER"], { message: "직위를 선택해주세요" }),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type InvitedSignupForm = z.infer<typeof invitedSignupSchema>;
export type InviteForm = z.infer<typeof inviteSchema>;
