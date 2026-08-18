import Link from "next/link";

// ============================================================
// 페이지 번호 이동 버튼 (1 2 3 ... 다음)
//
// [비개발자 설명]
// 기사가 많아지면 번호 버튼이 화면 밖으로 넘쳐 가로 스크롤이 생겼습니다.
// 이 컴포넌트는 "현재 페이지 주변 번호 + 맨 앞/맨 뒤"만 보여주고
// 사이는 … 으로 줄여서, 기사가 몇 백 개가 되어도 한 줄에 들어옵니다.
// ============================================================

interface PaginationProps {
  /** 지금 보고 있는 페이지 번호 */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지 번호를 붙일 기본 주소 예) "/articles" → "/articles?page=2" */
  basePath: string;
}

/** 현재 페이지 좌우로 몇 개까지 번호를 보여줄지 */
const SIBLING_COUNT = 1;

/**
 * 보여줄 번호 목록을 계산합니다.
 * "…"(생략 표시)는 문자열로 섞여 들어갑니다.
 * 예) 현재 7페이지 / 전체 20페이지 → [1, "…", 6, 7, 8, "…", 20]
 */
function buildPageList(currentPage: number, totalPages: number): (number | "…")[] {
  // 페이지가 적으면 전부 보여줍니다.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const first = 1;
  const last = totalPages;
  const start = Math.max(first + 1, currentPage - SIBLING_COUNT);
  const end = Math.min(last - 1, currentPage + SIBLING_COUNT);

  const pages: (number | "…")[] = [first];
  if (start > first + 1) pages.push("…");
  for (let page = start; page <= end; page++) pages.push(page);
  if (end < last - 1) pages.push("…");
  pages.push(last);

  return pages;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  // 페이지가 하나뿐이면 버튼을 보여줄 필요가 없습니다.
  if (totalPages <= 1) return null;

  const pages = buildPageList(currentPage, totalPages);
  const linkTo = (page: number) => `${basePath}?page=${page}`;

  return (
    <nav
      aria-label="페이지 이동"
      className="flex flex-wrap items-center justify-center gap-1.5 mt-10"
    >
      {/* 이전 페이지 */}
      {currentPage > 1 && (
        <Link
          href={linkTo(currentPage - 1)}
          className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors"
        >
          이전
        </Link>
      )}

      {/* 번호 버튼들 */}
      {pages.map((page, index) =>
        page === "…" ? (
          <span key={`gap-${index}`} className="px-2 text-gray-400 select-none">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={linkTo(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`min-w-[2.5rem] text-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-primary text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {page}
          </Link>
        )
      )}

      {/* 다음 페이지 */}
      {currentPage < totalPages && (
        <Link
          href={linkTo(currentPage + 1)}
          className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors"
        >
          다음
        </Link>
      )}
    </nav>
  );
}
