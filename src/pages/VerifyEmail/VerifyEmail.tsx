import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface VerifyEmailLocationState {
  email?: string;
}

export function VerifyEmail() {
  let navigate: ((path: string, options?: { state?: unknown }) => void) | null = null;
  try {
    navigate = useNavigate();
  } catch {
    navigate = null;
  }

  let location: { state?: unknown } | null = null;
  try {
    location = useLocation();
  } catch {
    location = null;
  }

  const email = ((location?.state as VerifyEmailLocationState) || {}).email || "";

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft]);

  useEffect(() => {
  otpRefs.current[0]?.focus();
  sendEmail();
}, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")} : ${String(secs).padStart(2, "0")}`;
  };

  const sendEmail = async () => {
  if (!email) return;

  try {
    const response = await fetch("https://relayplus.kr:34308/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error("이메일 발송 실패");
    }
  } catch (error) {
    console.error(error);
    setOtpError("인증 메일 발송에 실패했습니다.");
  }
};

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError("");

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      setOtpError("");
      otpRefs.current[5]?.focus();
    }
  };

  const handleResendOtp = async () => {
  setTimeLeft(180);
  setOtp(["", "", "", "", "", ""]);
  setOtpError("");
  otpRefs.current[0]?.focus();

  await sendEmail();
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");

    if (timeLeft <= 0) {
      setOtpError("인증 시간이 만료되었습니다. 재발송 버튼을 눌러주세요.");
      return;
    }

    if (code.length < 6) {
      setOtpError("인증번호가 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      if (navigate) {
        navigate("/signup", { state: { verified: true, email } });
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] flex flex-col items-center justify-center p-4 sm:p-8 font-sans antialiased">
      <div>
        <h1 className="text-[28px] sm:text-[30px] font-extrabold text-black text-center mb-3 leading-tight tracking-tight">
          인증번호를 입력해주세요
        </h1>

        <p className="text-[14px] sm:text-[15px] text-[#555555] text-center mb-8 font-medium break-all leading-relaxed">
          <span className="text-[#d99f00] font-bold mr-1">
            {email || "입력한 이메일"}
          </span>
          로 인증번호 6자리를 보냈어요.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <div className="flex gap-2 sm:gap-2.5 justify-center mb-4 w-full">
            {otp.map((digit, idx) => {
              const isFilled = digit !== "";

              return (
                <input
                  key={idx}
                  ref={(el) => {
                    otpRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className={`w-11 h-14 sm:w-13 sm:h-16 rounded-2xl text-center text-2xl font-bold text-black outline-none transition-all ${
                    isFilled
                      ? "border-2 border-[#FFC83D] bg-white ring-2 ring-[#FFC83D]/20"
                      : "border border-gray-300 bg-gray-50 hover:border-[#FFC83D] focus:border-[#FFC83D] focus:bg-white"
                  }`}
                />
              );
            })}
          </div>

          {otpError ? (
            <p className="text-[#e35252] text-xs font-medium mb-6 text-center">
              {otpError}
            </p>
          ) : (
            <div className="h-[18px] mb-6" />
          )}

          <div className="inline-flex items-center gap-2 bg-[#FFEAA7] px-5 py-2 rounded-full mb-8">
            <svg
              className="w-4 h-4 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-bold text-gray-900 tracking-wide">
              남은 시간 {formatTime(timeLeft)}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[50px] bg-[#2d2d2d] hover:bg-black text-white text-base font-bold rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed mb-5 shadow-sm"
          >
            {isSubmitting ? "인증 확인 중..." : "인증 완료"}
          </button>

          <p className="text-xs text-gray-500 m-0">
            이메일을 받지 못하셨나요?{" "}
            <span
              onClick={handleResendOtp}
              className="font-bold text-gray-900 border-b-2 border-[#FFC83D] pb-0.5 cursor-pointer hover:text-[#FFC83D] transition-colors"
            >
              재발송
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default VerifyEmail;