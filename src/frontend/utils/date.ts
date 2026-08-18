// ============================================================
// 날짜를 사람이 읽기 좋은 글자로 바꾸는 함수 모음
//
// [비개발자 설명]
// 데이터베이스에는 "2026-08-18T09:30:00.000Z" 같은 형태로 저장됩니다.
// 그대로 보여주면 읽기 어려우니 화면에 맞게 다듬어 줍니다.
// ============================================================

/** 밀리초 단위 상수 (계산식을 읽기 쉽게 하기 위함) */
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * 기사 목록용 — 최근 글은 "3시간 전", 하루가 지나면 "2026.08.18"
 *
 * @param value 날짜 값 (Date 또는 날짜 문자열)
 */
export function formatRelativeDate(value: string | Date): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const elapsed = Date.now() - date.getTime();

  // 미래 날짜(서버·PC 시계 오차 등)는 "방금 전"으로 처리합니다.
  if (elapsed < MINUTE) return "방금 전";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}분 전`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}시간 전`;

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * 기사 상세용 — "2026년 8월 18일 오후 06:30" 형태로 자세히 표시
 */
export function formatFullDate(value: string | Date): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
