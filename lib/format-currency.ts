export function formatWon(value: number): string {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function parseWonInput(value: string): number {
  const digitsOnly = value.replace(/[^0-9]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
}
