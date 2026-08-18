// ============================================================
// 목록 위에 붙는 구간 제목 (검은 띠 + 라벨)
//
// [비개발자 설명]
// "최신 기사", "정치" 처럼 목록이 시작되는 지점을 알려주는 제목 줄입니다.
// 홈과 전체 기사 목록이 같은 모양을 쓰도록 하나로 묶었습니다.
// ============================================================

interface SectionHeadingProps {
  /** 검은 띠 안에 들어갈 글자 */
  title: string;
  /** 오른쪽에 덧붙일 보조 문구 (예: "총 32개의 기사") */
  suffix?: React.ReactNode;
}

export default function SectionHeading({ title, suffix }: SectionHeadingProps) {
  return (
    <div className="border-t-2 border-primary mb-6 flex items-start justify-between gap-3">
      <h2 className="bg-primary text-white text-sm font-bold px-4 py-2 whitespace-nowrap">
        {title}
      </h2>
      {suffix && <span className="text-xs text-gray-500 pt-2.5">{suffix}</span>}
    </div>
  );
}
