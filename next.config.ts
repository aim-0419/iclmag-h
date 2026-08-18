import type { NextConfig } from "next";
import path from "path";

// ============================================================
// Next.js 설정
//
// [비개발자 설명]
// 사이트를 빌드(배포용으로 묶는 작업)할 때 필요한 옵션입니다.
// 평소 기능 수정에는 건드릴 일이 거의 없습니다.
// ============================================================

const nextConfig: NextConfig = {
  // 이 폴더를 프로젝트의 최상위로 고정합니다.
  // (상위 폴더에 다른 package-lock.json 이 있으면 Next.js 가
  //  엉뚱한 폴더를 기준으로 잡아 빌드 경고가 나기 때문입니다)
  outputFileTracingRoot: path.join(__dirname),

  images: {
    // 기사 사진은 서버 안 /public/uploads 에 저장되므로
    // 외부 주소 허용 설정은 개발용 localhost 만 열어둡니다.
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
