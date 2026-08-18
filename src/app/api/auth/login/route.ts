import { NextRequest } from "next/server";
import { validateLogin } from "@/backend/services/userService";
import { signToken } from "@/backend/lib/jwt";
import { fail, ok, serverError } from "@/backend/lib/apiResponse";

// ============================================================
// 로그인 API   POST /api/auth/login
//
// [비개발자 설명]
// 아이디(이름) 또는 이메일 + 비밀번호를 확인하고,
// 맞으면 "로그인 출입증"을 브라우저 쿠키에 넣어줍니다.
//
// 이 쿠키는 httpOnly 로 설정되어 있어 웹페이지의 스크립트가
// 읽을 수 없습니다. (악성 스크립트가 출입증을 훔치는 공격 방어)
//
// 이메일 인증을 마치지 않은 계정은 로그인할 수 없습니다.
// ============================================================

/** 출입증 유효기간 (7일) */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return fail("아이디(또는 이메일)와 비밀번호를 입력해주세요.");
    }

    // 아이디/비밀번호 확인
    const user = await validateLogin(email, password);
    if (!user) {
      // 어느 쪽이 틀렸는지는 알려주지 않습니다.
      // (알려주면 어떤 이메일이 가입돼 있는지 외부에서 알아낼 수 있습니다)
      return fail("아이디 또는 비밀번호가 올바르지 않습니다.", 401);
    }

    // 이메일 인증을 마치지 않은 계정은 차단합니다.
    // 화면에서는 code 값을 보고 "인증하러 가기" 링크를 띄웁니다.
    if (!user.emailVerified) {
      return Response.json(
        {
          success: false,
          message: "이메일 인증이 필요합니다. 가입 시 발송된 인증 코드를 입력해주세요.",
          code: "EMAIL_NOT_VERIFIED",
        },
        { status: 403 }
      );
    }

    // 출입증 발급
    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = ok(
      { userId: user.id, email: user.email, name: user.name, role: user.role },
      "로그인되었습니다."
    );

    // 출입증을 쿠키에 저장합니다.
    // secure 는 사이트 주소가 https 일 때만 켜집니다. (개발용 http 에서도 동작하도록)
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: !!process.env.NEXT_PUBLIC_APP_URL?.startsWith("https"),
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    return serverError("로그인 오류", error);
  }
}
