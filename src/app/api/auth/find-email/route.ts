import { NextRequest } from "next/server";
import prisma from "@/backend/lib/db";
import { fail, notFound, serverError } from "@/backend/lib/apiResponse";

// ============================================================
// 아이디(이메일) 찾기 API   POST /api/auth/find-email
//
// [비개발자 설명]
// 가입할 때 쓴 이름으로 이메일을 찾아줍니다.
// 단, 이메일을 통째로 보여주면 남의 주소가 노출되므로
// 앞 3글자만 남기고 나머지는 별표로 가려서 알려줍니다.
//   예) hong1234@gmail.com  →  hon*****@gmail.com
// ============================================================

/** 이메일 앞부분을 가려서 돌려줍니다. */
function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  const visible = localPart.slice(0, 3);
  // 최소 2개는 가려서 원래 길이를 짐작하기 어렵게 합니다.
  const hidden = "*".repeat(Math.max(localPart.length - 3, 2));
  return `${visible}${hidden}@${domain}`;
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || name.trim().length < 2) {
      return fail("이름을 2자 이상 입력해주세요.");
    }

    const users = await prisma.user.findMany({
      where: { name: name.trim() },
      select: { email: true, createdAt: true },
    });

    if (users.length === 0) {
      return notFound("해당 이름으로 가입된 계정이 없습니다.");
    }

    const accounts = users.map((user) => ({
      email: maskEmail(user.email),
      createdAt: user.createdAt.toLocaleDateString("ko-KR"),
    }));

    // 화면(FindEmailModal)이 accounts 키로 읽고 있어 형태를 그대로 유지합니다.
    return Response.json({ success: true, accounts });
  } catch (error) {
    return serverError("아이디 찾기 오류", error);
  }
}
