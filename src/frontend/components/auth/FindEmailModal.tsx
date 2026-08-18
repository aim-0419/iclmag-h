"use client";

import { useState } from "react";
import Modal from "@/frontend/components/ui/Modal";
import Alert from "@/frontend/components/ui/Alert";

// ============================================================
// 아이디(이메일) 찾기 팝업
//
// [비개발자 설명]
// 가입할 때 쓴 "이름"을 입력하면 그 이름으로 가입된 이메일을 알려줍니다.
// 다만 이메일 전체를 그대로 보여주면 다른 사람이 남의 주소를 알아낼 수
// 있으므로, 앞 3글자만 남기고 나머지는 ***** 로 가려서 보여줍니다.
// ============================================================

/** 서버가 돌려주는 계정 한 건 */
interface MaskedAccount {
  email: string;
  createdAt: string;
}

export default function FindEmailModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [accounts, setAccounts] = useState<MaskedAccount[] | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setAccounts(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/find-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setAccounts(data.accounts);
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
    <Modal title="아이디(이메일) 찾기" onClose={onClose}>
      {!accounts ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="find-email-name" className="block text-sm font-medium text-gray-700 mb-1">
              가입 시 입력한 이름
            </label>
            <input
              id="find-email-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름 입력"
              required
              className="input-field"
              autoFocus
            />
          </div>

          <Alert tone="error">{errorMessage}</Alert>

          <button type="submit" disabled={isLoading} className="w-full btn-primary">
            {isLoading ? "조회 중..." : "아이디 찾기"}
          </button>
        </form>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-4">해당 이름으로 가입된 계정입니다:</p>
          <ul className="space-y-2 mb-5">
            {accounts.map((account) => (
              <li key={account.email} className="bg-gray-50 rounded-lg px-4 py-3">
                {/* break-all : 긴 이메일 주소가 팝업 밖으로 넘치지 않게 합니다. */}
                <p className="font-mono font-semibold text-gray-900 break-all">{account.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">가입일: {account.createdAt}</p>
              </li>
            ))}
          </ul>
          <button type="button" onClick={onClose} className="w-full btn-primary">
            확인
          </button>
        </div>
      )}
    </Modal>
  );
}
