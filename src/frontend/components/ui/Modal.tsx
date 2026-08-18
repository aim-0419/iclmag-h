"use client";

import { useEffect } from "react";

// ============================================================
// 팝업 창(모달) 공통 부품
//
// [비개발자 설명]
// 화면 가운데 떠오르는 작은 창입니다.
// "아이디 찾기", "회원탈퇴 확인", "기사 삭제 확인"이 모두 이 부품을 씁니다.
// 공통으로 아래 편의 기능이 들어 있습니다.
//   · 어두운 배경을 클릭하면 닫힘
//   · 키보드 ESC 를 누르면 닫힘
//   · 창이 열려 있는 동안 뒤 페이지가 스크롤되지 않음
//   · 내용이 길면 창 안에서만 스크롤 (화면 밖으로 넘치지 않음)
// ============================================================

interface ModalProps {
  /** 창 제목 */
  title: string;
  /** 창을 닫을 때 실행할 동작 */
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    // ESC 키로 닫기
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    // 창이 열린 동안 뒤 페이지 스크롤 막기
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* 어두운 배경 (클릭하면 닫힘) */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 실제 창 */}
      <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[85vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-3 mb-5">
          <h2 className="text-lg font-bold text-gray-900 break-keep">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-gray-400 hover:text-gray-600 text-xl leading-none flex-shrink-0"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
