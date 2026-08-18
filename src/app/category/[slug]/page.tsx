import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticles } from "@/backend/services/articleService";
import { CATEGORY_LABELS, CATEGORY_SLUGS } from "@/constants/categories";
import ArticleGrid from "@/frontend/components/articles/ArticleGrid";
import Pagination from "@/frontend/components/ui/Pagination";

// ============================================================
// 카테고리별 기사 목록 화면 (주소: /category/politics 등)
//
// [비개발자 설명]
// 헤더의 "정치 / 경제 / 사회 ..." 탭을 눌렀을 때 열리는 화면입니다.
// 해당 분야 기사만 최신순으로 12건씩 보여줍니다.
// ============================================================

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

/** 검색엔진에 노출될 페이지 제목·설명을 만듭니다. */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORY_SLUGS[slug];
  if (!category) return { title: "카테고리를 찾을 수 없습니다" };

  const categoryLabel = CATEGORY_LABELS[category];
  return {
    title: `${categoryLabel} 뉴스`,
    description: `ICL MAG-H의 ${categoryLabel} 분야 최신 뉴스와 기사를 확인하세요.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;

  // 주소의 slug(politics)를 DB 값(POLITICS)으로 바꿉니다.
  const category = CATEGORY_SLUGS[slug];

  // 없는 카테고리 주소로 들어오면 404 화면을 보여줍니다.
  if (!category) notFound();

  const currentPage = Number(page) || 1;
  const categoryLabel = CATEGORY_LABELS[category];

  const { articles, total, totalPages } = await getArticles(currentPage, category);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 카테고리 제목 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-accent rounded-full flex-shrink-0" />
          <h1 className="text-2xl font-bold text-gray-900 break-keep">{categoryLabel}</h1>
        </div>
        <p className="text-gray-500 text-sm ml-4">
          총 <strong className="text-gray-700">{total}</strong>개의 기사
        </p>
      </div>

      <ArticleGrid
        articles={articles}
        emptyTitle={`${categoryLabel} 기사가 없습니다.`}
        emptyDescription="곧 새로운 기사가 등록될 예정입니다."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/category/${slug}`}
      />
    </div>
  );
}
