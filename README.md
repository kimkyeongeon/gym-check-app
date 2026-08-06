# 오운완 — 운동 인증 웹앱

10명 고정 멤버가 주간 목표 횟수만큼 운동 사진을 인증하고, 서로의 진행 상황을 한 화면에서 확인하는 모바일 웹앱입니다.

- 로그인 없이 이름 선택으로 진입
- 캘린더에서 날짜를 골라 사진 인증 (지난 날짜 인증 가능, 하루 중복 불가)
- 원본 사진은 Google Drive(개인 계정 OAuth 연결)에 저장, 앱 DB에는 압축 썸네일만 저장
- 업로드 1개월 경과 시 Drive 원본 자동 삭제 (Vercel Cron), 썸네일은 계속 남음
- 이번 주 현황판 + 주차별 히스토리

## 기술 스택

Next.js(App Router, TypeScript) · Tailwind CSS · Prisma + Postgres(Vercel Postgres/Neon) · Google Drive API(OAuth) · sharp

## 로컬 개발 준비

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사해 `.env`를 만들고 값을 채웁니다.

```bash
cp .env.example .env
```

| 변수 | 설명 |
| --- | --- |
| `DATABASE_URL` | Postgres 연결 문자열 (pooled) |
| `DIRECT_URL` | Postgres 직접 연결 문자열 (마이그레이션용) |
| `GOOGLE_OAUTH_CLIENT_ID` | Google Cloud OAuth 클라이언트 ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google Cloud OAuth 클라이언트 보안 비밀번호 |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | `/api/admin/drive-auth`로 한 번 로그인 승인 후 발급받는 refresh token |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | 업로드 대상 Drive 루트 폴더 ID (OAuth로 연결한 계정 소유 폴더) |
| `CRON_SECRET` | 정리 크론 엔드포인트 보호용 임의 문자열 |
| `ADMIN_PASSCODE` | `/admin` 화면 접근 비밀번호 |

### 3. DB 마이그레이션

```bash
npx prisma migrate dev --name init
```

### 4. 개발 서버 실행

```bash
npm run dev
```

## 외부 서비스 설정 가이드

### Vercel Postgres / Neon

1. Vercel 프로젝트에서 **Storage → Create Database → Postgres**(Neon)를 선택해 연결합니다.
2. 발급된 `POSTGRES_PRISMA_URL`을 `DATABASE_URL`에, `POSTGRES_URL_NON_POOLING`을 `DIRECT_URL`에 매핑합니다. (직접 Neon을 쓰는 경우 pooled/direct 두 연결 문자열을 각각 사용)

### Google Drive OAuth 연결

개인 Gmail 계정은 서비스 계정에 Drive 저장공간이 없어서(`Service Accounts do not have storage quota`), 실제 사용자 계정으로 한 번 로그인 승인하는 OAuth 방식을 씁니다.

1. [Google Cloud Console](https://console.cloud.google.com/)에서 새 프로젝트를 만들고 **Google Drive API**를 사용 설정합니다.
2. **API 및 서비스 → OAuth 동의 화면**에서 "외부"로 앱을 등록하고(테스트 사용자에 본인 이메일 추가), 필요한 정보를 채웁니다.
3. **API 및 서비스 → 사용자 인증 정보 → 사용자 인증 정보 만들기 → OAuth 클라이언트 ID**(유형: 웹 애플리케이션)를 생성합니다.
4. **승인된 리디렉션 URI**에 `https://<your-domain>/api/admin/drive-auth/callback`을 등록합니다.
5. 발급된 클라이언트 ID/보안 비밀번호를 `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`에 저장합니다.
6. Google Drive에서 업로드용 폴더(예: `운동인증`)를 만들고, URL의 폴더 ID를 `GOOGLE_DRIVE_ROOT_FOLDER_ID`에 저장합니다.
7. 배포 후 `/admin`에 로그인한 상태로 **"구글 드라이브 연결"** 버튼(또는 `/api/admin/drive-auth`)을 눌러 본인 계정으로 로그인/승인합니다.
8. 콜백 화면에 표시되는 값을 `GOOGLE_DRIVE_REFRESH_TOKEN`에 저장하고 재배포합니다.

## 배포 (Vercel)

1. 이 저장소를 Vercel 프로젝트로 연결합니다.
2. 위 환경 변수를 Vercel 프로젝트 설정(Environment Variables)에 등록합니다.
3. `vercel.json`에 등록된 Cron(`/api/cron/cleanup`, 매일 UTC 18:00 = KST 새벽 3시)이 자동으로 활성화됩니다. Vercel이 요청 시 `Authorization: Bearer $CRON_SECRET` 헤더를 자동으로 붙입니다.
4. 최초 배포 전 `npx prisma migrate deploy`로 프로덕션 DB에 스키마를 반영합니다.

## 정리 크론 수동 테스트

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<your-domain>/api/cron/cleanup
```

`uploadedAt`이 30일보다 오래된 로그 중 `driveFileId`가 남아있는 항목을 찾아 Drive 원본을 삭제하고, DB에는 `driveFileId/driveFileUrl`을 `null`로, `originalDeletedAt`을 기록합니다. 썸네일은 삭제되지 않습니다.

## 알아두면 좋은 점

- 사진 파일이 4MB를 넘으면 업로드 전 브라우저에서 자동으로 리사이즈/압축합니다 (서버리스 함수 요청 크기 제한 대응). 그래도 원본은 충분한 고화질을 유지하도록 최대 2200px 장변 기준으로만 축소합니다.
- 관리자 화면 인증은 별도 계정 시스템 없이 `ADMIN_PASSCODE` 단일 비밀번호 + 세션 쿠키로 보호됩니다.
- 멤버를 관리자 화면에서 "삭제"해도 실제로는 `isActive=false`로만 바뀌며, 기존 인증 기록은 히스토리에서 계속 조회할 수 있습니다.
