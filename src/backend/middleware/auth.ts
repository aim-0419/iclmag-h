import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, JWTPayload } from "@/backend/lib/jwt";
import prisma from "@/backend/lib/db";

// ============================================================
// "지금 요청을 보낸 사람이 누구인가?" 를 확인하는 공통 함수 모음
//
// [비개발자 설명]
// 기사 작성·삭제처럼 아무나 하면 안 되는 기능은
// 실행 전에 반드시 이 파일의 함수로 신원과 권한을 확인합니다.
//
// 로그인 정보를 확인하는 곳이 두 종류라서 함수도 두 개입니다.
//   · getAuthUser            → API 주소(/api/...)에서 사용
//   · getAuthUserFromCookies → 화면을 그리는 서버 코드에서 사용
// 실제 검사 로직은 아래 resolveUser 하나로 공유합니다.
// ============================================================

/** 출입증 문자열을 검사해서 DB의 최신 사용자 정보를 돌려줍니다. */
async function resolveUser(token: string | undefined): Promise<JWTPayload | null> {
  if (!token) return null;

  // 출입증이 위조되었거나 기간이 지났는지 검사
  const tokenUser = await verifyToken(token);
  if (!tokenUser) return null;

  try {
    // 탈퇴했거나 권한이 바뀌었을 수 있으므로 DB에서 최신 정보를 다시 읽습니다.
    // (출입증에 적힌 옛날 권한을 그대로 믿으면, 관리자 권한을 회수해도
    //  기존 출입증으로 계속 기사를 쓸 수 있게 되기 때문입니다)
    const dbUser = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!dbUser) return null;

    return {
      userId: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
    };
  } catch (error) {
    console.error("[인증 사용자 조회 오류]", error);
    return null;
  }
}

/**
 * API 요청을 보낸 로그인 사용자 정보를 가져옵니다.
 * 로그인하지 않았거나 출입증이 만료됐으면 null 을 돌려줍니다.
 */
export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  // 브라우저는 쿠키로, 외부 프로그램은 Authorization 헤더로 출입증을 보냅니다.
  const token =
    request.cookies.get("auth_token")?.value ||
    request.headers.get("Authorization")?.replace("Bearer ", "");

  return resolveUser(token);
}

/**
 * 서버에서 화면을 그릴 때(예: 기사 상세 페이지) 로그인 사용자를 확인합니다.
 * 관리자에게만 "삭제" 버튼을 보여주는 것 같은 처리에 사용합니다.
 */
export async function getAuthUserFromCookies(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  return resolveUser(cookieStore.get("auth_token")?.value);
}

/**
 * 관리자 여부 확인.
 * 기사 작성·수정·삭제와 이미지 업로드는 관리자만 할 수 있습니다.
 */
export function isAdmin(user: JWTPayload | null): boolean {
  return user?.role === "ADMIN";
}
