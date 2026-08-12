// 도구 페이지 본문에서 세율표 수치를 하드코딩하지 않고 lib/tax-tables.ts에서
// 직접 가져와 문장에 보간하기 위한 표기 헬퍼. (CLAUDE.md 규칙 3)
export function formatWonUnit(value: number): string {
  return `${(value / 10_000).toLocaleString("ko-KR")}만 원`;
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
