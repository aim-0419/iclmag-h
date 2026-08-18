"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/frontend/components/ui/Modal";
import Alert from "@/frontend/components/ui/Alert";

// ============================================================
// 기사 삭제 버튼 (관리자에게만 보입니다)
//
// [비개발자 설명]
// 누르면 곧바로 지우지 않고 "정말 삭제할까요?" 확인 창을 먼저 띄웁니다.
// 실수로 기사를 지우는 사고를 막기 위한 안전장치입니다.
// ============================================================

export default function DeleteArticleButton({ articleId }: { articleId: number }) {
  const router = useRouter();

  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /** 실제 삭제 요청을 보냅니다. */
  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage("");

    try {
      const res = await fetch(`/api/articles/${articleId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        // 삭제 성공 → 홈으로 이동하고 목록을 새로 불러옵니다.
        router.push("/");
        router.refresh();
        return;
      }
      setErrorMessage(data.message || "삭제하지 못했습니다.");
    } catch {
      setErrorMessage("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeModal = () => {
    setShowConfirm(false);
    setErrorMessage("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="text-sm text-red-500 hover:text-red-700 transition-colors"
      >
        삭제
      </button>

      {showConfirm && (
        <Modal title="기사 삭제" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-5 break-keep">
            정말 이 기사를 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.
          </p>

          <Alert tone="error" className="mb-4">
            {errorMessage}
          </Alert>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
