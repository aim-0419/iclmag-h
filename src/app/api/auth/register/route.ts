import { NextRequest, NextResponse } from "next/server";
import { createUser, validateUserInput } from "@/backend/services/userService";
import { createVerificationToken } from "@/backend/services/verificationService";
import { sendVerificationEmail } from "@/backend/lib/email";

// ============================================================
// 회원가입 API   POST /api/auth/register
//
// [비개발자 설명]
// 이름·이메일·비밀번호를 받아 계정을 만들고,
// 곧바로 6자리 인증 코드를 메일로 보냅니다.
// 사용자는 /verify-email 화면에서 그 코드를 입력해야 로그인할 수 있습니다.
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // 서버에서도 한 번 더 입력값을 검사합니다.
    // (화면 검사만 믿으면 개발자도구로 우회할 수 있기 때문)
    const errors = validateUserInput(email, password, name);
    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // 계정 생성 (이메일 중복이면 아래 catch 로 넘어갑니다)
    const user = await createUser(email, password, name);

    // 6자리 인증 코드 발급 (10분간 유효)
    const code = await createVerificationToken(user.id);

    // 메일 발송이 실패해도 가입 자체는 완료로 처리합니다.
    // (사용자는 인증 화면에서 "코드 다시 받기"로 재시도할 수 있습니다)
    try {
      await sendVerificationEmail(email, name, code);
    } catch (emailError) {
      console.error("[인증 메일 발송 실패]", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "회원가입이 완료되었습니다. 메일로 받은 6자리 인증 코드를 입력해주세요.",
        data: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (error) {
    // 이메일 중복 등 미리 예상한 오류는 그대로 안내합니다.
    if (error instanceof Error && error.message === "이미 사용 중인 이메일입니다.") {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 });
    }

    console.error("[회원가입 오류]", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
