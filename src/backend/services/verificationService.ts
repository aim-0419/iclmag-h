import prisma from "@/backend/lib/db";

// ============================================================
// 이메일 인증 코드 처리
//
// [비개발자 설명]
// 회원가입한 사람이 진짜 그 이메일의 주인인지 확인하는 절차입니다.
//   1) 가입 즉시 6자리 숫자 코드를 만들어 저장하고 메일로 보냄
//   2) 사용자가 화면에 코드를 입력
//   3) 저장된 코드와 같고 10분이 지나지 않았으면 "인증 완료" 처리
// 인증이 끝나면 코드는 바로 삭제해 재사용을 막습니다.
// ============================================================

/** 코드 유효 시간 (10분) */
const CODE_LIFETIME_MS = 10 * 60 * 1000;

/** 6자리 무작위 숫자 코드를 만듭니다. (100000 ~ 999999) */
function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * 인증 코드 발급
 * 이미 발급한 코드가 있으면 지우고 새로 만듭니다. (항상 최신 코드 1개만 유효)
 *
 * @returns 새로 만든 6자리 코드
 */
export async function createVerificationToken(userId: number): Promise<string> {
  await prisma.verificationToken.deleteMany({ where: { userId } });

  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_LIFETIME_MS);

  await prisma.verificationToken.create({
    data: { token: code, userId, expiresAt },
  });

  return code;
}

/**
 * 입력한 코드를 확인하고 인증을 완료합니다.
 *
 * @param email 사용자가 입력한 이메일
 * @param code  사용자가 입력한 6자리 코드
 * @returns 성공 여부와 화면에 보여줄 안내문
 */
export async function verifyEmailCode(
  email: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { verificationTokens: true },
  });

  if (!user) {
    return { success: false, message: "존재하지 않는 계정입니다." };
  }

  // 이미 인증을 끝낸 계정이면 그대로 통과시킵니다.
  if (user.emailVerified) {
    return { success: true, message: "이미 인증된 계정입니다." };
  }

  const record = user.verificationTokens[0];
  if (!record) {
    return { success: false, message: "발급된 인증 코드가 없습니다. 코드를 다시 요청해주세요." };
  }

  // 10분이 지난 코드는 지우고 재발급을 안내합니다.
  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { userId: user.id } });
    return { success: false, message: "인증 코드가 만료되었습니다. 코드를 다시 요청해주세요." };
  }

  if (record.token !== code) {
    return { success: false, message: "인증 코드가 올바르지 않습니다." };
  }

  // "인증 완료 표시"와 "코드 삭제"를 한 묶음으로 처리합니다.
  // (둘 중 하나만 성공해 어중간한 상태가 남는 것을 방지)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    }),
    prisma.verificationToken.deleteMany({ where: { userId: user.id } }),
  ]);

  return { success: true, message: "이메일 인증이 완료되었습니다." };
}
