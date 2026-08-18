import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { POLICY_CONTENT, POLICY_TABS } from "@/constants/policies";

// ============================================================
// 약관 / 정책 페이지  (주소: /policy/약관종류)
//
// [비개발자 설명]
// 푸터 아래쪽 "개인정보 취급방침", "청소년보호정책" 등을 눌렀을 때
// 열리는 화면입니다. 이 파일은 "화면을 어떻게 그릴지"만 담당하고,
// 실제 글 내용은 src/constants/policies.ts 에 따로 모아두었습니다.
// 문구 수정은 그 파일에서 하시면 됩니다.
// ============================================================

interface PolicyPageProps {
  params: Promise<{ type: string }>;
}

/** 검색엔진에 노출될 페이지 제목·설명을 만듭니다. */
export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const { type } = await params;
  const policy = POLICY_CONTENT[type];
  if (!policy) return { title: "페이지를 찾을 수 없습니다" };

  return {
    title: policy.title,
    description: `이끌림필라테스매거진 ${policy.title}`,
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { type } = await params;
  const policy = POLICY_CONTENT[type];

  // 주소에 없는 약관 종류를 입력하면 404 화면으로 보냅니다.
  if (!policy) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* 페이지 대제목 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">이끌림필라테스매거진 법적고지</h1>
      </div>

      {/*
        약관 종류를 고르는 탭 메뉴.
        화면이 좁으면 가로 스크롤로 넘겨볼 수 있어 글자가 잘리지 않습니다.
      */}
      <nav className="mb-8 -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <ul className="inline-flex min-w-full border border-gray-300 rounded overflow-hidden">
          {POLICY_TABS.map((tab) => (
            <li key={tab.type} className="flex-1">
              <Link
                href={`/policy/${tab.type}`}
                className={`block text-center whitespace-nowrap px-4 py-2.5 text-sm font-medium border-r border-gray-300 last:border-r-0 transition-colors ${
                  tab.type === type
                    ? "bg-primary text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* 약관 본문 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 min-h-64">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
          {policy.title}
        </h2>
        {/*
          whitespace-pre-wrap : 원문의 줄바꿈을 그대로 보여줍니다.
          break-words        : 아주 긴 단어/주소가 화면 밖으로 삐져나가지 않게 잘라 줄바꿈합니다.
        */}
        <div className="text-gray-700 leading-8 whitespace-pre-wrap break-words text-sm">
          {policy.content}
        </div>

        {/* 청소년보호정책 페이지에서만 추가로 보여주는 담당자 안내 카드 */}
        {type === "youth-protection" && <YouthProtectionContacts />}
      </div>

      {/* 뒤로가기 */}
      <div className="mt-6">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← 홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// 청소년보호 책임자 / 담당자 연락처 카드
// 두 카드의 내용이 같아 한 곳에서 정의하고 두 번 그립니다.
// ------------------------------------------------------------
const YOUTH_PROTECTION_STAFF = [
  { role: "청소년 보호 관리 책임자", name: "최운창", team: "보도제작본부", phone: "062-671-8650", position: "PD", email: "ceo@aimcoltd.com" },
  { role: "청소년 보호 관리 담당자", name: "최운창", team: "보도제작본부", phone: "062-671-8650", position: "PD", email: "ceo@aimcoltd.com" },
];

function YouthProtectionContacts() {
  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
      {YOUTH_PROTECTION_STAFF.map((staff) => (
        <div key={staff.role} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200">
            {staff.role}
          </h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
            <span>이름 : {staff.name}</span>
            <span>소속 : {staff.team}</span>
            <span>전화 : {staff.phone}</span>
            <span>직위 : {staff.position}</span>
            <span className="col-span-2 break-all">
              메일 :{" "}
              <a href={`mailto:${staff.email}`} className="text-blue-500 hover:underline">
                {staff.email}
              </a>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
