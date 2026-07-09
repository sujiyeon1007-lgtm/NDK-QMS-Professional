/**

 * 입고관리 Detail Popup — 데이터 모델 (입고관리 전용)

 */



import { CERTIFICATE_STATUS, SHIPMENT_STATUS } from "../../utils/ndkWorkflow";

import { getProductionProcessName } from "../../config/productionProcessCodes";

import { getCertificateEntryByManagementId } from "../../utils/certificateSession";

import { getInspectionLogsByManagementId } from "../../utils/inspectionLogSession";

import { getProductByCompanyAndPartNo } from "../../utils/productRegistrationSession";

import { getProductInspectionByProductId } from "../../utils/productInspectionSession";

import { formatTraceabilityDateTime, getCoLotProducts } from "../../utils/productTraceabilityModel";

import { getSessionProductionRecords, isIncomingRegistered } from "../../utils/productionRecords";

import { formatQtyWithUnit } from "../../utils/productUnits";

import { mapV13ProductListRow } from "../../utils/processFlow";
import { getActiveWorkers } from "../../utils/masterData";
import {
  formatFoundationAttachmentTypeLabel,
  normalizeFoundationAttachment,
} from "../../utils/foundationAttachmentEngine";

import {
  inferScreenKeyFromListRow,
  resolveRecordCurrentProcess,
} from "../../utils/workflowProcessStatus";

import {
  formatOutboundDateDetailLabel,
  formatOutboundDateLabel,
  formatOutboundTimeLabel,
  getOutboundManager,
} from "../../utils/outboundManagementStatus";

import {

  getInboundManagementStatus,

  isInboundShipOutComplete,

} from "../../utils/inboundManagementStatus";

import {
  TITAN_STANDARD_DETAIL_POPUP_TABS,
} from "../../foundation/components/detailPopup/standardDetailPopupTabs";
import {
  TITAN_STANDARD_DETAIL_POPUP_CHROME_HEIGHT,
  TITAN_STANDARD_DETAIL_POPUP_CONTENT_HEIGHT,
  TITAN_STANDARD_DETAIL_POPUP_HEIGHT,
  TITAN_STANDARD_DETAIL_POPUP_WIDTH,
} from "../../foundation/components/detailPopup/standardDetailPopupLayout";

export const INBOUND_DETAIL_POPUP_TABS = TITAN_STANDARD_DETAIL_POPUP_TABS;

/** PM 고정 규격 — 탭별 재계산 없음, 가장 긴 탭(공정이력) 기준 Dialog 크기 */
export const INBOUND_DETAIL_POPUP_WIDTH = TITAN_STANDARD_DETAIL_POPUP_WIDTH;
export const INBOUND_DETAIL_POPUP_HEIGHT = TITAN_STANDARD_DETAIL_POPUP_HEIGHT;
export const INBOUND_DETAIL_POPUP_CHROME_HEIGHT = TITAN_STANDARD_DETAIL_POPUP_CHROME_HEIGHT;
export const INBOUND_DETAIL_POPUP_CONTENT_HEIGHT = TITAN_STANDARD_DETAIL_POPUP_CONTENT_HEIGHT;

/** @param {object | null | undefined} listRow */
export function resolveStandardDetailListRow(listRow) {
  if (!listRow) return null;

  const rowId = listRow.managementId ?? listRow.record?.id ?? listRow.id;
  let freshRecord = rowId
    ? getSessionProductionRecords().find((item) => item.id === rowId)
    : null;

  if (!freshRecord && listRow.partNo && listRow.company) {
    freshRecord = getSessionProductionRecords().find(
      (item) =>
        String(item.partNo ?? "").trim() === String(listRow.partNo ?? "").trim() &&
        String(item.company ?? "").trim() === String(listRow.company ?? "").trim()
    );
  }

  const record = freshRecord ?? listRow.record ?? listRow;

  if (!record?.id && !rowId) {
    return listRow;
  }

  const screenKey = inferScreenKeyFromListRow(listRow);
  let statusLabel = listRow.statusLabel;
  let statusVariant = listRow.statusVariant ?? "wait";

  if (!statusLabel && !screenKey) {
    const status = isInboundShipOutComplete(record)
      ? { label: "출고완료", variant: "complete" }
      : getInboundManagementStatus(record);
    statusLabel = status?.label;
    statusVariant = status?.variant ?? "wait";
  }

  const mapped = screenKey
    ? mapV13ProductListRow(
        record,
        { label: statusLabel ?? listRow.statusLabel ?? "—", variant: statusVariant },
        { screenKey }
      )
    : mapV13ProductListRow(record, { label: statusLabel, variant: statusVariant });

  const current = resolveRecordCurrentProcess(record);

  return {
    ...mapped,
    ...(listRow.outboundDate !== undefined
      ? {
          outboundDate: formatOutboundDateLabel(record),
          outboundDateLabel: formatOutboundDateDetailLabel(record),
          shipDateLabel: formatOutboundDateDetailLabel(record),
          outboundTimeLabel: formatOutboundTimeLabel(record),
          outboundManagerLabel: getOutboundManager(record),
        }
      : {}),
    managerName:
      listRow.outboundDate !== undefined
        ? getOutboundManager(record)
        : record.registrar ?? record.manager ?? listRow.managerName ?? "—",
    record,
    screenKey: screenKey ?? listRow.screenKey,
    statusLabel: statusLabel ?? listRow.statusLabel ?? mapped.statusLabel,
    statusVariant: statusVariant ?? listRow.statusVariant ?? mapped.statusVariant,
    currentProcess: current.label,
    currentProcessKey: current.key,
    currentProcessVariant: current.variant,
    workflowProcess: current.label,
    workflowStatus: listRow.workflowStatus ?? mapped.workflowStatus ?? statusLabel,
    heatTreatmentProcess: listRow.heatTreatmentProcess ?? listRow.processName ?? mapped.processName,
  };
}

/** @deprecated use resolveStandardDetailListRow */
export function resolveInboundDetailListRow(listRow) {
  return resolveStandardDetailListRow(listRow);
}

/** @param {object | null | undefined} listRow */
export function buildInboundDetailContent(listRow, statusLabel, statusVariant) {
  const resolved = resolveStandardDetailListRow(listRow);
  if (!resolved) return null;
  const record = resolved.record ?? resolved;
  const base = buildInboundBasicInfo(
    record,
    resolved,
    statusLabel ?? resolved.statusLabel,
    statusVariant ?? resolved.statusVariant
  );

  if (resolved.outboundDate !== undefined) {
    return {
      ...base,
      outboundDate: resolved.outboundDateLabel ?? resolved.outboundDate ?? "—",
      outboundManager: resolved.outboundManagerLabel ?? getOutboundManager(record),
      outboundTime: resolved.outboundTimeLabel ?? formatOutboundTimeLabel(record),
    };
  }

  return base;
}



export const INBOUND_QR_WORK_HISTORY_LABELS = [

  { key: "incomingRegistered", label: "입고등록" },

  { key: "productionStart", label: "생산 시작" },

  { key: "productionDone", label: "생산 종료" },

  { key: "inspectionStart", label: "검사 시작" },

  { key: "inspectionDone", label: "검사 종료" },

  { key: "certificateIssued", label: "성적서 발행" },

  { key: "shipmentDone", label: "출고" },

];



export const INBOUND_PROCESS_HISTORY_STEPS = [

  { key: "incomingRegistered", label: "입고등록" },

  { key: "htlPrinted", label: "입고리스트 출력" },

  { key: "productionStart", label: "생산 시작" },

  { key: "productionDone", label: "생산 완료" },

  { key: "inspectionStart", label: "검사 시작" },

  { key: "inspectionDone", label: "검사 완료" },

  { key: "certificateIssued", label: "성적서 발행" },

  { key: "shipmentDone", label: "출고 완료" },

];

/** 공정이력 타임라인 — 단계별 아이콘 강조색 */
export const INBOUND_PROCESS_HISTORY_STEP_TONES = {
  incomingRegistered: "blue",
  htlPrinted: "blue",
  productionStart: "orange",
  productionDone: "orange",
  inspectionStart: "green",
  inspectionDone: "green",
  certificateIssued: "purple",
  shipmentDone: "teal",
};

const EMPTY_HISTORY_CELL = {

  datetime: "—",

  assignee: "—",

  status: "—",

  completed: false,

};

function resolveProcessAssigneeDisplay(value) {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "—") {
    return { assignee: "—", assigneeDetail: "—" };
  }

  const worker = getActiveWorkers().find((item) => raw.includes(item.name));
  if (worker?.name) {
    return {
      assignee: worker.name,
      assigneeDetail: [worker.department, worker.name, worker.position].filter(Boolean).join(" · "),
    };
  }

  const normalized = raw
    .replace(/[()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const parts = normalized.split(/[\s·/|>-]+/).filter(Boolean);
  const isOrgToken = (part) =>
    /(부|팀|파트|센터|관리부|품질관리부|생산관리부|경영지원|담당|주임|대리|과장|차장|부장|관리자권한)$/u.test(part);
  if (parts.length > 0 && parts.every(isOrgToken)) {
    return { assignee: "—", assigneeDetail: raw };
  }
  const nameLike = [...parts]
    .reverse()
    .find((part) => !isOrgToken(part));
  const fallback = nameLike || parts.at(-1) || raw;

  return { assignee: fallback, assigneeDetail: raw };
}

function formatAttachmentCategory(typeId) {
  return formatFoundationAttachmentTypeLabel({ attachmentType: typeId });
}



function formatDisplayDateTime(value) {

  if (!value) return "—";

  return formatTraceabilityDateTime(value);

}



function resolveInspectionLog(record) {

  const logs = getInspectionLogsByManagementId(record?.id);

  if (!logs.length) return null;

  return [...logs].sort((a, b) =>

    String(b.inspectionDate || b.createdAt || "").localeCompare(String(a.inspectionDate || a.createdAt || ""))

  )[0];

}



function resolveFirstPrintHistory(record) {

  const history = record?.inboundListPrintHistory ?? record?.htlPrintHistory ?? [];

  if (!Array.isArray(history) || history.length === 0) return null;

  return history.find((entry) => !entry.reprint) ?? history[0];

}



function buildProcessHistoryStep(record, stepKey) {

  if (!record) return { ...EMPTY_HISTORY_CELL };



  switch (stepKey) {

    case "incomingRegistered": {

      if (!isIncomingRegistered(record)) return { ...EMPTY_HISTORY_CELL };

      return {

        completed: true,

        datetime: formatDisplayDateTime(

          record.incomingRegisteredAt || (record.incomingDate ? `${record.incomingDate}T09:00:00` : "")

        ),

        assignee: record.registrar?.trim() || record.manager?.trim() || "—",

        status: "완료",

      };

    }

    case "htlPrinted": {

      const printEntry = resolveFirstPrintHistory(record);

      if (!printEntry && !record.workSheetGenerated && !record.htlNo?.trim()) {

        return { ...EMPTY_HISTORY_CELL };

      }

      return {

        completed: true,

        datetime: printEntry?.printDateTime || formatDisplayDateTime(record.htlPrintedAt || record.inboundListLastPrintedAt),

        assignee: printEntry?.printedBy || record.inboundListLastPrintedBy || "—",

        status: "완료",

      };

    }

    case "productionStart": {

      if (!record.productionStartAt && !record.workDate && !(record.registered && record.lotNo?.trim())) {

        return { ...EMPTY_HISTORY_CELL };

      }

      const started = Boolean(record.productionStartAt || record.workDate || record.dailyReportDraftStarted);

      if (!started) return { ...EMPTY_HISTORY_CELL };

      return {

        completed: true,

        datetime: formatDisplayDateTime(record.productionStartAt || (record.workDate ? `${record.workDate}T08:00:00` : "")),

        assignee: record.worker?.trim() || record.operator?.trim() || "—",

        status: "완료",

      };

    }

    case "productionDone": {

      const done =

        record.completionStatus === "생산완료" ||

        record.workflowStatus === "생산완료" ||

        Boolean(record.productionEndAt || record.productionCompleteDate);

      if (!done) return { ...EMPTY_HISTORY_CELL };

      return {

        completed: true,

        datetime: formatDisplayDateTime(

          record.productionEndAt || record.productionCompleteDate || (record.workDate ? `${record.workDate}T17:00:00` : "")

        ),

        assignee: record.worker?.trim() || record.operator?.trim() || "—",

        status: "완료",

      };

    }

    case "inspectionStart": {

      const log = resolveInspectionLog(record);

      if (!log && !record.inspectionStartAt) return { ...EMPTY_HISTORY_CELL };

      return {

        completed: true,

        datetime: formatDisplayDateTime(

          record.inspectionStartAt ||

            log?.createdAt ||

            (log?.inspectionDate ? `${log.inspectionDate}T08:30:00` : "")

        ),

        assignee: log?.assignee?.trim() || record.inspector?.trim() || "—",

        status: log?.status === "검사중" ? "진행중" : "완료",

      };

    }

    case "inspectionDone": {

      const log = resolveInspectionLog(record);

      const done = Boolean(log?.judgment) || Boolean(record.inspectionEndAt);

      if (!done) return { ...EMPTY_HISTORY_CELL };

      return {

        completed: true,

        datetime: formatDisplayDateTime(

          record.inspectionEndAt ||

            log?.updatedAt ||

            (log?.inspectionDate ? `${log.inspectionDate}T09:30:00` : "")

        ),

        assignee: log?.assignee?.trim() || record.inspector?.trim() || "—",

        status: log?.judgment || "완료",

      };

    }

    case "certificateIssued": {

      const certEntry = getCertificateEntryByManagementId(record.id);

      const issued =

        record.certificateStatus === CERTIFICATE_STATUS.ISSUED ||

        Boolean(certEntry?.registeredAt || certEntry?.pdfFileName);

      if (!issued) return { ...EMPTY_HISTORY_CELL };

      return {

        completed: true,

        datetime: formatDisplayDateTime(record.certificateIssuedAt || certEntry?.registeredAt || certEntry?.updatedAt),

        assignee: certEntry?.registeredBy?.trim() || record.certificateRegistrar?.trim() || "—",

        status: "발행완료",

      };

    }

    case "shipmentDone": {

      if (record.shipmentStatus !== SHIPMENT_STATUS.DONE && !(record.shippedQty > 0)) {

        return { ...EMPTY_HISTORY_CELL };

      }

      return {

        completed: true,

        datetime: formatDisplayDateTime(
          record.outboundTime || record.outboundDate || record.shipCompletedAt || record.shipDate || record.lastShipDate
        ),

        assignee: record.outboundManager?.trim() || record.shipManager?.trim() || "—",

        status: "완료",

      };

    }

    default:

      return { ...EMPTY_HISTORY_CELL };

  }

}



/** @param {object | null | undefined} record */

export function buildInboundProcessHistoryRows(record) {

  return INBOUND_PROCESS_HISTORY_STEPS.map((step) => {

    const history = buildProcessHistoryStep(record, step.key);
    const assigneeMeta = resolveProcessAssigneeDisplay(history.assignee);

    return {

      key: step.key,

      label: step.label,

      ...history,

      assignee: assigneeMeta.assignee,

      assigneeDetail: assigneeMeta.assigneeDetail,

    };

  });

}



/** @param {object | null | undefined} listRow */

export function buildInboundBasicInfo(record, listRow, statusLabel, statusVariant) {

  const row = listRow ?? {};

  const source = record ?? row.record ?? row;

  const inboundQty = row.inboundQtyLabel ?? formatQtyWithUnit(source.qty, source.unit);

  const workQty =

    row.workQtyLabel ??

    (source.registered && source.lotNo?.trim()

      ? formatQtyWithUnit(source.qty, source.unit)

      : "—");



  const current = resolveRecordCurrentProcess(source);

  return {

    managementId: source.id ?? row.managementId ?? row.id ?? "—",

    incomingDate: row.incomingDate ?? source.incomingDate ?? source.registeredDate ?? "—",

    productionDate:

      row.productionDate ?? source.workDate ?? source.productionCompleteDate ?? source.productionDate ?? "—",

    lotNo: row.lotNo ?? (source.lotNo?.trim() || "—"),

    company: row.company ?? source.company ?? "—",

    partName: row.partName ?? source.partName ?? "—",

    partNo: row.partNo ?? source.partNo ?? "—",

    material: row.material ?? source.material ?? "—",

    spec: String(source.spec ?? row.spec ?? "").trim() || "—",

    inboundQty,

    workQty,

    currentProcess: current.label,

    currentProcessVariant: current.variant,

    statusLabel: statusLabel ?? row.statusLabel ?? "—",

    statusVariant: statusVariant ?? row.statusVariant ?? "wait",

    manager: row.managerName ?? source.registrar ?? source.manager ?? "—",

    note: String(source.note ?? row.remark ?? "").trim() || "—",

  };

}



/** @param {object | null | undefined} record */

export function buildInboundAttachmentRows(record) {

  if (!record?.id) return [];



  const rows = [];

  const product = getProductByCompanyAndPartNo(record.company, record.partNo);

  const inspection = product ? getProductInspectionByProductId(product.id) : null;

  const drawing = inspection?.drawing;



  if (drawing?.fileName || drawing?.drawingNo || record.drawingNo?.trim()) {

    rows.push({

      key: "drawing",

      category: formatAttachmentCategory("drawing"),

      name: drawing?.fileName || drawing?.drawingNo || record.drawingNo,

      detail: drawing?.revision ? `Rev.${String(drawing.revision).replace(/^Rev\.?/i, "")}` : "—",

    });

  }



  if (record.htlNo?.trim() || record.workSheetGenerated) {

    rows.push({

      key: "worksheet",

      category: formatAttachmentCategory("workOrder"),

      name: record.htlNo?.trim() || "열처리 작업 요청 리스트",

      detail: record.htlPrintStatus || "출력완료",

    });

  }



  getInspectionLogsByManagementId(record.id).forEach((log) => {

    rows.push({

      key: `inspection-${log.id}`,

      category: formatAttachmentCategory("inspectionCertificate"),

      name: log.inspectionItem?.trim() || `${log.partName || "검사"} 리포트`,

      detail: log.inspectionDate || log.createdAt?.slice(0, 10) || "—",

    });

  });



  const certEntry = getCertificateEntryByManagementId(record.id);

  if (certEntry?.pdfFileName || certEntry?.excelFileName || record.certificateStatus === CERTIFICATE_STATUS.ISSUED) {

    rows.push({

      key: "certificate",

      category: formatAttachmentCategory("certificate"),

      name: certEntry?.pdfFileName || certEntry?.excelFileName || `${record.partNo || record.id} 성적서`,

      detail: certEntry?.registeredAt?.slice(0, 10) || "—",

    });

  }



  const extraFiles = Array.isArray(record.attachments) ? record.attachments : [];

  extraFiles.forEach((file, index) => {
    const normalizedFile = normalizeFoundationAttachment({
      ...file,
      attachmentType: file.attachmentType ?? file.typeId ?? "etc",
    }, index);
    if (!normalizedFile) return;

    rows.push({

      key: `extra-${index}`,

      category: formatFoundationAttachmentTypeLabel(normalizedFile),

      name: normalizedFile?.name || "첨부파일",

      detail: normalizedFile?.uploadedAt?.slice(0, 10) || file.registeredDate?.slice(0, 10) || "—",

    });

  });



  return rows;

}



/** @param {object | null | undefined} listRow */

export function buildInboundProductSummary(record, listRow, statusLabel, statusVariant) {

  const info = buildInboundBasicInfo(record, listRow, statusLabel, statusVariant);

  return {

    company: info.company,

    partName: info.partName,

    partNo: info.partNo,

    lotNo: info.lotNo,

    currentProcess: info.currentProcess,

    statusLabel: info.statusLabel,

    statusVariant: info.statusVariant,

  };

}



/** @param {object | null | undefined} record */

export function buildInboundQrWorkHistoryRows(record) {

  const historyByKey = Object.fromEntries(

    buildInboundProcessHistoryRows(record)

      .filter((row) => row.key !== "htlPrinted")

      .map((row) => [row.key, row])

  );



  return INBOUND_QR_WORK_HISTORY_LABELS.map((def) => {

    const history = historyByKey[def.key];

    return {

      key: def.key,

      label: def.label,

      atLabel: history?.completed ? history.datetime : "—",

      worker: history?.completed ? history.assignee : "—",

      pending: !history?.completed,

    };

  });

}



/** @param {object | null | undefined} record */

export function buildInboundCoLotProductRows(record) {

  if (!record) {

    return { lotNo: "—", products: [] };

  }



  const lotNo = record.lotNo?.trim() || "—";

  const coLotProducts = getCoLotProducts(record);

  const records = getSessionProductionRecords();



  return {

    lotNo,

    products: coLotProducts.map((item) => {

      const source = records.find((row) => row.id === item.managementId);

      const current = source ? resolveRecordCurrentProcess(source) : null;
      const currentProcess = current?.label ?? "—";



      const shipComplete = source ? isInboundShipOutComplete(source) : false;

      const status = source ? getInboundManagementStatus(source) : null;

      const statusLabel = shipComplete ? "출고완료" : status?.label ?? "—";

      const statusVariant = shipComplete ? "complete" : status?.variant ?? "wait";

      const workQty =

        source?.registered && source?.lotNo?.trim()

          ? formatQtyWithUnit(source.qty, source.unit)

          : "—";



      return {

        ...item,

        company: source?.company ?? item.company ?? "—",

        partNo: item.partNo ?? source?.partNo ?? "—",

        workQty,

        currentProcess,

        statusLabel,

        statusVariant,

      };

    }),

  };

}



/** @param {object | null | undefined} record */

export function buildInboundMemoSections(record) {

  if (!record) {

    return [

      { key: "incoming", label: "입고 메모", value: "—" },

      { key: "production", label: "생산 메모", value: "—" },

      { key: "inspection", label: "검사 메모", value: "—" },

      { key: "admin", label: "관리 메모", value: "—" },

    ];

  }



  const inspectionLog = resolveInspectionLog(record);



  return [

    {

      key: "incoming",

      label: "입고 메모",

      value: record.note?.trim() || "—",

    },

    {

      key: "production",

      label: "생산 메모",

      value: record.productionMemo?.trim() || record.dailyReportNote?.trim() || record.productionNote?.trim() || "—",

    },

    {

      key: "inspection",

      label: "검사 메모",

      value: inspectionLog?.note?.trim() || record.inspectionMemo?.trim() || "—",

    },

    {

      key: "admin",

      label: "관리 메모",

      value: record.adminMemo?.trim() || record.managerMemo?.trim() || record.managementNote?.trim() || "—",

    },

  ];

}

/** Standard Detail Popup — 공통 export (입고관리 UI Freeze) */
export const STANDARD_PROCESS_HISTORY_STEP_TONES = INBOUND_PROCESS_HISTORY_STEP_TONES;
export const STANDARD_PROCESS_HISTORY_STEPS = INBOUND_PROCESS_HISTORY_STEPS;
export const STANDARD_QR_WORK_HISTORY_LABELS = INBOUND_QR_WORK_HISTORY_LABELS;

export const buildStandardDetailContent = buildInboundDetailContent;
export const buildStandardBasicInfo = buildInboundBasicInfo;
export const buildStandardProcessHistoryRows = buildInboundProcessHistoryRows;
export const buildStandardQrWorkHistoryRows = buildInboundQrWorkHistoryRows;
export const buildStandardCoLotProductRows = buildInboundCoLotProductRows;
export const buildStandardAttachmentRows = buildInboundAttachmentRows;
export const buildStandardMemoSections = buildInboundMemoSections;
export const buildStandardProductSummary = buildInboundProductSummary;

