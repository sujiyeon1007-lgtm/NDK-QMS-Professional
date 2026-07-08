/**
 * Project TITAN Sprint 8 — 작업자관리 (Worker Master · Domain Master Workspace · Read Only 집계)
 *
 * Material → Process → Equipment Master 패턴을 작업자(workers) Master 에 적용.
 * 단일 진입:
 *   buildWorkerMasterSummary()
 *   buildWorkerListMeta()
 *   getWorkerHealth(worker, ctx)
 *   buildWorkerMasterDetail(worker)
 *
 * 자격 정보 탭은 조회 전용이며 향후 교육관리 · 자격관리 연결을 위한 구조만 준비한다.
 */

import { getMasterDataByCategory } from "./masterData";
import { getSessionProductionRecords } from "./productionRecords";
import { getInspectionLogs } from "./inspectionLogSession";
import { getAllMasterImportLogs } from "./masterExcelImportLog";

function hasText(value) {
  return String(value ?? "").trim().length > 0;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function normKey(value) {
  return String(value ?? "").trim().toLowerCase();
}

function activeWorkers() {
  return getMasterDataByCategory("workers").filter((row) => row.active !== false);
}

function workerKey(worker) {
  return normKey(worker?.name) || normKey(worker?.code);
}

/** 작업자명 · 사번 · assignee 부분 일치 */
function matchesWorker(value, worker) {
  const field = normKey(value);
  const name = normKey(worker?.name);
  const code = normKey(worker?.code);
  if (!field) return false;
  if (name && (field === name || field.includes(name) || name.includes(field))) return true;
  if (code && field === code) return true;
  return false;
}

function recordWorkerFields(record) {
  return [
    record?.worker,
    record?.operator,
    record?.manager,
    record?.registrar,
    record?.assignee,
    record?.inspector,
    record?.registeredBy,
    record?.shippedBy,
  ];
}

function recordMatchesWorker(record, worker) {
  return recordWorkerFields(record).some((field) => matchesWorker(field, worker));
}

function phoneForWorker(worker) {
  const nameKey = normKey(worker?.name);
  if (!nameKey) return "—";
  const employee = getMasterDataByCategory("employees").find(
    (row) => normKey(row.name) === nameKey
  );
  return hasText(employee?.phone) ? employee.phone : "—";
}

/** Worker ↔ 생산 · 검사 인덱스 (1회 구축) */
function buildWorkerIndex() {
  const productionByWorker = new Map();
  const inspectionByWorker = new Map();

  getSessionProductionRecords().forEach((record) => {
    activeWorkers().forEach((worker) => {
      if (!recordMatchesWorker(record, worker)) return;
      const key = workerKey(worker);
      if (!productionByWorker.has(key)) productionByWorker.set(key, []);
      productionByWorker.get(key).push(record);
    });
  });

  try {
    getInspectionLogs().forEach((log) => {
      activeWorkers().forEach((worker) => {
        if (!recordMatchesWorker(log, worker)) return;
        const key = workerKey(worker);
        if (!inspectionByWorker.has(key)) inspectionByWorker.set(key, []);
        inspectionByWorker.get(key).push(log);
      });
    });
  } catch {
    // inspection registry 미초기화 — 무시
  }

  return { productionByWorker, inspectionByWorker };
}

function connectedProduction(worker, index) {
  return index.productionByWorker.get(workerKey(worker)) ?? [];
}

function connectedInspections(worker, index) {
  return index.inspectionByWorker.get(workerKey(worker)) ?? [];
}

function recentWorkDate(records) {
  return records
    .map((r) => r.workDate || r.incomingDate || r.inspectionDate)
    .filter(Boolean)
    .sort()
    .at(-1);
}

function deriveProcessNames(records, inspections) {
  const set = new Map();
  records.forEach((r) => {
    const ht = r.heatTreatment?.trim();
    if (!ht) return;
    if (!set.has(normKey(ht))) set.set(normKey(ht), ht);
  });
  inspections.forEach((log) => {
    const proc = log.process?.trim();
    if (!proc) return;
    if (!set.has(normKey(proc))) set.set(normKey(proc), proc);
  });
  return [...set.values()].sort((a, b) => a.localeCompare(b));
}

function primaryProcess(processNames) {
  return processNames[0] ?? "—";
}

function hasQualification(worker) {
  // 향후 교육 · 자격증 필드 연동 — 현재는 부서 지정을 자격정보 proxy
  return hasText(worker?.department);
}

function workerContext(worker, index) {
  const production = connectedProduction(worker, index);
  const inspections = connectedInspections(worker, index);
  const processNames = deriveProcessNames(production, inspections);
  return {
    active: worker?.active !== false,
    hasProcess: processNames.length > 0,
    processNames,
    primaryProcess: primaryProcess(processNames),
    hasRecentWork: Boolean(recentWorkDate([...production, ...inspections])),
    hasQualification: hasQualification(worker),
    lotCount: new Set(production.filter((r) => hasText(r.lotNo)).map((r) => r.lotNo)).size,
    production,
    inspections,
  };
}

/** 관리 필요 사유 */
export function getWorkerManagementIssues(worker, ctx = {}) {
  const issues = [];
  if (!ctx.active) issues.push("활성 상태 아님");
  if (!ctx.hasProcess) issues.push("담당 공정 없음");
  if (!ctx.hasRecentWork) issues.push("최근 작업 없음");
  if (!ctx.hasQualification) issues.push("자격정보 없음");
  return issues;
}

/** Worker Health — 🟢 정상 · 🟡 확인 필요 · 🔴 관리 필요 */
export function getWorkerHealth(worker, ctx = {}) {
  if (!ctx.active || !ctx.hasProcess) {
    return { status: "error", label: "관리 필요", icon: "🔴" };
  }
  if (!ctx.hasRecentWork || !ctx.hasQualification) {
    return { status: "warn", label: "확인 필요", icon: "🟡" };
  }
  return { status: "ok", label: "정상", icon: "🟢" };
}

function computePassRate(inspections) {
  if (!inspections.length) return "—";
  const judged = inspections.filter((log) => hasText(log.judgment) && log.judgment !== "보류");
  if (!judged.length) return "—";
  const pass = judged.filter((log) => {
    const j = String(log.judgment ?? "").trim();
    return j === "합격" || j === "OK" || j === "Pass";
  }).length;
  return `${Math.round((pass / judged.length) * 100)}%`;
}

export function buildWorkerMasterSummary() {
  try {
    const all = getMasterDataByCategory("workers");
    const active = all.filter((row) => row.active !== false);
    const index = buildWorkerIndex();

    let processLinked = 0;
    let needsCare = 0;
    active.forEach((worker) => {
      const ctx = workerContext(worker, index);
      if (ctx.hasProcess) processLinked += 1;
      if (getWorkerHealth(worker, ctx).status === "error") needsCare += 1;
    });

    return [
      { id: "total", label: "전체 작업자", value: all.length, unit: "명" },
      { id: "active", label: "활성 작업자", value: active.length, unit: "명" },
      { id: "process-linked", label: "공정 연결 완료", value: processLinked, unit: "명" },
      {
        id: "needs-care",
        label: "관리 필요",
        value: needsCare,
        unit: "명",
        tone: needsCare > 0 ? "danger" : undefined,
      },
    ];
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildWorkerMasterSummary]", error);
    return [
      { id: "total", label: "전체 작업자", value: 0, unit: "명" },
      { id: "active", label: "활성 작업자", value: 0, unit: "명" },
      { id: "process-linked", label: "공정 연결 완료", value: 0, unit: "명" },
      { id: "needs-care", label: "관리 필요", value: 0, unit: "명" },
    ];
  }
}

export function buildWorkerListMeta() {
  const meta = new Map();
  try {
    const index = buildWorkerIndex();
    getMasterDataByCategory("workers").forEach((worker) => {
      const ctx = workerContext(worker, index);
      const health = getWorkerHealth(worker, ctx);
      meta.set(worker.id, {
        process: ctx.primaryProcess,
        healthStatus: health.status,
        healthLabel: health.label,
        healthIcon: health.icon,
      });
    });
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildWorkerListMeta]", error);
  }
  return meta;
}

function buildRecentUpdates(worker, limit = 12) {
  const rows = [];
  let logs = {};
  try {
    logs = getAllMasterImportLogs() ?? {};
  } catch {
    logs = {};
  }
  Object.values(logs)
    .filter((log) => log && (log.masterType === "workers" || log.masterType === "worker"))
    .forEach((log) => {
      const dt = log.datetime ? new Date(log.datetime) : null;
      const valid = dt && !Number.isNaN(dt.getTime());
      rows.push({
        id: log.id ?? `worker-${log.datetime}`,
        sort: valid ? dt.getTime() : 0,
        date: valid
          ? `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`
          : "—",
        time: valid ? `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}` : "--:--",
        type: "Import",
        label: `작업자 Excel Import${log.fileName ? ` · ${log.fileName}` : ""}`,
        user: log.user || "시스템",
      });
    });

  rows.push({
    id: `reg-${worker.id}`,
    sort: 0,
    date: "—",
    time: "--:--",
    type: "등록",
    label: `${worker.name || worker.code || "작업자"} Master 등록`,
    user: "시스템",
  });

  return rows.sort((a, b) => b.sort - a.sort).slice(0, limit);
}

function mapProcessRows(processNames, production) {
  const processMaster = getMasterDataByCategory("heatTreatment");
  return processNames.map((name) => {
    const master = processMaster.find(
      (p) => normKey(p.name) === normKey(name) || normKey(p.code) === normKey(name)
    );
    const lotCount = new Set(
      production
        .filter((r) => normKey(r.heatTreatment) === normKey(name) && hasText(r.lotNo))
        .map((r) => r.lotNo)
    ).size;
    return {
      id: master?.id ?? normKey(name),
      name: master?.name ?? name,
      code: master?.code ?? "—",
      lotCount: `${lotCount}건`,
    };
  });
}

export function buildWorkerMasterDetail(worker) {
  const empty = {
    summaryCard: { name: "—", process: "—", recentLotCount: 0, passRate: "—" },
    qualification: { education: "—", certificate: "—", department: "—", note: "—" },
    processes: [],
    production: [],
    quality: [],
    recentWork: [],
    recentUpdates: [],
    health: { status: "error", label: "관리 필요", icon: "🔴" },
    counts: { processes: 0, production: 0, quality: 0, recentWork: 0 },
    phone: "—",
  };
  if (!worker) return empty;

  try {
    const index = buildWorkerIndex();
    const ctx = workerContext(worker, index);
    const { production, inspections, processNames } = ctx;

    const productionRows = production
      .filter((r) => hasText(r.lotNo))
      .map((r) => ({
        id: r.id,
        lotNo: r.lotNo,
        partNo: r.partNo || "—",
        partName: r.partName || "—",
        workDate: r.workDate || r.incomingDate || "—",
        _date: r.workDate || r.incomingDate || "",
      }))
      .sort((a, b) => String(b._date).localeCompare(String(a._date)));

    const qualityRows = inspections.map((log) => {
      const judgment = String(log.judgment ?? "").trim();
      const isPass = judgment === "합격" || judgment === "OK" || judgment === "Pass";
      const isFail = judgment === "불합격" || judgment === "NG" || judgment === "Fail";
      return {
        id: log.id,
        inspectionItem: log.inspectionItem || "—",
        passLabel: isPass ? "합격" : "—",
        failLabel: isFail ? "불합격" : "—",
      };
    });

    const recentWork = production
      .filter((r) => hasText(r.lotNo))
      .map((r) => ({
        id: r.id,
        lotNo: r.lotNo,
        process: r.heatTreatment || "—",
        equipment: r.equipment || "—",
        workDate: r.workDate || r.incomingDate || "—",
        _date: r.workDate || r.incomingDate || "",
      }))
      .sort((a, b) => String(b._date).localeCompare(String(a._date)));

    const processes = mapProcessRows(processNames, production);

    return {
      summaryCard: {
        name: worker.name || "—",
        process: ctx.primaryProcess,
        recentLotCount: ctx.lotCount,
        passRate: computePassRate(inspections),
      },
      qualification: {
        // 조회 전용 — 향후 교육관리 · 자격관리 연결 준비
        education: "—",
        certificate: "—",
        department: hasText(worker.department) ? worker.department : "—",
        note: hasText(worker.note) ? worker.note : "—",
      },
      processes,
      production: productionRows.map(({ _date, ...rest }) => rest),
      quality: qualityRows,
      recentWork: recentWork.map(({ _date, ...rest }) => rest),
      recentUpdates: buildRecentUpdates(worker),
      health: getWorkerHealth(worker, ctx),
      counts: {
        processes: processes.length,
        production: productionRows.length,
        quality: qualityRows.length,
        recentWork: recentWork.length,
      },
      phone: phoneForWorker(worker),
    };
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildWorkerMasterDetail]", error);
    return empty;
  }
}
