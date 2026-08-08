import React, { useState, useRef, useEffect } from "react";

export interface VerifyEmailProps {
  email: string;
  onVerifySuccess: () => void;
  onBack?: () => void;
}

export function VerifyEmail({ email, onVerifySuccess, onBack }: VerifyEmailProps) {
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
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")} : ${String(secs).padStart(2, "0")}`;
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

  const handleResendOtp = () => {
    setTimeLeft(180);
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    otpRefs.current[0]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");

    if (timeLeft <= 0) {
      setOtpError("인증 시간이 만료되었습니다. 재발송 버튼을 눌러주세요.");
      return;
    }

    if (code.length < 6) {
      setOtpError("인증번호 6자리를 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onVerifySuccess();
    }, 400);
  };

  return (
    <div
      className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 sm:p-8 font-sans antialiased select-none"
      style={{
        boxSizing: "border-box",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: 0,
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              alignSelf: "flex-start",
              background: "none",
              border: "none",
              color: "#6b7280",
              fontSize: "14px",
              cursor: "pointer",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            ← 이메일 재입력
          </button>
        )}

        <h1
          style={{
            fontSize: "30px",
            fontWeight: 800,
            color: "#000000",
            textAlign: "center",
            margin: "0 0 12px 0",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          인증번호를 입력해주세요
        </h1>

        <p
          style={{
            fontSize: "15px",
            color: "#555555",
            textAlign: "center",
            margin: "0 0 32px 0",
            fontWeight: 500,
            wordBreak: "break-all",
          }}
        >
          <span style={{ color: "#FFC83D", fontWeight: 700 }}>
            {email || "입력한 이메일"}
          </span>
          로 인증번호 6자리를 보냈어요.
        </p>

        {}
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              marginBottom: "16px",
              width: "100%",
            }}
          >
            {otp.map((digit, idx) => {
              const isFocused = otpRefs.current[idx] === document.activeElement;
              const isFilled = digit !== "";

              return (
                <input
                  key={idx}
                  ref={(el) => {
                    otpRefs.current[idx] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  style={{
                    width: "52px",
                    height: "60px",
                    borderRadius: "14px",
                    border: isFilled || isFocused ? "2px solid #FFC83D" : "1.5px solid #d1d5db",
                    backgroundColor: "#ffffff",
                    fontSize: "26px",
                    fontWeight: 700,
                    textAlign: "center",
                    color: "#000000",
                    outline: "none",
                    transition: "border-color 0.15s ease",
                    boxSizing: "border-box",
                  }}
                />
              );
            })}
          </div>

          {otpError ? (
            <p
              style={{
                color: "#e35252",
                fontSize: "13px",
                fontWeight: 500,
                margin: "0 0 24px 0",
                textAlign: "center",
              }}
            >
              {otpError}
            </p>
          ) : (
            <div style={{ height: "13px", marginBottom: "24px" }} />
          )}

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#FFEAA7",
              padding: "8px 20px",
              borderRadius: "9999px",
              marginBottom: "32px",
            }}
          >
            <svg
              style={{ width: "16px", height: "16px", color: "#111827" }}
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
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#111827",
                letterSpacing: "0.02em",
              }}
            >
              남은 시간 {formatTime(timeLeft)}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              maxWidth: "360px",
              height: "50px",
              backgroundColor: "#2d2d2d",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 700,
              borderRadius: "12px",
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              marginBottom: "20px",
              transition: "background-color 0.2s ease",
            }}
          >
            {isSubmitting ? "인증 확인 중..." : "인증 완료"}
          </button>

          <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
            이메일을 받지 못하셨나요?{" "}
            <span
              onClick={handleResendOtp}
              style={{
                fontWeight: 700,
                color: "#111827",
                borderBottom: "2px solid #FFC83D",
                paddingBottom: "1px",
                cursor: "pointer",
              }}
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