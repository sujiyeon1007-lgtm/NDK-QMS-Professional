import {
  FilePenLine,
  Search,
  CheckCircle2,
  ListTree,
  CalendarRange,
  Factory,
  Percent,
} from "lucide-react";

import { ACCOUNTING_MODULE } from "./titanV12ModuleExpansion";

const ICONS = {
  journalEntry: FilePenLine,
  journalLookup: Search,
  journalApproval: CheckCircle2,
  chartOfAccounts: ListTree,
  monthlyStatus: CalendarRange,
  costStatus: Factory,
  vatStatus: Percent,
};

/** 회계관리 Launcher */
export const ACCOUNTING_LAUNCHER_ITEMS = ACCOUNTING_MODULE.functions.map((fn) => ({
  id: fn.id,
  label: fn.label,
  path: `/accounting/${fn.id}`,
  icon: ICONS[fn.id] ?? FilePenLine,
  description: fn.label,
  status: fn.status,
}));

export function getAccountingLauncherItem(id) {
  return ACCOUNTING_LAUNCHER_ITEMS.find((item) => item.id === id) ?? null;
}
