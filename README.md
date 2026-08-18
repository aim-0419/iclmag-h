# ICL MAG-H — 이끌림필라테스매거진

정치·경제·사회·생활/문화·IT/과학·세계 기사를 발행하는 온라인 매거진 웹사이트입니다.

> 이 문서는 **개발자가 아닌 분도 읽을 수 있도록** 작성했습니다.
> 코드 파일마다 맨 위에 `[비개발자 설명]` 주석이 있으니 함께 보시면 이해가 빠릅니다.

---

## 1. 이 사이트로 무엇을 할 수 있나요?

| 기능 | 누가 쓸 수 있나 | 화면 주소 |
|---|---|---|
| 기사 읽기 | 누구나 (로그인 불필요) | `/`, `/articles`, `/articles/1` |
| 카테고리별 기사 보기 | 누구나 | `/category/politics` 등 |
| 회원가입 + 이메일 인증 | 누구나 | `/register` → `/verify-email` |
| 로그인 / 로그아웃 | 회원 | `/login` |
| 아이디·비밀번호 찾기 | 회원 | `/login` 안의 팝업 |
| 내 정보 수정 / 회원탈퇴 | 회원 | `/mypage` |
| **기사 작성·발행·삭제** | **관리자(ADMIN)만** | `/write` |
| 약관·정책 보기 | 누구나 | `/policy/privacy` 등 |

### 회원 등급

| 등급 | 설명 |
|---|---|
| `USER` | 일반 회원. 기사 읽기만 가능합니다. (회원가입 시 기본값) |
| `WRITER` | 기자 계정용으로 미리 만들어 둔 등급. **현재 권한은 USER와 같습니다.** |
| `ADMIN` | 관리자. 기사 작성·수정·삭제와 이미지 업로드가 가능합니다. |

> **관리자로 바꾸는 방법**
> `npm run db:studio` 를 실행하면 데이터베이스 편집 화면이 브라우저에 열립니다.
> `users` 표에서 해당 사람의 `role` 값을 `ADMIN` 으로 바꾸고 저장하면 됩니다.

---

## 2. 회원가입은 이렇게 진행됩니다

이메일 인증을 마쳐야만 로그인할 수 있습니다.

```
① /register 에서 이름·이메일·비밀번호 입력
        ↓
② 서버가 6자리 숫자 코드를 만들어 메일로 발송 (유효시간 10분)
        ↓
③ 자동으로 /verify-email 화면으로 이동 (이메일이 미리 채워져 있음)
        ↓
④ 메일에서 받은 6자리 코드 입력  → "인증하기"
   · 코드가 안 왔다면 "코드 다시 받기" (60초에 한 번)
        ↓
⑤ 인증 완료 → /login 에서 로그인
```

비밀번호를 잊었다면 로그인 화면의 **비밀번호 찾기** → 메일로 온 링크(30분간 유효)에서 새 비밀번호를 정하면 됩니다.

---

## 3. 폴더 구조

기능별로 폴더를 나눠 두었습니다. **"화면"과 "서버 처리"와 "고정 데이터"가 분리**되어 있어,
문구만 바꾸고 싶을 때 코드를 건드리지 않아도 됩니다.

```
src/
├── app/                        ← 주소(URL) 하나 = 폴더 하나
│   ├── page.tsx                    홈 화면
│   ├── layout.tsx                  모든 화면 공통 틀 (헤더 + 내용 + 푸터)
│   ├── not-found.tsx               404 화면
│   ├── globals.css                 전역 글꼴·색상·버튼 모양
│   ├── (auth)/                     로그인 · 회원가입
│   ├── verify-email/               이메일 인증 코드 입력
│   ├── reset-password/             새 비밀번호 설정
│   ├── articles/                   전체 기사 목록 + 기사 상세([id])
│   ├── category/[slug]/            카테고리별 기사 목록
│   ├── write/                      기사 작성 (관리자 전용)
│   ├── mypage/                     내 정보 · 회원탈퇴
│   ├── policy/[type]/              약관 · 정책 화면
│   └── api/                        ── 서버 처리 창구 ──
│       ├── auth/                     로그인·가입·인증·비밀번호
│       ├── articles/                 기사 목록/작성/수정/삭제
│       ├── user/                     프로필 수정·회원탈퇴
│       └── upload/                   이미지 업로드
│
├── backend/                    ← 서버 쪽 실제 처리
│   ├── lib/
│   │   ├── db.ts                   데이터베이스 연결
│   │   ├── jwt.ts                  로그인 출입증 발급·검사
│   │   ├── email.ts                메일 발송 (인증코드·비밀번호 재설정)
│   │   └── apiResponse.ts          API 응답 형식 통일
│   ├── middleware/auth.ts          "지금 누가 요청했나 / 관리자인가" 확인
│   └── services/                   비즈니스 로직
│       ├── articleService.ts         기사 조회·작성·수정·삭제
│       ├── userService.ts            가입·로그인 검증
│       ├── verificationService.ts    이메일 인증 코드
│       └── passwordResetService.ts   비밀번호 재설정 열쇠
│
├── frontend/                   ← 화면 부품
│   ├── components/
│   │   ├── layout/                 Header, Footer
│   │   ├── articles/               ArticleCard, ArticleGrid, Editor,
│   │   │                           ContentProtection, DeleteArticleButton
│   │   ├── auth/                   FindEmailModal, ForgotPasswordModal
│   │   └── ui/                     Alert, Modal, Pagination,
│   │                               EmptyState, SectionHeading
│   ├── hooks/useAuth.ts            로그인 상태 공통 처리
│   └── utils/date.ts               날짜 표시 형식
│
├── constants/                  ← ★ 문구·설정만 모아둔 곳 (여기만 고쳐도 됩니다)
│   ├── categories.ts               카테고리 목록·이름·색상
│   ├── policies.ts                 약관·정책 본문
│   └── site.ts                     회사명·주소·전화번호·저작권
│
└── types/index.ts              ← 데이터 생김새 정의
```

### 자주 바꾸게 되는 것 → 어느 파일?

| 바꾸고 싶은 것 | 파일 |
|---|---|
| 회사명·주소·전화번호·발행인 | `src/constants/site.ts` |
| 개인정보처리방침 등 약관 본문 | `src/constants/policies.ts` |
| 카테고리 이름·순서·배지 색 | `src/constants/categories.ts` |
| 한 페이지에 보여줄 기사 수 | `src/backend/services/articleService.ts` 의 `PAGE_SIZE` |
| 홈 화면 갱신 주기 | `src/app/page.tsx` 의 `revalidate` |
| 사이트 색상·버튼 모양 | `tailwind.config.ts`, `src/app/globals.css` |

---

## 4. 기술 스택

| 구분 | 사용 기술 |
|---|---|
| 프레임워크 | Next.js 15 (App Router) + React 19 + TypeScript |
| 데이터베이스 | MySQL + Prisma ORM |
| 스타일링 | Tailwind CSS |
| 로그인 | JWT(jose) — httpOnly 쿠키 저장 |
| 비밀번호 보관 | bcrypt 해시 (평문 저장 안 함) |
| 메일 발송 | Nodemailer + Gmail SMTP |
| 배포 | AWS EC2 + PM2 + GitHub Actions |

---

## 5. 처음 실행하는 방법

### 1) 필요한 프로그램 설치
- [Node.js](https://nodejs.org) 18 이상
- MySQL 8 이상

### 2) 소스 내려받고 라이브러리 설치

```bash
git clone <저장소 주소>
cd iclmag_hyo
npm install
```

### 3) 환경변수 파일 만들기

```bash
cp .env.example .env.local
```

`.env.local` 을 열어 데이터베이스 주소, `JWT_SECRET`, 메일 계정을 실제 값으로 바꿉니다.
각 항목의 의미는 파일 안 주석에 설명되어 있습니다.

> Prisma 도구는 `.env` 파일도 읽습니다. `DATABASE_URL` 은 `.env` 에도 같이 넣어주세요.

### 4) 데이터베이스 만들기

```sql
CREATE DATABASE iclmag CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5) 표(테이블) 생성

```bash
npm run db:push
```

### 6) 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 을 엽니다.

---

## 6. 자주 쓰는 명령어

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 (코드를 고치면 화면이 바로 바뀝니다) |
| `npm run build` | 배포용으로 묶기 (오류가 있으면 여기서 걸러집니다) |
| `npm start` | 묶어둔 결과물로 실제 서비스 실행 |
| `npm run lint` | 코드 문법·품질 검사 |
| `npm run db:push` | 설계도(schema.prisma)대로 데이터베이스 표 맞추기 |
| `npm run db:studio` | 브라우저에서 데이터베이스를 직접 보고 수정 |
| `npm run db:generate` | Prisma 코드 다시 생성 |

---

## 7. 배포

`main` 브랜치에 push 하면 GitHub Actions가 EC2 서버에 자동 배포합니다.
(`.github/workflows/deploy.yml`)

```
git push origin main
      ↓
EC2 접속 → git pull → npm install → prisma db push → npm run build → pm2 restart
```

수동으로 배포할 때:

```bash
npm run build
pm2 restart iclmag     # 최초 실행 시: pm2 start npm --name "iclmag" -- start
```

---

## 8. 보안 관련 메모

- 비밀번호는 **bcrypt로 해시**해 저장하므로 데이터베이스가 유출돼도 원문을 알 수 없습니다.
- 로그인 출입증은 **httpOnly 쿠키**에 담아 스크립트가 훔쳐갈 수 없습니다.
- 권한(관리자 여부)은 출입증에 적힌 값이 아니라 **매 요청마다 데이터베이스의 최신 값**으로 확인합니다.
  → 관리자 권한을 회수하면 기존 로그인 상태에서도 즉시 반영됩니다.
- 아이디 찾기·비밀번호 찾기·인증코드 재발송은 **가입 여부를 알려주지 않습니다.**
  (외부인이 회원 이메일 목록을 알아내지 못하도록)
- 업로드는 관리자만 가능하며, 이미지 형식과 5MB 용량 제한을 서버에서 검사합니다.
- `.env`, `.env.local` 은 git에 올라가지 않습니다. **절대 커밋하지 마세요.**

---

## 9. 알아두면 좋은 제약

- 기사 **수정 API**(`PUT /api/articles/[id]`)는 만들어져 있지만 **수정 화면은 아직 없습니다.**
  현재는 삭제 후 새로 작성하는 방식으로 운영합니다.
- 업로드한 이미지는 서버 안 `public/uploads` 폴더에 저장됩니다.
  서버를 새로 만들면 기존 이미지는 따로 옮겨야 합니다. (git에 포함되지 않음)
- 기사 본문은 서식 없는 일반 텍스트입니다. 줄바꿈은 그대로 반영됩니다.
