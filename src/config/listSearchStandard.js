/**
 * Project TITAN V1.0 — 리스트 · 검색 공통 기준
 */

export const TABLE_PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

export const DEFAULT_TABLE_PAGE_SIZE = 20;

export const SEARCH_ADVANCED_OPEN_LABEL = "▼ 상세검색";

export const SEARCH_ADVANCED_CLOSE_LABEL = "▲ 상세검색 닫기";

export const SEARCH_SUBMIT_LABEL = "조회";

export const SEARCH_RESET_LABEL = "초기화";

/** 기본 검색 4항목 (항상 표시) */
export const BASIC_SEARCH_KEYS = ["company", "partName", "partNo", "material"];

export const EMPTY_BASIC_SEARCH = {
  company: "",
  partName: "",
  partNo: "",
  material: "",
};

export function createEmptyInboundSearch() {
  return {
    ...EMPTY_BASIC_SEARCH,
    incomingDateFrom: "",
    incomingDateTo: "",
    managementId: "",
    lotNo: "",
    process: "",
    qty: "",
    manager: "",
    status: "",
    note: "",
  };
}

export function createEmptyOutboundSearch() {
  return {
    ...EMPTY_BASIC_SEARCH,
    shipDateFrom: "",
    shipDateTo: "",
    managementId: "",
    lotNo: "",
    process: "",
    qty: "",
    manager: "",
    status: "",
    note: "",
  };
}

export function createEmptyProductionDailyReportSearch() {
  return {
    ...EMPTY_BASIC_SEARCH,
    managementId: "",
    lotNo: "",
    process: "",
    workDateFrom: "",
    workDateTo: "",
    equipment: "",
    worker: "",
    approvalStatus: "",
  };
}

export function createEmptyProductionDailyReportRegister() {
  return {
    lotNo: "",
    chargeProducts: [],
    heatTreatmentConditionRows: [{ temperature: "", duration: "" }],
    workDate: "",
    equipment: "",
    worker: "",
    note: "",
  };
}

export function createEmptyProductionResultsSearch() {
  return {
    ...EMPTY_BASIC_SEARCH,
    process: "",
    workDateFrom: "",
    workDateTo: "",
    equipment: "",
    worker: "",
    status: "",
  };
}

export function createEmptyDefectHistorySearch() {
  return {
    ...EMPTY_BASIC_SEARCH,
    managementId: "",
    lotNo: "",
    process: "",
    equipment: "",
    worker: "",
    defectType: "",
    handlingStatus: "",
    occurredDateFrom: "",
    occurredDateTo: "",
  };
}

export function createEmptyInspectionLogSearch() {
  return {
    ...EMPTY_BASIC_SEARCH,
    managementId: "",
    lotNo: "",
    process: "",
    inspectionDateFrom: "",
    inspectionDateTo: "",
    assignee: "",
    status: "",
  };
}

export function createEmptyInspectionLogRegister() {
  return {
    managementId: "",
    lotNo: "",
    company: "",
    partName: "",
    partNo: "",
    drawingNo: "",
    material: "",
    process: "",
    qty: "",
    unit: "EA",
    inspectionDate: "",
    assignee: "",
    inspectionItems: [],
    judgment: "합격",
    note: "",
    appliedSpecification: null,
    hardnessMeasurements: [],
    dimensionMeasurements: [],
    appearanceMeasurements: [],
    hasMicrostructurePhoto: false,
    microstructureJudgment: "이상없음",
    hardeningDepthHv: [],
  };
}

export function createEmptyCertificateSearch() {
  return {
    ...EMPTY_BASIC_SEARCH,
    managementId: "",
    lotNo: "",
    process: "",
    registeredDateFrom: "",
    registeredDateTo: "",
    assignee: "",
    status: "",
  };
}

export function createEmptyCertificateRegister() {
  return {
    managementId: "",
    lotNo: "",
    company: "",
    partName: "",
    partNo: "",
    material: "",
    process: "",
    qty: "",
    unit: "EA",
    excelFile: null,
    pdfFile: null,
  };
}

export function createEmptyHomeSearch() {
  return {
    ...EMPTY_BASIC_SEARCH,
    drawingNo: "",
    managementId: "",
    lotNo: "",
    process: "",
    status: "",
    manager: "",
    dueDateFrom: "",
    dueDateTo: "",
  };
}

export function createEmptyDepartmentWorkSearch() {
  return {
    ...EMPTY_BASIC_SEARCH,
    title: "",
    assignee: "",
    status: "",
    priority: "",
    requestDateFrom: "",
    requestDateTo: "",
    dueDateFrom: "",
    dueDateTo: "",
  };
}

export function matchesExtendedSearch(search, record) {
  if (!matchesBasicSearch(search, record)) return false;

  const includes = (value, query) =>
    !query?.trim() ||
    String(value ?? "")
      .toLowerCase()
      .includes(query.trim().toLowerCase());

  if (!includes(record.drawingNo, search.drawingNo)) return false;
  if (!includes(record.managementId ?? record.id, search.managementId)) return false;
  if (!includes(record.lotNo, search.lotNo)) return false;
  if (
    search.process &&
    !includes(record.process ?? record.heatTreatment ?? record.processName, search.process)
  ) {
    return false;
  }
  if (search.status) {
    const statusText = String(record.statusLabel ?? record.status ?? record.currentProcess ?? "").trim();
    const q = search.status.trim().toLowerCase();
    if (statusText && !statusText.toLowerCase().includes(q)) return false;
    if (!statusText) return false;
  }
  if (
    search.manager &&
    !includes(record.managerLabel ?? record.manager ?? record.registrar, search.manager)
  ) {
    return false;
  }
  const dueDate = record.dueDate ?? record.dueDateLabel ?? "";
  if (search.dueDateFrom && dueDate && dueDate !== "—" && dueDate < search.dueDateFrom) return false;
  if (search.dueDateTo && dueDate && dueDate !== "—" && dueDate > search.dueDateTo) return false;
  return true;
}

/** @param {Record<string, string>} search @param {object} record */
export function matchesBasicSearch(search, record) {
  if (
    search.company &&
    !String(record.company ?? "")
      .toLowerCase()
      .includes(search.company.toLowerCase())
  ) {
    return false;
  }
  if (
    search.partName &&
    !String(record.partName ?? "")
      .toLowerCase()
      .includes(search.partName.toLowerCase())
  ) {
    return false;
  }
  if (
    search.partNo &&
    !String(record.partNo ?? "")
      .toLowerCase()
      .includes(search.partNo.toLowerCase())
  ) {
    return false;
  }
  if (
    search.material &&
    !String(record.material ?? "")
      .toLowerCase()
      .includes(search.material.toLowerCase())
  ) {
    return false;
  }
  return true;
}
