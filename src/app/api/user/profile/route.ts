import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/backend/lib/db";
import { getAuthUser } from "@/backend/middleware/auth";
import { fail, notFound, ok, serverError, unauthorized } from "@/backend/lib/apiResponse";

// ============================================================
// 프로필 수정 API   PUT /api/user/profile
//
// [비개발자 설명]
// 마이페이지에서 "이름 변경" 또는 "비밀번호 변경"을 누르면 실행됩니다.
// 비밀번호를 바꿀 때는 반드시 현재 비밀번호를 함께 확인해서,
// 자리를 비운 사이 다른 사람이 몰래 바꾸는 일을 막습니다.
// ============================================================

/** 비밀번호를 뒤섞는 강도 (회원가입과 동일하게 유지) */
const SALT_ROUNDS = 12;

export async function PUT(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { name, currentPassword, newPassword } = await request.json();

    // 실제로 바꿀 내용을 담을 상자
    const updateData: { name?: string; password?: string } = {};

    // ---------- 이름 변경 ----------
    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return fail("이름은 최소 2자 이상이어야 합니다.");
      }
      updateData.name = name.trim();
    }

    // ---------- 비밀번호 변경 ----------
    if (newPassword !== undefined) {
      if (!currentPassword) return fail("현재 비밀번호를 입력해주세요.");
      if (newPassword.length < 8) return fail("새 비밀번호는 최소 8자 이상이어야 합니다.");

      const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
      if (!dbUser) return notFound("사용자를 찾을 수 없습니다.");

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
      if (!isCurrentPasswordValid) return fail("현재 비밀번호가 올바르지 않습니다.");

      updateData.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    }

    // 바꿀 내용이 하나도 없으면 알려줍니다.
    if (Object.keys(updateData).length === 0) {
      return fail("변경할 정보가 없습니다.");
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: updateData,
      select: { id: true, email: true, name: true, role: true },
    });

    return ok(updatedUser, "프로필이 수정되었습니다.");
  } catch (error) {
    return serverError("프로필 수정 오류", error);
  }
}
