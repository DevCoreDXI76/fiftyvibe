# CHECKLIST — 단계별 실행 체크리스트

체크 규칙: 완료 시 [x], 날짜 병기. Claude Code 세션에서 이 파일을 직접 갱신한다.

## 0. 완료된 것 (기획 단계)
- [x] 아이디어 발굴·키워드 실측 (2026-07-26)
- [x] Phase 1 라인업 확정: 퇴직소득세 / 일시금vs연금 / DB-DC (07-26)
- [x] 도메인 fiftyvibe.kr 법인 명의 구매 (07-26)
- [x] 유튜브 채널명 변경 + 프로필·배너 제작 (07-26)
- [x] 문서화: PRD/SPEC/PLAN/DECISIONS (07-26)

## 1. 개발 환경 (W1)
- [x] Node.js LTS 설치, `node -v` 확인 (v24.15.0) (07-26)
- [x] `npx create-next-app@latest fiftyvibe --typescript --tailwind --eslint --app --no-src-dir` (07-26)
- [x] docs/ 폴더와 CLAUDE.md를 리포 루트에 복사 (07-26, 이미 리포 루트에서 작업해 유지됨)
- [x] 첫 커밋 (로컬 git) (07-26) + GitHub 리포 생성·연결·푸시 완료 (07-27, https://github.com/DevCoreDXI76/fiftyvibe)
- [x] Vercel 연결 (프리뷰 배포 확인) (07-27, 운영자가 직접 연결·GitHub 연동 확인, https://fiftyvibe.vercel.app 정상 응답)
- [x] `next.config.ts`에 `output: 'export'` 설정 (07-26)
- [x] vitest 설치·설정 (`npm test` → `vitest run --passWithNoTests` 정상 동작 확인) (07-26)

## 2. 공통 기반 (W1)
- [x] tailwind.config 디자인 토큰 등록 (SPEC §6) — Tailwind v4라 app/globals.css @theme로 구현 (07-27)
- [x] 폰트: Pretendard + JetBrains Mono (07-27)
- [x] 레이아웃: 헤더(로고타입+커서), 푸터 (07-27)
- [x] 브라우저 탭 파비콘 교체 (07-29, 헤더의 앰버 커서 모티프 + 스틸블루 게이지 링 조합.
  `app/icon.svg`(모던 브라우저), `app/favicon.ico`(16/32/48px 레거시 폴백),
  `app/apple-icon.png`(180×180 iOS 홈 화면) 3종. 신규 이미지 자산·npm 의존성 추가 없이
  SVG 좌표 + 기존 설치돼 있던 sharp로 1회성 변환)
- [x] `<Disclaimer />`, `<AdSlot />`, `<ToolCTA />` (07-27)
- [x] GA4 스니펫 + 이벤트 유틸 (07-27, 측정 ID는 아직 미발급 — .env.example에 변수만 준비)

## 3. 도구 1: 퇴직소득세 계산기 (W1)
- [x] `lib/tax-tables.ts` (2026 세율·공제표) (07-27)
- [x] `lib/calculators/severance-tax.ts` 순수 함수 (07-27)
- [x] 단위 테스트: 검증 3케이스 + 경계값(근속 1년, 5/10/20년 경계) (07-27, ✅ 홈택스 실측 대조 완료)
- [x] **홈택스 모의계산 대조 오차 0원 (게이트 — 통과 전 도구 2 금지)** (07-27, 운영자 직접 대조 — 근속연수 계산 버그 1건 + 10원 절사 로직 1건 수정 후 오차 0원 확인. §4 착수 가능)
- [x] 화면 구현 (입력 폼, 결과, 계산과정 아코디언) (07-27, Playwright 스모크 테스트 통과)
- [x] 하단 설명 콘텐츠 800자 + FAQ 4문항 (07-27, 운영자 개인 경험담 문단은 추후 보강 예정)
- [x] 메타태그 + JSON-LD (07-27, WebApplication+FAQPage+BreadcrumbList)

## 4. 도구 2: 일시금 vs 연금 (W2)
- [x] `lib/calculators/pension-compare.ts` (도구 1 로직 import) (07-27)
- [x] 쿼리 파라미터 수신 (도구 1 → 2 값 전달) (07-27)
- [x] 화면 + 비교 차트 + 연차별 표 (07-27, Playwright 스모크 테스트 통과)
- [x] 고지문(운용수익 별도) + 설명 콘텐츠 + SEO (07-27)

## 5. 도구 3: DB/DC 전환 (W2)
- [x] `lib/calculators/db-dc.ts` + 손익분기 수익률 산출 (07-28)
- [x] 임금피크제 옵션 (07-28)
- [x] 화면 + 라인 차트 (07-28, Playwright 스모크 테스트 통과)
- [x] 비가역성 경고 고지 + 설명 콘텐츠 + SEO (07-28)

## 6. 페이지·콘텐츠 (W2~W3)
- [x] 홈 (도구 카드 3 + 소개) (07-28, "최신 가이드" 섹션은 가이드 작성 후 별도 추가 예정)
- [x] about (운영자 소개 — 피프티바이브 스토리) (07-28)
- [x] privacy (애드센스 쿠키 고지 포함) / contact (07-28, 사업자 정보·시행일자는 운영자가
  배포 전 직접 채워야 함 — TODO 표시됨)
- [x] 가이드 5편 MDX (SPEC §8 목록) (07-28, 최초 작성 시 본문 분량이 SPEC §8 "2,000자+"
  기준 미달 — 최소 623자~최대 1,392자였음. 같은 날 4편(dc-switch-checklist,
  lump-vs-pension-guide, risk-asset-70, severance-tax-explained)을 2,000자+로 보강
  완료 — 실측 2,131~2,765자. db-vs-dc는 최초부터 2,599자로 기준 충족. 5편 전부 SPEC
  §8 분량 기준 충족)
- [x] 홈 "최신 가이드" 섹션 추가 (가이드 5편 작성 후, SPEC §1) (07-28)
- [x] 각 가이드 ↔ 도구 상호 링크 확인 (07-28, 모든 가이드가 최소 1개 도구로 연결됨)
- [x] 도구 1·2·3(퇴직소득세 계산기, 일시금 vs 연금 비교, DB/DC 전환 계산기) 하단에 관련 가이드 3링크 삽입 (07-28)

## 7. 배포·검수 (W3)
- [x] privacy 개인정보 보호책임자 정보·시행일자 실제 값 입력 (07-30, 성명 "최시헌"·연락처
  devcoredxi00@coredxi.com·시행일자 2026-07-29로 확정 반영)
- [x] sitemap.xml, robots.txt (07-28, `app/sitemap.ts`/`app/robots.ts`로 동적 생성 —
  lib/guides.ts 기반이라 향후 가이드 추가 시 자동 반영됨)
- [x] Lighthouse 모바일 90+ (성능·접근성·SEO) (07-28, 홈/도구3/가이드목록: 성능
  93~98·접근성/SEO/모범사례 100. Pretendard를 CDN 링크에서 next/font/local 자체 호스팅으로
  전환해 렌더링 차단 해소(성능 73→93+). 주의: `npx lighthouse` 기본값인
  `--throttling-method=simulate`는 이 정적 사이트에서 LCP를 비정상적으로 부풀림(실측정 대비
  10배 이상) — 재측정 시 반드시 `--throttling-method=devtools` 사용할 것)
- [x] 모바일 실기기 확인 (입력 UX, 숫자 키패드) (07-28, 운영자 실기기 확인 완료)
- [x] Vercel 프로덕션 + fiftyvibe.kr DNS 연결 + https 확인 (07-28, DNS/HTTPS 정상, 전 페이지
  200 확인. www→non-www 리다이렉트 방향을 코드의 canonical/OG/sitemap 기준(non-www)에
  맞게 운영자가 Vercel 대시보드에서 수정 완료)
- [x] GA4 실데이터 수신 확인 (07-28, 측정 ID(G-PV68RXSB6F) Vercel 환경변수 등록·재배포 완료,
  실시간 리포트에서 활성 사용자·페이지 경로(/, /tools/db-dc 등) 정상 수신 확인)

## 8. 색인·홍보 (W4)
- [x] 구글 서치콘솔: 소유 확인, sitemap 제출, 대표 URL 색인 요청 (07-28, HTML 태그 방식
  소유 확인 — `app/layout.tsx` metadata.verification.google)
- [x] 네이버 서치어드바이저: 동일 (07-28, metadata.verification.other의
  naver-site-verification. 07-29 운영자가 웹마스터도구 콘솔에서 재확인 — 사이트 등록(소유확인)
  통과 상태였고, 사이트맵 제출(sitemap.xml, 등록일 26.07.28 19:40:13)·웹페이지 수집요청
  (대표 URL "/", 등록일 26.07.28 19:40:28) 이력이 스크린샷으로 확인됨. 3개 항목 모두 완료)
- [x] 유튜브 제작기 1편 업로드 (07-29, https://youtu.be/LBpHRNgq43o 업로드 완료. 채널
  "피프티바이브"(구독자 17명), 제목 "DB에서 DC로 전환하는데 퇴직금 세금이 얼마나 나올지
  몰라서 직접 만들었습니다.", 설명란에 fiftyvibe.kr 링크·해시태그·구독 유도 문구 정상 포함을
  확인. 34초 분량의 짧은 티저 형태로 게시됨)
- [x] 네이버 블로그 런칭 글 (07-29, https://blog.naver.com/coredxi/224361482757 게시 완료.
  블로그명 "피프티바이브", 프로필에 법인 소개 없이 개인 AI 자동화 기록으로 정리되어 있음을
  확인 후 진행. 커버 이미지·3도구 소개 이미지 정상 삽입, 본문 서식(소제목/굵은 글씨) 및
  fiftyvibe.kr 링크카드·퇴직소득세 계산기 CTA 정상 작동을 운영자 스크린샷으로 확인)
- [x] 디스콰이엇 등록 (07-29, https://disquiet.io/products/7b69f287-ea5e-4c77-9c3d-60bf6e327d02
  "승인 대기중" 상태로 제출 완료 확인 — 프로덕트명·한 줄 소개·소개·썸네일·프로덕트 이미지
  정상 반영. 최초 등록 시 "드래프트" 상태로 남아있는 것을 발견해 "제출하기" 버튼을
  운영자가 직접 클릭하도록 안내, 이후 배지가 드래프트 → 승인 대기중으로 전환된 것을
  확인함)
- [x] 스레드 공유 (07-29, https://www.threads.com/@fifty.vibe.kr 프로필·첫 게시물 등록 완료.
  프로필명 "fifty.vibe"·사용자이름 "fifty.vibe.kr", 소개글·관심사(AI/재테크 등)·fiftyvibe.kr
  링크 정상 반영. 첫 게시물에 문제-해결 스토리 톤 홍보 문구와 fiftyvibe.kr 링크 카드("피프티바이브
  — 퇴직연금 계산 도구")가 정상적으로 첨부된 것을 직접 확인함)

## 9. 애드센스 (W5+)
- [ ] 가이드 8~10편 증량 (07-28, 기존 5편 2,000자+ 보강은 완료 — §6 참고. 신규 3~5편
  추가는 아직 미착수)
- [ ] 색인 페이지 수 확인 (최소 10+)
- [ ] 애드센스 신청 (법인 CoreDXI 계정)
- [ ] 승인 → AdSlot 활성화, ads.txt 배치
- [ ] 광고 게재 후 Lighthouse 재확인 (CLS 점검)

## 10. 운영 루틴 (런칭 후 상시)
- [ ] 주간: 서치콘솔 쿼리 확인 → 콘텐츠 보강 1건
- [ ] 월간: 수익·트래픽 리뷰, PLAN.md 갱신
- [ ] 연간(1월): tax-tables.ts 세법 개정 반영
