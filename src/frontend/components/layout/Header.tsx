"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/constants/categories";
import { useAuth } from "@/frontend/hooks/useAuth";

// ============================================================
// 사이트 상단 헤더 (로고 · 로그인 메뉴 · 카테고리 탭)
//
// [비개발자 설명]
// 모든 화면 맨 위에 항상 붙어 있는 영역입니다.
//   윗줄  : 로고, 로그인/회원가입 또는 내 이름·로그아웃(관리자는 기사쓰기)
//   아랫줄: 정치·경제·사회… 카테고리 탭
//
// 휴대폰처럼 화면이 좁을 때는 윗줄 메뉴가 밖으로 넘치지 않도록
// 햄버거(≡) 버튼 안으로 접어서 보여줍니다.
// ============================================================

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // 로그인 상태는 공용 훅에서 가져옵니다.
  const { user, isAdmin, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 다른 페이지로 이동하면 열려 있던 모바일 메뉴를 닫습니다.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  /** 로그아웃 후 홈으로 이동 */
  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  /** 카테고리 탭 하나의 스타일 (현재 보고 있는 탭은 빨간색 밑줄) */
  const tabClass = (isActive: boolean) =>
    `block px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
      isActive ? "text-accent border-accent" : "text-gray-400 hover:text-white border-transparent"
    }`;

  return (
    <header className="bg-primary text-white">
      {/* ---------- 윗줄: 로고 + 계정 메뉴 ---------- */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          {/* 매거진 로고 */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-accent font-black text-2xl sm:text-3xl tracking-tighter">ICL</span>
            <span className="font-light text-lg sm:text-xl tracking-widest text-gray-300">MAG-H</span>
          </Link>

          {/* 넓은 화면용 계정 메뉴 (좁은 화면에서는 숨기고 햄버거로 대체) */}
          <nav className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/write"
                    className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded transition-colors"
                  >
                    ✏️ 기사 쓰기
                  </Link>
                )}
                <Link
                  href="/mypage"
                  className="text-gray-400 hover:text-white text-sm transition-colors max-w-[10rem] truncate"
                >
                  {user.name}님
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white text-sm transition-colors">
                  로그인
                </Link>
                <Link href="/register" className="text-gray-300 hover:text-white text-sm transition-colors">
                  회원가입
                </Link>
              </>
            )}
          </nav>

          {/* 좁은 화면용 햄버거 버튼 */}
          <button
            type="button"
            className="sm:hidden text-gray-400 hover:text-white p-1 -mr-1"
            aria-label="메뉴 열기"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ---------- 아랫줄: 카테고리 탭 ---------- */}
      {/* 화면이 좁으면 옆으로 밀어서 볼 수 있고, 스크롤바는 숨겨 깔끔하게 보입니다. */}
      <nav className="bg-primary border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <li>
              <Link href="/" className={tabClass(pathname === "/")}>
                전체
              </Link>
            </li>
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  className={tabClass(pathname === `/category/${category.slug}`)}
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ---------- 좁은 화면에서 햄버거를 눌렀을 때 펼쳐지는 메뉴 ---------- */}
      {isMenuOpen && (
        <div className="sm:hidden bg-gray-900 border-b border-gray-800 px-4 py-3">
          {user ? (
            <div className="flex flex-col gap-3">
              <Link href="/mypage" className="text-gray-300 text-sm truncate">
                {user.name}님 (마이페이지)
              </Link>
              {isAdmin && (
                <Link href="/write" className="text-accent text-sm">
                  ✏️ 기사 쓰기
                </Link>
              )}
              <button onClick={handleLogout} className="text-gray-400 text-sm text-left">
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/login" className="text-gray-300 text-sm">
                로그인
              </Link>
              <Link href="/register" className="text-gray-300 text-sm">
                회원가입
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
