"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Editor, { type EditorSubmitData } from "@/frontend/components/articles/Editor";
import Alert from "@/frontend/components/ui/Alert";
import { useAuth } from "@/frontend/hooks/useAuth";

// ============================================================
// 기사 작성 화면 (주소: /write )
//
// [비개발자 설명]
// 관리자만 들어올 수 있는 화면입니다.
//   · 로그인하지 않았으면 → 로그인 화면으로 보냅니다.
//   · 로그인했지만 관리자가 아니면 → 홈으로 보냅니다.
// 권한을 확인하는 동안에는 "권한 확인 중..." 문구를 보여줘
// 잠깐 빈 화면이 보이는 일이 없도록 했습니다.
//
// 실제 입력 폼은 Editor 부품(components/articles/Editor.tsx)이 담당하고,
// 이 파일은 "권한 확인"과 "저장 요청"만 처리합니다.
// ============================================================

export default function WritePage() {
  const router = useRouter();
  const { isLoading: isAuthLoading, isLoggedIn, isAdmin } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 권한 확인이 끝나면 자격이 없는 사용자를 내보냅니다.
  useEffect(() => {
    if (isAuthLoading) return;
    if (!isLoggedIn) {
      router.replace("/login");
    } else if (!isAdmin) {
      router.replace("/");
    }
  }, [isAuthLoading, isLoggedIn, isAdmin, router]);

  /** Editor 에서 "임시저장" 또는 "발행하기"를 누르면 실행됩니다. */
  const handleSubmit = async (data: EditorSubmitData) => {
    setIsSaving(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(result.message || result.errors?.[0] || "기사 저장에 실패했습니다.");
        return;
      }

      // 저장 성공 → 방금 쓴 기사 화면으로 이동
      router.push(`/articles/${result.data.id}`);
      router.refresh();
    } catch {
      setErrorMessage("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  // 권한 확인 중이거나 자격이 없어 이동하는 중
  if (isAuthLoading || !isLoggedIn || !isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-400 text-sm">권한 확인 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">기사 작성</h1>
        <p className="text-gray-500 text-sm mt-1 break-keep">
          카테고리를 선택하고 기사를 작성하세요. 임시저장하면 나중에 이어서 발행할 수 있습니다.
        </p>
      </div>

      <Alert tone="error" className="mb-6">
        {errorMessage}
      </Alert>

      <Editor onSubmit={handleSubmit} isLoading={isSaving} />
    </div>
  );
}
