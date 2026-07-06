/**
 * Project TITAN V1.3 — Assignee resolver (auth → workers Master)
 */

import { getAuthSession } from "./titanAuthSession";
import { getActiveWorkers } from "./masterData";

/** Match logged-in user to workers Master name; fallback to auth name or first worker */
export function resolveDefaultAssigneeFromAuth() {
  const session = getAuthSession();
  const workers = getActiveWorkers();

  if (session?.name) {
    const byName = workers.find((worker) => worker.name === session.name);
    if (byName) return byName.name;
  }

  if (session?.name?.trim()) return session.name.trim();
  return workers[0]?.name ?? "관리자";
}

export function resolveAssigneeWorkerOptions() {
  return getActiveWorkers();
}

/** Normalize assignee string against workers list */
export function normalizeAssigneeValue(value, workers = getActiveWorkers()) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return resolveDefaultAssigneeFromAuth();

  const exact = workers.find((worker) => worker.name === trimmed);
  if (exact) return exact.name;

  const partial = workers.find(
    (worker) =>
      trimmed.includes(worker.name) ||
      worker.name.includes(trimmed) ||
      String(worker.code ?? "").toUpperCase() === trimmed.toUpperCase()
  );
  if (partial) return partial.name;

  return trimmed;
}

/** Build assignee metadata for persistence */
export function resolveAssigneeMeta(value, workers = getActiveWorkers()) {
  const assignee = normalizeAssigneeValue(value, workers);
  const worker = workers.find((item) => item.name === assignee);
  const session = getAuthSession();

  return {
    assignee,
    assigneeUserId: session?.userId ?? "",
    workerCode: worker?.code ?? worker?.id ?? "",
    department: worker?.department ?? session?.department ?? "",
  };
}
