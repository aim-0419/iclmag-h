import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/backend/lib/db";
import { getAuthUser } from "@/backend/middleware/auth";
import { fail, notFound, ok, serverError, unauthorized } from "@/backend/lib/apiResponse";

// ============================================================
// 회원탈퇴 API   DELETE /api/user/delete
//
// [비개발자 설명]
// 마이페이지에서 탈퇴를 신청하면 실행됩니다.
// 비밀번호를 한 번 더 확인한 뒤 계정을 영구 삭제하며,
// 그 사람이 쓴 기사도 함께 삭제됩니다. (되돌릴 수 없습니다)
// 삭제 후에는 브라우저에 남은 로그인 출입증도 즉시 지웁니다.
// ============================================================

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { password } = await request.json();
    if (!password) return fail("비밀번호를 입력해주세요.");

    // 본인 확인
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!dbUser) return notFound("사용자를 찾을 수 없습니다.");

    const isPasswordValid = await bcrypt.compare(password, dbUser.password);
    if (!isPasswordValid) return fail("비밀번호가 올바르지 않습니다.");

    // 계정 삭제 (작성한 기사·인증 토큰은 DB 설정에 따라 함께 삭제됩니다)
    await prisma.user.delete({ where: { id: user.userId } });

    // 로그인 출입증 쿠키 즉시 만료
    const response = ok(undefined, "회원탈퇴가 완료되었습니다.");
    response.cookies.set("auth_token", "", { httpOnly: true, maxAge: 0, path: "/" });

    return response;
  } catch (error) {
    return serverError("회원탈퇴 오류", error);
  }
}
