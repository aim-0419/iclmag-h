import type { ArticleListItem } from "@/types";
import ArticleCard from "./ArticleCard";
import EmptyState from "@/frontend/components/ui/EmptyState";

// ============================================================
// 기사 목록 격자 (카드를 줄 맞춰 늘어놓는 부품)
//
// [비개발자 설명]
// 홈, 전체 기사, 카테고리 화면이 모두 같은 모양의 목록을 씁니다.
// 화면 너비에 따라 한 줄에 놓이는 카드 수가 자동으로 바뀝니다.
//   휴대폰 1개 → 태블릿 2개 → 노트북 3개 → 큰 모니터 4개
// 보여줄 기사가 하나도 없으면 안내 문구를 대신 보여줍니다.
// ============================================================

interface ArticleGridProps {
  articles: ArticleListItem[];
  /** 기사가 없을 때 보여줄 안내 문구 */
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function ArticleGrid({
  articles,
  emptyTitle = "아직 등록된 기사가 없습니다.",
  emptyDescription,
}: ArticleGridProps) {
  if (articles.length === 0) {
    return <EmptyState icon="📭" title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
