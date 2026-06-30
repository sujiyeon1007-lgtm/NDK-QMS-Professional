/**
 * Project TITAN V1.0 — 품질관리 KPI · 조회 기준 구성
 */

import { CircleCheck, ClipboardCheck, FileCheck2, ShieldCheck } from "lucide-react";

export const INSPECTION_STATUS_PANEL = {
  title: "품질 현황",
  titleIcon: ClipboardCheck,
};

export const CERTIFICATE_STATUS_PANEL = {
  title: "성적서 현황",
  titleIcon: FileCheck2,
};

/** @type {{ id: string, label: string, subLabel: string, icon: import("react").ComponentType, tone: string, to?: string }} */
export const INSPECTION_STATUS_CARDS = [
  {
    id: "todayInspect",
    label: "금일 검사",
    subLabel: "금일 검사 건",
    icon: ClipboardCheck,
    tone: "blue",
    to: "/quality/inspection",
  },
  {
    id: "weekInspect",
    label: "주간 검사",
    subLabel: "금주 검사 건",
    icon: ShieldCheck,
    tone: "green",
    to: "/quality/inspection",
  },
  {
    id: "monthInspect",
    label: "월간 검사",
    subLabel: "금월 검사 건",
    icon: CircleCheck,
    tone: "purple",
    to: "/quality/inspection",
  },
  {
    id: "passRate",
    label: "검사 합격률",
    subLabel: "합격 비율",
    icon: CircleCheck,
    tone: "orange",
    to: "/quality/inspection",
  },
];

export const CERTIFICATE_STATUS_CARDS = [
  {
    id: "todayRegister",
    label: "금일 등록",
    subLabel: "금일 등록 건",
    icon: FileCheck2,
    tone: "blue",
    to: "/quality/certificate",
  },
  {
    id: "weekRegister",
    label: "주간 등록",
    subLabel: "금주 등록 건",
    icon: ClipboardCheck,
    tone: "green",
    to: "/quality/certificate",
  },
  {
    id: "monthRegister",
    label: "월간 등록",
    subLabel: "금월 등록 건",
    icon: ShieldCheck,
    tone: "purple",
    to: "/quality/certificate",
  },
  {
    id: "registerRate",
    label: "등록 완료율",
    subLabel: "엑셀·PDF 완료",
    icon: CircleCheck,
    tone: "orange",
    to: "/quality/certificate",
  },
];

export const INSPECTION_ITEM_OPTIONS = [
  "외관검사",
  "경도검사",
  "경화깊이",
  "조직검사",
  "치수검사",
  "기타",
];

export const INSPECTION_RESULT_OPTIONS = ["합격", "불합격"];

export const INSPECTION_LOG_STATUS_OPTIONS = ["합격", "불합격", "보류"];

export const CERTIFICATE_FILE_STATUS_OPTIONS = ["등록완료", "등록대기", "엑셀만", "PDF만"];
