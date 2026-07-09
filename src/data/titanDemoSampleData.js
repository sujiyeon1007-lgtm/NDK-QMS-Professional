/**
 * Project TITAN V1.4 — Demo sample data (MES/QMS workflow)
 *
 * KPI 목표 분포 (활성 Workflow): 입고등록 1 · 열처리 대기 2 · 열처리 중 3
 * · 검사 대기 2 · 성적서 대기 6 · 출고 대기 5
 */

const COMPANY = "서암기계공업";
const HEAT_TREATMENT = "이온질화";
const REGISTRAR = "관리자";
const DEMO_USER = "품질관리부 / 정반이 사원";

/** @param {object} lot */
function buildLotFields(lot) {
  const lotNo = String(lot.lotNo ?? "").trim();
  const htlNo = String(lot.htlNo ?? "").trim();
  const workDate = String(lot.workDate ?? "").trim();
  const registered = Boolean(lot.registered && lotNo);
  const hasHtl = Boolean(htlNo);

  return {
    lotNo,
    workDate,
    equipment: lot.equipment ?? "",
    heatTreatment: HEAT_TREATMENT,
    heatTreatmentConditions: lot.heatTreatmentConditions ?? "",
    htlNo,
    htlPrintStatus: hasHtl ? "출력완료" : "미출력",
    htlPrintHistory: hasHtl
      ? [
          {
            at: `${workDate || lot.incomingDate || "2026-07-01"}T09:00:00.000Z`,
            docNo: htlNo,
            reprint: false,
          },
        ]
      : undefined,
    registered,
    qrGenerated: registered,
    workSheetGenerated: hasHtl || registered,
    workflowStatus: lot.workflowStatus ?? "",
    completionStatus: lot.completionStatus ?? "",
    certificateStatus: lot.certificateStatus ?? "미발행",
    shipmentStatus: lot.shipmentStatus ?? "출고대기",
    lotCreatedAt: lot.lotCreatedAt ?? (lotNo ? `${workDate || "2026-07-01"}T08:30:00.000Z` : ""),
    productionEndAt: lot.productionEndAt ?? "",
    registrar: REGISTRAR,
    outboundDate: lot.outboundDate ?? "",
    outboundManager: lot.outboundManager ?? REGISTRAR,
    hasTransactionStatement: Boolean(lot.hasTransactionStatement),
    partialShipHistory: lot.partialShipHistory,
  };
}

/** @param {object} lot @param {object[]} items */
function buildLotRecords(lot, items) {
  const lotFields = buildLotFields(lot);
  return items.map((item) => ({
    company: COMPANY,
    drawingNo: "",
    unit: "EA",
    incomingRegistered: true,
    urgent: false,
    note: "",
    shippedQty: item.shippedQty ?? 0,
    ...lotFields,
    ...item,
    stockQty: Math.max(0, Number(item.qty) - Number(item.shippedQty ?? 0)),
  }));
}

/** @type {object[]} */
export const TITAN_DEMO_PRODUCTION_RECORDS = [
  // ── 입고등록 (LOT 미생성) ──
  {
    id: "SE_20260703_0010",
    company: COMPANY,
    partName: "PINION",
    partNo: "PIN-260703",
    drawingNo: "",
    material: "SACM645",
    qty: 10,
    unit: "EA",
    incomingDate: "2026-07-03",
    incomingRegistered: true,
    shippedQty: 0,
    stockQty: 10,
    dueDate: "2026-07-12",
    purchaseOrderNo: "PO-20260703-010",
    customerLotNo: "SA-PN-010",
    heatTreatment: HEAT_TREATMENT,
    lotNo: "",
    equipment: "",
    workDate: "",
    completionStatus: "",
    workflowStatus: "",
    registered: false,
    qrGenerated: false,
    workSheetGenerated: false,
    htlPrintStatus: "미출력",
    certificateStatus: "미발행",
    shipmentStatus: "출고대기",
    urgent: false,
    note: "",
    registrar: REGISTRAR,
  },
  {
    id: "SE_20260709_SH01",
    company: COMPANY,
    partName: "SHOT SHAFT",
    partNo: "SH-260709",
    drawingNo: "",
    material: "SCM440",
    spec: "Ø35 x 180",
    qty: 40,
    unit: "EA",
    incomingDate: "2026-07-09",
    incomingRegistered: true,
    shippedQty: 0,
    stockQty: 40,
    dueDate: "2026-07-11",
    purchaseOrderNo: "PO-20260709-SH01",
    customerLotNo: "SA-SHOT-001",
    workType: "shot",
    shotStatus: "waiting",
    shotWorker: "",
    shotWorkDate: "",
    shotCompletedAt: "",
    shotAttachments: [],
    heatTreatment: "",
    lotNo: "",
    equipment: "",
    workDate: "",
    completionStatus: "",
    workflowStatus: "",
    registered: false,
    qrGenerated: false,
    workSheetGenerated: false,
    htlPrintStatus: "미출력",
    certificateStatus: "미발행",
    shipmentStatus: "출고대기",
    urgent: false,
    note: "쇼트 작업 대상",
    registrar: REGISTRAR,
  },
  {
    id: "SE_20260709_SH02",
    company: COMPANY,
    partName: "SHOT GEAR",
    partNo: "SHG-260709",
    drawingNo: "",
    material: "SNCM439",
    spec: "M2.0 x 48T",
    qty: 25,
    unit: "EA",
    incomingDate: "2026-07-09",
    incomingRegistered: true,
    shippedQty: 0,
    stockQty: 25,
    dueDate: "2026-07-11",
    purchaseOrderNo: "PO-20260709-SH02",
    customerLotNo: "SA-SHOT-002",
    workType: "shot",
    shotStatus: "complete",
    shotWorker: "관리자",
    shotWorkDate: "2026-07-09",
    shotCompletedAt: "2026-07-09",
    shotAttachments: [],
    heatTreatment: "",
    lotNo: "",
    equipment: "",
    workDate: "",
    completionStatus: "쇼트완료",
    workflowStatus: "쇼트완료",
    registered: false,
    qrGenerated: false,
    workSheetGenerated: false,
    htlPrintStatus: "미출력",
    certificateStatus: "미발행",
    shipmentStatus: "출고대기",
    urgent: false,
    note: "쇼트 완료 후 출고 대기",
    registrar: REGISTRAR,
  },

  // ── LOT 260701-3S1A · 생산중 (3제품 동일) ──
  ...buildLotRecords(
    {
      lotNo: "260701-3S1A",
      htlNo: "HTL-20260710-001",
      workDate: "2026-07-10",
      equipment: "3S-1",
      registered: true,
      workflowStatus: "생산중",
      heatTreatmentConditions: "580℃ 4시간 + 500℃ 2시간",
      lotCreatedAt: "2026-07-10T08:30:00.000Z",
    },
    [
      {
        id: "SE_20260703_0001",
        partName: "BULL GEAR",
        partNo: "H2E19655",
        material: "SNCM439",
        qty: 12,
        incomingDate: "2026-07-01",
        dueDate: "2026-07-10",
        purchaseOrderNo: "PO-20260701-001",
        customerLotNo: "SA-BG-001",
      },
      {
        id: "SE_20260703_0002",
        partName: "BULL GEAR",
        partNo: "CQ91BUL504",
        material: "SNCM439",
        qty: 24,
        incomingDate: "2026-07-01",
        dueDate: "2026-07-10",
        purchaseOrderNo: "PO-20260701-002",
        customerLotNo: "SA-BG-002",
      },
      {
        id: "SE_20260703_0003",
        partName: "SHAFT",
        partNo: "H2E-SHAFT-01",
        material: "SNCM439",
        qty: 6,
        incomingDate: "2026-07-10",
        dueDate: "2026-07-10",
        purchaseOrderNo: "PO-20260710-003",
        customerLotNo: "SA-SF-001",
      },
    ]
  ),

  // ── LOT 260702-3S1A · 생산대기 (HTL 출력 · LOT 미등록) ──
  ...buildLotRecords(
    {
      lotNo: "",
      htlNo: "HTL-20260702-001",
      workDate: "",
      equipment: "3S-1",
      registered: false,
      workflowStatus: "작업대기",
    },
    [
      {
        id: "SE_20260703_0004",
        partName: "BULL GEAR",
        partNo: "H2E17688",
        material: "SNCM439",
        qty: 18,
        incomingDate: "2026-07-02",
        dueDate: "2026-07-11",
        purchaseOrderNo: "PO-20260702-001",
        customerLotNo: "SA-BG-004",
      },
      {
        id: "SE_20260703_0005",
        partName: "BULL GEAR",
        partNo: "CV105510",
        material: "SNCM439",
        qty: 20,
        incomingDate: "2026-07-02",
        dueDate: "2026-07-11",
        purchaseOrderNo: "PO-20260702-002",
        customerLotNo: "SA-BG-005",
      },
    ]
  ),

  // ── LOT 260703-3S1A · 생산완료 / 검사대기 ──
  ...buildLotRecords(
    {
      lotNo: "260703-3S1A",
      htlNo: "HTL-20260703-001",
      workDate: "2026-07-03",
      equipment: "3S-1",
      registered: true,
      workflowStatus: "생산완료",
      completionStatus: "생산완료",
      productionEndAt: "2026-07-03T18:00:00.000Z",
      heatTreatmentConditions: "580℃ 4시간 + 500℃ 2시간",
    },
    [
      {
        id: "SE_20260703_0006",
        partName: "BULL GEAR",
        partNo: "H2E19655",
        material: "SNCM439",
        qty: 15,
        incomingDate: "2026-07-03",
        dueDate: "2026-07-12",
        purchaseOrderNo: "PO-20260703-001",
        customerLotNo: "SA-BG-006",
      },
      {
        id: "SE_20260703_0007",
        partName: "SHAFT",
        partNo: "H2E-SHAFT-02",
        material: "SNCM439",
        qty: 8,
        incomingDate: "2026-07-03",
        dueDate: "2026-07-12",
        purchaseOrderNo: "PO-20260703-002",
        customerLotNo: "SA-SF-002",
      },
    ]
  ),

  // ── LOT 260704-3S1A · 검사중 (검사일지 보류) ──
  ...buildLotRecords(
    {
      lotNo: "260704-3S1A",
      htlNo: "HTL-20260704-001",
      workDate: "2026-07-04",
      equipment: "3S-1",
      registered: true,
      workflowStatus: "생산완료",
      completionStatus: "생산완료",
      productionEndAt: "2026-07-04T17:30:00.000Z",
      heatTreatmentConditions: "580℃ 4시간 + 500℃ 2시간",
    },
    [
      {
        id: "SE_20260703_0008",
        partName: "BULL GEAR",
        partNo: "CQ91BUL504",
        material: "SNCM439",
        qty: 22,
        incomingDate: "2026-07-04",
        dueDate: "2026-07-13",
        purchaseOrderNo: "PO-20260704-001",
        customerLotNo: "SA-BG-008",
      },
      {
        id: "SE_20260703_0009",
        partName: "SHAFT",
        partNo: "H2E-SHAFT-01",
        material: "SNCM439",
        qty: 10,
        incomingDate: "2026-07-04",
        dueDate: "2026-07-13",
        purchaseOrderNo: "PO-20260704-002",
        customerLotNo: "SA-SF-008",
      },
    ]
  ),

  // ── LOT 260705-3S1A · 검사완료 ──
  ...buildLotRecords(
    {
      lotNo: "260705-3S1A",
      htlNo: "HTL-20260705-001",
      workDate: "2026-07-05",
      equipment: "3S-1",
      registered: true,
      workflowStatus: "검사완료",
      completionStatus: "생산완료",
      productionEndAt: "2026-07-05T18:10:00.000Z",
      heatTreatmentConditions: "580℃ 4시간 + 500℃ 2시간",
    },
    [
      {
        id: "SE_20260703_0011",
        partName: "BULL GEAR",
        partNo: "H2E19655",
        material: "SNCM439",
        qty: 16,
        incomingDate: "2026-07-05",
        dueDate: "2026-07-14",
        purchaseOrderNo: "PO-20260705-001",
        customerLotNo: "SA-BG-011",
      },
      {
        id: "SE_20260703_0012",
        partName: "BULL GEAR",
        partNo: "H2E17688",
        material: "SNCM439",
        qty: 14,
        incomingDate: "2026-07-05",
        dueDate: "2026-07-14",
        purchaseOrderNo: "PO-20260705-002",
        customerLotNo: "SA-BG-012",
      },
    ]
  ),

  // ── LOT 260706-3S1A · 성적서 대기 ──
  ...buildLotRecords(
    {
      lotNo: "260706-3S1A",
      htlNo: "HTL-20260706-001",
      workDate: "2026-07-06",
      equipment: "3S-1",
      registered: true,
      workflowStatus: "검사완료",
      completionStatus: "생산완료",
      productionEndAt: "2026-07-06T17:45:00.000Z",
      heatTreatmentConditions: "580℃ 4시간 + 500℃ 2시간",
      certificateStatus: "미발행",
    },
    [
      {
        id: "SE_20260703_0013",
        partName: "BULL GEAR",
        partNo: "CQ91BUL504",
        material: "SNCM439",
        qty: 20,
        incomingDate: "2026-07-06",
        dueDate: "2026-07-15",
        purchaseOrderNo: "PO-20260706-001",
        customerLotNo: "SA-BG-013",
      },
      {
        id: "SE_20260703_0014",
        partName: "SHAFT",
        partNo: "H2E-SHAFT-02",
        material: "SNCM439",
        qty: 9,
        incomingDate: "2026-07-06",
        dueDate: "2026-07-15",
        purchaseOrderNo: "PO-20260706-002",
        customerLotNo: "SA-SF-014",
      },
    ]
  ),

  // ── LOT 260707-3S1A · 성적서 발행완료 / 출고대기 ──
  ...buildLotRecords(
    {
      lotNo: "260707-3S1A",
      htlNo: "HTL-20260707-001",
      workDate: "2026-07-07",
      equipment: "3S-1",
      registered: true,
      workflowStatus: "성적서완료",
      completionStatus: "생산완료",
      productionEndAt: "2026-07-07T18:20:00.000Z",
      heatTreatmentConditions: "580℃ 4시간 + 500℃ 2시간",
      certificateStatus: "발행완료",
    },
    [
      {
        id: "SE_20260703_0015",
        partName: "BULL GEAR",
        partNo: "H2E19655",
        material: "SNCM439",
        qty: 18,
        incomingDate: "2026-07-07",
        dueDate: "2026-07-16",
        purchaseOrderNo: "PO-20260707-001",
        customerLotNo: "SA-BG-015",
      },
      {
        id: "SE_20260703_0016",
        partName: "BULL GEAR",
        partNo: "CV105510",
        material: "SNCM439",
        qty: 12,
        incomingDate: "2026-07-07",
        dueDate: "2026-07-16",
        purchaseOrderNo: "PO-20260707-002",
        customerLotNo: "SA-BG-016",
      },
      {
        id: "SE_20260703_0017",
        partName: "SHAFT",
        partNo: "H2E-SHAFT-01",
        material: "SNCM439",
        qty: 7,
        incomingDate: "2026-07-07",
        dueDate: "2026-07-16",
        purchaseOrderNo: "PO-20260707-003",
        customerLotNo: "SA-SF-017",
      },
    ]
  ),

  // ── LOT 260708-3S2A · 부분출고 ──
  ...buildLotRecords(
    {
      lotNo: "260708-3S2A",
      htlNo: "HTL-20260708-001",
      workDate: "2026-07-08",
      equipment: "3S-2",
      registered: true,
      workflowStatus: "성적서완료",
      completionStatus: "생산완료",
      productionEndAt: "2026-07-08T17:50:00.000Z",
      heatTreatmentConditions: "580℃ 4시간 + 500℃ 2시간",
      certificateStatus: "발행완료",
      partialShipHistory: [{ at: "2026-07-09T10:00:00.000Z", qty: 6 }],
    },
    [
      {
        id: "SE_20260703_0018",
        partName: "BULL GEAR",
        partNo: "H2E17688",
        material: "SNCM439",
        qty: 20,
        shippedQty: 6,
        incomingDate: "2026-07-08",
        dueDate: "2026-07-17",
        purchaseOrderNo: "PO-20260708-001",
        customerLotNo: "SA-BG-018",
      },
      {
        id: "SE_20260703_0019",
        partName: "SHAFT",
        partNo: "H2E-SHAFT-02",
        material: "SNCM439",
        qty: 10,
        shippedQty: 3,
        incomingDate: "2026-07-08",
        dueDate: "2026-07-17",
        purchaseOrderNo: "PO-20260708-002",
        customerLotNo: "SA-SF-019",
      },
    ]
  ),

  // ── LOT 260629-3S2A · 출고완료 ──
  ...buildLotRecords(
    {
      lotNo: "260629-3S2A",
      htlNo: "HTL-20260629-001",
      workDate: "2026-06-29",
      equipment: "3S-2",
      registered: true,
      workflowStatus: "출고완료",
      completionStatus: "생산완료",
      productionEndAt: "2026-06-29T18:00:00.000Z",
      heatTreatmentConditions: "580℃ 4시간 + 500℃ 2시간",
      certificateStatus: "발행완료",
      shipmentStatus: "출고완료",
      outboundDate: "2026-06-29",
      hasTransactionStatement: true,
    },
    [
      {
        id: "SE_20260703_0020",
        partName: "#2 PINION GEAR",
        partNo: "CWFYH11251",
        material: "SACM645",
        qty: 8,
        shippedQty: 8,
        incomingDate: "2026-06-28",
        dueDate: "2026-07-05",
        purchaseOrderNo: "PO-20260628-003",
        customerLotNo: "SA-PG-001",
      },
    ]
  ),
];

function inspectionSeedBase(record, overrides = {}) {
  return {
    category: "양산",
    company: record.company,
    partName: record.partName,
    partNo: record.partNo,
    drawingNo: record.drawingNo ?? "",
    material: record.material,
    lotNo: record.lotNo,
    purchaseOrderNo: record.purchaseOrderNo,
    customerLotNo: record.customerLotNo,
    qty: record.qty,
    unit: record.unit ?? "EA",
    assignee: DEMO_USER,
    inspectionItem: "표면경도",
    inspectionStandard: "550~700 HV",
    measuredValue: "",
    judgment: "보류",
    inspectionEquipment: "경도시험기",
    inspectionLocation: "품질검사실",
    note: "",
    process: HEAT_TREATMENT,
    appliedSpecification: null,
    hardnessMeasurements: [],
    dimensionMeasurements: [],
    appearanceMeasurements: [],
    hasMicrostructurePhoto: false,
    microstructureJudgment: "이상없음",
    deleted: false,
    ...overrides,
  };
}

/** @param {object} record @param {object} overrides */
export function buildDemoInspectionLogSeed(record, overrides = {}) {
  const idSuffix = record.id.slice(-4);
  return inspectionSeedBase(record, {
    id: `INS-DEMO-${idSuffix}`,
    managementId: record.id,
    inspectionDate: record.workDate || record.incomingDate,
    createdAt: `${record.workDate || record.incomingDate}T09:00:00.000Z`,
    updatedAt: `${record.workDate || record.incomingDate}T09:00:00.000Z`,
    ...overrides,
  });
}

/** 검사일지 시드 — LOT 단위 동일 진행 상태 */
export function getTitanDemoInspectionLogSeeds(records = TITAN_DEMO_PRODUCTION_RECORDS) {
  const byId = new Map(records.map((record) => [record.id, record]));
  const ids = [
    ["SE_20260703_0008", { judgment: "보류", measuredValue: "측정중" }],
    ["SE_20260703_0009", { judgment: "보류", measuredValue: "측정중" }],
    ["SE_20260703_0011", { judgment: "합격", measuredValue: "HV 612" }],
    ["SE_20260703_0012", { judgment: "합격", measuredValue: "HV 605" }],
    ["SE_20260703_0013", { judgment: "합격", measuredValue: "HV 618" }],
    ["SE_20260703_0014", { judgment: "합격", measuredValue: "HV 601" }],
    ["SE_20260703_0015", { judgment: "합격", measuredValue: "HV 620" }],
    ["SE_20260703_0016", { judgment: "합격", measuredValue: "HV 608" }],
    ["SE_20260703_0017", { judgment: "합격", measuredValue: "HV 615" }],
    ["SE_20260703_0018", { judgment: "합격", measuredValue: "HV 610" }],
    ["SE_20260703_0019", { judgment: "합격", measuredValue: "HV 607" }],
    ["SE_20260703_0020", { judgment: "합격", measuredValue: "HV 598" }],
  ];

  return ids
    .map(([managementId, patch]) => {
      const record = byId.get(managementId);
      if (!record) return null;
      return buildDemoInspectionLogSeed(record, patch);
    })
    .filter(Boolean);
}

/** 성적서 파일 시드 */
export function getTitanDemoCertificateSeeds(records = TITAN_DEMO_PRODUCTION_RECORDS) {
  const certIds = [
    "SE_20260703_0015",
    "SE_20260703_0016",
    "SE_20260703_0017",
    "SE_20260703_0018",
    "SE_20260703_0019",
    "SE_20260703_0020",
  ];

  return certIds
    .map((managementId) => {
      const record = records.find((item) => item.id === managementId);
      if (!record) return null;
      const date = record.workDate || record.incomingDate;
      return {
        id: `CERT-DEMO-${managementId.slice(-4)}`,
        managementId: record.id,
        company: record.company,
        partName: record.partName,
        partNo: record.partNo,
        material: record.material,
        lotNo: record.lotNo,
        purchaseOrderNo: record.purchaseOrderNo,
        customerLotNo: record.customerLotNo,
        qty: record.qty,
        unit: record.unit ?? "EA",
        process: HEAT_TREATMENT,
        excelFile: {
          name: `${record.partNo}_${record.lotNo}.xlsx`,
          size: 28672,
          type: "application/vnd.ms-excel",
          updatedAt: `${date}T10:00:00.000Z`,
        },
        pdfFile: {
          name: `${record.partNo}_${record.lotNo}.pdf`,
          size: 153600,
          type: "application/pdf",
          updatedAt: `${date}T10:05:00.000Z`,
        },
        registeredDate: date,
        registeredBy: DEMO_USER,
        deleted: false,
        createdAt: `${date}T10:00:00.000Z`,
        updatedAt: `${date}T10:05:00.000Z`,
      };
    })
    .filter(Boolean);
}

export function getTitanDemoTransactionStatements(records = TITAN_DEMO_PRODUCTION_RECORDS) {
  const shipped = records.filter((record) => Number(record.shippedQty) > 0);
  return shipped.map((record, index) => {
    const shipQty = Number(record.shippedQty) || 0;
    const unitPrice = record.partNo === "CWFYH11251" ? 64141 : 660000;
    const supplyAmount = shipQty * unitPrice;
    const vat = Math.round(supplyAmount * 0.1);
    return {
      id: `TS-DEMO-${String(index + 1).padStart(3, "0")}`,
      printedAt: record.outboundDate || record.workDate || record.incomingDate,
      printedBy: DEMO_USER,
      managementId: record.id,
      company: record.company,
      partName: record.partName,
      partNo: record.partNo,
      drawingNo: record.drawingNo ?? "",
      material: record.material ?? "",
      shipQty,
      unit: record.unit ?? "EA",
      unitPrice,
      supplyAmount,
      vat,
      totalAmount: supplyAmount + vat,
    };
  });
}

export function getTitanDemoShipmentEvents(records = TITAN_DEMO_PRODUCTION_RECORDS) {
  const shipped = records.filter((record) => Number(record.shippedQty) > 0);
  return shipped.map((record, index) => {
    const shipQty = Number(record.shippedQty) || 0;
    const unitPrice = record.partNo === "CWFYH11251" ? 64141 : 660000;
    return {
      id: `SH-DEMO-${String(index + 1).padStart(3, "0")}`,
      shippedAt: record.outboundDate || record.workDate || record.incomingDate,
      shippedBy: DEMO_USER,
      managementId: record.id,
      company: record.company,
      partName: record.partName,
      partNo: record.partNo,
      shipQty,
      unit: record.unit ?? "EA",
      unitPrice,
      stockAfter: Math.max(0, Number(record.qty) - shipQty),
    };
  });
}

/** QR Traceability — LOT 260701-3S1A 3제품 동시작업 예시 */
export const TITAN_DEMO_QR_TRACEABILITY_SEED = {
  SE_20260703_0001: {
    lotNo: "260701-3S1A",
    events: [
      { type: "incomingRegistered", at: "2026-07-10T09:15:00", worker: "김입고", source: "qr" },
      { type: "productionStart", at: "2026-07-10T13:42:00", worker: "홍길동", equipment: "3S-1", source: "qr" },
    ],
  },
  SE_20260703_0002: {
    lotNo: "260701-3S1A",
    events: [
      { type: "incomingRegistered", at: "2026-07-10T09:18:00", worker: "김입고", source: "qr" },
      { type: "productionStart", at: "2026-07-10T13:42:00", worker: "홍길동", equipment: "3S-1", source: "qr" },
    ],
  },
  SE_20260703_0003: {
    lotNo: "260701-3S1A",
    events: [
      { type: "incomingRegistered", at: "2026-07-10T09:20:00", worker: "김입고", source: "qr" },
      { type: "productionStart", at: "2026-07-10T13:42:00", worker: "홍길동", equipment: "3S-1", source: "qr" },
    ],
  },
};

/** QA Demo Seed V1.0-P0 — 배포 전 Workflow 검증 (운영 데이터와 분리) */
export const TITAN_QA_DEMO_COMPANIES = [
  { id: "qa-c1", code: "SE", name: "서암기계공업", active: true, contacts: [], ndkAssignees: [] },
  { id: "qa-c2", code: "TS", name: "태성정공", active: true, contacts: [], ndkAssignees: [] },
  { id: "qa-c3", code: "HJ", name: "한진산업", active: true, contacts: [], ndkAssignees: [] },
  { id: "qa-c4", code: "DY", name: "동양정밀", active: true, contacts: [], ndkAssignees: [] },
  { id: "qa-c5", code: "KS", name: "KSM", active: true, contacts: [], ndkAssignees: [] },
  { id: "qa-c6", code: "SH", name: "신한울 프로젝트", active: true, contacts: [], ndkAssignees: [] },
];

export const TITAN_QA_DEMO_PRODUCTS = [
  { id: "qa-p1", company: "서암기계공업", partName: "SHAFT", partNo: "SFT-001", material: "SCM440", drawingNo: "", active: true },
  { id: "qa-p2", company: "태성정공", partName: "GEAR", partNo: "GR-002", material: "SNCM439", drawingNo: "", active: true },
  { id: "qa-p3", company: "한진산업", partName: "VALVE STEM", partNo: "VS-003", material: "SACM645", drawingNo: "", active: true },
  { id: "qa-p4", company: "동양정밀", partName: "PIN", partNo: "PN-004", material: "SNACM220", drawingNo: "", active: true },
  { id: "qa-p5", company: "KSM", partName: "BUSH", partNo: "BS-005", material: "F22 Cl.3", drawingNo: "", active: true },
  { id: "qa-p6", company: "신한울 프로젝트", partName: "FLANGE", partNo: "FL-006", material: "42CrMo4", drawingNo: "", active: true },
];

export const TITAN_QA_DEMO_PRODUCTION_RECORDS = [
  { id: "SE_20260709_001", company: "서암기계공업", partName: "SHAFT", partNo: "SFT-001", material: "SCM440", qty: 50, incomingDate: "2026-07-09", incomingRegistered: true, shippedQty: 0, workflowStatus: "", registered: false, lotNo: "", heatTreatment: HEAT_TREATMENT },
  { id: "TS_20260709_002", company: "태성정공", partName: "GEAR", partNo: "GR-002", material: "SNCM439", qty: 80, incomingDate: "2026-07-08", incomingRegistered: true, shippedQty: 0, htlNo: "HTL-20260708-001", workflowStatus: "작업대기", completionStatus: "작업대기", registered: false, lotNo: "", heatTreatment: HEAT_TREATMENT, htlPrintStatus: "출력완료" },
  { id: "HJ_20260709_003", company: "한진산업", partName: "VALVE STEM", partNo: "VS-003", material: "SACM645", qty: 40, incomingDate: "2026-07-07", incomingRegistered: true, shippedQty: 0, htlNo: "HTL-20260707-002", lotNo: "LOT-20260707-A", workDate: "2026-07-09", equipment: "3S-1", workflowStatus: "생산중", registered: true, heatTreatment: HEAT_TREATMENT, htlPrintStatus: "출력완료" },
  { id: "DY_20260709_004", company: "동양정밀", partName: "PIN", partNo: "PN-004", material: "SNACM220", qty: 120, incomingDate: "2026-07-06", incomingRegistered: true, shippedQty: 0, htlNo: "HTL-20260706-001", lotNo: "LOT-20260706-B", workDate: "2026-07-08", equipment: "10S-01", workflowStatus: "생산완료", completionStatus: "생산완료", registered: true, certificateStatus: "미발행", shipmentStatus: "출고대기", heatTreatment: HEAT_TREATMENT, htlPrintStatus: "출력완료" },
  { id: "KS_20260709_005", company: "KSM", partName: "BUSH", partNo: "BS-005", material: "F22 Cl.3", qty: 60, incomingDate: "2026-07-05", incomingRegistered: true, shippedQty: 0, htlNo: "HTL-20260705-003", lotNo: "LOT-20260705-C", workDate: "2026-07-07", equipment: "3S-2", workflowStatus: "생산완료", completionStatus: "생산완료", registered: true, shipmentStatus: "출고대기", heatTreatment: HEAT_TREATMENT, htlPrintStatus: "출력완료" },
  { id: "SH_20260709_006", company: "신한울 프로젝트", partName: "FLANGE", partNo: "FL-006", material: "42CrMo4", qty: 100, shippedQty: 35, incomingDate: "2026-07-04", incomingRegistered: true, htlNo: "HTL-20260704-001", lotNo: "LOT-20260704-D", workDate: "2026-07-06", equipment: "61", workflowStatus: "생산완료", completionStatus: "생산완료", registered: true, shipmentStatus: "부분출고", heatTreatment: HEAT_TREATMENT, htlPrintStatus: "출력완료", stockQty: 65 },
  { id: "SE_20260709_007", company: "서암기계공업", partName: "SHAFT", partNo: "SFT-002", material: "SCM440", qty: 30, shippedQty: 30, incomingDate: "2026-07-02", incomingRegistered: true, htlNo: "HTL-20260702-001", lotNo: "LOT-20260702-E", workDate: "2026-07-04", equipment: "3S-1", workflowStatus: "출고완료", completionStatus: "생산완료", registered: true, shipmentStatus: "출고완료", outboundDate: "2026-07-09", heatTreatment: HEAT_TREATMENT, htlPrintStatus: "출력완료", stockQty: 0 },
  { id: "TS_20260709_008", company: "태성정공", partName: "GEAR", partNo: "GR-003", material: "SNCM439", qty: 25, incomingDate: "2026-07-09", incomingRegistered: true, shippedQty: 0, workflowStatus: "", registered: false, lotNo: "", heatTreatment: HEAT_TREATMENT },
  { id: "HJ_20260709_009", company: "한진산업", partName: "VALVE STEM", partNo: "VS-004", material: "SACM645", qty: 20, incomingDate: "2026-07-03", incomingRegistered: true, shippedQty: 0, htlNo: "HTL-20260703-002", lotNo: "LOT-20260703-F", workDate: "2026-07-05", equipment: "10S-01", workflowStatus: "생산완료", completionStatus: "생산완료", registered: true, shipmentStatus: "출고대기", heatTreatment: HEAT_TREATMENT, htlPrintStatus: "출력완료" },
  { id: "HJ_20260709_010", company: "한진산업", partName: "VALVE STEM", partNo: "VS-005", material: "SACM645", qty: 15, incomingDate: "2026-07-03", incomingRegistered: true, shippedQty: 0, htlNo: "HTL-20260703-002", lotNo: "LOT-20260703-F", workDate: "2026-07-05", equipment: "10S-01", workflowStatus: "생산완료", completionStatus: "생산완료", registered: true, shipmentStatus: "출고대기", heatTreatment: HEAT_TREATMENT, htlPrintStatus: "출력완료" },
].map((row) => ({ unit: "EA", drawingNo: "", registrar: REGISTRAR, ...row }));

export const TITAN_QA_DEMO_SHIPMENT_EVENTS = [
  { id: "QA-SH-001", managementId: "SH_20260709_006", lotNo: "LOT-20260704-D", company: "신한울 프로젝트", partName: "FLANGE", partNo: "FL-006", shipQty: 35, shippedAt: "2026-07-09T10:00:00.000Z", shippedBy: REGISTRAR, note: "QA partial" },
  { id: "QA-SH-002", managementId: "SE_20260709_007", lotNo: "LOT-20260702-E", company: "서암기계공업", partName: "SHAFT", partNo: "SFT-002", shipQty: 30, shippedAt: "2026-07-09T11:00:00.000Z", shippedBy: REGISTRAR, note: "QA shipped" },
];

export function buildQaDemoMasterSeed(baseOperationalSeed) {
  return {
    ...baseOperationalSeed,
    companies: TITAN_QA_DEMO_COMPANIES.map((row) => ({ ...row })),
    products: TITAN_QA_DEMO_PRODUCTS.map((row) => ({ ...row })),
    materials: [
      { id: "qa-m1", code: "SCM440", name: "SCM440", spec: "", note: "", active: true },
      { id: "qa-m2", code: "SNCM439", name: "SNCM439", spec: "", note: "", active: true },
      { id: "qa-m3", code: "SACM645", name: "SACM645", spec: "", note: "", active: true },
      { id: "qa-m4", code: "SNACM220", name: "SNACM220", spec: "", note: "", active: true },
      { id: "qa-m5", code: "F22-CL3", name: "F22 Cl.3", spec: "", note: "", active: true },
      { id: "qa-m6", code: "42CrMo4", name: "42CrMo4", spec: "", note: "", active: true },
    ],
  };
}
