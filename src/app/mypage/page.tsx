"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/types";
import { useAuth } from "@/frontend/hooks/useAuth";
import Alert from "@/frontend/components/ui/Alert";
import Modal from "@/frontend/components/ui/Modal";

// ============================================================
// 마이페이지 (주소: /mypage )
//
// [비개발자 설명]
// 로그인한 사람만 볼 수 있는 내 계정 관리 화면입니다.
//   1) 계정 정보 확인 (이름 · 이메일 · 등급)
//   2) 이름 변경
//   3) 비밀번호 변경
//   4) 회원탈퇴 (비밀번호를 다시 확인한 뒤 처리)
// ============================================================

/** 등급 코드를 사람이 읽는 말로 바꾸기 */
const ROLE_LABELS: Record<Role, string> = {
  USER: "일반 회원",
  WRITER: "기자",
  ADMIN: "관리자",
};

/** 화면 안내 문구 (성공/실패 구분 포함) */
type FeedbackMessage = { tone: "success" | "error"; text: string } | null;

export default function MyPage() {
  const router = useRouter();
  const { user, isLoading, isLoggedIn, refetch } = useAuth();

  // 프로필 수정 입력값
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [feedback, setFeedback] = useState<FeedbackMessage>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 회원탈퇴 관련
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // 로그인하지 않았으면 로그인 화면으로 보냅니다.
  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.replace("/login");
  }, [isLoading, isLoggedIn, router]);

  // 내 정보를 불러오면 이름 칸에 현재 이름을 채워둡니다.
  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  /** 이름 변경 */
  const handleNameChange = async () => {
    if (!name.trim() || name.trim() === user?.name) {
      setFeedback({ tone: "error", text: "변경할 새 이름을 입력해주세요." });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({ tone: "success", text: "이름이 변경되었습니다." });
        // 헤더에 보이는 이름도 함께 갱신합니다.
        await refetch();
      } else {
        setFeedback({ tone: "error", text: data.message });
      }
    } catch {
      setFeedback({ tone: "error", text: "서버 오류가 발생했습니다." });
    } finally {
      setIsSaving(false);
    }
  };

  /** 비밀번호 변경 */
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setFeedback({ tone: "error", text: "비밀번호 항목을 모두 입력해주세요." });
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setFeedback({ tone: "error", text: "새 비밀번호가 서로 일치하지 않습니다." });
      return;
    }
    if (newPassword.length < 8) {
      setFeedback({ tone: "error", text: "새 비밀번호는 8자 이상이어야 합니다." });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setCurrentPassword("");
        setNewPassword("");
        setNewPasswordConfirm("");
        setFeedback({ tone: "success", text: "비밀번호가 변경되었습니다." });
      } else {
        setFeedback({ tone: "error", text: data.message });
      }
    } catch {
      setFeedback({ tone: "error", text: "서버 오류가 발생했습니다." });
    } finally {
      setIsSaving(false);
    }
  };

  /** 회원탈퇴 (되돌릴 수 없습니다) */
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("비밀번호를 입력해주세요.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();

      if (data.success) {
        // 계정이 사라졌으므로 페이지 전체를 새로 읽어 로그아웃 상태로 되돌립니다.
        window.location.href = "/";
        return;
      }
      setDeleteError(data.message);
    } catch {
      setDeleteError("서버 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePassword("");
    setDeleteError("");
  };

  // 정보를 불러오는 중 (또는 로그인 화면으로 이동 중)
  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">마이페이지</h1>

      {/* ---------- 계정 정보 ---------- */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          계정 정보
        </h2>
        <div className="flex items-center gap-3">
          {/* 이름 첫 글자로 만든 동그란 프로필 */}
          <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          {/* min-w-0 + break-all : 긴 이메일이 카드 밖으로 넘치지 않게 합니다. */}
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-lg truncate">{user.name}</p>
            <p className="text-sm text-gray-500 break-all">{user.email}</p>
            <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1">
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          </div>
        </div>
      </section>

      {/* ---------- 프로필 수정 ---------- */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">
          프로필 수정
        </h2>

        {feedback && (
          <Alert tone={feedback.tone} className="mb-5">
            {feedback.text}
          </Alert>
        )}

        {/* 이름 변경 */}
        <div className="mb-6 pb-6 border-b border-gray-100">
          <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-2">
            이름 변경
          </label>
          <div className="flex gap-2">
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="새 이름"
              maxLength={50}
              className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleNameChange}
              disabled={isSaving}
              className="px-5 py-2.5 bg-primary hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
            >
              변경
            </button>
          </div>
        </div>

        {/* 비밀번호 변경 */}
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-3">비밀번호 변경</span>
          <div className="space-y-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호"
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호 (8자 이상)"
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <input
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              placeholder="새 비밀번호 확인"
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <button
              type="button"
              onClick={handlePasswordChange}
              disabled={isSaving}
              className="w-full py-2.5 bg-primary hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : "비밀번호 변경"}
            </button>
          </div>
        </div>
      </section>

      {/* ---------- 회원탈퇴 ---------- */}
      <section className="bg-white rounded-2xl border border-red-100 p-6">
        <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-2">
          회원탈퇴
        </h2>
        <p className="text-sm text-gray-500 mb-4 break-keep">
          탈퇴하면 계정과 작성하신 모든 기사가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="px-5 py-2.5 border border-red-400 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors"
        >
          회원탈퇴 신청
        </button>
      </section>

      {/* ---------- 탈퇴 확인 팝업 ---------- */}
      {showDeleteModal && (
        <Modal title="정말 탈퇴하시겠습니까?" onClose={closeDeleteModal}>
          <p className="text-sm text-gray-500 mb-5 break-keep">
            확인을 위해 현재 비밀번호를 입력해주세요. 탈퇴 후에는 데이터를 복구할 수 없습니다.
          </p>

          <Alert tone="error" className="mb-4">
            {deleteError}
          </Alert>

          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="비밀번호 입력"
            autoComplete="current-password"
            onKeyDown={(e) => e.key === "Enter" && handleDeleteAccount()}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent mb-4"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={closeDeleteModal}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isDeleting ? "처리 중..." : "탈퇴하기"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
