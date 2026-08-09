import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { sendVerificationEmail, signup as signupApi } from "../../api/authApi";
import CustomSelect from "../../components/ui/CustomSelect";
import {
  DEPARTMENT_API_VALUES,
  DEPARTMENT_OPTIONS,
} from "../../constants/profileOptions";

export interface SignupProps {
  onSignupSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

interface SignupLocationState {
  verified?: boolean;
  email?: string;
  draft?: SignupDraft;
}

interface SignupDraft {
  name: string;
  email: string;
  generation: string;
  major: string;
  password: string;
  passwordConfirm: string;
}

const GENERATION_OPTIONS = ["8", "9", "10"];

function getServerErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const response = (error as { response?: { data?: unknown } }).response;
    const data = response?.data;

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (typeof data === "object" && data !== null) {
      const message = (data as { message?: unknown; error?: unknown; detail?: unknown }).message;
      if (typeof message === "string" && message.trim()) return message;

      const errorMessage = (data as { error?: unknown }).error;
      if (typeof errorMessage === "string" && errorMessage.trim()) return errorMessage;

      const detail = (data as { detail?: unknown }).detail;
      if (typeof detail === "string" && detail.trim()) return detail;
    }
  }

  return fallback;
}

export function Signup({ onSignupSuccess }: SignupProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = (location.state as SignupLocationState) || null;
  const initialDraft = locationState?.draft;

  const [name, setName] = useState(initialDraft?.name ?? "");
  const [email, setEmail] = useState(locationState?.email ?? initialDraft?.email ?? "");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [generation, setGeneration] = useState(initialDraft?.generation ?? "");
  const [major, setMajor] = useState(initialDraft?.major ?? "");

  const [password, setPassword] = useState(initialDraft?.password ?? "");
  const [passwordConfirm, setPasswordConfirm] = useState(initialDraft?.passwordConfirm ?? "");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");

  useEffect(() => {
    const state = (location.state as SignupLocationState) || null;
    if (state?.draft) {
      setName(state.draft.name);
      setGeneration(state.draft.generation);
      setMajor(state.draft.major);
      setPassword(state.draft.password);
      setPasswordConfirm(state.draft.passwordConfirm);
    }

    if (state?.verified) {
      setIsEmailVerified(true);
      if (state.email) {
        setEmail(state.email);
      } else if (state.draft?.email) {
        setEmail(state.draft.email);
      }
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emailRegex = /^s\d{5}@gsm\.hs\.kr$/;
  const isEmailValidFormat =
    emailRegex.test(email.trim()) ||
    (email.includes("@gsm.hs.kr") && email.trim().length >= 10);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  const isPasswordValid = passwordRegex.test(password);

  const isAllFilled =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    generation.length > 0 &&
    major.length > 0 &&
    isPasswordValid &&
    passwordConfirm.length >= 8 &&
    password === passwordConfirm;

  const isSubmitActive = isAllFilled && isEmailVerified;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    setIsEmailVerified(false);
    setEmailError("");
  };

  const handleVerifyEmail = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!isEmailValidFormat) {
      setEmailError("s00000@gsm.hs.kr 형식의 올바른 학교 이메일을 입력해 주세요.");
      return;
    }

    setEmailError("");
    const draft: SignupDraft = {
      name,
      email: email.trim(),
      generation,
      major,
      password,
      passwordConfirm,
    };

    try {
      await sendVerificationEmail(email.trim());
    } catch {
      // 서버가 메일을 보낸 뒤 오류 상태를 돌려주는 경우가 있어 인증 화면으로 계속 진행합니다.
    }

    navigate("/verify", { state: { email: email.trim(), draft } });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);

    if (val.length > 0 && !passwordRegex.test(val)) {
      setPasswordError("대문자, 소문자, 숫자, 특수문자를 포함한 8자 이상이어야 합니다.");
    } else {
      setPasswordError("");
    }

    if (passwordConfirm && val !== passwordConfirm) {
      setPasswordConfirmError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordConfirmError("");
    }
  };

  const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPasswordConfirm(val);

    if (password && val !== password) {
      setPasswordConfirmError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordConfirmError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSubmitActive || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await signupApi({
        name: name.trim(),
        email: email.trim(),
        password,
        passwordConfirm,
        department: DEPARTMENT_API_VALUES[major] ?? major,
        generation,
      });

      onSignupSuccess?.();
      navigate("/login");
    } catch (error) {
      setSubmitError(getServerErrorMessage(error, "회원가입에 실패했습니다. 입력한 정보를 확인해주세요."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[#f8f9fa]">
      <div className="w-full max-w-[480px] mx-auto bg-white rounded-[32px] p-8 sm:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col select-none">
        <h1 className="text-[30px] font-extrabold text-black text-center mb-8 leading-tight tracking-tight">
          회원가입
        </h1>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="text-sm font-bold text-black mb-2 block">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해 주세요."
              className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm outline-none focus:border-[#FFC83D] focus:ring-2 focus:ring-[#FFC83D]/20 transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-bold text-black mb-2 block">학교 이메일</label>
            <div className="relative w-full">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="이메일 주소를 입력해 주세요."
                className={`w-full h-12 pl-4 pr-24 rounded-xl text-sm outline-none transition-all ${
                  emailError
                    ? "border-1.5 border-[#e35252] bg-[#fdf0f0] text-black focus:border-[#FFC83D] focus:ring-2 focus:ring-[#FFC83D]/20"
                    : "border border-gray-300 bg-white text-gray-900 focus:border-[#FFC83D] focus:ring-2 focus:ring-[#FFC83D]/20"
                }`}
              />
              <button
                type="button"
                onClick={handleVerifyEmail}
                disabled={!isEmailValidFormat || isEmailVerified}
                className={`absolute right-2 top-1/2 -translate-y-1/2 h-8.5 px-3.5 rounded-lg text-xs font-semibold border-none transition-colors flex items-center justify-center ${
                  isEmailVerified
                    ? "bg-emerald-500 text-white cursor-default"
                    : isEmailValidFormat
                    ? "bg-[#FFC83D] hover:bg-[#f0ba33] text-black font-bold cursor-pointer"
                    : "bg-gray-800 text-white cursor-not-allowed opacity-80"
                }`}
              >
                {isEmailVerified ? "인증완료" : "인증"}
              </button>
            </div>
            {emailError ? (
              <p className="text-[#e35252] text-xs font-medium mt-1.5">{emailError}</p>
            ) : (
              <p className="text-gray-400 text-xs mt-1.5">
                s00000@gsm.hs.kr 형식의 학교 이메일만 사용할 수 있어요.
              </p>
            )}
          </div>

          <div className="flex gap-3 w-full">
            <div className="flex-1">
              <label className="text-sm font-bold text-black mb-2 block">기수</label>
              <CustomSelect
                options={GENERATION_OPTIONS}
                value={generation}
                onChange={setGeneration}
                placeholder="기수 선택"
              />
            </div>

            <div className="flex-1">
              <label className="text-sm font-bold text-black mb-2 block">학과</label>
              <CustomSelect
                options={DEPARTMENT_OPTIONS}
                value={major}
                onChange={setMajor}
                placeholder="학과 선택"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-bold text-black mb-2 block">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="비밀번호를 입력해 주세요."
              className={`w-full h-12 px-4 rounded-xl text-sm outline-none transition-all placeholder:text-gray-400 ${
                passwordError
                  ? "border-1.5 border-[#e35252] bg-[#fdf0f0] text-black focus:border-[#FFC83D] focus:ring-2 focus:ring-[#FFC83D]/20"
                  : "border border-gray-300 bg-white text-gray-900 focus:border-[#FFC83D] focus:ring-2 focus:ring-[#FFC83D]/20"
              }`}
            />
            {passwordError ? (
              <p className="text-[#e35252] text-xs font-medium mt-1.5">{passwordError}</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1.5">
                <span className="text-[#FFC83D] font-bold mr-1">필수</span>
                영문 대소문자 + 숫자, 8자 이상 · 특수문자(&@#$! 등) 가능
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-bold text-black mb-2 block">비밀번호 확인</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={handlePasswordConfirmChange}
              placeholder="비밀번호를 다시 입력해 주세요."
              className={`w-full h-12 px-4 rounded-xl text-sm outline-none transition-all placeholder:text-gray-400 ${
                passwordConfirmError
                  ? "border-1.5 border-[#e35252] bg-[#fdf0f0] text-black focus:border-[#FFC83D] focus:ring-2 focus:ring-[#FFC83D]/20"
                  : "border border-gray-300 bg-white text-gray-900 focus:border-[#FFC83D] focus:ring-2 focus:ring-[#FFC83D]/20"
              }`}
            />
            {passwordConfirmError && (
              <p className="text-[#e35252] text-xs font-medium mt-1.5">{passwordConfirmError}</p>
            )}
          </div>

          {submitError && (
            <p className="text-[#e35252] text-sm font-medium">{submitError}</p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={!isSubmitActive || isSubmitting}
              className={`w-full h-12 font-bold text-base rounded-xl transition-all cursor-pointer flex items-center justify-center border-none ${
                isSubmitActive && !isSubmitting
                  ? "bg-[#FFC83D] hover:bg-[#f0ba33] text-black shadow-sm"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "가입 중..." : "회원가입"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
