"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ====================================
// 회원가입 페이지
// 1단계: 이름/이메일/비밀번호 입력
// 2단계: 이메일로 받은 6자리 인증 코드 입력
// ====================================

export default function RegisterPage() {
  const router = useRouter();

  // ── 1단계: 가입 폼 상태 ──────────────────
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ── 2단계: 인증 코드 입력 상태 ───────────
  const [step, setStep] = useState<1 | 2>(1);           // 현재 단계
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""]); // 6칸
  const [codeError, setCodeError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ====================================
  // 1단계: 회원가입 폼 제출
  // ====================================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // 클라이언트 유효성 검증
    const clientErrors: string[] = [];
    if (!name.trim() || name.length < 2) clientErrors.push("이름은 최소 2자 이상이어야 합니다.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) clientErrors.push("올바른 이메일 형식을 입력해주세요.");
    if (!password || password.length < 8) clientErrors.push("비밀번호는 최소 8자 이상이어야 합니다.");
    if (password !== passwordConfirm) clientErrors.push("비밀번호가 일치하지 않습니다.");
    if (clientErrors.length > 0) { setErrors(clientErrors); return; }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors || [data.message || "회원가입에 실패했습니다."]);
        return;
      }

      // 성공 → 2단계 코드 입력 화면으로 전환
      setStep(2);
    } catch {
      setErrors(["서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."]);
    } finally {
      setIsLoading(false);
    }
  };

  // ====================================
  // 2단계: 코드 입력 핸들링
  // ====================================

  /**
   * 각 칸에 숫자 입력 시 처리
   * 숫자만 허용, 입력 후 다음 칸으로 자동 이동
   */
  const handleCodeInput = (index: number, value: string) => {
    // 숫자만 허용
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...codeDigits];
    newDigits[index] = digit;
    setCodeDigits(newDigits);
    setCodeError("");

    // 입력 완료 시 다음 칸으로 포커스 이동
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // 6칸 모두 입력됐으면 자동 제출
    if (digit && index === 5) {
      const fullCode = [...newDigits.slice(0, 5), digit].join("");
      if (fullCode.length === 6) submitCode(fullCode);
    }
  };

  /**
   * 백스페이스 키 처리
   * 현재 칸이 비어있으면 이전 칸으로 이동
   */
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * 붙여넣기 처리 (6자리 코드 한 번에 붙이기)
   */
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...codeDigits];
      pasted.split("").forEach((ch, i) => { if (i < 6) newDigits[i] = ch; });
      setCodeDigits(newDigits);
      // 마지막으로 채워진 칸으로 포커스
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
      if (pasted.length === 6) submitCode(pasted);
    }
  };

  /**
   * 인증 코드 제출
   */
  const submitCode = async (code: string) => {
    setIsVerifying(true);
    setCodeError("");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (data.success) {
        // 인증 완료 → 로그인 페이지로 이동
        router.push("/login?verified=1");
      } else {
        setCodeError(data.message);
        // 오류 시 칸 초기화
        setCodeDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setCodeError("서버 오류가 발생했습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * 인증 코드 재발송
   */
  const handleResend = async () => {
    setIsResending(true);
    setCodeError("");
    setCodeDigits(["", "", "", "", "", ""]);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      inputRefs.current[0]?.focus();
    } catch {
      setCodeError("재발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsResending(false);
    }
  };

  // ====================================
  // 렌더링
  // ====================================
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-accent font-black text-3xl">ICL</span>
            <span className="font-light text-2xl text-gray-700">MAG</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">
            {step === 1 ? "새 계정을 만들어보세요" : "이메일로 발송된 인증 코드를 입력하세요"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* ──────────────────────────────
              1단계: 회원가입 폼
              ────────────────────────────── */}
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">회원가입</h1>

              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
                  <ul className="space-y-1">
                    {errors.map((err, i) => <li key={i}>• {err}</li>)}
                  </ul>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력하세요" required className="input-field" autoComplete="name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일을 입력하세요" required className="input-field" autoComplete="email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호 <span className="text-gray-400 font-normal">(최소 8자)</span>
                  </label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요" required className="input-field" autoComplete="new-password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
                  <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요" required
                    className={`input-field ${passwordConfirm && password !== passwordConfirm ? "border-red-300 ring-2 ring-red-100" : ""}`}
                    autoComplete="new-password" />
                  {passwordConfirm && password !== passwordConfirm && (
                    <p className="text-red-500 text-xs mt-1">비밀번호가 일치하지 않습니다.</p>
                  )}
                </div>
                <button type="submit" disabled={isLoading} className="w-full btn-primary mt-2">
                  {isLoading ? "처리 중..." : "회원가입"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                이미 계정이 있으신가요?{" "}
                <Link href="/login" className="text-accent font-medium hover:underline">로그인</Link>
              </p>
            </>
          )}

          {/* ──────────────────────────────
              2단계: 인증 코드 입력
              ────────────────────────────── */}
          {step === 2 && (
            <>
              {/* 헤더 */}
              <div className="text-center mb-7">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">인증 코드 입력</h2>
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{email}</span>으로<br />
                  6자리 인증 코드를 발송했습니다.
                </p>
              </div>

              {/* 6칸 코드 입력 */}
              <div className="flex justify-center gap-2 mb-5">
                {codeDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeInput(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className={`w-11 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all
                      ${digit ? "border-accent text-gray-900" : "border-gray-200 text-gray-400"}
                      ${codeError ? "border-red-400 bg-red-50" : "focus:border-accent"}
                    `}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {/* 오류 메시지 */}
              {codeError && (
                <p className="text-center text-sm text-red-600 mb-4">{codeError}</p>
              )}

              {/* 로딩 표시 */}
              {isVerifying && (
                <p className="text-center text-sm text-gray-400 mb-4">인증 확인 중...</p>
              )}

              {/* 안내 문구 */}
              <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-400 text-center mb-5">
                📌 코드는 <strong>10분</strong> 동안 유효합니다.<br />
                메일이 안 보이면 스팸함도 확인해주세요.
              </div>

              {/* 재발송 버튼 */}
              <button
                onClick={handleResend}
                disabled={isResending}
                className="w-full text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 disabled:opacity-50"
              >
                {isResending ? "발송 중..." : "코드를 받지 못했나요? 재발송"}
              </button>
            </>
          )}

        </div>

        <p className="text-center mt-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            ← 홈으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
