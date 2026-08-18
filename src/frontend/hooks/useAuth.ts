"use client";

import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@/types";

// ============================================================
// 로그인 상태를 다루는 공통 기능 (커스텀 훅)
//
// [비개발자 설명]
// "지금 로그인했는가?", "관리자인가?", "로그아웃하기" 를
// 여러 화면에서 똑같이 처리하기 위한 공용 코드입니다.
// 헤더, 마이페이지, 기사 작성 화면이 모두 이것을 사용하므로
// 로그인 규칙이 바뀌면 이 파일만 고치면 됩니다.
// ============================================================

export function useAuth() {
  /** 로그인한 사용자 정보 (로그인 안 했으면 null) */
  const [user, setUser] = useState<AuthUser | null>(null);
  /** 아직 확인 중인지 여부 (확인 전에 "로그인 안 됨"으로 보이는 깜빡임 방지) */
  const [isLoading, setIsLoading] = useState(true);

  /** 서버에 "내 정보"를 물어봅니다. */
  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch {
      // 네트워크 오류 등은 "로그인 안 됨"으로 처리합니다.
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** 로그아웃 (서버에서 출입증 쿠키를 지웁니다) */
  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  // 화면이 처음 열릴 때 한 번 확인합니다.
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return {
    user,
    isLoading,
    /** 로그인 여부 */
    isLoggedIn: !!user,
    /** 기사 작성 권한 여부 (관리자만 가능) */
    isAdmin: user?.role === "ADMIN",
    logout,
    /** 정보가 바뀐 뒤 다시 불러오고 싶을 때 사용 */
    refetch: fetchCurrentUser,
  };
}
