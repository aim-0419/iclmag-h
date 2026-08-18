import { NextResponse } from "next/server";

// ============================================================
// API 응답을 만드는 공통 함수 모음
//
// [비개발자 설명]
// 서버가 화면에 답을 돌려줄 때의 형식을 하나로 통일합니다.
//   성공 → { success: true,  data: 내용, message: "안내문" }
//   실패 → { success: false, message: "무엇이 잘못됐는지" }
//
// 예전에는 15개 파일마다 이 형식을 손으로 적어서
// 어떤 곳은 message 가 빠지는 등 답이 제각각이었습니다.
// 이제는 아래 함수만 쓰면 항상 같은 모양이 나옵니다.
// ============================================================

/** 성공 응답 */
export function ok<T>(data?: T, message?: string, status = 200) {
  return NextResponse.json({ success: true, ...(message && { message }), ...(data !== undefined && { data }) }, { status });
}

/** 새로 만들어졌을 때의 성공 응답 (201) */
export function created<T>(data: T, message: string) {
  return ok(data, message, 201);
}

/** 실패 응답 (기본 400 = 입력값이 잘못됨) */
export function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

/** 입력값 검사에서 여러 항목이 걸렸을 때 */
export function invalid(errors: string[]) {
  return NextResponse.json({ success: false, errors }, { status: 400 });
}

/** 로그인이 필요할 때 (401) */
export function unauthorized(message = "로그인이 필요합니다.") {
  return fail(message, 401);
}

/** 로그인했지만 권한이 없을 때 (403) */
export function forbidden(message = "권한이 없습니다.") {
  return fail(message, 403);
}

/** 대상을 찾지 못했을 때 (404) */
export function notFound(message = "요청하신 정보를 찾을 수 없습니다.") {
  return fail(message, 404);
}

/**
 * 예상하지 못한 서버 오류 (500)
 * 자세한 내용은 서버 기록(로그)에만 남기고,
 * 사용자에게는 내부 사정이 드러나지 않는 일반 문구만 보여줍니다.
 */
export function serverError(tag: string, error: unknown) {
  console.error(`[${tag}]`, error);
  return fail("서버 오류가 발생했습니다.", 500);
}
