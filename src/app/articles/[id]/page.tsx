import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getArticleById, getArticleByIdOnly } from "@/backend/services/articleService";
import { getAuthUserFromCookies, isAdmin } from "@/backend/middleware/auth";
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_TO_SLUG } from "@/constants/categories";
import { formatFullDate } from "@/frontend/utils/date";
import ContentProtection from "@/frontend/components/articles/ContentProtection";
import DeleteArticleButton from "@/frontend/components/articles/DeleteArticleButton";

// ============================================================
// 기사 상세 화면 (주소: /articles/기사번호 )
//
// [비개발자 설명]
// 기사 하나를 처음부터 끝까지 보여주는 화면입니다.
// 이 화면을 열 때마다 해당 기사의 조회수가 1씩 올라갑니다.
// 관리자로 로그인한 경우에만 아래쪽에 "삭제" 버튼이 보입니다.
// ============================================================

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

/**
 * 검색엔진·카카오톡 공유 등에 쓰이는 정보를 만듭니다.
 * 이때는 조회수를 올리지 않는 함수를 사용합니다.
 * (공유 미리보기 때문에 조회수가 부풀려지지 않도록)
 */
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleByIdOnly(Number(id));

  if (!article) return { title: "기사를 찾을 수 없습니다" };

  return {
    title: article.title,
    description: article.summary || article.content.slice(0, 150),
    openGraph: {
      title: article.title,
      description: article.summary || undefined,
      images: article.thumbnail ? [article.thumbnail] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;

  // 기사를 가져오면서 조회수를 1 올립니다.
  const article = await getArticleById(Number(id));

  // 없는 기사이거나 아직 발행하지 않은 임시저장 기사면 404 화면을 보여줍니다.
  if (!article || article.status === "DRAFT") {
    notFound();
  }

  // 관리자에게만 삭제 버튼을 보여주기 위해 로그인 상태를 확인합니다.
  const canDelete = isAdmin(await getAuthUserFromCookies());

  const categoryLabel = CATEGORY_LABELS[article.category];
  const categoryColor = CATEGORY_COLORS[article.category];
  const categoryHref = `/category/${CATEGORY_TO_SLUG[article.category]}`;

  return (
    <ContentProtection>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* 현재 위치 표시 (홈 > 카테고리) */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-600">
            홈
          </Link>
          <span aria-hidden>›</span>
          <Link href={categoryHref} className="hover:text-gray-600">
            {categoryLabel}
          </Link>
        </nav>

        {/* ---------- 기사 머리말 ---------- */}
        <header className="mb-8">
          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${categoryColor}`}>
            {categoryLabel}
          </span>

          {/* break-keep : 한국어 단어가 어색하게 잘리지 않도록 줄바꿈합니다. */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight break-keep mb-5">
            {article.title}
          </h1>

          {article.summary && (
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed break-keep border-l-4 border-accent pl-4 mb-5">
              {article.summary}
            </p>
          )}

          {/* 작성자 · 작성일 · 조회수 */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {article.author.name.charAt(0)}
              </div>
              <span className="font-medium text-gray-700 truncate">{article.author.name}</span>
            </div>
            <span aria-hidden>·</span>
            <span>{formatFullDate(article.createdAt)}</span>
            <span aria-hidden>·</span>
            <span>👁 조회 {article.views.toLocaleString()}</span>
          </div>
        </header>

        {/* ---------- 대표 사진 ---------- */}
        {article.thumbnail && (
          <div className="relative w-full h-56 sm:h-72 md:h-96 rounded-xl overflow-hidden mb-8 bg-gray-100">
            <Image
              src={article.thumbnail}
              alt={article.title}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* ---------- 기사 본문 ---------- */}
        <article className="article-content mb-12">{article.content}</article>

        {/* ---------- 아래쪽 이동 버튼 ---------- */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/articles"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              ← 목록으로 돌아가기
            </Link>
            <div className="flex items-center gap-4">
              {canDelete && <DeleteArticleButton articleId={article.id} />}
              <Link
                href={categoryHref}
                className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColor}`}
              >
                {categoryLabel} 더보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ContentProtection>
  );
}
