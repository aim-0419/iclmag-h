import { NextRequest } from "next/server";
import { findUserByEmail } from "@/backend/services/userService";
import { createVerificationToken } from "@/backend/services/verificationService";
import { sendVerificationEmail } from "@/backend/lib/email";
import { fail, ok, serverError } from "@/backend/lib/apiResponse";

// ============================================================
// 인증 코드 재발송 API   POST /api/auth/resend-verification
//
// [비개발자 설명]
// 인증 메일을 못 받았거나 10분이 지나 코드가 만료됐을 때
// 새 코드를 다시 보내줍니다. (이전 코드는 자동으로 무효가 됩니다)
//
// 가입되지 않은 이메일이나 이미 인증된 계정에도 똑같이
// "발송 완료"라고 답합니다. 그래야 외부인이 이 주소를 이용해
// 어떤 이메일이 가입돼 있는지 알아낼 수 없습니다.
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return fail("이메일을 입력해주세요.");

    const user = await findUserByEmail(email.trim());

    // 보안상 실제 결과를 숨깁니다.
    if (!user || user.emailVerified) {
      return ok(undefined, "인증 코드를 발송했습니다.");
    }

    const code = await createVerificationToken(user.id);
    await sendVerificationEmail(user.email, user.name, code);

    return ok(undefined, "인증 코드를 재발송했습니다.");
  } catch (error) {
    return serverError("인증 코드 재발송 오류", error);
  }
}
