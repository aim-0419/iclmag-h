"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Alert from "@/frontend/components/ui/Alert";

// ============================================================
// 비밀번호 재설정 화면 (주소: /reset-password?token=임시열쇠 )
//
// [비개발자 설명]
// "비밀번호 찾기"로 받은 메일의 버튼을 누르면 오는 화면입니다.
// 주소에 들어 있는 임시 열쇠(token)로 본인 확인을 대신하므로
// 이전 비밀번호를 몰라도 새 비밀번호를 정할 수 있습니다.
// 열쇠는 발급 후 30분이 지나면 사용할 수 없습니다.
// ============================================================

type SubmitStatus = "idle" | "loading" | "success" | "error";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [message, setMessage] = useState("");

  // 주소에 열쇠가 없으면 잘못 들어온 것입니다.
  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">올바르지 않은 링크입니다.</p>
          <Link href="/login" className="text-accent hover:underline">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      setStatus("error");
      setMessage("비밀번호가 서로 일치하지 않습니다.");
      return;
    }
    if (password.length < 8) {
      setStatus("error");
      setMessage("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message);
        // 잠시 후 자동으로 로그인 화면으로 이동합니다.
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setStatus("error");
        setMessage(data.message);
      }
    } catch {
      setStatus("error");
      setMessage("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
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
          {status === "success" ? (
            // 변경 완료 화면
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">비밀번호 변경 완료!</h1>
              <p className="text-gray-500 text-sm">{message}</p>
              <p className="text-gray-400 text-xs mt-3">잠시 후 로그인 화면으로 이동합니다...</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">새 비밀번호 설정</h1>
              <p className="text-sm text-gray-500 mb-6">8자 이상의 새 비밀번호를 입력해주세요.</p>

              <Alert tone={status === "error" ? "error" : "info"} className="mb-5">
                {message}
              </Alert>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                    새 비밀번호
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8자 이상 입력"
                    required
                    autoComplete="new-password"
                    className="input-field"
                    autoFocus
                  />
                </div>
                <div>
                  <label
                    htmlFor="new-password-confirm"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    비밀번호 확인
                  </label>
                  <input
                    id="new-password-confirm"
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="비밀번호 재입력"
                    required
                    autoComplete="new-password"
                    className="input-field"
                  />
                </div>
                <button type="submit" disabled={status === "loading"} className="w-full btn-primary mt-2">
                  {status === "loading" ? "변경 중..." : "비밀번호 변경"}
                </button>
              </form>
            </>
          )}
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

export default function ResetPasswordPage() {
  // useSearchParams 를 쓰는 화면은 Suspense 로 감싸야 합니다. (Next.js 규칙)
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
