import {
  FileText,
  Printer,
  History,
  Truck,
  Wallet,
  Building2,
  Receipt,
  BarChart3,
  Landmark,
  CreditCard,
  CalendarClock,
  BadgeCheck,
} from "lucide-react";

import { ACCOUNTING_CLERK_V1_FEATURES } from "./accountingClerkPolicy";

const ICONS = {
  statementManagement: FileText,
  outboundLink: Truck,
  companyLookup: Building2,
  documentLookup: History,
  statementReprint: Printer,
  shipmentStatistics: BarChart3,
  todayReceipts: CalendarClock,
  receivables: Wallet,
  paymentConfirm: BadgeCheck,
  creditManagement: Landmark,
  taxInvoice: Receipt,
  financeIntegration: CreditCard,
  bankAccounts: Building2,
};

function resolveFeaturePath(fn) {
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
  statusLabel: fn.status === "active" ? "V1.0 Lite" : "준비 중",
  badgeColor: fn.status === "active" ? "green" : "gray",
  tone: fn.status === "active" ? "blue" : "gray",
  placeholder: fn.status !== "active",
}));

export function getAccountingClerkLauncherItem(id) {
  return ACCOUNTING_CLERK_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;
}
