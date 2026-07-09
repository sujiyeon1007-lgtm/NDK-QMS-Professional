import {
  Building2,
  Search,
  CalendarRange,
  Percent,
  History,
  ClipboardCheck,
} from "lucide-react";

const ICONS = {
  journalLookup: Search,
  monthlyStatus: CalendarRange,
  companyStatus: Building2,
  taxData: Percent,
  issueHistory: History,
  closingStatus: ClipboardCheck,
};

const ACCOUNTING_FINAL_ITEMS = [
  {
    id: "journalLookup",
    label: "회계자료 조회",
    description: "거래명세서 · 출고자료 · 발행 문서를 회계 참고자료로 조회합니다.",
    badge: "자료",
    tone: "blue",
  },
  {
    id: "monthlyStatus",
    label: "월별 매출",
    description: "월별 출고금액과 문서 발행 건수를 조회합니다.",
    badge: "월별",
    tone: "green",
  },
  {
    id: "companyStatus",
    label: "거래처별 매출",
    description: "거래처별 출고 · 공급가액 · 부가세 현황을 조회합니다.",
    badge: "거래처",
    tone: "purple",
  },
  {
    id: "taxData",
    label: "세금자료",
    description: "거래명세서 기준 공급가액 · 부가세 · 합계를 조회합니다.",
    badge: "세금",
    tone: "cyan",
  },
  {
    id: "issueHistory",
    label: "발행 이력",
    description: "거래명세서 발행 및 재출력 이력을 조회합니다.",
    badge: "이력",
    tone: "orange",
  },
  {
    id: "closingStatus",
    label: "마감 현황",
    description: "월 마감 · 거래처별 마감 · 미처리 상태를 조회합니다.",
    badge: "마감",
    tone: "gray",
  },
];

/** 회계관리 Launcher — PM final inquiry menu */
export const ACCOUNTING_LAUNCHER_ITEMS = ACCOUNTING_FINAL_ITEMS.map((fn) => ({
  id: fn.id,
  label: fn.label,
  path: `/accounting/${fn.id}`,
  icon: ICONS[fn.id] ?? Search,
  description: fn.description,
  status: "active",
  badge: fn.badge,
  badgeColor: "blue",
  tone: fn.tone,
  placeholder: false,
}));

export function getAccountingLauncherItem(id) {
  return ACCOUNTING_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;
}
