import { FileText, FlaskConical, ShieldCheck } from "lucide-react";

/** 품질관리 Launcher — V1.5 Hub */
export const QUALITY_MANAGEMENT_LAUNCHER_ITEMS = [
  {
    id: "inspection",
    label: "검사관리",
    path: "/quality/inspection/mass",
    icon: ShieldCheck,
    description: "검사 등록 · 검사 결과 · 검사 이력",
    metricKeys: ["inspectionWait", "inspectionDone"],
  },
  {
    id: "certificate",
    label: "성적서관리",
    path: "/quality/certificate",
    icon: FileText,
    description: "성적서 작성 · PDF · 발행 이력",
    metricKeys: ["certificateWait", "certificateDone"],
  },
  {
    id: "documents",
    label: "문서관리",
    path: "/documents",
    icon: FlaskConical,
    description: "표준서 · 도면 · 절차서 · 품질 문서",
    metricKeys: ["documentCount"],
  },
];

export function getQualityManagementLauncherItem(id) {
  return QUALITY_MANAGEMENT_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;
}
