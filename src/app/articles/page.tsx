import type { Metadata } from "next";
import { getArticles } from "@/backend/services/articleService";
import ArticleGrid from "@/frontend/components/articles/ArticleGrid";
import Pagination from "@/frontend/components/ui/Pagination";
import SectionHeading from "@/frontend/components/ui/SectionHeading";

// ============================================================
// 전체 기사 목록 화면 (주소: /articles )
//
// [비개발자 설명]
// 홈 화면 아래 "기사 더보기" 버튼을 누르면 오는 페이지입니다.
// 카테고리 구분 없이 발행된 모든 기사를 최신순으로 12건씩 보여주고,
// 아래쪽 번호 버튼으로 다음 페이지를 넘겨볼 수 있습니다.
//
// ※ 이전에는 이 페이지가 없어서 "기사 더보기"를 누르면
//    "페이지를 찾을 수 없습니다" 화면이 떴습니다.
// ============================================================

export const metadata: Metadata = {
  title: "전체 기사",
  description: "ICL MAG-H에 발행된 모든 기사를 최신순으로 확인하세요.",
};

interface ArticlesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const { articles, total, totalPages } = await getArticles(currentPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-accent rounded-full" />
          <h1 className="text-2xl font-bold text-gray-900">전체 기사</h1>
        </div>
        <p className="text-gray-500 text-sm ml-4">
          총 <strong className="text-gray-700">{total}</strong>개의 기사
        </p>
      </div>

      <SectionHeading title="최신순" suffix={`${currentPage} / ${totalPages} 페이지`} />

      <ArticleGrid
        articles={articles}
        emptyTitle="아직 등록된 기사가 없습니다."
        emptyDescription="첫 번째 기사를 기다리고 있습니다."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/articles" />
    </div>
  );
}
