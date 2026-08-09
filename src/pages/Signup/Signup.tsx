import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export interface SignupProps {
  onSignupSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

interface SignupLocationState {
  verified?: boolean;
  email?: string;
}

export function Signup({ onSignupSuccess }: SignupProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [generation, setGeneration] = useState("");
  const [isGenerationOpen, setIsGenerationOpen] = useState(false);

  const [major, setMajor] = useState("");
  const [isMajorOpen, setIsMajorOpen] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");

  const genRef = useRef<HTMLDivElement>(null);
  const majorRef = useRef<HTMLDivElement>(null);

  // VerifyEmail 페이지에서 인증 완료 후 돌아왔을 때 상태 반영
  useEffect(() => {
    const state = (location.state as SignupLocationState) || null;
    if (state?.verified) {
      setIsEmailVerified(true);
      if (state.email) {
        setEmail(state.email);
      }
      // state를 소비한 뒤 히스토리에서 제거 (뒤로가기 시 재적용 방지)
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (genRef.current && !genRef.current.contains(event.target as Node)) {
        setIsGenerationOpen(false);
      }
      if (majorRef.current && !majorRef.current.contains(event.target as Node)) {
        setIsMajorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const emailRegex = /^s\d{5}@gsm\.hs\.kr$/;
  const isEmailValidFormat =
    emailRegex.test(email.trim()) ||
    (email.includes("@gsm.hs.kr") && email.trim().length >= 10);

  // 비밀번호 정규식: 영문 대문자 최소 1개, 영문 소문자 최소 1개, 숫자 최소 1개, 8자 이상
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

  const handleVerifyEmail = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!isEmailValidFormat) {
      setEmailError("s00000@gsm.hs.kr 형식의 올바른 학교 이메일을 입력해 주세요.");
      return;
    }

    setEmailError("");

    // 이메일 인증 페이지로 이동, 입력한 이메일을 state로 전달
    navigate("/verify-email", { state: { email } });
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSubmitActive) return;

    alert("가입되었습니다.");

    navigate("/login");
    onSignupSuccess?.();
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[#f8f9fa]">
      <div className="w-full max-w-[480px] mx-auto bg-white rounded-[32px] p-8 sm:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col select-none">
        <h1 className="text-[30px] font-extrabold text-black text-center mb-8 leading-tight tracking-tight">
          회원가입
        </h1>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* 이름 */}
          <div className="flex flex-col">
            <label className="text-sm font-bold text-black mb-2 block">
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해 주세요."
              className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm outline-none focus:border-[#FFC83D] focus:ring-2 focus:ring-[#FFC83D]/20 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* 학교 이메일 */}
          <div className="flex flex-col">
            <label className="text-sm font-bold text-black mb-2 block">
              학교 이메일
            </label>
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
              <p className="text-[#e35252] text-xs font-medium mt-1.5">
                {emailError}
              </p>
            ) : (
              <p className="text-gray-400 text-xs mt-1.5">
                s00000@gsm.hs.kr 형식의 학교 이메일만 사용할 수 있어요.
              </p>
            )}
          </div>

          {/* 기수 및 학과 선택 Dropdowns */}
          <div className="flex gap-3 w-full">
            {/* 기수 Dropdown */}
            <div ref={genRef} className="flex-1 relative">
              <label className="text-sm font-bold text-black mb-2 block">
                기수
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsGenerationOpen(!isGenerationOpen);
                  setIsMajorOpen(false);
                }}
                className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white hover:bg-[#FFF8E7] hover:border-[#FFC83D] text-left text-sm outline-none flex items-center justify-between cursor-pointer focus:border-[#FFC83D] focus:ring-2 focus:ring-[#FFC83D]/20 transition-all"
              >
                <span className={generation ? "text-gray-900 font-medium" : "text-gray-400"}>
                  {generation || "기수 선택"}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    isGenerationOpen ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isGenerationOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-lg z-30 overflow-hidden py-1">
                  {["8기", "9기", "10기"].map((item) => {
                    const isSelected = generation === item;
                    return (
                      <div
                        key={item}
                        onClick={() => {
                          setGeneration(item);
                          setIsGenerationOpen(false);
                        }}
                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#FFF8E7] hover:bg-[#FFF8E7] font-bold text-gray-900"
                            : "text-gray-700 hover:bg-[#FFF8E7]"
                        }`}
                      >
                        {item}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 학과 Dropdown */}
            <div ref={majorRef} className="flex-1 relative">
              <label className="text-sm font-bold text-black mb-2 block">
                학과
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsMajorOpen(!isMajorOpen);
                  setIsGenerationOpen(false);
                }}
                className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white hover:bg-[#FFF8E7] hover:border-[#FFC83D] text-left text-sm outline-none flex items-center justify-between cursor-pointer focus:border-[#FFC83D] focus:ring-2 focus:ring-[#FFC83D]/20 transition-all"
              >
                <span className={major ? "text-gray-900 font-medium truncate" : "text-gray-400"}>
                  {major || "학과 선택"}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    isMajorOpen ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isMajorOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-lg z-30 overflow-hidden py-1">
                  {["소프트웨어개발과", "스마트IoT과", "AI과"].map((item) => {
                    const isSelected = major === item;
                    return (
                      <div
                        key={item}
                        onClick={() => {
                          setMajor(item);
                          setIsMajorOpen(false);
                        }}
                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#FFF8E7] hover:bg-[#FFF8E7] font-bold text-gray-900"
                            : "text-gray-700 hover:bg-[#FFF8E7]"
                        }`}
                      >
                        {item}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col">
            <label className="text-sm font-bold text-black mb-2 block">
              비밀번호
            </label>
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
              <p className="text-[#e35252] text-xs font-medium mt-1.5">
                {passwordError}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1.5">
                <span className="text-[#FFC83D] font-bold mr-1">필수</span>
                영문 대소문자 + 숫자, 8자 이상 · 특수문자(&@#$! 등) 가능
              </p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="flex flex-col">
            <label className="text-sm font-bold text-black mb-2 block">
              비밀번호 확인
            </label>
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
              <p className="text-[#e35252] text-xs font-medium mt-1.5">
                {passwordConfirmError}
              </p>
            )}
          </div>

          {/* 가입하기 버튼 */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!isSubmitActive}
              className={`w-full h-12 font-bold text-base rounded-xl transition-all cursor-pointer flex items-center justify-center border-none ${
                isSubmitActive
                  ? "bg-[#FFC83D] hover:bg-[#f0ba33] text-black shadow-sm"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
