"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Alert from "@/frontend/components/ui/Alert";

// ============================================================
// 회원가입 화면 (주소: /register )
//
// [비개발자 설명]
// 이름·이메일·비밀번호를 받아 계정을 만듭니다.
// 가입에 성공하면 곧바로 "이메일 인증" 화면으로 넘어가고,
// 메일로 받은 6자리 코드를 입력해야 로그인할 수 있습니다.
//
// ※ 예전에는 가입 후 "메일의 인증 링크를 누르세요"라고 안내했지만
//    실제 메일에는 링크가 아니라 코드가 들어 있어 안내가 어긋났습니다.
// ============================================================

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // 두 비밀번호 칸이 서로 다르면 서버에 보내기 전에 걸러냅니다.
    if (password !== passwordConfirm) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
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
        setErrorMessage(data.message || data.errors?.[0] || "회원가입에 실패했습니다.");
        return;
      }

      // 가입 성공 → 인증 코드 입력 화면으로 이동 (이메일을 미리 채워서 전달)
      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch {
      setErrorMessage("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
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
          <p className="text-gray-500 text-sm mt-2">회원가입 후 이메일 인증을 완료해주세요</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">회원가입</h1>

          <Alert tone="error" className="mb-5">
            {errorMessage}
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                id="register-name"
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
              <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                id="register-email"
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
              <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                id="register-password"
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
              <label
                htmlFor="register-password-confirm"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                비밀번호 확인
              </label>
              <input
                id="register-password-confirm"
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

            <button type="submit" disabled={isLoading} className="w-full btn-primary mt-2">
              {isLoading ? "가입 처리 중..." : "회원가입"}
            </button>
          </form>

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
