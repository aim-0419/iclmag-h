import bcrypt from "bcryptjs";
import prisma from "@/backend/lib/db";
import { Role } from "@prisma/client";

// ============================================================
// 회원 관련 처리 (가입 / 로그인 검증 / 조회)
//
// [비개발자 설명]
// 비밀번호는 절대 원문 그대로 저장하지 않습니다.
// bcrypt 라는 방식으로 뒤섞어(해시) 저장하기 때문에,
// 설령 데이터베이스가 통째로 유출되어도 원래 비밀번호를 알 수 없습니다.
// 로그인할 때는 입력값을 같은 방식으로 뒤섞어 비교합니다.
// ============================================================

/** 비밀번호를 뒤섞는 강도 (숫자가 클수록 안전하지만 느려집니다) */
const SALT_ROUNDS = 12;

/** 화면에 돌려줘도 안전한 항목들 (비밀번호는 절대 포함하지 않음) */
const PUBLIC_FIELDS = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} as const;

/** 이메일로 회원 찾기 (비밀번호 포함 - 서버 내부 검증용) */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

/** 회원 번호로 찾기 (비밀번호 제외 - 화면에 전달해도 안전) */
export async function findUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: PUBLIC_FIELDS,
  });
}

/**
 * 회원가입
 * 이메일이 이미 있으면 오류를 발생시키고, 없으면 비밀번호를 뒤섞어 저장합니다.
 * 새 계정은 항상 일반 회원(USER) 등급으로 만들어집니다.
 */
export async function createUser(email: string, password: string, name: string) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("이미 사용 중인 이메일입니다.");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  return prisma.user.create({
    data: { email, password: hashedPassword, name, role: Role.USER },
    select: PUBLIC_FIELDS,
  });
}

/**
 * 로그인 검증
 * 이메일 또는 이름(아이디) 중 아무거나 입력해도 로그인할 수 있습니다.
 *
 * @returns 비밀번호를 뺀 회원 정보, 로그인 실패 시 null
 */
export async function validateLogin(emailOrName: string, password: string) {
  const input = emailOrName.trim();

  // 1) 이메일로 먼저 찾고, 없으면 2) 이름으로 찾습니다.
  const user =
    (await findUserByEmail(input)) ??
    (await prisma.user.findFirst({ where: { name: input } }));

  if (!user) return null;

  // 입력한 비밀번호를 같은 방식으로 뒤섞어 저장된 값과 비교
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return null;

  // 비밀번호 항목만 빼고 나머지를 돌려줍니다. (이메일 인증 여부 포함)
  const { password: _hashedPassword, ...userWithoutPassword } = user;
  void _hashedPassword;
  return userWithoutPassword;
}

/**
 * 가입 입력값 검사
 *
 * @param name 회원가입일 때만 전달 (로그인 검증에는 생략)
 * @returns 문제가 있으면 안내문 목록, 없으면 빈 배열
 */
export function validateUserInput(email: string, password: string, name?: string): string[] {
  const errors: string[] = [];

  // 이메일 형식 검사 (@ 와 도메인이 있는지)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("올바른 이메일 형식을 입력해주세요.");
  }

  if (!password || password.length < 8) {
    errors.push("비밀번호는 최소 8자 이상이어야 합니다.");
  }

  if (name !== undefined && (!name || name.trim().length < 2)) {
    errors.push("이름은 최소 2자 이상이어야 합니다.");
  }

  return errors;
}
