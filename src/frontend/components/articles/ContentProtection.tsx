"use client";

import { useEffect, useRef } from "react";

// ============================================================
// 기사 본문 무단 복제 방지
//
// [비개발자 설명]
// 기사 영역 안에서 마우스 오른쪽 클릭, 드래그 선택, 이미지 끌어내기,
// 복사(Ctrl+C)·저장(Ctrl+S)·인쇄(Ctrl+P)·소스보기(Ctrl+U)를 막습니다.
//
// 예전에는 이 차단이 "페이지 전체"에 걸려 있어서 헤더·푸터 같은
// 기사와 무관한 영역까지 선택이 안 되고, 개발자도구 단축키까지 막아
// 불편했습니다. 지금은 기사 본문 영역 안에서만 동작합니다.
//
// ※ 참고: 브라우저 화면에 보이는 글은 기술적으로 100% 차단할 수 없습니다.
//    이 기능은 "손쉬운 무단 복사"를 막는 1차 방어선입니다.
// ============================================================

/** 차단할 Ctrl 조합 키 (c=복사, a=전체선택, s=저장, p=인쇄, u=소스보기) */
const BLOCKED_CTRL_KEYS = ["c", "a", "s", "p", "u"];

export default function ContentProtection({ children }: { children: React.ReactNode }) {
  // 보호할 영역(기사 본문 상자)을 가리키는 표식
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 오른쪽 클릭 메뉴 차단
    const blockEvent = (e: Event) => e.preventDefault();

    // 복사 관련 단축키 차단 (기사 상세 페이지가 열려 있는 동안만 적용)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (BLOCKED_CTRL_KEYS.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    container.addEventListener("contextmenu", blockEvent);
    container.addEventListener("dragstart", blockEvent);
    container.addEventListener("selectstart", blockEvent);
    container.addEventListener("copy", blockEvent);
    document.addEventListener("keydown", handleKeyDown);

    // 화면을 떠날 때 등록한 차단을 모두 해제합니다. (다른 페이지에 영향 없도록)
    return () => {
      container.removeEventListener("contextmenu", blockEvent);
      container.removeEventListener("dragstart", blockEvent);
      container.removeEventListener("selectstart", blockEvent);
      container.removeEventListener("copy", blockEvent);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="select-none">
      {children}
    </div>
  );
}
