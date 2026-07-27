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
- [x] `<Disclaimer />`, `<AdSlot />`, `<ToolCTA />` (07-27)
- [x] GA4 스니펫 + 이벤트 유틸 (07-27, 측정 ID는 아직 미발급 — .env.example에 변수만 준비)

## 3. 도구 1: 퇴직소득세 계산기 (W1)
- [x] `lib/tax-tables.ts` (2026 세율·공제표) (07-27)
- [x] `lib/calculators/severance-tax.ts` 순수 함수 (07-27)
- [x] 단위 테스트: 검증 3케이스 + 경계값(근속 1년, 5/10/20년 경계) (07-27, ⚠️ SPEC 공식 손계산값 — 홈택스 실측 아님)
- [ ] **홈택스 모의계산 대조 오차 0원 (게이트 — 통과 전 도구 2 금지)** — 운영자 확인 대기 중
- [x] 화면 구현 (입력 폼, 결과, 계산과정 아코디언) (07-27, Playwright 스모크 테스트 통과)
- [x] 하단 설명 콘텐츠 800자 + FAQ 4문항 (07-27, 운영자 개인 경험담 문단은 추후 보강 예정)
- [x] 메타태그 + JSON-LD (07-27, WebApplication+FAQPage+BreadcrumbList)

## 4. 도구 2: 일시금 vs 연금 (W2)
- [ ] `lib/calculators/pension-compare.ts` (도구 1 로직 import)
- [ ] 쿼리 파라미터 수신 (도구 1 → 2 값 전달)
- [ ] 화면 + 비교 차트 + 연차별 표
- [ ] 고지문(운용수익 별도) + 설명 콘텐츠 + SEO

## 5. 도구 3: DB/DC 전환 (W2)
- [ ] `lib/calculators/db-dc.ts` + 손익분기 수익률 산출
- [ ] 임금피크제 옵션
- [ ] 화면 + 라인 차트
- [ ] 비가역성 경고 고지 + 설명 콘텐츠 + SEO

## 6. 페이지·콘텐츠 (W2~W3)
- [ ] 홈 (도구 카드 3 + 소개 + 최신 가이드)
- [ ] about (운영자 소개 — 피프티바이브 스토리)
- [ ] privacy (애드센스 쿠키 고지 포함) / contact
- [ ] 가이드 5편 MDX (SPEC §8 목록)
- [ ] 각 가이드 ↔ 도구 상호 링크 확인
- [ ] 도구 1(퇴직소득세 계산기) 하단에 관련 가이드 3링크 삽입 (SPEC §1 요구사항 — §3에서 누락, 가이드 작성 후 추가)

## 7. 배포·검수 (W3)
- [ ] sitemap.xml, robots.txt
- [ ] Lighthouse 모바일 90+ (성능·접근성·SEO)
- [ ] 모바일 실기기 확인 (입력 UX, 숫자 키패드)
- [ ] Vercel 프로덕션 + fiftyvibe.kr DNS 연결 + https 확인
- [ ] GA4 실데이터 수신 확인

## 8. 색인·홍보 (W4)
- [ ] 구글 서치콘솔: 소유 확인, sitemap 제출, 대표 URL 색인 요청
- [ ] 네이버 서치어드바이저: 동일
- [ ] 유튜브 제작기 1편 업로드 (설명란에 사이트 링크)
- [ ] 네이버 블로그 런칭 글 / 디스콰이엇 등록 / 스레드 공유

## 9. 애드센스 (W5+)
- [ ] 가이드 8~10편 증량
- [ ] 색인 페이지 수 확인 (최소 10+)
- [ ] 애드센스 신청 (법인 CoreDXI 계정)
- [ ] 승인 → AdSlot 활성화, ads.txt 배치
- [ ] 광고 게재 후 Lighthouse 재확인 (CLS 점검)

## 10. 운영 루틴 (런칭 후 상시)
- [ ] 주간: 서치콘솔 쿼리 확인 → 콘텐츠 보강 1건
- [ ] 월간: 수익·트래픽 리뷰, PLAN.md 갱신
- [ ] 연간(1월): tax-tables.ts 세법 개정 반영
