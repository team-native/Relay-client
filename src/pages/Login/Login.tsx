import React, { useState } from "react";
import { Link, useNavigate, useInRouterContext } from "react-router-dom";

export interface LoginProps {
  /** 실제 API 연동 시 사용할 로그인 콜백 (옵션) */
  onLoginSubmit?: (data: { email: string; password: string }) => Promise<void> | void;
}

function SafeLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
}) {
  let inRouter = false;
  try {
    inRouter = useInRouterContext();
  } catch {
    inRouter = false;
  }

  if (inRouter) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={to} className={className}>
      {children}
    </a>
  );
}

export function Login({ onLoginSubmit }: LoginProps) {
  let navigate: ((path: string) => void) | null = null;
  try {
    navigate = useNavigate();
  } catch {
    navigate = null;
  }

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 이메일과 비밀번호가 모두 입력되었는지 여부
  const isFormFilled = email.trim().length > 0 && password.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormFilled || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (onLoginSubmit) {
        await onLoginSubmit({ email, password });
      } else {
        // 백엔드 미연동 시 기본 시뮬레이션 로직
        await new Promise((resolve) => setTimeout(resolve, 600));

        // 간단한 검증 예시
        if (!email.endsWith("@gsm.hs.kr") || password.length < 8) {
          setErrorMessage("이메일 또는 비밀번호가 일치하지 않습니다.");
          setIsSubmitting(false);
          return;
        }

        // 로그인 성공 시 메인 페이지 이동
        if (navigate) {
          navigate("/");
        }
      }
    } catch {
      setErrorMessage("이메일 또는 비밀번호가 일치하지 않습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] flex flex-col items-center justify-center p-4 sm:p-8 font-sans antialiased select-none">
      {/* Login Card Container */}
      <div className="w-full max-w-[480px] bg-white rounded-[32px] p-8 sm:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col items-center">
        {/* Title Header */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] sm:text-[30px] font-extrabold text-black tracking-tight mb-2 leading-tight">
            다시 만나서 반가워요
          </h1>
          <p className="text-[14px] sm:text-[15px] text-[#666666] font-medium">
            학교 이메일로 로그인하세요.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="w-full space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-[14px] font-bold text-black mb-2">
              학교 이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              placeholder="이메일 주소를 입력해 주세요."
              className={`w-full h-[50px] px-4 rounded-[12px] text-[14px] outline-none transition-colors duration-150 placeholder:text-[#a0a0a0] ${
                errorMessage
                  ? "border-[1.5px] border-[#e35252] bg-[#fdf0f0] text-black"
                  : "border border-[#d1d5db] bg-white text-black focus:border-[#FFC83D] focus:ring-2 focus:ring-[#FFC83D]/20"
              }`}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[14px] font-bold text-black mb-2">
              비밀번호
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="비밀번호를 입력해 주세요."
                className={`w-full h-[50px] pl-4 pr-12 rounded-[12px] text-[14px] outline-none transition-colors duration-150 placeholder:text-[#a0a0a0] ${
                  errorMessage
                    ? "border-[1.5px] border-[#e35252] bg-[#fdf0f0] text-black"
                    : "border border-[#d1d5db] bg-white text-black focus:border-[#FFC83D] focus:ring-2 focus:ring-[#FFC83D]/20"
                }`}
              />

              {/* Password Show/Hide Toggle Button */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors focus:outline-none p-1 flex items-center justify-center cursor-pointer"
              >
                {showPassword ? (
                  /* Eye Open Icon */
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ) : (
                  /* Eye Slashed / Closed Icon */
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Error Message */}
            {errorMessage ? (
              <p className="text-[#e35252] text-[13px] font-medium mt-2 leading-none">
                {errorMessage}
              </p>
            ) : null}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!isFormFilled || isSubmitting}
              className={`w-full h-[50px] font-bold text-[15px] rounded-[12px] border-none transition-colors duration-150 flex items-center justify-center ${
                isFormFilled && !isSubmitting
                  ? "bg-[#2d2d2d] hover:bg-black text-white cursor-pointer"
                  : "bg-[#bebebe] text-white cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "로그인 중..." : "로그인"}
            </button>
          </div>

          {/* Footer Signup Link */}
          <div className="text-center text-[14px] text-[#333333] pt-2">
            <span>계정이 없으신가요? </span>
            <SafeLink
              to="/signup"
              className="font-bold text-black border-b-2 border-[#FFC83D] pb-[1px] hover:text-[#FFC83D] transition-colors inline-block"
            >
              회원가입 하기
            </SafeLink>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;