"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Alert from "@/frontend/components/ui/Alert";

// ============================================================
// 이메일 인증 화면 (주소: /verify-email?email=주소 )
//
// [비개발자 설명]
// 회원가입을 하면 메일로 6자리 숫자 코드가 갑니다.
// 그 코드를 여기에 입력해야 로그인을 할 수 있습니다.
//
// ※ 예전에는 이 화면이 "메일 속 링크를 눌러 인증하는 방식"으로 만들어져
//    있었는데, 실제로 발송되는 메일에는 링크가 아니라 6자리 코드가
//    들어 있어서 인증을 끝낼 방법이 아예 없었습니다.
//    (= 가입은 되지만 아무도 로그인할 수 없는 상태)
//    지금은 메일 내용과 똑같이 "코드 입력" 방식으로 맞췄습니다.
// ============================================================

/** 인증 코드 자릿수 */
const CODE_LENGTH = 6;
/** 재발송 버튼을 다시 누를 수 있게 되기까지의 대기 시간(초) */
const RESEND_COOLDOWN_SECONDS = 60;

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 회원가입 직후 넘어오면 이메일이 자동으로 채워집니다.
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const codeInputRef = useRef<HTMLInputElement>(null);

  // 이메일이 이미 채워져 있으면 코드 칸에 바로 커서를 놓아줍니다.
  useEffect(() => {
    if (email) codeInputRef.current?.focus();
    // 첫 진입 시 한 번만 실행합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 재발송 대기 시간을 1초씩 줄입니다.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  /** 입력한 코드로 인증을 시도합니다. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (code.length !== CODE_LENGTH) {
      setErrorMessage(`인증 코드 ${CODE_LENGTH}자리를 모두 입력해주세요.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMessage("이메일 인증이 완료되었습니다! 로그인 화면으로 이동합니다.");
        setTimeout(() => router.push("/login?verified=1"), 1500);
        return;
      }
      setErrorMessage(data.message || "인증에 실패했습니다.");
    } catch {
      setErrorMessage("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /** 인증 코드를 다시 보냅니다. */
  const handleResend = async () => {
    if (!email.trim()) {
      setErrorMessage("가입한 이메일을 먼저 입력해주세요.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsResending(true);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMessage("인증 코드를 다시 보냈습니다. 메일함을 확인해주세요.");
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else {
        setErrorMessage(data.message || "재발송에 실패했습니다.");
      }
    } catch {
      setErrorMessage("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-accent font-black text-3xl">ICL</span>
            <span className="font-light text-2xl text-gray-700">MAG-H</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">이메일 인증</h1>
          <p className="text-sm text-gray-500 mb-6 break-keep">
            가입하신 메일로 보내드린 {CODE_LENGTH}자리 인증 코드를 입력해주세요.
            코드는 발송 후 10분 동안만 사용할 수 있습니다.
          </p>

          <Alert tone="error" className="mb-5">
            {errorMessage}
          </Alert>
          <Alert tone="success" className="mb-5">
            {successMessage}
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="verify-email" className="block text-sm font-medium text-gray-700 mb-1">
                가입 이메일
              </label>
              <input
                id="verify-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="가입한 이메일 주소"
                required
                autoComplete="email"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="verify-code" className="block text-sm font-medium text-gray-700 mb-1">
                인증 코드
              </label>
              {/*
                inputMode="numeric" : 휴대폰에서 숫자 키패드가 바로 열립니다.
                숫자만 남기고 6자리까지만 입력받습니다.
              */}
              <input
                id="verify-code"
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))
                }
                placeholder="000000"
                className="input-field text-center text-2xl font-bold tracking-[0.5em] pl-[0.5em]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !!successMessage}
              className="w-full btn-primary mt-2"
            >
              {isSubmitting ? "확인 중..." : "인증하기"}
            </button>
          </form>

          {/* 코드를 못 받았을 때 다시 보내기 */}
          <div className="text-center mt-5 text-sm text-gray-500">
            메일이 오지 않았나요?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || cooldown > 0}
              className="text-accent hover:underline disabled:text-gray-300 disabled:no-underline"
            >
              {cooldown > 0 ? `${cooldown}초 후 재발송` : isResending ? "발송 중..." : "코드 다시 받기"}
            </button>
          </div>
        </div>

        <p className="text-center mt-4">
          <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">
            ← 로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  // useSearchParams 를 쓰는 화면은 Suspense 로 감싸야 합니다. (Next.js 규칙)
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
