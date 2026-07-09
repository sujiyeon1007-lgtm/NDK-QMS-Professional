import { AlertTriangle, BookMarked, BookOpen, FileText, FlaskConical, Layers, ShieldCheck } from "lucide-react";

/** 품질관리 Launcher — V1.5 (Category Badge 전 카드 공통) */
export const QUALITY_MANAGEMENT_LAUNCHER_ITEMS = [
  {
    id: "inspection",
    label: "검사관리",
    badge: "검사",
    badgeColor: "green",
    path: "/quality/inspection/mass",
    icon: ShieldCheck,
    description: "검사 등록 · 검사 결과 · 검사 이력",
    metricKeys: ["inspectionWait", "inspectionDone"],
  },
  {
    id: "certificate",
    label: "성적서",
    badge: "성적서",
    badgeColor: "blue",
    path: "/quality/certificate",
    icon: FileText,
    description: "성적서 작성 · PDF · 발행 이력",
    metricKeys: ["certificateWait", "certificateDone"],
  },
  {
    id: "defect-history",
    label: "부적합",
    badge: "품질",
    badgeColor: "green",
    path: "/quality/defect-history",
    icon: AlertTriangle,
    description: "불량 · NCR · 재처리 · 향후 CAPA 확장",
    metricKeys: ["defectToday"],
    emphasis: true,
  },
  {
    id: "knowledge-record",
    label: "Knowledge Record",
    badge: "기술",
    badgeColor: "cyan",
    path: "/quality/knowledge",
    icon: BookMarked,
    description: "실제 작업 + 검사 결과 기술 데이터 (Sprint 9)",
    metricKeys: [],
  },
  {
    id: "lot-lifecycle",
    label: "LOT Lifecycle",
    badge: "LOT",
    badgeColor: "purple",
    path: "/quality/lot-lifecycle",
    icon: Layers,
    description: "Technology Summary · Document JSON (TDE Interface)",
    metricKeys: [],
  },
  {
    id: "documents",
    label: "문서관리",
    badge: "문서",
    badgeColor: "purple",
    path: "/documents",
    icon: FlaskConical,
    description: "표준서 · 도면 · 절차서 · 품질 문서",
    metricKeys: ["documentStandards", "documentQuality"],
  },
  {
    id: "quality-work-journal",
    label: "품질 업무일지",
    badge: "일지",
    badgeColor: "cyan",
    path: "/quality/work-journal",
    icon: BookOpen,
    description: "검사 · 성적서 · 품질 문서 관련 업무 기록",
    metricKeys: ["qualityJournalToday"],
  },
];

export function getQualityManagementLauncherItem(id) {
  return QUALITY_MANAGEMENT_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;
}
