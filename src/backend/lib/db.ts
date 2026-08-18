import { PrismaClient } from "@prisma/client";

// ============================================================
// 데이터베이스 연결 (Prisma)
//
// [비개발자 설명]
// 회원·기사 정보가 저장된 데이터베이스와 이야기하는 창구입니다.
// 서버 전체에서 이 창구 하나만 만들어 함께 씁니다.
//
// 개발 중에는 코드를 저장할 때마다 서버가 부분적으로 다시 켜지는데,
// 그때마다 새 연결을 만들면 연결 수가 계속 늘어나 DB가 멈춥니다.
// 그래서 "이미 만든 연결이 있으면 그것을 재사용"하도록 했습니다.
// ============================================================

// 개발 환경에서 기존 연결을 보관해 둘 전역 저장소
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // 개발 중에는 실행된 질의를 자세히 보여주고,
    // 실제 서비스에서는 오류만 기록합니다. (기록이 너무 많이 쌓이지 않도록)
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// 실제 서비스 환경에서는 전역에 담아두지 않습니다.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
