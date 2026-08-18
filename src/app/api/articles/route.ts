import { NextRequest } from "next/server";
import { Category, Status } from "@prisma/client";
import { getArticles, createArticle, validateArticleInput } from "@/backend/services/articleService";
import { getAuthUser, isAdmin } from "@/backend/middleware/auth";
import { isValidCategory } from "@/constants/categories";
import { created, invalid, forbidden, ok, serverError, unauthorized } from "@/backend/lib/apiResponse";

// ============================================================
// 기사 목록 조회 / 새 기사 저장 API
//   GET  /api/articles  → 기사 목록 (누구나)
//   POST /api/articles  → 새 기사 저장 (관리자만)
// ============================================================

/**
 * 기사 목록 조회
 * 주소 뒤에 조건을 붙일 수 있습니다. 예) /api/articles?page=2&category=POLITICS
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const categoryParam = searchParams.get("category");

    // 엉뚱한 카테고리 값이 들어오면 무시하고 전체 목록을 보여줍니다.
    const category = isValidCategory(categoryParam) ? (categoryParam as Category) : undefined;

    return ok(await getArticles(page, category));
  } catch (error) {
    return serverError("기사 목록 조회 오류", error);
  }
}

/**
 * 새 기사 저장 (관리자 전용)
 * 보내는 내용: { title, content, summary?, thumbnail?, category, status? }
 */
export async function POST(request: NextRequest) {
  try {
    // 1) 로그인했는지 확인
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    // 2) 관리자인지 확인
    if (!isAdmin(user)) return forbidden("기사 작성 권한이 없습니다.");

    // 3) 입력값이 올바른지 확인
    const { title, content, summary, thumbnail, category, status } = await request.json();
    const errors = validateArticleInput(title, content, category);
    if (errors.length > 0) return invalid(errors);

    // 4) 저장
    const article = await createArticle(
      {
        title: title.trim(),
        content: content.trim(),
        summary: summary?.trim() || null,
        thumbnail: thumbnail || null,
        category: category as Category,
        status: (status as Status) || Status.DRAFT,
      },
      user.userId
    );

    return created(
      article,
      status === "PUBLISHED" ? "기사가 발행되었습니다." : "임시저장되었습니다."
    );
  } catch (error) {
    return serverError("기사 생성 오류", error);
  }
}
