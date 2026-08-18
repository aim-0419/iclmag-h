"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CATEGORIES } from "@/constants/categories";
import Alert from "@/frontend/components/ui/Alert";

// ============================================================
// 기사 작성 편집기
//
// [비개발자 설명]
// 제목 · 카테고리 · 요약 · 대표사진 · 본문을 한 화면에서 작성합니다.
// 아래 두 개의 버튼으로 저장 방식을 고를 수 있습니다.
//   · 임시저장 : 나만 볼 수 있게 저장 (홈에 노출되지 않음)
//   · 발행하기 : 모든 사람에게 공개
//
// 잘못 입력한 항목이 있으면 예전에는 브라우저 경고창이 떴지만,
// 지금은 화면 안에 빨간 안내 문구로 보여줘 흐름이 끊기지 않습니다.
// ============================================================

/** 대표사진 최대 용량 (5MB) */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
/** 제목 최대 글자 수 (데이터베이스 제한과 동일) */
const MAX_TITLE_LENGTH = 500;
/** 요약 최대 글자 수 */
const MAX_SUMMARY_LENGTH = 300;

/** 저장할 기사 내용 */
export interface EditorSubmitData {
  title: string;
  content: string;
  summary: string;
  category: string;
  thumbnail: string;
  status: "DRAFT" | "PUBLISHED";
}

interface EditorProps {
  /** 기존 기사를 고칠 때 넘겨주는 원래 내용 */
  initialData?: Partial<Omit<EditorSubmitData, "status">>;
  onSubmit: (data: EditorSubmitData) => Promise<void>;
  isLoading?: boolean;
}

export default function Editor({ initialData, onSubmit, isLoading }: EditorProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [summary, setSummary] = useState(initialData?.summary ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail ?? "");

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 숨겨둔 파일 선택창을 버튼으로 열기 위한 연결고리
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** 대표사진을 서버에 올립니다. */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage("");

    if (!file.type.startsWith("image/")) {
      setErrorMessage("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrorMessage("이미지 크기는 5MB를 넘을 수 없습니다.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "이미지 업로드에 실패했습니다.");
        return;
      }
      setThumbnail(data.data.url);
    } catch {
      setErrorMessage("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
      // 같은 파일을 다시 선택해도 반응하도록 입력값을 비웁니다.
      e.target.value = "";
    }
  };

  /** 저장 전에 빠진 항목이 없는지 확인합니다. */
  const handleSave = async (status: "DRAFT" | "PUBLISHED") => {
    setErrorMessage("");

    if (!title.trim()) return setErrorMessage("제목을 입력해주세요.");
    if (!category) return setErrorMessage("카테고리를 선택해주세요.");
    if (!content.trim()) return setErrorMessage("본문을 입력해주세요.");

    await onSubmit({ title, content, summary, category, thumbnail, status });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Alert tone="error" className="mb-5">
        {errorMessage}
      </Alert>

      {/* ---------- 제목 ---------- */}
      <div className="mb-6">
        <label htmlFor="article-title" className="sr-only">
          기사 제목
        </label>
        <input
          id="article-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="기사 제목을 입력하세요"
          maxLength={MAX_TITLE_LENGTH}
          className="w-full text-2xl sm:text-3xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none bg-transparent break-keep"
        />
        <div className="flex items-center gap-2 mt-1">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400 flex-shrink-0">
            {title.length}/{MAX_TITLE_LENGTH}
          </span>
        </div>
      </div>

      {/* ---------- 카테고리 + 요약 ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="article-category" className="block text-sm font-medium text-gray-700 mb-1">
            카테고리 <span className="text-accent">*</span>
          </label>
          <select
            id="article-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="">카테고리 선택</option>
            {CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="article-summary" className="block text-sm font-medium text-gray-700 mb-1">
            요약 <span className="text-gray-400 font-normal">(선택, 목록에 표시됨)</span>
          </label>
          <input
            id="article-summary"
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="기사 요약을 입력하세요"
            maxLength={MAX_SUMMARY_LENGTH}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
      </div>

      {/* ---------- 대표사진 ---------- */}
      <div className="mb-6">
        <span className="block text-sm font-medium text-gray-700 mb-2">
          썸네일 이미지 <span className="text-gray-400 font-normal">(선택, 최대 5MB)</span>
        </span>

        {thumbnail ? (
          // 올린 사진 미리보기
          <div className="relative w-full h-56 sm:h-64 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
            <Image
              src={thumbnail}
              alt="썸네일 미리보기"
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => setThumbnail("")}
              aria-label="썸네일 삭제"
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          // 아직 사진이 없을 때 보이는 업로드 영역
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-10 flex flex-col items-center justify-center gap-2 hover:border-accent transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <span className="text-gray-500 text-sm">업로드 중...</span>
            ) : (
              <>
                <span className="text-3xl">🖼️</span>
                <span className="text-gray-500 text-sm">클릭하여 이미지 업로드</span>
                <span className="text-gray-400 text-xs">JPG, PNG, WebP, GIF 지원</span>
              </>
            )}
          </button>
        )}

        {/* 실제 파일 선택창 (화면에는 보이지 않고 위 버튼이 대신 눌러줍니다) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* ---------- 본문 ---------- */}
      <div className="mb-8">
        <label htmlFor="article-content" className="block text-sm font-medium text-gray-700 mb-2">
          본문 <span className="text-accent">*</span>
        </label>
        <textarea
          id="article-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="기사 본문을 작성하세요..."
          rows={20}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-y"
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-400">{content.length}자</span>
        </div>
      </div>

      {/* ---------- 저장 버튼 ---------- */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 border-t pt-6">
        <button
          type="button"
          onClick={() => handleSave("DRAFT")}
          disabled={isLoading || isUploading}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
        >
          임시저장
        </button>
        <button
          type="button"
          onClick={() => handleSave("PUBLISHED")}
          disabled={isLoading || isUploading}
          className="px-8 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
        >
          {isLoading ? "처리 중..." : "발행하기"}
        </button>
      </div>
    </div>
  );
}
