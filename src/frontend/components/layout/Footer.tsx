import Link from "next/link";
import { POLICY_TABS } from "@/constants/policies";
import { SITE } from "@/constants/site";

// ============================================================
// 사이트 하단 푸터 (약관 링크 · 회사 정보 · 저작권)
//
// [비개발자 설명]
// 모든 화면 맨 아래에 붙는 영역입니다.
// 약관 링크 목록과 회사 정보는 각각
//   src/constants/policies.ts  (약관)
//   src/constants/site.ts      (회사 정보)
// 에서 가져오므로, 문구를 바꾸려면 그 파일만 수정하면 됩니다.
// ============================================================

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-16">
      {/* ---------- 약관 링크 ---------- */}
      {/* 화면이 좁으면 자동으로 여러 줄로 접히고, 구분선(|)은 줄 첫 항목에서 숨깁니다. */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-3">
        <ul className="flex flex-wrap justify-center items-center gap-x-1 gap-y-1.5">
          {POLICY_TABS.map((link, index) => (
            <li key={link.type} className="flex items-center">
              {index > 0 && (
                <span aria-hidden className="text-gray-300 mx-1.5 select-none text-xs">
                  |
                </span>
              )}
              <Link
                href={`/policy/${link.type}`}
                className="text-xs text-gray-500 hover:text-gray-800 transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* ---------- 회사 정보 ---------- */}
      <div className="max-w-7xl mx-auto px-6 py-4 text-center">
        <Link href="/">
          <span className="text-xs font-bold text-gray-600 block mb-2">{SITE.name}</span>
        </Link>

        <div className="space-y-1 text-xs text-gray-400 leading-5 break-keep">
          <p>
            신문사업 등록번호 {SITE.registration}
            <Separator />
            발행인 {SITE.publisher}
            <Separator />
            편집인 {SITE.editor}
            <Separator />
            개인정보관리책임자 {SITE.privacyOfficer}
            <Separator />
            청소년보호책임자 {SITE.youthOfficer}
          </p>
          <p>
            발행 {SITE.address}
            <Separator />
            대표번호 {SITE.phone}
          </p>
          <p>{SITE.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

/** 회사 정보 항목 사이를 구분하는 세로선 */
function Separator() {
  return (
    <span aria-hidden className="text-gray-300 mx-1.5">
      |
    </span>
  );
}
