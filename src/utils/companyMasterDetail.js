/**
 * Project TITAN Sprint 8 — 거래처관리 (Customer Master · ERP Master · Read Only)
 *
 * 거래처는 단순 CRUD 대상이 아니라 Project TITAN 전체가 참조하는 Master 이다.
 * 본 유틸은 거래처 리스트 KPI 와 상세 Popup(관련 제품 · LOT · 출고 · 품질 · 수정)에서
 * 필요한 정보를 기준정보 Master + Workflow/History Session 에서 자동 집계한다.
 *
 * 모든 지표는 입력 금지 — 자동 계산. (SessionStorage Demo)
 * 단일 진입: buildCompanyMasterSummary() · buildCompanyMasterDetail(company)
 */

import { getMasterDataByCategory } from "./masterData";
import { getCompanyTradeSummary } from "./companyTradeSummary";
import { getSessionProductionRecords, isIncomingRegistered } from "./productionRecords";
import { resolveRecordCurrentProcess } from "./workflowProcessStatus";
import { getRecordWorkflowState } from "./ndkWorkflow";
import { getShipmentEvents } from "./titanHistorySession";
import { getInspectionLogs } from "./inspectionLogSession";
import { getAllMasterImportLogs } from "./masterExcelImportLog";

function hasText(value) {
  return String(value ?? "").trim().length > 0;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function companyHasContact(company) {
  const contacts = Array.isArray(company?.contacts) ? company.contacts : [];
  const assignees = Array.isArray(company?.ndkAssignees) ? company.ndkAssignees : [];
  return contacts.some((c) => hasText(c?.name)) || assignees.some((a) => hasText(a?.name));
}

function activeCompanies() {
  return getMasterDataByCategory("companies").filter((row) => row.active !== false);
}

/**
 * 거래처 리스트 Summary KPI — 조회 기간 개념 없이 Master 현황을 요약한다.
 * @returns {Array<{id:string,label:string,value:number,unit:string,tone?:"danger",hint?:string}>}
 */
export function buildCompanyMasterSummary() {
  try {
    const companies = activeCompanies();
    const total = companies.length;
    const withContact = companies.filter((c) => companyHasContact(c)).length;
    const missingContact = total - withContact;

    const records = getSessionProductionRecords();
    const tradingNames = new Set(
      records.map((record) => record.company?.trim()).filter(Boolean)
    );
    const tradingCount = companies.filter((c) => tradingNames.has(c.name?.trim())).length;

    return [
      { id: "total", label: "전체 거래처", value: total, unit: "개" },
      { id: "trading", label: "거래 진행중", value: tradingCount, unit: "개" },
      { id: "with-contact", label: "담당자 등록", value: withContact, unit: "개" },
      {
        id: "missing-contact",
        label: "담당자 미등록",
        value: missingContact,
        unit: "개",
        tone: missingContact > 0 ? "danger" : undefined,
      },
    ];
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildCompanyMasterSummary]", error);
    return [
      { id: "total", label: "전체 거래처", value: 0, unit: "개" },
      { id: "trading", label: "거래 진행중", value: 0, unit: "개" },
      { id: "with-contact", label: "담당자 등록", value: 0, unit: "개" },
      { id: "missing-contact", label: "담당자 미등록", value: 0, unit: "개" },
    ];
  }
}

/** 관련 제품 — 제품 Master 에서 해당 거래처 품번 집계 */
function buildRelatedProducts(name) {
  return getMasterDataByCategory("products")
    .filter((row) => row.active !== false && row.company?.trim() === name)
    .map((row) => ({
      id: row.id,
      partName: row.name || "—",
      partNo: row.partNo || "—",
      material: hasText(row.material) ? row.material : "—",
      process: hasText(row.process) ? row.process : "—",
      activeLabel: row.active === false ? "미사용" : "사용",
    }));
}

/** 관련 LOT — 생산 Workflow 기록(LOT 생성분) 집계 · 최신순 */
function buildRelatedLots(name, limit = 60) {
  return getSessionProductionRecords()
    .filter((record) => record.company?.trim() === name && hasText(record.lotNo))
    .map((record) => ({
      id: record.id,
      managementId: record.id || "—",
      lotNo: record.lotNo || "—",
      partName: record.partName || "—",
      process: resolveRecordCurrentProcess(record)?.label ?? "—",
      workDate: record.workDate || record.incomingDate || "—",
      qty: `${Number(record.qty ?? 0).toLocaleString("ko-KR")} ${record.unit || "EA"}`,
    }))
    .sort((a, b) => String(b.workDate).localeCompare(String(a.workDate)))
    .slice(0, limit);
}

/** 최근 출고 — 출고 이벤트 History 집계 · 최신순 */
function buildRecentShipments(name, limit = 20) {
  return getShipmentEvents()
    .filter((event) => event.company?.trim() === name)
    .slice(0, limit)
    .map((event) => ({
      id: event.id,
      shippedAt: event.shippedAt || "—",
      managementId: event.managementId || "—",
      partName: event.partName || "—",
      shipQty: `${Number(event.shipQty ?? 0).toLocaleString("ko-KR")} ${event.unit || "EA"}`,
      shippedBy: event.shippedBy || "—",
    }));
}

/** 최근 품질 — 검사일지 집계 · 최신순 */
function buildRecentQuality(name, limit = 20) {
  return getInspectionLogs()
    .filter((log) => log.company?.trim() === name)
    .sort((a, b) => String(b.inspectionDate).localeCompare(String(a.inspectionDate)))
    .slice(0, limit)
    .map((log) => ({
      id: log.id,
      inspectionDate: log.inspectionDate || "—",
      lotNo: log.lotNo || log.managementId || "—",
      partName: log.partName || log.partNo || "—",
      judgment: log.judgment || "보류",
    }));
}

/** 최근 수정 이력 — 거래처 Master Excel Import Log (실제 timestamp) */
function buildRecentUpdates(limit = 12) {
  let logs = {};
  try {
    logs = getAllMasterImportLogs() ?? {};
  } catch {
    logs = {};
  }
  return Object.values(logs)
    .filter((log) => log && (log.masterType === "companies" || log.masterType === "company"))
    .map((log) => {
      const dt = log.datetime ? new Date(log.datetime) : null;
      const valid = dt && !Number.isNaN(dt.getTime());
      return {
        id: log.id ?? `companies-${log.datetime}`,
        sort: valid ? dt.getTime() : 0,
        date: valid
          ? `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`
          : "—",
        time: valid ? `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}` : "--:--",
        label: `거래처 Excel Import${log.fileName ? ` · ${log.fileName}` : ""}`,
        user: log.user || "시스템",
      };
    })
    .sort((a, b) => b.sort - a.sort)
    .slice(0, limit);
}

/**
 * 거래처 상세 Popup 데이터 Snapshot.
 * @param {object|null} company 거래처 Master row
 * @returns {{
 *   tradeSummary: object,
 *   products: object[],
 *   lots: object[],
 *   shipments: object[],
 *   quality: object[],
 *   recentUpdates: object[],
 *   counts: {products:number,lots:number,shipments:number,quality:number},
 * }}
 */
export function buildCompanyMasterDetail(company) {
  const name = company?.name?.trim();
  const empty = {
    tradeSummary: getCompanyTradeSummary(name, company),
    products: [],
    lots: [],
    shipments: [],
    quality: [],
    recentUpdates: [],
    counts: { products: 0, lots: 0, shipments: 0, quality: 0 },
  };
  if (!name) return empty;

  try {
    const products = buildRelatedProducts(name);
    const lots = buildRelatedLots(name);
    const shipments = buildRecentShipments(name);
    const quality = buildRecentQuality(name);

    // 거래이력 요약 — 입고/출고 건수는 전체 Workflow 기록 기준(공통 유틸 재사용)
    const records = getSessionProductionRecords().filter((r) => r.company?.trim() === name);
    const inboundCount = records.filter(isIncomingRegistered).length;
    const outboundCount = records.filter(
      (r) => getRecordWorkflowState(r) === "출고완료" || r.shipmentStatus === "출고완료"
    ).length;

    return {
      tradeSummary: {
        ...getCompanyTradeSummary(name, company),
        inboundCount,
        outboundCount,
      },
      products,
      lots,
      shipments,
      quality,
      recentUpdates: buildRecentUpdates(),
      counts: {
        products: products.length,
        lots: lots.length,
        shipments: shipments.length,
        quality: quality.length,
      },
    };
  } catch (error) {
    if (import.meta.env?.DEV) console.error("[buildCompanyMasterDetail]", error);
    return empty;
  }
}
