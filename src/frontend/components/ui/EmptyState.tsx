import Link from "next/link";

// ============================================================
// 내용이 없을 때 보여주는 안내 화면
//
// [비개발자 설명]
// "아직 등록된 기사가 없습니다" 처럼 빈 화면을 그냥 두면
// 오류가 난 것처럼 보입니다. 이 컴포넌트가 아이콘과 안내 문구를
// 통일된 모양으로 보여줍니다.
// ============================================================

interface EmptyStateProps {
  /** 위에 크게 표시할 이모지 */
  icon?: string;
  /** 굵은 안내 문구 */
  title: string;
  /** 아래 작은 보조 문구 */
  description?: string;
  /** 아래에 붙일 링크 버튼 (선택) */
  action?: { label: string; href: string };
}

export default function EmptyState({
  icon = "📰",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-20 px-4">
      <p className="text-5xl mb-4">{icon}</p>
      <p className="text-gray-500 text-lg">{title}</p>
      {description && <p className="text-gray-400 text-sm mt-2">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="inline-block mt-6 text-accent hover:underline text-sm"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
