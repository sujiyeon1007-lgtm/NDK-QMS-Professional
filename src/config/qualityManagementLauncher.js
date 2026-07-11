import { AlertTriangle, ClipboardCheck, FileText, History, ShieldCheck } from "lucide-react";

/** 품질관리 Launcher — RC1 Menu Layout (Launcher = Sidebar) */
export const QUALITY_MANAGEMENT_LAUNCHER_ITEMS = [
  {
    id: "inspection-register",
    label: "검사등록",
    badge: "검사관리",
    badgeColor: "green",
    path: "/quality/inspection/register",
    icon: ClipboardCheck,
    description: "검사 등록 · 검사 결과 입력",
    metricKeys: ["inspectionWait"],
  },
  {
    id: "inspection-status",
    label: "검사현황",
    badge: "검사관리",
    badgeColor: "green",
    path: "/quality/inspection/status",
    icon: ShieldCheck,
    description: "검사 현황 · 검사 이력 조회",
    metricKeys: ["inspectionWait", "inspectionDone"],
  },
  {
    id: "certificate-register",
    label: "성적서등록",
    badge: "성적서관리",
    badgeColor: "blue",
    path: "/quality/certificate/register",
    icon: FileText,
    description: "검사완료 · 성적서 발행 대기",
    metricKeys: ["certificateWait"],
  },
  {
    id: "certificate-status",
    label: "성적서현황",
    badge: "성적서관리",
    badgeColor: "blue",
    path: "/quality/certificate/status",
    icon: FileText,
    description: "발행 완료 성적서 이력 · 재발행",
    metricKeys: ["certificateDone"],
  },
  {
    id: "defect-history",
    label: "부적합관리",
    badge: "불량관리",
    badgeColor: "orange",
    path: "/quality/defect-history",
    icon: AlertTriangle,
    description: "불량이력 · NCR · 재처리",
    metricKeys: ["defectToday"],
    emphasis: true,
  },
  {
    id: "quality-history",
    label: "품질이력조회",
    badge: "불량관리",
    badgeColor: "slate",
    path: "/history",
    icon: History,
    description: "LOT · 관리번호 품질 Traceability 조회",
    metricKeys: [],
  },
];

export function getQualityManagementLauncherItem(id) {
  return QUALITY_MANAGEMENT_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;
}
