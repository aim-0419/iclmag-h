import type { Category } from "@/types";

// ============================================================
// 기사 카테고리 정보 (사이트 전체의 유일한 원본 데이터)
//
// [비개발자 설명]
// 이 파일 하나만 고치면 사이트 전체(헤더 메뉴, 기사 카드 배지,
// 기사 작성 화면의 카테고리 선택창, 주소 등)가 한 번에 바뀝니다.
// 예전에는 같은 목록이 4군데에 흩어져 있어서 하나만 고치면
// 나머지가 어긋나는 문제가 있었습니다.
// ============================================================

/** 카테고리 한 건의 정보 */
export interface CategoryInfo {
  /** DB에 저장되는 값 (영문 대문자) */
  value: Category;
  /** 주소창에 쓰이는 값 예) /category/politics */
  slug: string;
  /** 화면에 보여줄 한국어 이름 */
  label: string;
  /** 기사 카드에 붙는 색상 배지 스타일 */
  badgeClass: string;
}

/** 카테고리 전체 목록 (헤더 메뉴 순서와 동일) */
export const CATEGORIES: readonly CategoryInfo[] = [
  { value: "POLITICS", slug: "politics", label: "정치",      badgeClass: "bg-red-100 text-red-700" },
  { value: "ECONOMY",  slug: "economy",  label: "경제",      badgeClass: "bg-blue-100 text-blue-700" },
  { value: "SOCIETY",  slug: "society",  label: "사회",      badgeClass: "bg-green-100 text-green-700" },
  { value: "CULTURE",  slug: "culture",  label: "생활/문화", badgeClass: "bg-purple-100 text-purple-700" },
  { value: "TECH",     slug: "tech",     label: "IT/과학",   badgeClass: "bg-cyan-100 text-cyan-700" },
  { value: "WORLD",    slug: "world",    label: "세계",      badgeClass: "bg-orange-100 text-orange-700" },
] as const;

/** DB 값 → 한국어 이름  예) "POLITICS" → "정치" */
export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
) as Record<Category, string>;

/** DB 값 → 배지 색상  예) "POLITICS" → "bg-red-100 text-red-700" */
export const CATEGORY_COLORS = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.badgeClass])
) as Record<Category, string>;

/** 주소 slug → DB 값  예) "politics" → "POLITICS" */
export const CATEGORY_SLUGS = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.value])
) as Record<string, Category | undefined>;

/** DB 값 → 주소 slug  예) "POLITICS" → "politics" */
export const CATEGORY_TO_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.slug])
) as Record<Category, string>;

/** 서버에서 넘어온 문자열이 진짜 카테고리인지 검사 (잘못된 값 차단용) */
export function isValidCategory(value: unknown): value is Category {
  return typeof value === "string" && CATEGORIES.some((c) => c.value === value);
}
