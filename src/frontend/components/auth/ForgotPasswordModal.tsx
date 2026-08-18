"use client";

import { useState } from "react";
import Modal from "@/frontend/components/ui/Modal";
import Alert from "@/frontend/components/ui/Alert";

// ============================================================
// 비밀번호 찾기 팝업
//
// [비개발자 설명]
// 가입한 이메일을 입력하면 "비밀번호 재설정 링크"를 메일로 보냅니다.
// 링크는 30분이 지나면 사용할 수 없습니다.
//
// 보안상, 가입되지 않은 이메일을 넣어도 "발송했습니다"라고 답합니다.
// (그래야 외부인이 "이 이메일이 가입돼 있구나"를 알아낼 수 없습니다)
// ============================================================

export default function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setIsSent(true);
      } else {
        setErrorMessage(data.message);
      }
    } catch {
      setErrorMessage("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal title="비밀번호 찾기" onClose={onClose}>
      {!isSent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-500 break-keep">
            가입한 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.
          </p>
          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 입력"
              required
              className="input-field"
              autoFocus
            />
          </div>

          <Alert tone="error">{errorMessage}</Alert>

          <button type="submit" disabled={isLoading} className="w-full btn-primary">
            {isLoading ? "발송 중..." : "재설정 링크 발송"}
          </button>
        </form>
      ) : (
        <div className="text-center py-2">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-700 font-medium mb-1">이메일을 발송했습니다!</p>
          <p className="text-sm text-gray-400 mb-5 break-keep">
            받은 편지함을 확인해주세요.
            <br />
            링크는 30분 후 만료됩니다.
          </p>
          <button type="button" onClick={onClose} className="w-full btn-primary">
            확인
          </button>
        </div>
      )}
    </Modal>
  );
}
