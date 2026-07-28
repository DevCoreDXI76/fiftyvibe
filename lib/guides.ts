export type Guide = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // YYYY-MM-DD
};

export const GUIDES: Guide[] = [
  {
    slug: "db-vs-dc",
    title: "DB형 vs DC형 차이, 그리고 제가 DC 전환을 결정하기까지",
    description: "퇴직연금 DB형과 DC형의 차이, 그리고 제가 전환을 고민하고 결정한 과정.",
    publishedAt: "2026-07-28",
  },
  {
    slug: "severance-tax-explained",
    title: "퇴직소득세 계산 구조를 예시로 이해하기",
    description: "근속연수공제부터 지방소득세까지, 실제 숫자로 따라가 보는 퇴직소득세 계산.",
    publishedAt: "2026-07-28",
  },
  {
    slug: "lump-vs-pension-guide",
    title: "일시금 vs 연금 수령, 감면 70%/60% 규칙 이해하기",
    description: "이연퇴직소득세와 연차별 감면율을 예시로 알아봅니다.",
    publishedAt: "2026-07-28",
  },
  {
    slug: "dc-switch-checklist",
    title: "DC 전환 전 체크리스트 5가지",
    description: "DB에서 DC로 전환하기 전 반드시 확인해야 할 다섯 가지.",
    publishedAt: "2026-07-28",
  },
  {
    slug: "risk-asset-70",
    title: "위험자산 70% 규칙과 안전자산 30%",
    description: "DC/IRP 계좌의 투자 한도 규정을 알아봅니다.",
    publishedAt: "2026-07-28",
  },
];

export const RELATED_GUIDES = {
  "severance-tax": ["severance-tax-explained", "lump-vs-pension-guide", "db-vs-dc"],
  "lump-vs-pension": ["lump-vs-pension-guide", "severance-tax-explained", "dc-switch-checklist"],
  "db-dc": ["db-vs-dc", "dc-switch-checklist", "risk-asset-70"],
} as const satisfies Record<string, readonly string[]>;
