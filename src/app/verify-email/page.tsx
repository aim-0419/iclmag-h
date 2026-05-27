"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ====================================
// 이메일 인증 완료 페이지
// /verify-email?token=xxx
// 이메일의 인증 링크 클릭 시 이동하는 페이지
// ====================================

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("올바르지 않은 인증 링크입니다.");
      return;
    }

    // 인증 API 호출
    fetch(`/api/auth/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("서버 오류가 발생했습니다.");
      });
  }, [token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* 로딩 */}
        {status === "loading" && (
          <div>
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-600">이메일 인증 중...</p>
          </div>
        )}

        {/* 성공 */}
        {status === "success" && (
          <div>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">인증 완료!</h1>
            <p className="text-gray-600 mb-8">{message}</p>
            <Link
              href="/login"
              className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              로그인하러 가기
            </Link>
          </div>
        )}

        {/* 실패 */}
        {status === "error" && (
          <div>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">인증 실패</h1>
            <p className="text-gray-600 mb-8">{message}</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/register"
                className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                다시 가입하기
              </Link>
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
