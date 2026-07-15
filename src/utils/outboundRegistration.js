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
import { getPrintOutputDate } from "./titanPrintDates";
import { resolveDefaultAssigneeFromAuth } from "./titanAssigneeResolver";
import { appendWorkJournalAutoEntry } from "./workJournalAutoRecord";
import { WORK_JOURNAL_ACTION_TYPES } from "../config/titanAssigneePolicy";
import { getStatementPrintStatus } from "./outboundStatementStatus";
import { expandRecordsByChargeHistory } from "./lotBundleService";
import { resolveChargeQty } from "./equipmentChargingQty";
import { hasInspectionLogForRecord } from "./inspectionLogSession";

export { isTitanAdminUser } from "./titanAdminAccess";

/** Product identity for 출고 UI (company + partNo + partName) */
export function buildOutboundProductKey(record) {
  const company = String(record?.company ?? "").trim();
  const partNo = String(record?.partNo ?? record?.productNo ?? "").trim();
  const partName = String(record?.partName ?? record?.productName ?? "").trim();
  return `${company}::${partNo}::${partName}`;
}

function resolveChargeEntryForLot(record) {
  const lotKey = String(record?.lotNo ?? "").trim().toUpperCase();
  if (!lotKey) return null;
  return (
    (record?.chargeHistory ?? []).find(
      (entry) => String(entry?.lotNo ?? "").trim().toUpperCase() === lotKey
    ) ?? null
  );
}

function outboundLotFifoSortKey(record) {
  const entry = resolveChargeEntryForLot(record);
  return (
    String(entry?.completedAt ?? "").trim() ||
    String(entry?.finishedAt ?? "").trim() ||
    String(entry?.startedAt ?? "").trim() ||
    String(entry?.chargedAt ?? "").trim() ||
    String(record?.productionCompletedAt ?? "").trim() ||
    `${record?.id ?? ""}\0${record?.lotNo ?? ""}`
  );
}

export function compareOutboundLotFifoOrder(a, b) {
  const keyA = outboundLotFifoSortKey(a);
  const keyB = outboundLotFifoSortKey(b);
  if (keyA < keyB) return -1;
  if (keyA > keyB) return 1;
  return String(a?.lotNo ?? "").localeCompare(String(b?.lotNo ?? ""));
}

/** LOT-level shippable qty (chargeQty − shipped for that LOT) */
export function resolveOutboundLotAvailableQty(record) {
  if (record?.isOutboundProductAggregate) {
    return resolveOutboundProductAvailableQty(record);
  }
  const chargeQty = resolveChargeQty(record, { lotNo: record?.lotNo });
  if (chargeQty <= 0) return 0;
  return Math.max(0, chargeQty - getOutboundShippedQtyForLot(record));
}

/** Alias — product aggregate or LOT row */
export function resolveOutboundAvailableQty(record) {
  return resolveOutboundLotAvailableQty(record);
}

export function resolveOutboundProductAvailableQty(product) {
  const lots = product?.outboundLotRows ?? product?.lotRows ?? [];
  if (lots.length > 0) {
    return lots.reduce((sum, row) => sum + resolveOutboundLotAvailableQty(row), 0);
  }
  return resolveOutboundLotAvailableQty({
    ...product,
    isOutboundProductAggregate: false,
  });
}

export function resolveOutboundProductCompletedQty(product) {
  const lots = product?.outboundLotRows ?? product?.lotRows ?? [];
  if (lots.length > 0) {
    return lots.reduce(
      (sum, row) => sum + (resolveChargeQty(row, { lotNo: row?.lotNo }) || 0),
      0
    );
  }
  return resolveChargeQty(product, { lotNo: product?.lotNo }) || 0;
}

export function resolveOutboundProductShippedQty(product) {
  const lots = product?.outboundLotRows ?? product?.lotRows ?? [];
  if (lots.length > 0) {
    return lots.reduce((sum, row) => sum + getOutboundShippedQtyForLot(row), 0);
  }
  return getOutboundShippedQtyForLot(product);
}

/** Inspection-complete LOT virtual rows with remaining shippable qty */
export function getOutboundEligibleLotRows(records = getSessionProductionRecords()) {
  return expandRecordsByChargeHistory(records)
    .filter((record) => hasInspectionLogForRecord(record) && resolveOutboundLotAvailableQty(record) > 0)
    .sort(compareOutboundLotFifoOrder);
}

/**
 * Aggregate inspection-complete LOTs into product rows (UI SSOT).
 * @param {object[]} [lotRows]
 */
export function aggregateOutboundProductsByKey(lotRows) {
  const map = new Map();

  for (const lotRow of lotRows) {
    const productKey = buildOutboundProductKey(lotRow);
    if (!productKey || productKey === "::::") continue;
    const existing = map.get(productKey);
    if (!existing) {
      map.set(productKey, {
        ...lotRow,
        id: lotRow.id,
        productKey,
        isOutboundProductAggregate: true,
        lotNo: "",
        outboundLotRows: [lotRow],
      });
      continue;
    }
    existing.outboundLotRows.push(lotRow);
  }

  return [...map.values()].map((product) => {
    const lots = [...product.outboundLotRows].sort(compareOutboundLotFifoOrder);
    const primary = lots[0] ?? product;
    const availableQty = lots.reduce((sum, row) => sum + resolveOutboundLotAvailableQty(row), 0);
    const completedQty = lots.reduce(
      (sum, row) => sum + (resolveChargeQty(row, { lotNo: row?.lotNo }) || 0),
      0
    );
    const shippedQty = lots.reduce((sum, row) => sum + getOutboundShippedQtyForLot(row), 0);
    const managementIds = [...new Set(lots.map((row) => row.id).filter(Boolean))];

    return {
      ...primary,
      id: primary.id,
      productKey: product.productKey,
      isOutboundProductAggregate: true,
      lotNo: "",
      outboundLotRows: lots,
      managementIds,
      availableQty,
      completedWorkQty: completedQty,
      shippedProductQty: shippedQty,
      chargeQty: availableQty,
      workQty: availableQty,
    };
  });
}

export function getOutboundEligibleRecords(records = getSessionProductionRecords()) {
  return aggregateOutboundProductsByKey(getOutboundEligibleLotRows(records)).filter(
    (product) => resolveOutboundProductAvailableQty(product) > 0
  );
}

export function getOutboundCompletedLotRows(records = getSessionProductionRecords()) {
  return expandRecordsByChargeHistory(records).filter((record) => hasOutboundShipmentForLot(record));
}

export function getOutboundCompletedProductRows(records = getSessionProductionRecords()) {
  return aggregateOutboundProductsByKey(getOutboundCompletedLotRows(records)).filter(
    (product) => resolveOutboundProductShippedQty(product) > 0
  );
}

export function findOutboundProductByKey(productKey, records = getSessionProductionRecords()) {
  const key = String(productKey ?? "").trim();
  if (!key) return null;
  return (
    getOutboundEligibleRecords(records).find((item) => item.productKey === key) ??
    getOutboundCompletedProductRows(records).find((item) => item.productKey === key) ??
    null
  );
}

/**
 * FIFO allocate shipQty across LOT rows (oldest completed/charged first).
 * @returns {{ ok: boolean, message?: string, allocations: Array<{ managementId: string, lotNo: string, shipQty: number, record: object }> }}
 */
export function allocateOutboundShipQtyFifo(lotRows, shipQty) {
  const qty = Number(shipQty);
  if (!Number.isFinite(qty) || qty <= 0) {
    return { ok: false, message: "출고수량(EA)을 입력하세요.", allocations: [] };
  }

  const sorted = [...(lotRows ?? [])].sort(compareOutboundLotFifoOrder);
  let remaining = qty;
  const allocations = [];

  for (const row of sorted) {
    if (remaining <= 0) break;
    const available = resolveOutboundLotAvailableQty(row);
    if (available <= 0) continue;
    const take = Math.min(available, remaining);
    allocations.push({
      managementId: row.id,
      lotNo: String(row.lotNo ?? "").trim(),
      shipQty: take,
      record: row,
    });
    remaining -= take;
  }

  if (remaining > 0) {
    return {
      ok: false,
      message: `출고수량(${qty} EA)이 출고가능(${qty - remaining} EA)보다 많습니다.`,
      allocations: [],
    };
  }

  return { ok: true, allocations };
}

export function getOutboundShippedQtyForLot(record) {
  const chargedLots = new Set(
    (record?.chargeHistory ?? [])
      .map((entry) => String(entry?.lotNo ?? "").trim().toUpperCase())
      .filter(Boolean)
  );
  const targetLot = String(record?.lotNo ?? "").trim().toUpperCase();
  const shippedForLot = getShipmentEvents(record?.id)
    .filter((event) => {
      const eventLot = String(event?.lotNo ?? "").trim().toUpperCase();
      return eventLot === targetLot || (!eventLot && chargedLots.size <= 1);
    })
    .reduce((sum, event) => sum + (Number(event?.shipQty) || 0), 0);
  return shippedForLot;
}

export function hasOutboundShipmentForLot(record) {
  if (record?.isOutboundProductAggregate) {
    return (record.outboundLotRows ?? []).some((row) => hasOutboundShipmentForLot(row));
  }
  const targetLot = String(record?.lotNo ?? "").trim().toUpperCase();
  const chargedLots = new Set(
    (record?.chargeHistory ?? [])
      .map((entry) => String(entry?.lotNo ?? "").trim().toUpperCase())
      .filter(Boolean)
  );
  return getShipmentEvents(record?.id).some((event) => {
    const eventLot = String(event?.lotNo ?? "").trim().toUpperCase();
    return eventLot === targetLot || (!eventLot && chargedLots.size <= 1);
  });
}

export function mapRecordToOutboundRegisterForm(record, prev = {}) {
  if (!record) {
    return {
      managementId: "",
      productKey: "",
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

  const available = resolveOutboundProductAvailableQty(record);

  return {
    ...prev,
    managementId: record.id,
    productKey: record.productKey || buildOutboundProductKey(record),
    lotNo: "",
    company: record.company ?? "",
    partName: record.partName ?? "",
    partNo: record.partNo ?? "",
    material: record.material ?? "",
    processName: getProductionProcessName(record),
    stockQty: String(available),
    shipQty: prev.shipQty ?? "",
    shipDate: prev.shipDate || getPrintOutputDate(),
    manager: prev.manager || resolveDefaultAssigneeFromAuth(),
    note: prev.note ?? "",
  };
}

export function validateOutboundRegisterForm(form) {
  const productKey = String(form.productKey ?? "").trim();
  const managementId = form.managementId?.trim();

  let product = productKey ? findOutboundProductByKey(productKey) : null;
  if (!product && managementId) {
    product =
      getOutboundEligibleRecords().find((item) => item.id === managementId) ??
      getOutboundEligibleRecords().find((item) =>
        (item.managementIds ?? [item.id]).includes(managementId)
      ) ??
      null;
  }

  if (!product) {
    return { ok: false, message: "출고 대상 제품을 선택하세요." };
  }

  const stock = resolveOutboundProductAvailableQty(product);
  const parsed = parseQtyWithUnit(form.shipQty, product.unit || "EA");
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
      message: `출고수량(${shipQty} EA)이 출고가능(${stock} EA)보다 많습니다.\n저장할 수 없습니다.`,
    };
  }

  const allocation = allocateOutboundShipQtyFifo(product.outboundLotRows ?? [], shipQty);
  if (!allocation.ok) {
    return { ok: false, message: allocation.message };
  }

  return { ok: true, record: product, product, shipQty, stock, allocations: allocation.allocations };
}

/**
 * @returns {{ ok: boolean, message?: string, managementId?: string, record?: object, shipQty?: number, stockAfter?: number, stockBefore?: number, allocations?: object[] }}
 */
export function applyOutboundRegister(form) {
  const validation = validateOutboundRegisterForm(form);
  if (!validation.ok) {
    return { ok: false, message: validation.message };
  }

  const { product, shipQty, stock, allocations } = validation;
  const stockBefore = stock;
  const shipDate = form.shipDate || getPrintOutputDate();
  const shippedBy = form.manager?.trim() || getCurrentTitanUser();
  const outboundTime = new Date().toISOString();
  const statementStatus = getStatementPrintStatus(product).label;

  /** @type {Map<string, number>} */
  const qtyByManagement = new Map();
  for (const allot of allocations) {
    qtyByManagement.set(
      allot.managementId,
      (qtyByManagement.get(allot.managementId) || 0) + allot.shipQty
    );
  }

  /** @type {object[]} */
  const processResults = [];
  for (const [managementId, qty] of qtyByManagement) {
    const result = processShipment(managementId, qty, {
      outboundRegistered: true,
      outboundDate: shipDate,
      outboundManager: shippedBy,
      outboundTime,
      note: form.note?.trim() || undefined,
    });
    if (!result.ok) {
      return { ok: false, message: result.message };
    }
    processResults.push({ managementId, result, qty });
  }

  const unitPrice = resolveRecordUnitPrice(product);
  const amounts = calculateAmounts(shipQty, unitPrice);
  let lastStockAfter = stockBefore - shipQty;

  for (const allot of allocations) {
    const processHit = processResults.find((item) => item.managementId === allot.managementId);
    const updated = processHit?.result?.record;
    lastStockAfter = processHit?.result?.stockAfter ?? lastStockAfter;

    saveShipmentEvent({
      shippedAt: shipDate,
      shippedBy,
      managementId: allot.managementId,
      lotNo: allot.lotNo,
      company: product.company,
      partName: product.partName,
      partNo: product.partNo,
      shipQty: allot.shipQty,
      unit: product.unit || "EA",
      unitPrice,
      stockAfter: processHit?.result?.stockAfter,
      productKey: product.productKey,
    });
  }

  for (const { managementId, result, qty } of processResults) {
    const sessionRecord = getSessionProductionRecords().find((item) => item.id === managementId);
    const partialShipEntry = {
      at: new Date().toISOString(),
      shipDate,
      shipQty: qty,
      shippedBy,
      statementStatus,
      balanceAfter: result.stockAfter,
      lotAllocations: allocations
        .filter((item) => item.managementId === managementId)
        .map((item) => ({ lotNo: item.lotNo, shipQty: item.shipQty })),
    };
    const partialShipHistory = [...(sessionRecord?.partialShipHistory ?? []), partialShipEntry];

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
  }

  const primaryManagementId = processResults[0]?.managementId || product.id;
  const primaryUpdated =
    getSessionProductionRecords().find((item) => item.id === primaryManagementId) ?? product;

  appendWorkJournalAutoEntry({
    actionType: WORK_JOURNAL_ACTION_TYPES.OUTBOUND_REGISTER,
    assignee: shippedBy,
    managementId: primaryManagementId,
    company: product.company,
    lotNo: allocations.map((item) => item.lotNo).filter(Boolean).join(", "),
    date: shipDate,
    title: `출고 완료 — ${product.company} ${product.partNo}`,
    note: form.note?.trim() || "",
  });

  const refreshedProduct =
    findOutboundProductByKey(product.productKey) ??
    getOutboundCompletedProductRows().find((item) => item.productKey === product.productKey) ??
    {
      ...primaryUpdated,
      productKey: product.productKey,
      isOutboundProductAggregate: true,
      outboundLotRows: product.outboundLotRows,
    };

  return {
    ok: true,
    message: "출고 등록이 완료되었습니다.",
    managementId: primaryManagementId,
    productKey: product.productKey,
    record: refreshedProduct,
    shipQty,
    stockBefore,
    stockAfter: Math.max(0, lastStockAfter),
    amounts,
    unitPrice,
    allocations,
  };
}

export function getLastOutboundShipQty(record) {
  if (!record) return 0;
  if (record.isOutboundProductAggregate) {
    const events = (record.managementIds ?? [record.id]).flatMap((id) => getShipmentEvents(id));
    if (events.length > 0) {
      const latestAt = String(events[0]?.shippedAt ?? "");
      const sameBatch = events.filter((event) => String(event?.shippedAt ?? "") === latestAt);
      const batchTotal = sameBatch.reduce((sum, event) => sum + (Number(event?.shipQty) || 0), 0);
      if (batchTotal > 0) return batchTotal;
      return Number(events[0].shipQty) || 0;
    }
    return resolveOutboundProductShippedQty(record) || resolveOutboundProductAvailableQty(record);
  }
  const events = getShipmentEvents(record.id).filter(
    (event) =>
      !record.lotNo ||
      String(event?.lotNo ?? "").trim().toUpperCase() === String(record.lotNo).trim().toUpperCase()
  );
  if (events.length > 0) return Number(events[0].shipQty) || 0;
  return resolveOutboundAvailableQty(record);
}

/**
 * 관리자 출고취소 — 마지막 출고 1건 되돌림 (거래명세서 이력 유지)
 */
export function cancelLastOutboundShipment(managementId, lotNo = "") {
  const id = managementId?.trim();
  if (!id) return { ok: false, message: "관리번호가 없습니다." };

  const record = getSessionProductionRecords().find((item) => item.id === id);
  if (!record) return { ok: false, message: "관리번호를 찾을 수 없습니다." };

  const lotKey = String(lotNo ?? "").trim().toUpperCase();
  const allEvents = getShipmentEvents(id);
  let events = allEvents.filter(
    (event) =>
      !lotKey || String(event?.lotNo ?? "").trim().toUpperCase() === lotKey
  );
  const chargedLots = new Set(
    (record.chargeHistory ?? [])
      .map((entry) => String(entry?.lotNo ?? "").trim().toUpperCase())
      .filter(Boolean)
  );
  if (events.length === 0 && lotKey && chargedLots.size <= 1) {
    events = allEvents.filter((event) => !String(event?.lotNo ?? "").trim());
  }
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
