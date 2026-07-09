/**
 * Project TITAN V1.0 — 리스트 · 검색 공통 기준
 */

export const TABLE_PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

export const DEFAULT_TABLE_PAGE_SIZE = 20;

export const SEARCH_ADVANCED_OPEN_LABEL = "▼ 상세검색";

export const SEARCH_ADVANCED_CLOSE_LABEL = "▲ 상세검색 닫기";

export const SEARCH_SUBMIT_LABEL = "조회";

export const SEARCH_RESET_LABEL = "초기화";

function padDatePart(value) {
  return String(value).padStart(2, "0");
}

export function formatTitanDateInputValue(date = new Date()) {
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function getTitanStandardDefaultDateRange(referenceDate = new Date()) {
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  return {
    from: formatTitanDateInputValue(start),
    to: formatTitanDateInputValue(referenceDate),
  };
}

export function getTitanQuickDateRange(rangeId, referenceDate = new Date()) {
  const today = new Date(referenceDate);
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  switch (rangeId) {
    case "today":
      return {
        from: formatTitanDateInputValue(today),
        to: formatTitanDateInputValue(today),
      };
    case "thisWeek": {
      const start = addDays(today, mondayOffset);
      const end = addDays(start, 6);
      return {
        from: formatTitanDateInputValue(start),
        to: formatTitanDateInputValue(end),
      };
    }
    case "thisMonth": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        from: formatTitanDateInputValue(start),
        to: formatTitanDateInputValue(end),
      };
    }
    case "lastMonth": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        from: formatTitanDateInputValue(start),
        to: formatTitanDateInputValue(end),
      };
    }
    case "recent3Months": {
      const start = addMonths(today, -3);
      return {
        from: formatTitanDateInputValue(start),
        to: formatTitanDateInputValue(today),
      };
    }
    case "all":
      return { from: "", to: "" };
    default:
      return getTitanStandardDefaultDateRange(today);
  }
}

export const TITAN_DATE_RANGE_QUICK_FILTERS = [
  { id: "today", label: "금일" },
  { id: "thisWeek", label: "이번 주" },
  { id: "thisMonth", label: "이번 달" },
  { id: "lastMonth", label: "지난 달" },
  { id: "recent3Months", label: "최근 3개월" },
  { id: "all", label: "전체" },
];

/** 기본 검색 4항목 (항상 표시) */
export const BASIC_SEARCH_KEYS = ["company", "partName", "partNo", "material"];

export const EMPTY_BASIC_SEARCH = {
  company: "",
  partName: "",
  partNo: "",
  material: "",
};

/** 제품/입출고/품질 공통 — 1행 기본 검색 (V1.3: 관리번호 · 업체 · 품명 · 품번 · LOT · 현재상태) */
export const STANDARD_PRODUCT_BASIC_SEARCH_FIELDS = [
  { key: "managementId", label: "관리번호", placeholder: "관리번호" },
  { key: "company", label: "업체명", placeholder: "업체명", allowEmpty: true, emptyLabel: "전체" },
  { key: "partName", label: "품명", placeholder: "품명" },
  { key: "partNo", label: "품번", placeholder: "품번" },
  { key: "lotNo", label: "LOT번호", placeholder: "LOT.NO" },
];

/** V1.3 상세검색 2·3행 — TitanStandardProductAdvancedSearch 참고 */
export const STANDARD_PRODUCT_ADVANCED_SEARCH_POLICY = {
  row2: ["incomingDateRange", "productionDateRange", "manager", "customerLotNo", "material", "process"],
  row3: ["qty", "note"],
  removedFields: ["purchaseOrderNo", "dueDateRange"],
};

/** 업무일지 — 1행 기본 검색 */
export const WORK_JOURNAL_BASIC_SEARCH_FIELDS = [
  { key: "company", label: "업체명", placeholder: "업체명", allowEmpty: true, emptyLabel: "전체" },
  { key: "managementId", label: "관리번호", placeholder: "관리번호" },
  { key: "lotNo", label: "LOT번호", placeholder: "LOT.NO" },
];

export function createEmptyInboundSearch() {
  const standardDateRange = getTitanStandardDefaultDateRange();
  return {
    ...EMPTY_BASIC_SEARCH,
    managementId: "",
    lotNo: "",
    purchaseOrderNo: "",
    customerLotNo: "",
    incomingDateFrom: standardDateRange.from,
    incomingDateTo: standardDateRange.to,
    productionDateFrom: "",
    productionDateTo: "",
    dueDateFrom: "",
    dueDateTo: "",
    process: "",
    qty: "",
    manager: "",
    status: "",
    note: "",
  };
}

/** @deprecated STANDARD_PRODUCT_BASIC_SEARCH_FIELDS 사용 */
export const INBOUND_BASIC_SEARCH_FIELDS = STANDARD_PRODUCT_BASIC_SEARCH_FIELDS;

export function createEmptyWorkJournalSearch() {
  const standardDateRange = getTitanStandardDefaultDateRange();
  return {
    company: "",
    category: "",
    title: "",
    managementId: "",
    lotNo: "",
    assignee: "",
    dateFrom: standardDateRange.from,
    dateTo: standardDateRange.to,
    source: "",
  };
}

export function createEmptyOutboundSearch() {
  const standardDateRange = getTitanStandardDefaultDateRange();
  return {
    ...EMPTY_BASIC_SEARCH,
    purchaseOrderNo: "",
    customerLotNo: "",
    shipDateFrom: "",
    shipDateTo: "",
    productionDateFrom: "",
    productionDateTo: "",
    incomingDateFrom: standardDateRange.from,
    incomingDateTo: standardDateRange.to,
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
  const standardDateRange = getTitanStandardDefaultDateRange();
  return {
    ...EMPTY_BASIC_SEARCH,
    managementId: "",
    lotNo: "",
    process: "",
    workDateFrom: standardDateRange.from,
    workDateTo: standardDateRange.to,
    productionDateFrom: "",
    productionDateTo: "",
    incomingDateFrom: "",
    incomingDateTo: "",
    equipment: "",
    worker: "",
    manager: "",
    qty: "",
    note: "",
    approvalStatus: "",
    status: "",
  };
}

export function createEmptyProductionDailyReportRegister() {
  return {
    lotNo: "",
    chargeProducts: [],
    heatTreatmentConditionRows: [{ temperature: "", duration: "" }],
    heatTreatmentProcessConditions: {},
    workDate: "",
    equipment: "",
    worker: "",
    note: "",
  };
}

export function createEmptyProductionResultsSearch() {
  const standardDateRange = getTitanStandardDefaultDateRange();
  return {
    ...EMPTY_BASIC_SEARCH,
    process: "",
    workDateFrom: standardDateRange.from,
    workDateTo: standardDateRange.to,
    equipment: "",
    worker: "",
    status: "",
  };
}

export function createEmptyDefectHistorySearch() {
  const standardDateRange = getTitanStandardDefaultDateRange();
  return {
    ...EMPTY_BASIC_SEARCH,
    managementId: "",
    lotNo: "",
    process: "",
    equipment: "",
    worker: "",
    defectType: "",
    handlingStatus: "",
    occurredDateFrom: standardDateRange.from,
    occurredDateTo: standardDateRange.to,
  };
}

export function createEmptyInspectionLogSearch() {
  const standardDateRange = getTitanStandardDefaultDateRange();
  return {
    ...EMPTY_BASIC_SEARCH,
    purchaseOrderNo: "",
    customerLotNo: "",
    managementId: "",
    lotNo: "",
    process: "",
    incomingDateFrom: "",
    incomingDateTo: "",
    productionDateFrom: "",
    productionDateTo: "",
    inspectionDateFrom: standardDateRange.from,
    inspectionDateTo: standardDateRange.to,
    assignee: "",
    manager: "",
    qty: "",
    note: "",
    status: "",
  };
}

/** 검사관리 3탭 공통 — 양산 · 개발 · 기타 */
export function createEmptyInspectionManagementSearch() {
  const standardDateRange = getTitanStandardDefaultDateRange();
  return {
    ...EMPTY_BASIC_SEARCH,
    managementId: "",
    lotNo: "",
    status: "",
    assignee: "",
    incomingDateFrom: "",
    incomingDateTo: "",
    productionDateFrom: "",
    productionDateTo: "",
    registeredDateFrom: standardDateRange.from,
    registeredDateTo: standardDateRange.to,
    process: "",
    customerLotNo: "",
    purchaseOrderNo: "",
    note: "",
    attachmentStatus: "",
    category: "",
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
  const standardDateRange = getTitanStandardDefaultDateRange();
  return {
    ...EMPTY_BASIC_SEARCH,
    purchaseOrderNo: "",
    customerLotNo: "",
    managementId: "",
    lotNo: "",
    process: "",
    incomingDateFrom: "",
    incomingDateTo: "",
    productionDateFrom: "",
    productionDateTo: "",
    registeredDateFrom: standardDateRange.from,
    registeredDateTo: standardDateRange.to,
    assignee: "",
    manager: "",
    qty: "",
    note: "",
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
    registeredBy: "",
    excelFile: null,
    pdfFile: null,
  };
}

export function createEmptyHomeSearch() {
  return {
    ...EMPTY_BASIC_SEARCH,
    purchaseOrderNo: "",
    customerLotNo: "",
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
  const standardDateRange = getTitanStandardDefaultDateRange();
  return {
    ...EMPTY_BASIC_SEARCH,
    title: "",
    assignee: "",
    status: "",
    priority: "",
    requestDateFrom: standardDateRange.from,
    requestDateTo: standardDateRange.to,
    dueDateFrom: "",
    dueDateTo: "",
  };
}

/** Document Management — 업체 중심 리스트 검색 */
export function createEmptyDocumentManagementSearch() {
  return {
    company: "",
    partName: "",
    partNo: "",
    material: "",
    manager: "",
    status: "",
  };
}

/** Document Management — 품질 공지 검색 */
export function createEmptyQualityNoticeSearch() {
  const standardDateRange = getTitanStandardDefaultDateRange();
  return {
    title: "",
    author: "",
    status: "",
    createdDateFrom: standardDateRange.from,
    createdDateTo: standardDateRange.to,
    effectiveDateFrom: "",
    effectiveDateTo: "",
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
  const customerLotQuery = (search.customerLotNo || search.purchaseOrderNo || "").trim();
  if (customerLotQuery) {
    const q = customerLotQuery.toLowerCase();
    const haystack = [record.customerLotNo, record.purchaseOrderNo].map((value) =>
      String(value ?? "").toLowerCase()
    );
    if (!haystack.some((value) => value.includes(q))) return false;
  }
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
