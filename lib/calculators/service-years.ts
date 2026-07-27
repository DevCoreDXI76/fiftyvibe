export function calculateServiceYears(
  startDate: string,
  endDate: string,
): number {
  // ISO 날짜 문자열(YYYY-MM-DD)은 UTC 자정으로 파싱되므로, 로컬 타임존 기준
  // getFullYear/setFullYear를 쓰면 UTC-8 이하 등 일부 타임존에서 날짜가
  // 하루 밀릴 수 있다. UTC 접근자로 고정해 타임존 무관하게 동작시킨다.
  const start = new Date(startDate);
  const end = new Date(endDate);

  const exactYears = end.getUTCFullYear() - start.getUTCFullYear();
  const anniversary = new Date(start);
  anniversary.setUTCFullYear(start.getUTCFullYear() + exactYears);

  // 홈택스 공식 예제표(소득세법 시행령 제105조1항 해석)로 확인된 규칙:
  // 퇴사일이 입사일로부터 "정확히 N년째 되는 날"이어도 N+1년으로 계산한다
  // (하루라도 못 미치면 N년). anniversary와 "같은 날"도 부분년으로 취급해야
  // 하므로 >= 를 쓴다 (2026-07-27 홈택스 실측 대조로 확정).
  const hasPartialYear = end.getTime() >= anniversary.getTime();
  const years = hasPartialYear ? exactYears + 1 : exactYears;

  return Math.max(years, 1);
}
