import { NextRequest } from "next/server";
import { getArticleByIdOnly, updateArticle, deleteArticle } from "@/backend/services/articleService";
import { getAuthUser, isAdmin } from "@/backend/middleware/auth";
import { fail, forbidden, notFound, ok, serverError, unauthorized } from "@/backend/lib/apiResponse";

// ============================================================
// 기사 한 건 조회 / 수정 / 삭제 API
//   GET    /api/articles/기사번호  → 기사 내용 (누구나)
//   PUT    /api/articles/기사번호  → 기사 수정 (관리자만)
//   DELETE /api/articles/기사번호  → 기사 삭제 (관리자만)
//
// [비개발자 설명]
// 화면에서 보는 기사 상세 페이지와는 별개로, 프로그램끼리 데이터를
// 주고받기 위한 통로입니다. 삭제 버튼을 누르면 여기 DELETE 가 실행됩니다.
// ============================================================

/** 주소에 들어온 기사 번호를 숫자로 바꿔 검사합니다. */
async function readArticleId(params: Promise<{ id: string }>): Promise<number | null> {
  const { id } = await params;
  const articleId = Number(id);
  return Number.isInteger(articleId) && articleId > 0 ? articleId : null;
}

/**
 * 기사 내용 조회
 * ※ 조회수는 올리지 않습니다. (조회수는 실제 기사 화면을 열 때만 올라갑니다)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const articleId = await readArticleId(params);
    if (!articleId) return fail("올바르지 않은 기사 번호입니다.");

    const article = await getArticleByIdOnly(articleId);
    if (!article) return notFound("기사를 찾을 수 없습니다.");

    return ok(article);
  } catch (error) {
    return serverError("기사 조회 오류", error);
  }
}

/** 기사 수정 (관리자 전용) */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    if (!isAdmin(user)) return forbidden("기사 수정 권한이 없습니다.");

    const articleId = await readArticleId(params);
    if (!articleId) return fail("올바르지 않은 기사 번호입니다.");

    const existing = await getArticleByIdOnly(articleId);
    if (!existing) return notFound("기사를 찾을 수 없습니다.");

    const body = await request.json();
    const updated = await updateArticle(articleId, body);

    return ok(updated, "기사가 수정되었습니다.");
  } catch (error) {
    return serverError("기사 수정 오류", error);
  }
}

/** 기사 삭제 (관리자 전용, 되돌릴 수 없음) */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    if (!isAdmin(user)) return forbidden("기사 삭제 권한이 없습니다.");

    const articleId = await readArticleId(params);
    if (!articleId) return fail("올바르지 않은 기사 번호입니다.");

    const existing = await getArticleByIdOnly(articleId);
    if (!existing) return notFound("기사를 찾을 수 없습니다.");

    await deleteArticle(articleId);

    return ok(undefined, "기사가 삭제되었습니다.");
  } catch (error) {
    return serverError("기사 삭제 오류", error);
  }
}
