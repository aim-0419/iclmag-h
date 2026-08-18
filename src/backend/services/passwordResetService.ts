import { randomBytes } from "crypto";
import prisma from "@/backend/lib/db";

// ============================================================
// 비밀번호 재설정 열쇠(토큰) 처리
//
// [비개발자 설명]
// 비밀번호를 잊은 사람에게 "임시 열쇠"가 담긴 링크를 메일로 보냅니다.
// 이 열쇠는 추측할 수 없는 무작위 64자리 문자열이며,
// 30분이 지나거나 한 번 사용하면 즉시 폐기됩니다.
// ============================================================

/** 열쇠 유효 시간 (30분) */
const TOKEN_LIFETIME_MS = 30 * 60 * 1000;

/**
 * 재설정 열쇠 발급
 * 기존 열쇠가 있으면 지우고 새로 만듭니다. (항상 최신 열쇠 1개만 유효)
 */
export async function createPasswordResetToken(userId: number): Promise<string> {
  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  // 무작위 32바이트를 16진수 문자열(64자)로 변환합니다.
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_LIFETIME_MS);

  await prisma.passwordResetToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
}

/**
 * 열쇠 확인
 *
 * @returns 열쇠 주인의 회원 번호, 열쇠가 없거나 만료됐으면 null
 */
export async function verifyPasswordResetToken(token: string): Promise<number | null> {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!record) return null;

  // 시간이 지난 열쇠는 지우고 거절합니다.
  if (record.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } });
    return null;
  }

  return record.userId;
}

/** 사용을 마친 열쇠 폐기 */
export async function deletePasswordResetToken(token: string): Promise<void> {
  await prisma.passwordResetToken.deleteMany({ where: { token } });
}
