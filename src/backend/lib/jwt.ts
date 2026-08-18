import { SignJWT, jwtVerify } from "jose";

// ============================================================
// 로그인 토큰(JWT) 만들기 / 검사하기
//
// [비개발자 설명]
// 로그인에 성공하면 서버가 "이 사람은 홍길동이고 관리자입니다"라는
// 내용이 담긴 위조 불가능한 출입증(토큰)을 발급합니다.
// 이후 요청마다 브라우저가 이 출입증을 함께 보내고,
// 서버는 서명을 확인해 진짜인지 검사합니다.
// 서명에 쓰이는 열쇠(JWT_SECRET)는 .env 파일에 보관합니다.
// ============================================================

// 출입증 서명에 사용할 비밀 열쇠 (반드시 .env 에 설정해야 합니다)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key-change-this"
);

// 출입증 유효기간 (기본 7일). 예) "7d", "24h", "60m"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/** 출입증에 담기는 사용자 정보 */
export interface JWTPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
}

/**
 * 출입증 발급 — 로그인 성공 시 호출합니다.
 *
 * @param payload 출입증에 담을 사용자 정보
 * @returns 서명된 토큰 문자열
 */
export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()                        // 발급 시각 기록
    .setExpirationTime(JWT_EXPIRES_IN)    // 만료 시각 설정
    .sign(JWT_SECRET);
}

/**
 * 출입증 검사 — 위조되었거나 기간이 지났으면 null 을 돌려줍니다.
 *
 * @param token 검사할 토큰 문자열
 * @returns 사용자 정보 또는 null
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    // 만료되었거나 서명이 맞지 않는 경우
    return null;
  }
}
