import { NextRequest } from "next/server";
import { verifyEmailCode } from "@/backend/services/verificationService";
import { fail, ok, serverError } from "@/backend/lib/apiResponse";

// ============================================================
// 이메일 인증 코드 확인 API   POST /api/auth/verify-email
//
// [비개발자 설명]
// /verify-email 화면에서 입력한 6자리 코드가 맞는지 확인합니다.
// 맞으면 그 계정을 "인증 완료" 상태로 바꿔 로그인할 수 있게 합니다.
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return fail("이메일과 인증 코드를 모두 입력해주세요.");
    }

    const result = await verifyEmailCode(email.trim(), String(code).trim());

    // 코드가 틀렸거나 시간이 지난 경우
    if (!result.success) return fail(result.message);

    return ok(undefined, result.message);
  } catch (error) {
    return serverError("인증 코드 확인 오류", error);
  }
}
