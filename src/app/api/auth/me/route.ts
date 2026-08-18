import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/backend/middleware/auth";

// ============================================================
// 내 정보 조회 API   GET /api/auth/me
//
// [비개발자 설명]
// 화면 상단 헤더가 "로그인 상태인지", "관리자인지"를 판단할 때
// 이 주소를 호출합니다. 로그인하지 않았으면 401 을 돌려줍니다.
// ============================================================

export async function GET(request: NextRequest) {
  // getAuthUser 가 출입증 검사와 DB 최신 정보 조회를 함께 처리합니다.
  const user = await getAuthUser(request);

  if (!user) {
    return NextResponse.json(
      { success: false, message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true, data: user });
}
