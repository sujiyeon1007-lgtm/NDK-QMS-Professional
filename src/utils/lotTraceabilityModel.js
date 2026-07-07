/**
 * Project TITAN V1.7 — LOT Traceability (Store + Legacy 통합)
 */

import { getTitanDataEngine } from "../foundation/data";
import { normalizeProductionLotKey } from "./productionDailyReportPrintData";
import { getSessionProductionRecords } from "./productionRecords";
import { hasInspectionLogForManagementId } from "./inspectionLogSession";
import { getCertificateFileEntries } from "./certificateSession";
import { getTimelineByLotNo } from "./timelineQuery";
import { getEquipmentById } from "./equipmentWorkflowService";
import { prepareCertificateLinkForLot } from "./certificateLinkPrep";

function normalizeLotNo(lotNo) {
  return normalizeProductionLotKey(lotNo);
}

function findLegacyRecordsByLot(lotNo) {
  const key = normalizeLotNo(lotNo);
  if (!key) return [];
  return getSessionProductionRecords().filter(
    (row) => normalizeLotNo(row.lotNo) === key
  );
}

/**
 * @param {string} lotNo
 */
export function buildLotTraceabilityView(lotNo) {
  const key = normalizeLotNo(lotNo);
  if (!key) return null;

  const dataEngine = getTitanDataEngine();
  const lotRecord = dataEngine.lot.getByLotNo(key) ?? dataEngine.lot.getByLotNo(lotNo);
  const legacyRecords = findLegacyRecordsByLot(key);
  const primaryRecord = legacyRecords[0] ?? null;

  const productionRows = dataEngine.production
    .list()
    .filter((row) => normalizeLotNo(row.lotNo) === key);

  const inspectionRows = dataEngine.quality
    .listInspections()
    .filter((row) => normalizeLotNo(row.lotNo) === key);

  const certificateRows = dataEngine.quality
    .listCertificates()
    .filter((row) => normalizeLotNo(row.lotNo) === key);

  const equipmentId =
    lotRecord?.equipmentId ??
    productionRows.find((row) => row.equipmentId)?.equipmentId ??
    primaryRecord?.equipment ??
    null;

  const equipment = equipmentId ? getEquipmentById(equipmentId) : null;

  const managementId =
    lotRecord?.managementId ??
    primaryRecord?.id ??
    primaryRecord?.mesManagementNo ??
    inspectionRows[0]?.managementId ??
    "";

  const productName =
    lotRecord?.productName ??
    primaryRecord?.partName ??
    primaryRecord?.productName ??
    "";

  const productNo = lotRecord?.productNo ?? primaryRecord?.partNo ?? "";

  const process =
    lotRecord?.process ??
    equipment?.process ??
    primaryRecord?.heatTreatment ??
    primaryRecord?.processName ??
    "";

  const progress =
    lotRecord?.progress ??
    equipment?.runningSession?.progress ??
    equipment?.progress ??
    (productionRows.some((row) => row.endTime) ? 100 : 0);

  const status =
    lotRecord?.status ??
    primaryRecord?.workflowStatus ??
    primaryRecord?.completionStatus ??
    "대기";

  const dailyReportStatus = primaryRecord?.registered
    ? primaryRecord?.dailyReportAutoCreated
      ? "자동 생성"
      : "등록됨"
    : "미등록";

  const inspectionStatus = inspectionRows.length
    ? inspectionRows[inspectionRows.length - 1]?.status ?? "검사완료"
    : hasInspectionLogForManagementId(managementId)
      ? "검사완료"
      : "미검사";

  const certificateEntry = certificateRows[0] ?? null;
  const legacyCertificate = getCertificateFileEntries().find((entry) => {
    if (normalizeLotNo(entry.lotNo) === key) return true;
    return entry.managementId === managementId;
  });

  const certificateStatus =
    certificateEntry?.status ??
    (legacyCertificate ? "발행완료" : primaryRecord?.certificateStatus ?? "미발행");

  const certificatePrep = prepareCertificateLinkForLot(key, {
    managementId,
    inspectionRows,
    certificateRows,
  });

  const shipmentStatus =
    primaryRecord?.shippedQty > 0 || primaryRecord?.outboundStatus === "출고완료"
      ? "출고완료"
      : primaryRecord?.outboundStatus ?? "미출고";

  const timeline = getTimelineByLotNo(key);

  return {
    lotNo: lotRecord?.lotNo ?? primaryRecord?.lotNo ?? lotNo,
    managementId,
    productName,
    productNo,
    process,
    equipmentId,
    equipmentName: equipment?.name ?? equipmentId ?? "—",
    progress,
    status,
    dailyReport: {
      status: dailyReportStatus,
      workDate: primaryRecord?.workDate ?? null,
      operator: primaryRecord?.worker ?? primaryRecord?.operator ?? null,
      records: legacyRecords,
      productionRows,
    },
    inspection: {
      status: inspectionStatus,
      rows: inspectionRows,
    },
    certificate: {
      status: certificateStatus,
      rows: certificateRows,
      legacyEntry: legacyCertificate ?? null,
      linkPrep: certificatePrep,
    },
    shipment: {
      status: shipmentStatus,
    },
    timeline,
    lotRecord,
  };
}

/**
 * @param {string} lotNo
 */
export function listLotTraceabilitySummaryRows(lotNo) {
  const view = buildLotTraceabilityView(lotNo);
  if (!view) return [];
  return [
    { label: "LOT 번호", value: view.lotNo },
    { label: "관리번호", value: view.managementId || "—" },
    { label: "제품명", value: view.productName || "—" },
    { label: "현재 공정", value: view.process || "—" },
    { label: "현재 설비", value: view.equipmentName || "—" },
    { label: "진행률", value: view.progress > 0 ? `${view.progress}%` : "—" },
    { label: "생산일보", value: view.dailyReport.status },
    { label: "검사", value: view.inspection.status },
    { label: "성적서", value: view.certificate.status },
    { label: "출고", value: view.shipment.status },
  ];
}
