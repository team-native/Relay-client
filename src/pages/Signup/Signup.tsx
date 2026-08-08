import React, { useState, useRef, useEffect } from "react";
import { Link, useInRouterContext} from "react-router-dom";

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

interface SafeLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function SafeLink({ to, children, className, style }: SafeLinkProps) {
  let inRouter = false;
  try {
    inRouter = useInRouterContext();
  } catch {
    inRouter = false;
  }

  if (inRouter) {
    return (
      <Link to={to} className={className} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <a href={to} className={className} style={style}>
      {children}
    </a>
  );
}

export function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [step, setStep] = useState<"form" | "verify">("form");

  const [generation, setGeneration] = useState("");
  const [isGenerationOpen, setIsGenerationOpen] = useState(false);

  const [major, setMajor] = useState("");
  const [isMajorOpen, setIsMajorOpen] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const genRef = useRef<HTMLDivElement>(null);
  const majorRef = useRef<HTMLDivElement>(null);

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
  const isEmailValidFormat = emailRegex.test(email.trim()) || (email.includes("@gsm.hs.kr") && email.trim().length >= 10);

  const isAllFilled =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    generation.length > 0 &&
    major.length > 0 &&
    password.length >= 8 &&
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
    setStep("verify");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (passwordConfirm && val !== passwordConfirm) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordError("");
    }
  };

  const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPasswordConfirm(val);
    if (password && val !== password) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSubmitActive) return;

    alert("가입되었습니다.");

    window.location.href = "/login";
  };

  if (step === "verify") {
    return (
      <VerifyEmail
        email={email}
        onVerifySuccess={() => {
          setIsEmailVerified(true);
          setStep("form");
        }}
        onBack={() => setStep("form")}
      />
    );
  }

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
        padding: "32px 16px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box"
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 800,
            color: "#000000",
            textAlign: "center",
            margin: "0 0 36px 0",
            lineHeight: 1.2,
            letterSpacing: "-0.02em"
          }}
        >
          회원가입
        </h1>

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#000000",
                marginBottom: "8px",
                display: "block"
              }}
            >
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해 주세요."
              style={{
                width: "100%",
                height: "48px",
                padding: "0 16px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                color: "#111827",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s ease"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#000000",
                marginBottom: "8px",
                display: "block"
              }}
            >
              학교 이메일
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="이메일 주소를 입력해 주세요."
                style={{
                  width: "100%",
                  height: "48px",
                  paddingLeft: "16px",
                  paddingRight: "80px",
                  borderRadius: "12px",
                  border: emailError ? "1.5px solid #e35252" : "1px solid #d1d5db",
                  backgroundColor: emailError ? "#fdf0f0" : "#ffffff",
                  color: "#111827",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "all 0.15s ease"
                }}
              />

              <button
                type="button"
                onClick={handleVerifyEmail}
                disabled={!isEmailValidFormat || isEmailVerified}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  height: "34px",
                  padding: "0 16px",
                  borderRadius: "8px",
                  backgroundColor: isEmailVerified
                    ? "#10b981"
                    : isEmailValidFormat
                    ? "#FFC83D"
                    : "#2b2b2b",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  cursor: isEmailValidFormat && !isEmailVerified ? "pointer" : "default",
                  transition: "background-color 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {isEmailVerified ? "인증완료" : "인증"}
              </button>
            </div>

            {emailError ? (
              <p style={{ color: "#e35252", fontSize: "12px", margin: "6px 0 0 0", fontWeight: 500 }}>
                {emailError}
              </p>
            ) : (
              <p style={{ color: "#a0a0a0", fontSize: "12px", margin: "6px 0 0 0", fontWeight: 400 }}>
                s00000@gsm.hs.kr 형식의 학교 이메일만 사용할 수 있어요.
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            
            <div ref={genRef} style={{ flex: 1, position: "relative" }}>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#000000",
                  marginBottom: "8px",
                  display: "block"
                }}
              >
                기수
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsGenerationOpen(!isGenerationOpen);
                  setIsMajorOpen(false);
                }}
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 16px",
                  borderRadius: "12px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                  color: generation ? "#111827" : "#a0a0a0",
                  fontSize: "14px",
                  outline: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  boxSizing: "border-box"
                  
                }}
              >
                <span>{generation || "기수를 선택해 주세요."}</span>
                <svg
                  style={{
                    width: "16px",
                    height: "16px",
                    color: "#6b7280",
                    transform: isGenerationOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease"
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isGenerationOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    zIndex: 20,
                    overflow: "hidden",
                    padding: "4px 0"
                  }}
                >
                  {["8기", "9기", "10기"].map((item) => (
                    <div
                      key={item}
                      onClick={() => {
                        setGeneration(item);
                        setIsGenerationOpen(false);
                      }}
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                        fontWeight: generation === item ? 700 : 500,
                        color: "#111827",
                        backgroundColor: generation === item ? "#FFF8E7" : "transparent",
                        cursor: "pointer",
                        transition: "background-color 0.15s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = generation === item ? "#FFEAA7" : "#FFC83D";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = generation === item ? "#FFF8E7" : "transparent";
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div ref={majorRef} style={{ flex: 1, position: "relative" }}>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#000000",
                  marginBottom: "8px",
                  display: "block"
                }}
              >
                학과
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsMajorOpen(!isMajorOpen);
                  setIsGenerationOpen(false);
                }}
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 16px",
                  borderRadius: "12px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                  color: major ? "#111827" : "#a0a0a0",
                  fontSize: "14px",
                  outline: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  boxSizing: "border-box"
                }}
              >
                <span>{major || "학과를 선택해 주세요."}</span>
                <svg
                  style={{
                    width: "16px",
                    height: "16px",
                    color: "#6b7280",
                    transform: isMajorOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease"
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isMajorOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    zIndex: 20,
                    overflow: "hidden",
                    padding: "4px 0"
                  }}
                >
                  {["소프트웨어개발과", "스마트IoT과", "AI과"].map((item) => (
                    <div
                      key={item}
                      onClick={() => {
                        setMajor(item);
                        setIsMajorOpen(false);
                      }}
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                        fontWeight: major === item ? 700 : 500,
                        color: "#111827",
                        backgroundColor: major === item ? "#FFF8E7" : "transparent",
                        cursor: "pointer",
                        transition: "background-color 0.15s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = major === item ? "#FFEAA7" : "#FFC83D";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = major === item ? "#FFF8E7" : "transparent";
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#000000",
                marginBottom: "8px",
                display: "block"
              }}
            >
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="비밀번호를 입력해 주세요."
              style={{
                width: "100%",
                height: "48px",
                padding: "0 16px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                color: "#111827",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
            <p style={{ fontSize: "12px", color: "#9ca3af", margin: "6px 0 0 0" }}>
              <span style={{ color: "#FFC83D", fontWeight: 700, marginRight: "4px" }}>필수</span>
              영문 대소문자 + 숫자, 8자 이상 · 특수문자(&@#$! 등) 사용 가능
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#000000",
                marginBottom: "8px",
                display: "block"
              }}
            >
              비밀번호 확인
            </label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={handlePasswordConfirmChange}
              placeholder="비밀번호를 다시 입력해 주세요."
              style={{
                width: "100%",
                height: "48px",
                padding: "0 16px",
                borderRadius: "12px",
                border: passwordError ? "1.5px solid #e35252" : "1px solid #d1d5db",
                backgroundColor: passwordError ? "#fdf0f0" : "#ffffff",
                color: "#111827",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                transition: "all 0.15s ease"
              }}
            />
            {passwordError && (
              <p style={{ color: "#e35252", fontSize: "12px", margin: "6px 0 0 0", fontWeight: 500 }}>
                {passwordError}
              </p>
            )}
          </div>

          <div style={{ paddingTop: "12px" }}>
            <button
              type="submit"
              disabled={!isSubmitActive}
              style={{
                width: "100%",
                height: "48px",
                backgroundColor: isSubmitActive ? "#FFC83D" : "#c0c0c0",
                color: "#ffffff",
                fontWeight: 700,
                borderRadius: "12px",
                fontSize: "15px",
                border: "none",
                cursor: isSubmitActive ? "pointer" : "not-allowed",
                transition: "background-color 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              회원가입
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: "8px" }}>
            <SafeLink
              to="/login"
              style={{
                fontSize: "13px",
                color: "#6b7280",
                textDecoration: "underline",
                cursor: "pointer"
              }}
            >
              이미 계정이 있으신가요? 로그인하기
            </SafeLink>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Signup;