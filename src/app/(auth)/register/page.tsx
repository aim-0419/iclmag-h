"use client";

import { useState } from "react";
import Link from "next/link";

// ====================================
// 회원가입 페이지
// 일반 사용자는 role 입력 없이 USER 권한으로 가입됨
// ====================================

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.errors?.[0] || "회원가입에 실패했습니다.");
        return;
      }

      setIsSuccess(true);
      setMessage(data.message || "회원가입이 완료되었습니다. 이메일 인증 후 로그인해주세요.");
    } catch {
      setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-accent font-black text-3xl">ICL</span>
            <span className="font-light text-2xl text-gray-700">MAG-H</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">회원가입 후 이메일 인증을 완료해주세요</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">회원가입</h1>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-5">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-4">
              <Link href="/login" className="block w-full btn-primary text-center">
                로그인으로 이동
              </Link>
              <p className="text-xs text-gray-400 text-center">
                메일함에서 인증 링크를 확인한 뒤 로그인할 수 있습니다.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  required
                  minLength={2}
                  maxLength={50}
                  className="input-field"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  required
                  className="input-field"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8자 이상 입력"
                  required
                  minLength={8}
                  className="input-field"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호를 다시 입력"
                  required
                  minLength={8}
                  className="input-field"
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary mt-2"
              >
                {isLoading ? "가입 처리 중..." : "회원가입"}
              </button>
            </form>
          )}

          <div className="text-center mt-5 text-sm text-gray-500">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-accent hover:underline">
              로그인
            </Link>
          </div>
        </div>

        <p className="text-center mt-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            홈으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
