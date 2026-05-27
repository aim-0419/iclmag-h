"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// ====================================
// 로그인 페이지
// 이메일 + 비밀번호로 로그인 처리
// ====================================

export default function LoginPage() {
  const searchParams = useSearchParams();

  // 폼 상태 관리
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 인증 완료 후 리다이렉트 시 안내 메시지
  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      setNotice("이메일 인증이 완료되었습니다! 이제 로그인하세요.");
    }
  }, [searchParams]);

  /**
   * 로그인 폼 제출 처리
   * /api/auth/login 엔드포인트로 자격증명 전송
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 이메일 미인증 계정 → 안내 메시지 표시
        if (data.code === "EMAIL_NOT_VERIFIED") {
          setError("이메일 인증이 완료되지 않았습니다. 가입 시 발송된 인증 메일을 확인해주세요.");
        } else {
          setError(data.message || "로그인에 실패했습니다.");
        }
        return;
      }

      // 로그인 성공 → 홈으로 강제 이동 (하드 리로드)
      // router.push()는 소프트 네비게이션이라 헤더의 useEffect가 재실행 안 됨
      // window.location.href 사용 시 전체 페이지가 새로 로드되어 로그인 상태 반영됨
      window.location.href = "/";
    } catch {
      setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-accent font-black text-3xl">ICL</span>
            <span className="font-light text-2xl text-gray-700">MAG</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">계속하려면 로그인하세요</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">로그인</h1>

          {/* 인증 완료 안내 */}
          {notice && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-5">
              ✅ {notice}
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이메일 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
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

            {/* 비밀번호 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                className="input-field"
                autoComplete="current-password"
              />
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary mt-2"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          {/* 회원가입 링크 */}
          <p className="text-center text-sm text-gray-500 mt-6">
            아직 계정이 없으신가요?{" "}
            <Link href="/register" className="text-accent font-medium hover:underline">
              회원가입
            </Link>
          </p>
        </div>

        {/* 홈으로 돌아가기 */}
        <p className="text-center mt-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            ← 홈으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
