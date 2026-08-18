import nodemailer from "nodemailer";
import { SITE } from "@/constants/site";

// ============================================================
// 이메일 발송 (Gmail SMTP 사용)
//
// [비개발자 설명]
// 회원가입 인증 코드와 비밀번호 재설정 링크를 보내는 곳입니다.
// 보내는 계정 정보는 .env.local 파일의 EMAIL_ 로 시작하는 값들이며,
// Gmail 은 일반 비밀번호가 아니라 "앱 비밀번호"를 발급받아 넣어야 합니다.
//
// 메일 본문은 HTML(웹페이지와 같은 형식)로 되어 있어
// 색상·버튼 등이 그대로 보입니다. 문구를 바꾸려면 아래 글자만
// 수정하면 됩니다.
// ============================================================

/** 메일 발송기 (한 번만 만들어 계속 재사용합니다) */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: true, // 465 포트는 SSL 암호화 연결
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/** 보내는 사람 표시 이름 */
const FROM = process.env.EMAIL_FROM || `${SITE.name} <noreply@example.com>`;

/**
 * 모든 메일에 공통으로 들어가는 바깥 틀 (로고 + 인사말 + 꼬리말)
 * 안쪽 내용만 바꿔서 재사용합니다.
 */
function wrapTemplate(name: string, bodyHtml: string): string {
  return `
    <div style="font-family: 'Apple SD Gothic Neo', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 20px; font-weight: bold; color: #0a0a0a; margin: 0;">${SITE.name}</h1>
      </div>

      <h2 style="font-size: 17px; font-weight: 600; color: #111; margin-bottom: 10px;">
        안녕하세요, ${name}님!
      </h2>

      ${bodyHtml}

      <p style="font-size: 12px; color: #aaa; line-height: 1.6; text-align: center;">
        본인이 요청하지 않은 경우 이 메일을 무시해주세요.
      </p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
      <p style="font-size: 11px; color: #bbb; text-align: center;">
        본 메일은 발신 전용입니다. 문의: ${SITE.phone}<br/>
        ${SITE.copyright}
      </p>
    </div>
  `;
}

/**
 * 회원가입 인증 코드 발송 (6자리 숫자, 10분간 유효)
 *
 * @param to   받는 사람 이메일
 * @param name 받는 사람 이름
 * @param code 6자리 인증 코드
 */
export async function sendVerificationEmail(to: string, name: string, code: string) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `[${SITE.name}] 이메일 인증 코드`,
    html: wrapTemplate(
      name,
      `
        <p style="font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 28px;">
          아래 인증 코드를 <strong>이메일 인증 화면</strong>에 입력해주세요.<br/>
          코드는 <strong>10분</strong> 동안 유효합니다.
        </p>

        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: #f5f5f5; border-radius: 12px; padding: 20px 40px;">
            <span style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #0a0a0a; font-family: monospace;">
              ${code}
            </span>
          </div>
        </div>
      `
    ),
  });
}

/**
 * 비밀번호 재설정 링크 발송 (30분간 유효)
 *
 * @param to    받는 사람 이메일
 * @param name  받는 사람 이름
 * @param token 재설정 링크에 들어갈 임시 열쇠
 */
export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `[${SITE.name}] 비밀번호 재설정`,
    html: wrapTemplate(
      name,
      `
        <p style="font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 28px;">
          비밀번호 재설정 요청이 접수되었습니다.<br/>
          아래 버튼을 눌러 새 비밀번호를 설정해주세요.<br/>
          링크는 <strong>30분</strong> 동안 유효합니다.
        </p>

        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${resetUrl}"
            style="display: inline-block; background: #c8102e; color: #ffffff; font-size: 15px; font-weight: 600; padding: 14px 36px; border-radius: 8px; text-decoration: none;">
            비밀번호 재설정하기
          </a>
        </div>

        <p style="font-size: 11px; color: #bbb; line-height: 1.6; text-align: center; word-break: break-all; margin-bottom: 24px;">
          버튼이 눌리지 않으면 아래 주소를 복사해 붙여넣으세요.<br/>${resetUrl}
        </p>
      `
    ),
  });
}
