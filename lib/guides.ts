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
  {
    slug: "severance-tax-common-mistakes",
    title: "퇴직소득세 계산할 때 자주 하는 실수 5가지",
    description: "홈택스 원천징수영수증과 대조해 검증한, 퇴직소득세 계산 시 가장 자주 나오는 실수 다섯 가지.",
    publishedAt: "2026-07-29",
  },
  {
    slug: "severance-interim-settlement",
    title: "퇴직금 중간정산 조건과 세금, 실제로 얼마나 낼까",
    description: "퇴직금 중간정산이 가능한 법정 사유와 절차, 중간정산 시 퇴직소득세 계산 예시.",
    publishedAt: "2026-07-29",
  },
  {
    slug: "pension-receipt-methods-after-55",
    title: "55세 이후 퇴직연금 수령방법 총정리",
    description: "만 55세 이후 퇴직연금을 일시금, 연금, 혼합으로 수령하는 방법과 세금 차이를 사례로 비교합니다.",
    publishedAt: "2026-07-29",
  },
  {
    slug: "irp-tax-deduction-limit",
    title: "IRP 세액공제 한도와 퇴직금 이체 시 주의사항",
    description: "IRP 계좌의 연간 세액공제 한도와 퇴직금을 IRP로 이체할 때 알아둬야 할 절차를 정리합니다.",
    publishedAt: "2026-07-29",
  },
  {
    slug: "dc-plan-provider-switch",
    title: "DC형 퇴직연금 수익률이 낮을 때 운용사·상품 갈아타는 법",
    description: "DC형 퇴직연금의 수익률이 기대에 못 미칠 때 운용사나 운용상품을 변경하는 실제 절차를 정리합니다.",
    publishedAt: "2026-07-29",
  },
  {
    slug: "irp-pension-withdrawal-limit",
    title: "IRP 연금수령한도 계산법",
    description: "IRP·연금저축 등 연금계좌에서 한 해에 받을 수 있는 연금수령한도를 산식과 예시로 계산해봅니다.",
    publishedAt: "2026-08-13",
  },
  {
    slug: "wage-peak-db-dc-timing",
    title: "임금피크제 앞두고 DB→DC 전환, 언제가 유리한가",
    description: "임금피크제 적용을 앞두고 있다면 DB에서 DC로 전환하는 시점이 왜 중요한지 계산 예시로 알아봅니다.",
    publishedAt: "2026-08-13",
  },
  {
    slug: "pension-health-insurance-after-55",
    title: "55세 이후 연금 수령 시 건강보험료 영향",
    description: "연금을 받기 시작하면 건강보험 피부양자 자격이나 지역가입자 보험료에 어떤 영향이 있는지 구조를 정리합니다.",
    publishedAt: "2026-08-13",
  },
  {
    slug: "early-withdrawal-before-55-tax",
    title: "55세 이전 퇴직금 수령 시 세금 불이익",
    description: "IRP 없이 55세 이전에 퇴직금을 일시금으로 받으면 어떤 세금 불이익이 있는지 계산 예시로 비교합니다.",
    publishedAt: "2026-08-13",
  },
];

export const RELATED_GUIDES = {
  "severance-tax": [
    "severance-tax-explained",
    "severance-tax-common-mistakes",
    "severance-interim-settlement",
    "lump-vs-pension-guide",
    "early-withdrawal-before-55-tax",
  ],
  "lump-vs-pension": [
    "lump-vs-pension-guide",
    "pension-receipt-methods-after-55",
    "irp-tax-deduction-limit",
    "severance-tax-explained",
    "irp-pension-withdrawal-limit",
    "pension-health-insurance-after-55",
    "early-withdrawal-before-55-tax",
  ],
  "db-dc": [
    "db-vs-dc",
    "dc-switch-checklist",
    "risk-asset-70",
    "dc-plan-provider-switch",
    "wage-peak-db-dc-timing",
  ],
} as const satisfies Record<string, readonly string[]>;
