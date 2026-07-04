import {
  FileText,
  Printer,
  History,
  PackageCheck,
  CalendarCheck,
  Wallet,
  Building2,
  Receipt,
  BarChart3,
} from "lucide-react";

import { ACCOUNTING_CLERK_V1_FEATURES } from "./accountingClerkPolicy";

const ICONS = {
  invoiceMgmt: FileText,
  invoiceReprint: Printer,
  invoiceHistory: History,
  outboundClosing: PackageCheck,
  monthlyClose: CalendarCheck,
  receivables: Wallet,
  salesByCompany: Building2,
  taxInvoiceStatus: Receipt,
  salesStatistics: BarChart3,
};

function resolveFeaturePath(fn) {
  if (fn.id === "invoiceReprint" || fn.id === "invoiceMgmt") {
    return "/inout/shipment";
  }
  if (fn.path) return fn.path;
  return `/accounting-clerk/${fn.id}`;
}

/** 경리관리 Launcher — policy SSoT 연동 */
export const ACCOUNTING_CLERK_LAUNCHER_ITEMS = ACCOUNTING_CLERK_V1_FEATURES.map((fn) => ({
  id: fn.id,
  label: fn.label,
  path: resolveFeaturePath(fn),
  icon: ICONS[fn.id] ?? FileText,
  description: fn.note ?? fn.label,
  status: fn.status,
  statusLabel: fn.status === "active" ? "V1.0 사용 가능" : "V1.0 예정",
}));

export function getAccountingClerkLauncherItem(id) {
  return ACCOUNTING_CLERK_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;
}
