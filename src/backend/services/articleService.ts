import prisma from "@/backend/lib/db";
import { Category, Status } from "@prisma/client";
import { isValidCategory } from "@/constants/categories";

// ============================================================
// 기사 관련 처리 (데이터베이스 담당)
//
// [비개발자 설명]
// 기사를 "가져오기 / 새로 쓰기 / 고치기 / 지우기" 하는 실제 작업이
// 모두 이 파일에 모여 있습니다. 화면 파일들은 직접 DB를 건드리지 않고
// 여기 있는 함수만 불러서 사용합니다. 그래야 나중에 규칙이 바뀌어도
// 이 파일 한 곳만 고치면 됩니다.
// ============================================================

/** 한 페이지에 보여줄 기사 개수 */
export const PAGE_SIZE = 12;

/** 목록 화면에서 필요한 항목만 골라 가져오기 위한 설정 (본문은 무거워서 제외) */
const LIST_FIELDS = {
  id: true,
  title: true,
  summary: true,
  thumbnail: true,
  category: true,
  views: true,
  createdAt: true,
  author: { select: { id: true, name: true } },
} as const;

/**
 * 발행된 기사 목록 가져오기 (페이지 나누기 + 카테고리 걸러내기)
 * 홈 화면, 전체 기사 목록, 카테고리 화면에서 사용합니다.
 *
 * @param page     몇 번째 페이지인지 (1부터 시작)
 * @param category 특정 카테고리만 볼 때 지정 (생략하면 전체)
 */
export async function getArticles(page = 1, category?: Category) {
  // 페이지 번호가 0이나 음수로 들어와도 1페이지로 처리합니다.
  const safePage = Math.max(1, Math.floor(page) || 1);

  const where = {
    status: Status.PUBLISHED,          // 임시저장(DRAFT) 기사는 목록에 보이지 않습니다.
    ...(category && { category }),
  };

  // 목록과 전체 개수를 한 번에 조회 (DB 왕복을 줄이기 위함)
  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },  // 최신 기사가 위로
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: LIST_FIELDS,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    articles,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    currentPage: safePage,
  };
}

/**
 * 기사 한 건 가져오기 (조회수는 올리지 않음)
 * 검색엔진용 정보를 만들 때처럼 "읽었다"고 세면 안 되는 경우에 씁니다.
 */
export async function getArticleByIdOnly(id: number) {
  if (!Number.isInteger(id)) return null;

  return prisma.article.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true } } },
  });
}

/**
 * 기사 한 건 가져오면서 조회수 1 올리기
 * 실제 기사 상세 화면을 열 때만 사용합니다.
 *
 * 예전에는 "조회 → 수정" 두 번 DB에 다녀왔지만,
 * 지금은 한 번의 수정 요청으로 값을 올리고 결과까지 받아옵니다.
 */
export async function getArticleById(id: number) {
  if (!Number.isInteger(id)) return null;

  try {
    return await prisma.article.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: { author: { select: { id: true, name: true } } },
    });
  } catch {
    // 해당 번호의 기사가 없는 경우
    return null;
  }
}

/**
 * 새 기사 저장하기
 * (누가 쓸 수 있는지에 대한 권한 검사는 API 파일에서 먼저 처리합니다)
 */
export async function createArticle(
  data: {
    title: string;
    content: string;
    summary?: string | null;
    thumbnail?: string | null;
    category: Category;
    status?: Status;
  },
  authorId: number
) {
  return prisma.article.create({
    data: { ...data, authorId },
    include: { author: { select: { id: true, name: true } } },
  });
}

/** 기존 기사 내용 고치기 */
export async function updateArticle(
  id: number,
  data: Partial<{
    title: string;
    content: string;
    summary: string;
    thumbnail: string;
    category: Category;
    status: Status;
  }>
) {
  return prisma.article.update({ where: { id }, data });
}

/** 기사 지우기 (되돌릴 수 없습니다) */
export async function deleteArticle(id: number) {
  return prisma.article.delete({ where: { id } });
}

/**
 * 기사 입력값이 올바른지 검사
 *
 * @returns 문제가 있으면 사람이 읽을 수 있는 안내문 목록, 없으면 빈 배열
 */
export function validateArticleInput(
  title: string,
  content: string,
  category: string
): string[] {
  const errors: string[] = [];

  if (!title || title.trim().length < 1) {
    errors.push("제목을 입력해주세요.");
  }
  if (title && title.length > 500) {
    errors.push("제목은 500자를 초과할 수 없습니다.");
  }
  if (!content || content.trim().length < 1) {
    errors.push("본문을 입력해주세요.");
  }
  if (!isValidCategory(category)) {
    errors.push("올바른 카테고리를 선택해주세요.");
  }

  return errors;
}
