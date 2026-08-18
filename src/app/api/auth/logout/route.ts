import { ok } from "@/backend/lib/apiResponse";

// ============================================================
// 로그아웃 API   POST /api/auth/logout
//
// [비개발자 설명]
// 브라우저에 저장된 로그인 출입증 쿠키를 즉시 만료시킵니다.
// 서버에는 따로 지울 정보가 없어 이 한 가지 처리로 끝납니다.
// ============================================================

export async function POST() {
  const response = ok(undefined, "로그아웃되었습니다.");

  // 만료 시각을 과거로 정하면 브라우저가 쿠키를 바로 지웁니다.
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
