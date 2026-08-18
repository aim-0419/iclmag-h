import Link from "next/link";
import { getArticles } from "@/backend/services/articleService";
import ArticleCard from "@/frontend/components/articles/ArticleCard";
import ArticleGrid from "@/frontend/components/articles/ArticleGrid";
import EmptyState from "@/frontend/components/ui/EmptyState";
import SectionHeading from "@/frontend/components/ui/SectionHeading";

// ============================================================
// 홈 화면 (주소: / )
//
// [비개발자 설명]
// 가장 최근 기사 1건을 왼쪽에 큼직하게, 그 다음 2건을 오른쪽에 붙여
// "대표 기사" 영역을 만들고, 나머지 기사를 아래에 격자로 보여줍니다.
//
// 예전에는 대표 기사 3건이 아래 목록에도 똑같이 다시 나와서
// 같은 기사가 두 번 보였는데, 지금은 겹치지 않게 잘라서 보여줍니다.
// ============================================================

// 5초마다 최신 내용으로 갱신합니다. (매번 DB를 조회하지 않아 화면이 빠릅니다)
export const revalidate = 5;

/** 대표 기사 영역에 사용할 기사 수 (큰 카드 1 + 옆 카드 2) */
const FEATURED_COUNT = 3;

export default async function HomePage() {
  // 첫 페이지 기사(12건)를 한 번만 조회해서 대표 기사와 목록에 나눠 씁니다.
  const { articles, totalPages } = await getArticles(1);

  const mainArticle = articles[0];
  const sideArticles = articles.slice(1, FEATURED_COUNT);
  const restArticles = articles.slice(FEATURED_COUNT);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ---------- 대표 기사 영역 ---------- */}
      {mainArticle && (
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽: 가장 최신 기사 (큰 카드) */}
            <div className="lg:col-span-2">
              <ArticleCard article={mainArticle} variant="featured" priority />
            </div>

            {/*
              오른쪽: 그다음 기사 2건.
              lg:grid-rows-2 덕분에 왼쪽 큰 카드와 높이가 자동으로 맞춰집니다.
              (예전에는 오른쪽이 왼쪽의 2배 높이로 늘어나 화면이 뒤틀렸습니다)
            */}
            {sideArticles.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
                {sideArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="side" />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ---------- 최신 기사 목록 ---------- */}
      {/* 기사가 하나도 없을 때만 안내 문구를 보여줍니다. */}
      {articles.length === 0 && (
        <EmptyState
          title="아직 등록된 기사가 없습니다."
          description="첫 번째 기사를 기다리고 있습니다."
        />
      )}

      {/* 대표 기사를 뺀 나머지가 있을 때만 아래 목록을 그립니다. */}
      {restArticles.length > 0 && (
        <>
          <SectionHeading title="최신 기사" />
          <ArticleGrid articles={restArticles} />
        </>
      )}

      {/* 기사가 한 페이지(12건)를 넘으면 전체 목록으로 가는 버튼을 보여줍니다. */}
      {totalPages > 1 && (
        <div className="text-center mt-10">
          <Link
            href="/articles"
            className="inline-block border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            기사 더보기
          </Link>
        </div>
      )}
    </div>
  );
}
