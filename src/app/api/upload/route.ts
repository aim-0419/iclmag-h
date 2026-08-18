import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getAuthUser, isAdmin } from "@/backend/middleware/auth";
import { fail, forbidden, ok, serverError, unauthorized } from "@/backend/lib/apiResponse";

// ============================================================
// 이미지 업로드 API   POST /api/upload  (관리자 전용)
//
// [비개발자 설명]
// 기사 작성 화면에서 대표사진을 고르면 이 주소로 파일이 전송됩니다.
// 파일은 서버의 public/uploads 폴더에 저장되고,
// 화면에서는 /uploads/파일이름 주소로 불러다 씁니다.
//
// 안전을 위해 세 가지를 검사합니다.
//   1) 관리자인가?
//   2) 진짜 이미지 파일인가? (실행 파일 등을 올리지 못하게)
//   3) 5MB 이하인가?
// ============================================================

/** 허용하는 이미지 종류 */
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

/** 최대 파일 크기 (5MB) */
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // 1) 관리자 확인
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    if (!isAdmin(user)) return forbidden("이미지 업로드 권한이 없습니다.");

    // 2) 전송된 파일 꺼내기
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return fail("파일을 선택해주세요.");
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return fail("JPG, PNG, WebP, GIF 형식만 업로드할 수 있습니다.");
    }
    if (file.size > MAX_SIZE) {
      return fail("파일 크기는 5MB를 넘을 수 없습니다.");
    }

    // 3) 저장 폴더 준비 (없으면 만듭니다)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // 4) 파일 이름 만들기
    //    - 앞에 현재 시각을 붙여 같은 이름의 사진이 덮어써지지 않게 합니다.
    //    - 한글·공백·특수문자는 _ 로 바꿔 주소 오류를 막습니다.
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${Date.now()}_${safeName}`;

    // 5) 실제 저장
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), buffer);

    return ok({ url: `/uploads/${fileName}`, fileName }, "이미지가 업로드되었습니다.");
  } catch (error) {
    return serverError("이미지 업로드 오류", error);
  }
}
