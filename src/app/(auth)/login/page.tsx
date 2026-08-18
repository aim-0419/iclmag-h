"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Alert from "@/frontend/components/ui/Alert";
import FindEmailModal from "@/frontend/components/auth/FindEmailModal";
import ForgotPasswordModal from "@/frontend/components/auth/ForgotPasswordModal";

// ============================================================
// 로그인 화면 (주소: /login )
//
// [비개발자 설명]
// 아이디(이름) 또는 이메일 + 비밀번호로 로그인합니다.
// 아직 이메일 인증을 하지 않은 계정은 로그인할 수 없으며,
// 이 경우 인증 화면으로 갈 수 있는 링크를 함께 보여줍니다.
//
// "아이디 찾기", "비밀번호 찾기" 팝업은 별도 파일로 분리했습니다.
//   src/frontend/components/auth/
// ============================================================

/** 어떤 팝업이 열려 있는지 */
type OpenModal = "find-email" | "forgot-password" | null;

function LoginForm() {
  const searchParams = useSearchParams();

  const [emailOrName, setEmailOrName] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  /** 이메일 미인증으로 로그인이 막혔는지 여부 (인증 화면 링크 표시용) */
  const [isUnverified, setIsUnverified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState<OpenModal>(null);

  // 이메일 인증을 막 끝내고 돌아온 경우 축하 문구를 보여줍니다.
  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      setNoticeMessage("이메일 인증이 완료되었습니다! 이제 로그인하세요.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsUnverified(false);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailOrName.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "EMAIL_NOT_VERIFIED") {
          setErrorMessage("이메일 인증이 완료되지 않았습니다.");
          setIsUnverified(true);
        } else {
          setErrorMessage(data.message || "로그인에 실패했습니다.");
        }
        return;
      }

      // 로그인 성공 → 홈으로 이동
      // (페이지 전체를 새로 읽어 헤더의 로그인 상태까지 갱신합니다)
      window.location.href = "/";
    } catch {
      setErrorMessage("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일 형태로 입력했다면 인증 화면에 주소를 미리 채워 보냅니다.
  const verifyEmailHref = emailOrName.includes("@")
    ? `/verify-email?email=${encodeURIComponent(emailOrName.trim())}`
    : "/verify-email";

  return (
    <>
      {/* 팝업 */}
      {openModal === "find-email" && <FindEmailModal onClose={() => setOpenModal(null)} />}
      {openModal === "forgot-password" && <ForgotPasswordModal onClose={() => setOpenModal(null)} />}

      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* 로고 */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-1">
              <span className="text-accent font-black text-3xl">ICL</span>
              <span className="font-light text-2xl text-gray-700">MAG-H</span>
            </Link>
            <p className="text-gray-500 text-sm mt-2">계속하려면 로그인하세요</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">로그인</h1>

            <Alert tone="success" className="mb-5">
              {noticeMessage}
            </Alert>

            <Alert tone="error" className="mb-5">
              {errorMessage && (
                <>
                  {errorMessage}
                  {/* 미인증 계정이면 인증 화면으로 바로 갈 수 있게 안내합니다. */}
                  {isUnverified && (
                    <>
                      {" "}
                      <Link href={verifyEmailHref} className="underline font-medium">
                        인증 코드 입력하러 가기 →
                      </Link>
                    </>
                  )}
                </>
              )}
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-id" className="block text-sm font-medium text-gray-700 mb-1">
                  아이디 또는 이메일
                </label>
                <input
                  id="login-id"
                  type="text"
                  value={emailOrName}
                  onChange={(e) => setEmailOrName(e.target.value)}
                  placeholder="아이디 또는 이메일을 입력하세요"
                  required
                  className="input-field"
                  autoComplete="username"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  className="input-field"
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" disabled={isLoading} className="w-full btn-primary mt-2">
                {isLoading ? "로그인 중..." : "로그인"}
              </button>
            </form>

            {/* 아이디 / 비밀번호 찾기 */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
              <button
                type="button"
                onClick={() => setOpenModal("find-email")}
                className="hover:text-gray-600 transition-colors"
              >
                아이디 찾기
              </button>
              <span aria-hidden>|</span>
              <button
                type="button"
                onClick={() => setOpenModal("forgot-password")}
                className="hover:text-gray-600 transition-colors"
              >
                비밀번호 찾기
              </button>
            </div>

            <div className="text-center mt-5 text-sm text-gray-500">
              아직 계정이 없으신가요?{" "}
              <Link href="/register" className="text-accent hover:underline">
                회원가입
              </Link>
            </div>
          </div>

          <p className="text-center mt-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
              ← 홈으로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  // useSearchParams 를 쓰는 화면은 Suspense 로 감싸야 합니다. (Next.js 규칙)
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <LoginForm />
    </Suspense>
  );
}
