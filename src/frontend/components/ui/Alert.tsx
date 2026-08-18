// ============================================================
// 알림 메시지 상자 (성공 / 오류 / 안내)
//
// [비개발자 설명]
// "저장되었습니다", "비밀번호가 틀립니다" 같은 메시지를
// 로그인·회원가입·마이페이지 등 여러 화면에서 똑같은 모양으로
// 보여주기 위한 공통 부품입니다.
// ============================================================

type AlertTone = "success" | "error" | "info";

/** 종류별 색상 조합 */
const TONE_STYLES: Record<AlertTone, string> = {
  success: "bg-green-50 border-green-200 text-green-700",
  error: "bg-red-50 border-red-200 text-red-700",
  info: "bg-yellow-50 border-yellow-200 text-yellow-700",
};

interface AlertProps {
  tone: AlertTone;
  /** 보여줄 문구. 비어 있으면 아무것도 그리지 않습니다. */
  children?: React.ReactNode;
  className?: string;
}

export default function Alert({ tone, children, className = "" }: AlertProps) {
  if (!children) return null;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`text-sm rounded-lg border px-4 py-3 break-words ${TONE_STYLES[tone]} ${className}`}
    >
      {children}
    </div>
  );
}
