import Link from "next/link";
import Image from "next/image";
import type { ArticleListItem } from "@/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/constants/categories";
import { formatRelativeDate } from "@/frontend/utils/date";

// ============================================================
// 기사 카드 (목록에 보이는 기사 한 칸)
//
// [비개발자 설명]
// 같은 기사 정보를 자리에 맞게 세 가지 모양으로 보여줍니다.
//   · featured : 홈 맨 위 대표 기사 (큰 사진)
//   · side     : 대표 기사 옆에 붙는 가로형 기사
//   · default  : 아래쪽 기사 목록의 일반 카드
// 어떤 모양이든 제목이 길면 두 줄까지만 보이고 "..." 로 줄여서
// 카드 크기가 들쭉날쭉해지거나 글자가 화면 밖으로 넘치지 않습니다.
// ============================================================

type CardVariant = "default" | "featured" | "side";

interface ArticleCardProps {
  article: ArticleListItem;
  variant?: CardVariant;
  /** 화면 최상단 이미지일 때 true (먼저 불러와 첫 화면이 빨리 뜹니다) */
  priority?: boolean;
}

/** 썸네일 사진이 없는 기사에 보여줄 대체 그림 */
function ThumbnailPlaceholder({ size }: { size: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <span className={size}>📰</span>
    </div>
  );
}

export default function ArticleCard({
  article,
  variant = "default",
  priority = false,
}: ArticleCardProps) {
  const categoryLabel = CATEGORY_LABELS[article.category];
  const categoryColor = CATEGORY_COLORS[article.category];
  const dateText = formatRelativeDate(article.createdAt);

  // ----------------------------------------------------------
  // featured : 홈 맨 위 대표 기사
  // ----------------------------------------------------------
  if (variant === "featured") {
    return (
      <Link href={`/articles/${article.id}`} className="group block h-full">
        <div className="relative w-full h-56 sm:h-72 lg:h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
          {article.thumbnail ? (
            <Image
              src={article.thumbnail}
              alt={article.title}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority={priority}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <ThumbnailPlaceholder size="text-5xl" />
          )}
          <span className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded ${categoryColor}`}>
            {categoryLabel}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-accent transition-colors line-clamp-2 break-keep mb-2">
          {article.title}
        </h2>
        {article.summary && (
          <p className="text-gray-500 text-sm line-clamp-2 break-keep mb-3">{article.summary}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
          <span className="truncate max-w-[8rem]">{article.author.name}</span>
          <span>·</span>
          <span>{dateText}</span>
          <span>·</span>
          <span>조회 {article.views.toLocaleString()}</span>
        </div>
      </Link>
    );
  }

  // ----------------------------------------------------------
  // side : 대표 기사 옆 가로형 기사 (사진 왼쪽 + 글 오른쪽)
  // ----------------------------------------------------------
  if (variant === "side") {
    return (
      <Link
        href={`/articles/${article.id}`}
        className="group flex h-full min-h-[6.5rem] bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="relative w-28 sm:w-2/5 flex-shrink-0 bg-gray-100">
          {article.thumbnail ? (
            <Image
              src={article.thumbnail}
              alt={article.title}
              fill
              sizes="(max-width: 1024px) 40vw, 15vw"
              className="object-cover"
            />
          ) : (
            <ThumbnailPlaceholder size="text-3xl" />
          )}
        </div>

        {/* min-w-0 : 제목이 길어도 사진을 밀어내지 않고 글자만 줄바꿈되게 합니다. */}
        <div className="flex-1 min-w-0 flex flex-col justify-center px-4 py-3">
          <span className={`self-start text-xs font-bold px-1.5 py-0.5 rounded ${categoryColor}`}>
            {categoryLabel}
          </span>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-accent transition-colors line-clamp-2 break-keep mt-1.5">
            {article.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1.5 truncate">
            {article.author.name} · {dateText}
          </p>
        </div>
      </Link>
    );
  }

  // ----------------------------------------------------------
  // default : 아래쪽 목록의 일반 카드
  // ----------------------------------------------------------
  return (
    <Link
      href={`/articles/${article.id}`}
      className="group flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
    >
      <div className="relative w-full h-44 sm:h-48 bg-gray-100 flex-shrink-0">
        {article.thumbnail ? (
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <ThumbnailPlaceholder size="text-4xl" />
        )}
        <span className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded ${categoryColor}`}>
          {categoryLabel}
        </span>
      </div>

      {/* flex-1 + mt-auto : 요약 길이가 달라도 아래 정보 줄의 높이가 나란히 맞춰집니다. */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 group-hover:text-accent transition-colors line-clamp-2 break-keep text-base mb-2">
          {article.title}
        </h3>
        {article.summary && (
          <p className="text-gray-500 text-sm line-clamp-2 break-keep mb-3">{article.summary}</p>
        )}
        <div className="flex items-center justify-between gap-2 text-xs text-gray-400 mt-auto pt-1">
          <span className="truncate min-w-0">
            {article.author.name} · {dateText}
          </span>
          <span className="flex-shrink-0">👁 {article.views.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}
