# TASK: PageSpeed 성능 저하 해결 — 서드파티 스크립트 로딩 지연 적용

> 이 파일은 Claude.ai 전략 세션(2026-08-12)에서 작성한 작업 지시서다.
> `CLAUDE.md`의 모든 규칙을 상속한다. 충돌 시 CLAUDE.md가 우선.
> TASK_adsense-week1.md(본문 증량 작업) 완료 후 배포 검증 단계에서 발견된 회귀 이슈에 대한 후속 작업이다.

---

## 0. 배경 (왜 이 작업을 하는가)

- 2026-08-12, TASK_adsense-week1.md 작업 배포 후 PageSpeed Insights(모바일) 검증에서 **성능 점수 57점** 확인. 게이트 기준(90+)에 크게 미달.
- 세부 지표: LCP 17.2초(심각), FCP 4.6초, Speed Index 7.6초 — 모두 불량. TBT 160ms, CLS 0 — 이 둘은 정상.
- **진단**: TBT/CLS가 정상인데 LCP만 극단적으로 나쁜 패턴은 "메인 스레드가 막힌 것"이 아니라 "네트워크 대역폭을 서드파티 요청이 잠식"하는 유형. 리치 결과 테스트의 "서드 파티" 섹션 확인 결과, 페이지 전체 페이로드 2,799KiB 중 다음이 확인됨:
  - Google/Doubleclick Ads(adsbygoogle.js 등): 약 550KiB
  - Google Tag Manager(gtag.js): 163KiB
  - Google FundingChoices(동의 배너): 100KiB+ (하위 요청 다수)
  - adtrafficquality.google(sodar, 부정클릭 방지): 28KiB+
  - 합산 약 900KiB~1MB — 전체 페이로드의 1/3 이상이 광고 생태계 스크립트
- 이전 게이트(07-30, Lighthouse 모바일 93~98)를 통과했을 당시는 애드센스 코드 삽입 직후라 광고 서버 요청이 본격화되기 전이었을 가능성이 높음. 현재는 미승인 상태에서도 스크립트가 계속 광고 서버에 요청을 쏘고 있어 부하가 커진 것으로 추정.
- **대응 방향**: 광고 태그·ads.txt·수익화 설정 자체는 전혀 건드리지 않고, **로딩 우선순위(타이밍)만** 조정해 핵심 콘텐츠(계산기 UI, 본문 텍스트)가 먼저 그려지도록 한다.

## 1. 절대 규칙 (CLAUDE.md 재확인 + 이번 작업 특칙)

1. 서버·DB·외부 API 추가 금지. 완전 정적 유지 (`output: 'export'`)
2. **애드센스 광고 코드(스크립트 태그 내용, pub ID, 슬롯 설정)·ads.txt는 절대 수정하지 않는다.** 이번 작업은 오직 "언제 로드하느냐(loading strategy)"만 바꾼다 — 스크립트의 src, 속성 값, 삽입 위치의 논리적 순서는 그대로 두고 로딩 방식만 지연시킨다.
3. Google Tag Manager / GA4 트래킹 자체를 제거하지 않는다. 지연 로드로 전환하되 페이지 로드 후 반드시 실행되도록 유지 (수집 데이터 공백 방지)
4. 세율·공제표 등 계산 상수는 `lib/tax-tables.ts`만 참조 (변경 없음, 이번 작업 범위 아님)
5. 기존 계산 로직(`lib/calculators/*.ts`)·ToolGuide 본문 콘텐츠는 절대 수정하지 않는다. 이번 작업은 순수 성능 최적화만
6. localStorage/sessionStorage 금지
7. 새 npm 패키지 추가 금지 (Next.js 내장 `next/script`만으로 충분)
8. 커밋 접두어: `perf:`

## 2. 작업 목록

### T1. 스크립트 삽입 위치 확인 (조사 우선, 코드 변경 전)

`app/layout.tsx` (또는 루트 레이아웃 파일)와 관련 컴포넌트에서 다음이 어디에 어떻게 삽입되어 있는지 먼저 확인하고 보고한다:
- AdSense 스크립트(`adsbygoogle.js`, client=ca-pub-8125995278513075)
- Google Tag Manager / gtag.js
- Google FundingChoices(동의 배너, consent provider)

각각 현재 `<script>` 태그로 직접 박혀 있는지, `next/script` 컴포넌트를 쓰고 있는지, 쓰고 있다면 `strategy` 값이 무엇인지 확인한다.

### T2. 로딩 전략 변경 (perf:)

Next.js `next/script`의 `strategy` 옵션을 활용해 다음과 같이 조정한다.

- **AdSense (`adsbygoogle.js`)**: `strategy="lazyOnload"`로 전환. 페이지가 인터랙티브해진 이후, 브라우저 유휴 시간에 로드되도록 한다. (현재 미승인 상태라 광고가 어차피 채워지지 않으므로, 지연 로드로 인한 수익 손실 우려는 없음. 승인 후에도 광고는 페이지 하단/사이드 슬롯이라 LCP 요소와 무관해 지연 로드가 안전함)
- **Google Tag Manager (gtag.js)**: `strategy="afterInteractive"` 유지 또는 전환(이미 이 값이면 변경 불필요) — GA4 데이터 수집 공백을 최소화하기 위해 lazyOnload까지는 가지 않고 afterInteractive 선에서 그친다.
- **Google FundingChoices(동의 배너)**: `strategy="afterInteractive"`로 조정. 동의 배너는 사용자 상호작용 전에 반드시 뜰 필요는 있지만, 초기 렌더링(LCP)을 막을 필요는 없음.
- 만약 현재 이 스크립트들이 `next/script`가 아니라 순수 `<script>` 태그로 박혀 있다면, 이번 기회에 `next/script` 컴포넌트로 교체한다(내용/src는 그대로, 로딩 방식만 Next.js 표준 방식으로 전환).

### T3. LCP 요소 확인 및 보고 (조사만, 수정은 별도 판단)

리치 결과 테스트의 "LCP 분석"에서 LCP 요소로 잡힌 것이 계산기 제목이 아니라 **디스클레이머(`<Disclaimer />`) 텍스트 블록**이었음. 이 자체가 문제는 아니지만, 왜 디스클레이머가 LCP로 잡히는지(레이아웃상 최상단 큰 블록인지, 계산기 UI보다 렌더링이 먼저 끝나는지) 원인만 조사해서 보고한다. **이번 작업에서 레이아웃 구조는 변경하지 않는다** — T1~T2로 서드파티 부하를 걷어낸 뒤 재측정해서 LCP가 정상 범위로 떨어지는지 먼저 확인하고, 그래도 남는 문제면 별도 지시서로 진행한다.

### T4. 대상 페이지

이번 작업은 루트 레이아웃(`app/layout.tsx`) 또는 공통 스크립트 삽입 컴포넌트 한 곳만 수정하면 사이트 전역(도구 페이지 3개 + About + 홈)에 일괄 적용되는 구조여야 한다. 페이지별로 따로 수정하지 않는다.

## 3. 검증 게이트 (완료 조건)

- [ ] `npm run build` 정적 export 성공
- [ ] AdSense 스크립트의 client ID(`ca-pub-8125995278513075`), 슬롯 설정값이 변경 전과 완전히 동일한지 diff로 확인 (loading 속성 외 변경 없음)
- [ ] `public/ads.txt` 변경 없음 확인
- [ ] GA4/GTM이 페이지 로드 후에도 정상적으로 이벤트를 전송하는지 브라우저 콘솔 또는 GA4 실시간 리포트로 확인
- [ ] 재배포 후 PageSpeed Insights(모바일) 재측정 — 도구 페이지 1개(퇴직소득세 계산기) 기준 **성능 90점 이상**, LCP 2.5초 이내 목표
- [ ] Lighthouse 접근성/권장사항/SEO 100점 유지 확인 (기존에도 96~100이었으므로 회귀 없어야 함)
- [ ] 홈페이지도 동일하게 재측정해서 90+ 확인

## 4. 배포 후 (사용자가 직접)

- Vercel 배포 확인 → PageSpeed Insights 재측정 결과를 Claude.ai 세션에 스크린샷으로 공유
- 90+ 확인되면 TASK_adsense-week1.md의 배포 후 체크리스트 4번(서치콘솔 색인 재요청)으로 복귀
- DECISIONS.md에 기록: "PageSpeed 회귀(57점) 발견 → 원인: 광고/GTM/동의배너 서드파티 부하 → lazyOnload 전환으로 해결, 재측정 결과 OO점"
- 세션 종료 시 노션 작업 로그 기록 (프로젝트 태그 fiftyvibe)

## 5. 하지 말 것 (스코프 아웃)

- 애드센스 광고 코드·ads.txt·pub ID·슬롯 설정 수정
- GA4/GTM 트래킹 제거 (지연은 가능, 제거는 불가)
- 계산 로직, 세율표, ToolGuide 본문 콘텐츠 수정
- 디자인/레이아웃 구조 변경 (T3는 조사·보고만)
- 새 도구 추가, 리브랜딩 등 이번 작업과 무관한 범위

---

## 작업 결과 기록 (Claude Code 세션에서 작성)

- 완료일: 2026-08-12
- 스크립트 위치 조사 결과 (T1):
  - AdSense(`adsbygoogle.js`): `app/layout.tsx` `<head>`, `next/script` 사용, `strategy="beforeInteractive"` — 이게 LCP 저해 원인으로 판단해 `"lazyOnload"`로 변경(T2)
  - GTM/`gtag.js`: `components/google-analytics.tsx`, `next/script` 사용, 이미 `strategy="afterInteractive"` — 목표값과 동일해 변경 없음
  - FundingChoices(동의 배너): 코드베이스 어디에도 별도 `<script>` 태그 없음. 애드센스 계정의 "개인정보 및 메시지" 설정에 의해 `adsbygoogle.js` 실행 체인을 통해 자동 주입되는 구조라 코드로 직접 제어 불가 — adsbygoogle.js를 lazyOnload로 늦추면 함께 지연되는 간접 효과만 가능
- T3 (Disclaimer가 LCP로 잡히는 원인, 조사만): 각 도구 페이지 h1 제목은 한 줄짜리 짧은 텍스트인 반면, `<Disclaimer />`는 border+padding이 있는 박스에 모바일 폭 기준 4줄로 줄바꿈되는 문단이라 렌더링 픽셀 면적이 h1보다 큼. 페이지에 히어로 이미지가 없어 "가장 큰 콘텐츠 요소" 후보가 텍스트 블록으로 좁혀지는데, 그중 면적이 가장 큰 게 Disclaimer라 LCP 요소로 선택된 것으로 판단. 로딩 지연 이슈가 아니라 레이아웃상 자연스러운 결과 — 서드파티 부하 제거 후 재측정에서 LCP *시간*이 2.5초 이내로 떨어지는지가 관건이고, 그래도 남으면 레이아웃 조정은 별도 지시서로 진행
- 변경 내용: `app/layout.tsx`의 AdSense Script `strategy`를 `"beforeInteractive"` → `"lazyOnload"`로 1줄 변경 (커밋 c618a20). client ID·src·슬롯 설정 diff 없음 확인. `public/ads.txt` 변경 없음 확인. `npm run build` 정적 export 성공.
- 변경 전/후 PageSpeed 점수: 변경 전 57점(LCP 17.2s) 확인됨. 변경 후 점수는 **미측정** — 재배포 후 사용자가 PageSpeed Insights로 직접 측정 필요(섹션 4 참조)
- 미완/이슈:
  - GA4/GTM 실시간 리포트로 이벤트 정상 수신 확인은 배포 후 사용자 확인 필요 (로컬 build만으로는 검증 불가)
  - 재배포 후 재측정(도구 페이지 1개 + 홈페이지) 미실시 — 다음 단계
  - Lighthouse 접근성/권장사항/SEO 100점 유지 여부도 재배포 후 확인 필요
- 다음 세션 인계 사항: Vercel 배포 → PageSpeed Insights로 severance-tax 페이지와 홈페이지 재측정 → 90+ 확인되면 DECISIONS.md 기록 + TASK_adsense-week1.md 배포 후 체크리스트 4번(서치콘솔 재색인) 복귀. 90 미달 시 T3 결과(Disclaimer LCP 원인)를 토대로 레이아웃 조정 별도 지시서 검토.
