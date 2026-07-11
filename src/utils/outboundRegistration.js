/**
 * Project TITAN V1.0 — 출고등록 · 재고 감소 · 거래명세서 Workflow
 */

import { getStockQty, getShippedQty } from "./inventory";
import { SHIPMENT_STATUS } from "./ndkWorkflow";
import { getProductionProcessName } from "../config/productionProcessCodes";
import { parseQtyWithUnit } from "./productUnits";
import { resolveRecordUnitPrice, calculateAmounts } from "./unitPriceSession";
import {
  getSessionProductionRecords,
  processShipment,
  updateSessionProductionRecord,
} from "./productionRecords";
import {
  getCurrentTitanUser,
  getShipmentEvents,
  removeShipmentEventById,
  saveShipmentEvent,
  saveTransactionStatement,
  updateTransactionStatement,
} from "./titanHistorySession";
import { onOutboundComplete, WORKFLOW_STATUS, getWorkflowStatus } from "./titanWorkflowStatus";
import { isShipmentReady } from "./ndkWorkflow";
import { getPrintOutputDate } from "./titanPrintDates";
import { resolveDefaultAssigneeFromAuth } from "./titanAssigneeResolver";
import { appendWorkJournalAutoEntry } from "./workJournalAutoRecord";
import { WORK_JOURNAL_ACTION_TYPES } from "../config/titanAssigneePolicy";
import { getStatementPrintStatus } from "./outboundStatementStatus";

export { isTitanAdminUser } from "./titanAdminAccess";

export function getOutboundEligibleRecords(records = getSessionProductionRecords()) {
  return records.filter((record) => isShipmentReady(record));
}

export function mapRecordToOutboundRegisterForm(record, prev = {}) {
  if (!record) {
    return {
      managementId: "",
      lotNo: "",
      company: "",
      partName: "",
      partNo: "",
      material: "",
      processName: "",
      stockQty: "",
      shipQty: "",
      shipDate: getPrintOutputDate(),
      manager: "",
      note: "",
    };
  }

  return {
    ...prev,
    managementId: record.id,
    lotNo: record.lotNo?.trim() || "—",
    company: record.company ?? "",
    partName: record.partName ?? "",
    partNo: record.partNo ?? "",
    material: record.material ?? "",
    processName: getProductionProcessName(record),
    stockQty: String(getStockQty(record)),
    shipQty: prev.shipQty ?? "",
    shipDate: prev.shipDate || getPrintOutputDate(),
    manager: prev.manager || resolveDefaultAssigneeFromAuth(),
    note: prev.note ?? "",
  };
}

export function validateOutboundRegisterForm(form) {
  const managementId = form.managementId?.trim();
  if (!managementId) {
    return { ok: false, message: "관리번호를 선택하세요." };
  }

  const record = getSessionProductionRecords().find((item) => item.id === managementId);
  if (!record) {
    return { ok: false, message: "관리번호를 찾을 수 없습니다." };
  }

  const stock = getStockQty(record);
  const parsed = parseQtyWithUnit(form.shipQty, record.unit || "EA");
  const shipQty = parsed.qty;
  const manager = String(form.manager ?? "").trim();

  if (!Number.isFinite(shipQty) || shipQty <= 0) {
    return { ok: false, message: "출고수량(EA)을 입력하세요." };
  }

  if (!manager) {
    return { ok: false, message: "출고 담당자를 선택하세요." };
  }

  if (!form.shipDate?.trim()) {
    return { ok: false, message: "출고일을 입력하세요." };
  }

  if (shipQty > stock) {
    return {
      ok: false,
      message: `출고수량(${shipQty} EA)이 실재고(${stock} EA)보다 많습니다.\n저장할 수 없습니다.`,
    };
  }

  return { ok: true, record, shipQty, stock };
}

/**
 * @returns {{ ok: boolean, message?: string, managementId?: string, record?: object, shipQty?: number, stockAfter?: number, stockBefore?: number }}
 */
export function applyOutboundRegister(form) {
  const validation = validateOutboundRegisterForm(form);
  if (!validation.ok) {
    return { ok: false, message: validation.message };
  }

  const { record, shipQty, stock } = validation;
  const managementId = record.id;
  const stockBefore = stock;
  const shipDate = form.shipDate || getPrintOutputDate();
  const shippedBy = form.manager?.trim() || getCurrentTitanUser();
  const outboundTime = new Date().toISOString();
  const statementStatus = getStatementPrintStatus(record).label;

  const result = processShipment(managementId, shipQty, {
    outboundRegistered: true,
    outboundDate: shipDate,
    outboundManager: shippedBy,
    outboundTime,
    note: form.note?.trim() || undefined,
  });

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  const updated = result.record;
  const unitPrice = resolveRecordUnitPrice(updated);
  const amounts = calculateAmounts(shipQty, unitPrice);

  saveShipmentEvent({
    shippedAt: shipDate,
    shippedBy,
    managementId,
    company: updated.company,
    partName: updated.partName,
    partNo: updated.partNo,
    shipQty,
    unit: updated.unit || "EA",
    unitPrice,
    stockAfter: result.stockAfter,
  });

  const partialShipEntry = {
    at: new Date().toISOString(),
    shipDate,
    shipQty,
    shippedBy,
    statementStatus,
    balanceAfter: result.stockAfter,
  };
  const partialShipHistory = [...(record.partialShipHistory ?? []), partialShipEntry];

  if (result.stockAfter <= 0) {
    onOutboundComplete(managementId);
    updateSessionProductionRecord(managementId, { partialShipHistory });
  } else {
    updateSessionProductionRecord(managementId, {
      outboundRegistered: true,
      outboundDate: shipDate,
      outboundManager: shippedBy,
      outboundTime,
      partialShipHistory,
    });
  }

  appendWorkJournalAutoEntry({
    actionType: WORK_JOURNAL_ACTION_TYPES.OUTBOUND_REGISTER,
    assignee: shippedBy,
    managementId,
    company: updated.company,
    lotNo: updated.lotNo,
    date: shipDate,
    title: `출고 완료 — ${updated.company} ${updated.partNo}`,
    note: form.note?.trim() || "",
  });

  return {
    ok: true,
    message: "출고 등록이 완료되었습니다.",
    managementId,
    record: getSessionProductionRecords().find((item) => item.id === managementId) ?? updated,
    shipQty,
    stockBefore,
    stockAfter: result.stockAfter,
    amounts,
    unitPrice,
  };
}

export function getLastOutboundShipQty(record) {
  if (!record) return 0;
  const events = getShipmentEvents(record.id);
  if (events.length > 0) return Number(events[0].shipQty) || 0;
  return getStockQty(record);
}

/**
 * 관리자 출고취소 — 마지막 출고 1건 되돌림 (거래명세서 이력 유지)
 */
export function cancelLastOutboundShipment(managementId) {
  const id = managementId?.trim();
  if (!id) return { ok: false, message: "관리번호가 없습니다." };

  const record = getSessionProductionRecords().find((item) => item.id === id);
  if (!record) return { ok: false, message: "관리번호를 찾을 수 없습니다." };

  const events = getShipmentEvents(id);
  if (events.length === 0) {
    return { ok: false, message: "취소할 출고 이력이 없습니다." };
  }

  const lastEvent = events[0];
  const revertQty = Number(lastEvent.shipQty) || 0;
  const newShippedQty = Math.max(0, getShippedQty(record) - revertQty);

  const cancelEntry = {
    at: new Date().toISOString(),
    canceledBy: getCurrentTitanUser(),
    shipQty: revertQty,
    shipmentEventId: lastEvent.id,
    note: "관리자 출고취소",
  };

  removeShipmentEventById(lastEvent.id);

  const stockAfter = getStockQty({ ...record, shippedQty: newShippedQty });
  const partialShipHistory = Array.isArray(record.partialShipHistory)
    ? record.partialShipHistory.slice(0, -1)
    : [];
  const patch = {
    shippedQty: newShippedQty,
    shipmentStatus: SHIPMENT_STATUS.WAITING,
    outboundCancelHistory: [...(record.outboundCancelHistory ?? []), cancelEntry],
    partialShipHistory,
  };

  if (getWorkflowStatus(record) === WORKFLOW_STATUS.SHIP_DONE && stockAfter > 0) {
    patch.workflowStatus = WORKFLOW_STATUS.PROD_DONE;
  }

  updateSessionProductionRecord(id, patch);

  return {
    ok: true,
    managementId: id,
    revertedQty: revertQty,
    stockAfter,
  };
}

export function recordTransactionStatementPrint(record, payload = {}) {
  if (!record?.id) return null;

  const shipQty = Number(payload.shipQty) || 0;
  const unitPrice = Number(payload.unitPrice) || resolveRecordUnitPrice(record);
  const amounts = payload.amounts ?? calculateAmounts(shipQty, unitPrice);
  const now = new Date().toISOString();
  const history = Array.isArray(record.statementPrintHistory) ? [...record.statementPrintHistory] : [];
  const isReprint = history.length > 0;
  const outputType = payload.outputType === "pdf" ? "pdf" : "print";
  const outputStatus = payload.outputStatus ?? (outputType === "pdf" ? "PDF만 저장" : "출력 완료");
  const pdfSaved = outputType === "pdf";

  const statementRow = saveTransactionStatement({
    issuedAt: now,
    printedAt: now.slice(0, 10),
    printedBy: getCurrentTitanUser(),
    managementId: record.id,
    lotNo: record.lotNo ?? "",
    company: record.company,
    partName: record.partName,
    partNo: record.partNo,
    drawingNo: record.drawingNo ?? "",
    material: record.material ?? "",
    shipQty,
    unit: record.unit ?? "EA",
    unitPrice,
    supplyAmount: amounts.supplyAmount,
    vat: amounts.vat,
    totalAmount: amounts.totalAmount,
    pdfSaved,
    outputType,
    outputStatus,
    reprint: isReprint,
  });

  history.push({
    at: now,
    printedBy: getCurrentTitanUser(),
    shipQty,
    reprint: isReprint,
    statementId: statementRow.id,
    pdfSaved,
    outputType,
    outputStatus,
  });

  const statementPrintStatus = "발행완료";

  const partialShipHistory = Array.isArray(record.partialShipHistory)
    ? record.partialShipHistory.map((entry, index, items) =>
        index === items.length - 1 ? { ...entry, statementStatus: statementPrintStatus } : entry
      )
    : [];

  updateSessionProductionRecord(record.id, {
    hasTransactionStatement: true,
    statementPrintHistory: history,
    statementPrintStatus,
    ...(partialShipHistory.length ? { partialShipHistory } : {}),
  });

  return statementRow;
}

export function updateTransactionStatementOutputStatus(managementId, statementId, outputStatus) {
  const normalizedStatus = outputStatus === "PDF만 저장" ? "PDF만 저장" : "출력 완료";
  const pdfSaved = normalizedStatus === "PDF만 저장";
  const updated = updateTransactionStatement(statementId, {
    outputStatus: normalizedStatus,
    outputType: pdfSaved ? "pdf" : "print",
    pdfSaved,
  });

  const record = getSessionProductionRecords().find((item) => item.id === managementId);
  if (record?.id) {
    const history = Array.isArray(record.statementPrintHistory)
      ? record.statementPrintHistory.map((entry) =>
          entry.statementId === statementId
            ? { ...entry, outputStatus: normalizedStatus, outputType: pdfSaved ? "pdf" : "print", pdfSaved }
            : entry
        )
      : [];
    updateSessionProductionRecord(record.id, {
      statementPrintHistory: history,
      statementPrintStatus: "발행완료",
    });
  }

  return updated;
}
