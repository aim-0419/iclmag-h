import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/backend/lib/db";
import {
  verifyPasswordResetToken,
  deletePasswordResetToken,
} from "@/backend/services/passwordResetService";
import { fail, ok, serverError } from "@/backend/lib/apiResponse";

// ============================================================
// 비밀번호 재설정 API   POST /api/auth/reset-password
//
// [비개발자 설명]
// 메일로 받은 링크의 임시 열쇠(token)와 새 비밀번호를 받아
// 비밀번호를 바꿔줍니다.
// 한 번 사용한 열쇠는 즉시 폐기해 다시 쓰지 못하게 합니다.
// ============================================================

/** 비밀번호를 뒤섞는 강도 (회원가입과 동일하게 유지) */
const SALT_ROUNDS = 12;

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) return fail("올바르지 않은 요청입니다.");
    if (password.length < 8) return fail("비밀번호는 8자 이상이어야 합니다.");

    // 열쇠가 진짜인지, 30분이 지나지 않았는지 확인
    const userId = await verifyPasswordResetToken(token);
    if (!userId) return fail("유효하지 않거나 만료된 링크입니다.");

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // 사용한 열쇠 폐기
    await deletePasswordResetToken(token);

    return ok(undefined, "비밀번호가 성공적으로 변경되었습니다.");
  } catch (error) {
    return serverError("비밀번호 재설정 오류", error);
  }
}
