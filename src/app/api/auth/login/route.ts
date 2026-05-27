import { NextRequest, NextResponse } from "next/server";
import { validateLogin } from "@/backend/services/userService";
import { signToken } from "@/backend/lib/jwt";

// ====================================
// 로그인 API
// POST /api/auth/login
// ====================================

/**
 * 로그인 요청 처리
 * 이메일/비밀번호 검증 후 JWT 토큰을 httpOnly 쿠키에 설정
 * 이메일 미인증 계정은 로그인 차단
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 필수 입력값 확인
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 이메일/비밀번호 검증
    const user = await validateLogin(email, password);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 이메일 인증 여부 확인 (미인증 계정 차단)
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "이메일 인증이 필요합니다. 가입 시 발송된 인증 메일을 확인해주세요.",
          code: "EMAIL_NOT_VERIFIED",
        },
        { status: 403 }
      );
    }

    // JWT 토큰 생성
    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // 응답 생성
    const response = NextResponse.json({
      success: true,
      message: "로그인되었습니다.",
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // JWT를 httpOnly 쿠키에 저장 (XSS 공격 방어)
    response.cookies.set("auth_token", token, {
      httpOnly: true,       // JavaScript에서 접근 불가
      secure: process.env.NODE_ENV === "production",  // HTTPS에서만 전송
      sameSite: "lax",      // CSRF 방어
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[로그인 오류]", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
