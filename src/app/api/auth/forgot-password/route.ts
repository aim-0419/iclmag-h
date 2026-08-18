import { NextRequest } from "next/server";
import { findUserByEmail } from "@/backend/services/userService";
import { createPasswordResetToken } from "@/backend/services/passwordResetService";
import { sendPasswordResetEmail } from "@/backend/lib/email";
import { fail, ok, serverError } from "@/backend/lib/apiResponse";

// ============================================================
// 비밀번호 재설정 요청 API   POST /api/auth/forgot-password
//
// [비개발자 설명]
// 로그인 화면의 "비밀번호 찾기"에서 이메일을 넣으면 실행됩니다.
// 30분간만 쓸 수 있는 재설정 링크를 메일로 보냅니다.
//
// 가입되지 않은 이메일을 넣어도 "발송했습니다"라고 답합니다.
// (가입 여부를 외부에서 알아내지 못하게 하기 위함)
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return fail("이메일을 입력해주세요.");

    const user = await findUserByEmail(email.trim());

    if (!user) {
      return ok(undefined, "비밀번호 재설정 링크를 이메일로 발송했습니다.");
    }

    const token = await createPasswordResetToken(user.id);
    await sendPasswordResetEmail(user.email, user.name, token);

    return ok(undefined, "비밀번호 재설정 링크를 이메일로 발송했습니다.");
  } catch (error) {
    return serverError("비밀번호 재설정 요청 오류", error);
  }
}
