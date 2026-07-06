/**
 * 업무일지 · 담당자 정책 검증 (node scripts/verify-work-journal.mjs)
 * Vite alias 없이 Node 단독 실행 — 핵심 정책 로직 인라인 검증
 */

import assert from "node:assert/strict";

const WORKERS = [
  { id: "w1", code: "W001", name: "김작업", department: "생산부" },
  { id: "w3", code: "W003", name: "이검사", department: "품질부" },
];

function resolveDefaultAssigneeFromAuth(session) {
  if (session?.name) {
    const byName = WORKERS.find((worker) => worker.name === session.name);
    if (byName) return byName.name;
    return session.name.trim();
  }
  return WORKERS[0]?.name ?? "관리자";
}

function resolveAssigneeMeta(value, session) {
  const assignee = String(value ?? "").trim() || resolveDefaultAssigneeFromAuth(session);
  const worker = WORKERS.find((item) => item.name === assignee);
  return {
    assignee,
    assigneeUserId: session?.userId ?? "",
    workerCode: worker?.code ?? worker?.id ?? "",
    department: worker?.department ?? session?.department ?? "",
  };
}

function entryMatchesCurrentUser(entry, session) {
  if (!session?.userId && !session?.name) return true;
  if (entry.assigneeUserId && session.userId) return entry.assigneeUserId === session.userId;
  if (entry.assignee && session.name) return entry.assignee === session.name;
  return false;
}

function filterWorkJournalEntries(entries, { session, isAdmin, assigneeFilter = "" }) {
  if (isAdmin) {
    if (assigneeFilter.trim()) {
      return entries.filter((entry) => entry.assignee === assigneeFilter.trim());
    }
    return entries;
  }
  return entries.filter((entry) => entryMatchesCurrentUser(entry, session));
}

console.log("verify-work-journal: assignee default from auth");
assert.equal(
  resolveDefaultAssigneeFromAuth({ userId: "u1", name: "김작업", department: "생산부" }),
  "김작업"
);
assert.equal(
  resolveDefaultAssigneeFromAuth({ userId: "u2", name: "미등록사용자", department: "품질부" }),
  "미등록사용자"
);

console.log("verify-work-journal: assignee meta");
const meta = resolveAssigneeMeta("이검사", { userId: "u3", name: "이검사", department: "품질부" });
assert.equal(meta.assignee, "이검사");
assert.equal(meta.workerCode, "W003");
assert.equal(meta.department, "품질부");

console.log("verify-work-journal: non-admin vs admin filter");
const entries = [
  {
    id: "a1",
    actionType: "inboundRegister",
    assignee: "김작업",
    assigneeUserId: "u-kim",
    date: "2026-07-06",
  },
  {
    id: "a2",
    actionType: "inspectionRegister",
    assignee: "이검사",
    assigneeUserId: "u-lee",
    date: "2026-07-06",
  },
];

const kimSession = { userId: "u-kim", name: "김작업", department: "생산부" };
const mine = filterWorkJournalEntries(entries, { session: kimSession, isAdmin: false });
assert.equal(mine.length, 1);
assert.equal(mine[0].actionType, "inboundRegister");

const all = filterWorkJournalEntries(entries, { session: kimSession, isAdmin: true });
assert.equal(all.length, 2);

const filtered = filterWorkJournalEntries(entries, {
  session: kimSession,
  isAdmin: true,
  assigneeFilter: "이검사",
});
assert.equal(filtered.length, 1);
assert.equal(filtered[0].actionType, "inspectionRegister");

console.log("verify-work-journal: daily summary by action type");
const summaryMap = new Map();
for (const entry of [...entries, { actionType: "", category: "회의", assignee: "김작업", date: "2026-07-06" }]) {
  if (entry.date !== "2026-07-06") continue;
  if (entry.assignee !== "김작업") continue;
  const key = entry.actionType || entry.category || "other";
  summaryMap.set(key, (summaryMap.get(key) ?? 0) + 1);
}
assert.equal(summaryMap.get("inboundRegister"), 1);
assert.equal(summaryMap.get("회의"), 1);

console.log("verify-work-journal: OK");
