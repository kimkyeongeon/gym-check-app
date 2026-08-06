import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin";
import { getOAuthClient } from "@/lib/drive";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "인증 코드가 없습니다." }, { status: 400 });
  }

  const redirectUri = `${req.nextUrl.origin}/api/admin/drive-auth/callback`;
  const client = getOAuthClient(redirectUri);
  const { tokens } = await client.getToken(code);

  if (!tokens.refresh_token) {
    return new NextResponse(
      "<p>refresh_token을 받지 못했습니다. 이미 한 번 승인한 적이 있다면 " +
        "Google 계정 설정 &gt; 보안 &gt; 타사 액세스에서 이 앱 연결을 해제한 뒤 다시 시도해주세요.</p>",
      { headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  return new NextResponse(
    `<!doctype html><html><body style="font-family: sans-serif; padding: 24px;">
      <h2>구글 드라이브 연결 완료</h2>
      <p>아래 값을 복사해서 Vercel 환경변수 <b>GOOGLE_DRIVE_REFRESH_TOKEN</b>에 붙여넣어주세요.</p>
      <textarea readonly style="width:100%;height:100px;font-size:14px;">${tokens.refresh_token}</textarea>
      <p style="color:#888;font-size:13px;">이 값은 비밀번호와 같으니 다른 사람과 공유하지 마세요. 저장 후 이 페이지는 닫으셔도 됩니다.</p>
    </body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
