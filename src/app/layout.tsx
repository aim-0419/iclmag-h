import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/frontend/components/layout/Header";
import Footer from "@/frontend/components/layout/Footer";
import { SITE } from "@/constants/site";

// ============================================================
// 전체 화면 공통 틀 (레이아웃)
//
// [비개발자 설명]
// 어떤 페이지를 열어도 항상 같은 위치에 나오는 껍데기입니다.
//   맨 위  : 헤더 (로고 · 로그인 · 카테고리 탭)
//   가운데 : 각 페이지 내용
//   맨 아래: 푸터 (약관 링크 · 회사 정보)
// 브라우저 탭에 뜨는 제목과 검색엔진용 설명도 여기서 정합니다.
// ============================================================

export const metadata: Metadata = {
  title: {
    default: SITE.title,
    // 다른 페이지 제목 뒤에 자동으로 " | ICL MAG-H" 가 붙습니다.
    template: `%s | ${SITE.shortName}`,
  },
  description: SITE.description,
  keywords: ["뉴스", "매거진", "정치", "경제", "사회", "IT", "세계"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE.shortName,
    title: SITE.title,
    description: SITE.description,
  },
};

// 휴대폰에서 화면 크기에 맞춰 보이도록 하는 설정
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      {/*
        flex 세로 배치 + main 의 flex-1 :
        기사가 적어 내용이 짧은 페이지에서도 푸터가 화면 중간에 뜨지 않고
        항상 화면 맨 아래에 붙습니다.
      */}
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        <Header />

        <main className="flex-1 bg-surface">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
