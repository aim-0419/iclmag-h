// ============================================================
// 사이트 공통 타입 정의
//
// [비개발자 설명]
// "타입"은 데이터의 생김새를 미리 적어두는 설계도입니다.
// 예를 들어 기사 하나에는 제목·요약·조회수가 들어간다고 적어두면,
// 개발 중에 오타나 빠진 값이 있을 때 바로 경고가 뜹니다.
// 화면(프론트엔드)과 서버(백엔드)가 같은 설계도를 보게 해서
// 서로 주고받는 데이터가 어긋나지 않도록 합니다.
// ============================================================

/** 기사 카테고리 (DB에 저장되는 값) */
export type Category = "POLITICS" | "ECONOMY" | "SOCIETY" | "CULTURE" | "TECH" | "WORLD";

/** 기사 발행 상태 — DRAFT: 임시저장(비공개), PUBLISHED: 발행(공개) */
export type Status = "DRAFT" | "PUBLISHED";

/**
 * 사용자 권한
 * - USER   : 일반 회원 (기사 읽기만 가능)
 * - WRITER : 기자 계정용으로 DB에 예약해 둔 등급. 현재 권한은 USER와 동일합니다.
 * - ADMIN  : 관리자 (기사 작성·수정·삭제, 이미지 업로드 가능)
 */
export type Role = "USER" | "WRITER" | "ADMIN";

// ------------------------------------------------------------
// 기사
// ------------------------------------------------------------

/** 목록 화면(홈·카테고리)의 기사 카드에 필요한 최소 정보 */
export interface ArticleListItem {
  id: number;
  title: string;
  summary: string | null;
  thumbnail: string | null;
  category: Category;
  views: number;
  /** 서버에서는 Date, 화면으로 전달될 때는 문자열이 되므로 둘 다 허용 */
  createdAt: string | Date;
  author: {
    id: number;
    name: string;
  };
}

/** 기사 상세 화면에 필요한 정보 (목록 정보 + 본문) */
export interface ArticleDetail extends ArticleListItem {
  content: string;
  status: Status;
  updatedAt: string | Date;
}

/** 목록 조회 결과 (기사 묶음 + 페이지 정보) */
export interface ArticlePage {
  articles: ArticleListItem[];
  /** 조건에 맞는 전체 기사 수 */
  total: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 지금 보고 있는 페이지 번호 */
  currentPage: number;
}

// ------------------------------------------------------------
// 사용자
// ------------------------------------------------------------

/** 로그인한 사용자 정보 (비밀번호는 절대 포함하지 않음) */
export interface AuthUser {
  userId: number;
  email: string;
  name: string;
  role: Role;
}
