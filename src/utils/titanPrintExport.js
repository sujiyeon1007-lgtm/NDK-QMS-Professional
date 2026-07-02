import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { buildHtlPrintLayout, HTL_PRINT_TITLE } from "./htlWorkListPrintLayout";
import { buildOutboundPrintLayout, OUTBOUND_PRINT_TITLE } from "./outboundListPrintLayout";
import { formatQtyWithUnit } from "./productUnits";
import { migrateHardeningDepthRows } from "./hardeningDepthModel";
import { getReportDepthOutputRows } from "./heatTreatmentCalculationEngine";
import { getInspectionScope } from "./inspectionScope";
import {
  findPrintDocument,
  getDocumentOrientation,
  getPrintPages,
  mountPrintEngine,
  printViaEngine,
  TITAN_PAGE_MM,
  TITAN_PRINT_MARGIN_MM,
  unmountPrintEngine,
} from "./titanPrintEngine";

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** @deprecated iframe 출력 엔진 사용 — 하위 호환 */
export function enterPrintMode() {
  document.body.classList.add("titan-print-mode");
}

/** @deprecated iframe 출력 엔진 사용 — 하위 호환 */
export function exitPrintMode() {
  document.body.classList.remove("titan-print-mode");
}

/** 공통 인쇄 — 출력 전용 iframe만 인쇄 */
export async function printTitanDocument(root) {
  const documentEl = findPrintDocument(root);
  if (!documentEl) return;
  await printViaEngine(documentEl);
}

/** Preview/출력 DOM과 동일 레이아웃으로 PDF 생성 (A4 · 10mm 여백) */
export async function exportTitanPdf(root, filename = "document.pdf") {
  const sourceEl = findPrintDocument(root);
  if (!sourceEl) return;

  const { iframe, document: documentEl, window: printWindow } = await mountPrintEngine(sourceEl);

  try {
    const orientation = getDocumentOrientation(documentEl);
    const pageMm = TITAN_PAGE_MM[orientation];
    const margin = TITAN_PRINT_MARGIN_MM;
    const contentWidth = pageMm.width - margin * 2;
    const contentHeight = pageMm.height - margin * 2;
    const pages = getPrintPages(documentEl);

    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format: "a4",
    });

    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index];
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: page.scrollWidth,
        height: page.scrollHeight,
        windowWidth: page.scrollWidth,
        windowHeight: page.scrollHeight,
        window: printWindow,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgHeightMm = (canvas.height / canvas.width) * contentWidth;
      const drawHeight = Math.min(imgHeightMm, contentHeight);
      const offsetY = margin + Math.max(0, (contentHeight - drawHeight) / 2);

      if (index > 0) {
        pdf.addPage(undefined, orientation);
      }

      pdf.addImage(imgData, "PNG", margin, offsetY, contentWidth, drawHeight);
    }

    pdf.save(filename);
  } finally {
    unmountPrintEngine(iframe);
  }
}

/** 열처리 작업 리스트 — Preview와 동일 데이터·컬럼 폭으로 .xlsx 생성 */
export async function exportHtlWorkListXlsx({
  rows,
  listNo = "",
  incomingDate = "",
  printDate = "",
  workDate = "",
  workMemo = "",
  printDateTime = "",
  printUser = "",
  filename = "document.xlsx",
}) {
  const XLSX = await import("xlsx");
  const { columns, columnWidths } = buildHtlPrintLayout(rows, workDate, { workMemo });
  const sheetRows = [
    [HTL_PRINT_TITLE],
    [`문서번호 ${listNo}`, incomingDate ? `입고일 ${incomingDate}` : "", printDate ? `출력일 ${printDate}` : ""],
    [],
    columns.map((column) => column.header),
    ...rows.map((row) => columns.map((column) => column.getValue(row))),
  ];

  const trimmedMemo = workMemo.trim();
  if (trimmedMemo) {
    sheetRows.push([], ["전달사항"], [trimmedMemo]);
  }

  sheetRows.push(
    [],
    [printDateTime ? `출력일시 ${printDateTime}` : "", printUser ? `출력 사용자 ${printUser}` : ""]
  );

  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
  worksheet["!cols"] = columnWidths.map((column) => ({
    wch: Math.max(column.handwriting ? 24 : 8, Math.round(column.widthPercent * 0.55)),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "작업리스트");
  XLSX.writeFile(workbook, filename);
}

/** 검사일지 — 단건 또는 리스트 Excel 출력 */
export async function exportInspectionLogXlsx({
  log,
  logs,
  printDateTime = "",
  printUser = "",
  filename = "검사일지.xlsx",
}) {
  const XLSX = await import("xlsx");

  if (Array.isArray(logs) && logs.length > 0) {
    const headers = [
      "검사일자",
      "구분",
      "관리번호",
      "업체명",
      "품명",
      "품번",
      "도번",
      "재질",
      "LOT",
      "수량",
      "담당자",
      "검사항목",
      "검사기준",
      "측정값",
      "판정",
      "검사장비",
      "검사위치",
      "비고",
    ];
    const sheetRows = [
      ["검사일지 리스트"],
      [],
      headers,
      ...logs.map((row) => [
        row.inspectionDate,
        row.category,
        row.managementId,
        row.company,
        row.partName,
        row.partNo,
        row.drawingNo || "",
        row.material,
        row.lotNo || "",
        formatQtyWithUnit(row.qty, row.unit),
        row.assignee,
        row.inspectionItem || "",
        row.inspectionStandard || "",
        row.measuredValue || "",
        row.judgment || "",
        row.inspectionEquipment || "",
        row.inspectionLocation || "",
        row.note || "",
      ]),
      [],
      [printDateTime ? `출력일시 ${printDateTime}` : "", printUser ? `출력 사용자 ${printUser}` : ""],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "검사일지");
    XLSX.writeFile(workbook, filename);
    return;
  }

  if (!log) return;

  const sheetRows = [
    ["검사일지"],
    [`검사일자 ${log.inspectionDate}`, `구분 ${log.category}`, `관리번호 ${log.managementId}`],
    [],
    ["기본정보"],
    ["업체명", log.company],
    ["품명", log.partName, "품번", log.partNo],
    ["도번", log.drawingNo || "", "재질", log.material],
    ["LOT", log.lotNo || "", "수량", formatQtyWithUnit(log.qty, log.unit)],
    ["담당자", log.assignee],
    [],
    ["검사정보"],
    ["검사 항목", log.inspectionItem || ""],
    ["검사 기준", log.inspectionStandard || ""],
    ["측정값", log.measuredValue || "", "판정", log.judgment || ""],
    ["검사 장비", log.inspectionEquipment || "", "검사 위치", log.inspectionLocation || ""],
    ["비고", log.note || ""],
    [],
    [printDateTime ? `출력일시 ${printDateTime}` : "", printUser ? `출력 사용자 ${printUser}` : ""],
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "검사일지");
  XLSX.writeFile(workbook, filename);
}

/** 출고 리스트 — Preview와 동일 데이터·컬럼 폭으로 .xlsx 생성 */
export async function exportOutboundListXlsx({
  rows,
  listNo = "",
  printDate = "",
  workDate = "",
  workMemo = "",
  printDateTime = "",
  printUser = "",
  filename = "document.xlsx",
}) {
  const XLSX = await import("xlsx");
  const shipDate = workDate || printDate;
  const { columns, columnWidths } = buildOutboundPrintLayout(rows, shipDate);
  const sheetRows = [
    [OUTBOUND_PRINT_TITLE],
    [`리스트 No. ${listNo}`, printDate ? `출력 기준일 ${printDate}` : ""],
    [],
    columns.map((column) => column.header),
    ...rows.map((row) => columns.map((column) => column.getValue(row))),
  ];

  const trimmedMemo = workMemo.trim();
  if (trimmedMemo) {
    sheetRows.push([], ["전달사항"], [trimmedMemo]);
  }

  sheetRows.push(
    [],
    [printDateTime ? `출력일시 ${printDateTime}` : "", printUser ? `출력 사용자 ${printUser}` : ""]
  );

  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
  worksheet["!cols"] = columnWidths.map((column) => ({
    wch: Math.max(column.handwriting ? 24 : 8, Math.round(column.widthPercent * 0.55)),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "출고리스트");
  XLSX.writeFile(workbook, filename);
}

/** 검사 리포트 — Final Design v1.0 Excel 출력 */
export async function exportInspectionReportXlsx({
  report,
  printDateTime = "",
  printUser = "",
  filename = "검사리포트.xlsx",
}) {
  if (!report) return;

  const XLSX = await import("xlsx");
  const scope = getInspectionScope(report.appliedSpecification);

  const sheetRows = [
    ["검사 리포트", report.reportNo || ""],
    [],
    ["① 기본정보"],
    ["업체명", report.company, "품명", report.partName, "품번", report.partNo],
    ["도번", report.drawingNo, "LOT", report.lotNo, "관리번호", report.managementId],
    ["재질", report.material, "열처리 공정", report.process, "수량", `${report.qty} ${report.unit}`],
    ["검사일", report.inspectionDate, "검사자", report.inspector, "승인자", report.approver],
    [],
    ["② 검사 기준 (Specification)"],
    ["항목", "기준", "단위", "비고"],
    ...report.specifications.map((row) => [row.item, row.spec, row.unit, row.note]),
    [],
    ["③ 검사 결과 (Result Summary)"],
    ["구분", "결과", "비고"],
    ...report.resultSummary.map((row) => [row.category, row.result, row.note]),
  ];

  if (scope.hardeningDepth) {
    const depthOutputRows = getReportDepthOutputRows(
      report.heatTreatmentCalculations,
      report.appliedSpecification
    );

    sheetRows.push(
      [],
      ["④ 경화깊이 데이터 (HV)"],
      ["깊이(mm)", "Hv"],
      ...migrateHardeningDepthRows(report).map((row) => [
        row.isCore ? "CORE" : row.depth,
        row.hv === "" ? "" : row.hv,
      ]),
      [],
      ["⑤ 열처리 계산 (자동 · 최종)"]
    );

    if (depthOutputRows.length > 0) {
      sheetRows.push(
        ["항목", "자동 계산(mm)", "최종 적용(mm)"],
        ...depthOutputRows.map((row) => {
          const calc = report.heatTreatmentCalculations?.[row.key];
          return [row.label, calc?.auto ?? "", calc?.final ?? ""];
        })
      );
    } else {
      sheetRows.push(
        ["유효경화깊이(mm)", report.effectiveDepthMm ?? ""],
        ["390Hv 기준 경화깊이(mm)", report.hardeningDepth390 ?? ""]
      );
    }
  }

  if (scope.appearance) {
    sheetRows.push(
      [],
      ["⑥ 외관검사"],
      ["항목", "기준", "결과", "판정"],
      ...report.appearanceRows.map((row) => [row.item, row.standard || "—", row.result, row.judgment]),
      ["외관검사 종합 판정", report.appearanceSummary]
    );
  }

  if (scope.hardness) {
    sheetRows.push(
      [],
      ["⑦ 경도검사 (측정값)"],
      ["항목", "스펙", "측정값", "단위", "판정"],
      ...report.hardnessRows.map((row) => [row.item, row.spec, row.measured, row.unit || "—", row.judgment]),
      ["경도검사 종합 판정", report.hardnessSummary]
    );
  }

  if (scope.dimension) {
    sheetRows.push(
      [],
      ["⑧ 치수검사"],
      ["항목", "스펙", "측정값", "단위", "판정"],
      ...report.dimensionRows.map((row) => [row.item, row.spec, row.measured, row.unit || "mm", row.judgment]),
      ["치수검사 종합 판정", report.dimensionSummary]
    );
  }

  if (scope.microstructure && report.hasMicrostructurePhoto) {
    sheetRows.push(
      [],
      ["⑨ 조직검사"],
      ["조직사진", "있음"],
      ["조직판정", report.microstructureJudgment],
      ["조직검사 판정", report.microstructureSummary]
    );
  }

  if (scope.other) {
    sheetRows.push(
      [],
      ["⑩ 기타검사"],
      ["항목", "결과", "비고"],
      ...report.otherRows.map((row) => [row.item, row.result, row.note])
    );
  }

  sheetRows.push(
    [],
    ["⑪ 비고", report.remarks],
    [],
    ["⑫ 최종판정", report.finalJudgment],
    [],
    [printDateTime ? `출력일시 ${printDateTime}` : "", printUser ? `출력 사용자 ${printUser}` : ""]
  );

  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "검사리포트");
  XLSX.writeFile(workbook, filename);
}

/** @deprecated HTML .xls — HTL은 exportHtlWorkListXlsx 사용 */
export function exportTitanExcel(root, filename = "document.xls") {
  const documentEl = findPrintDocument(root);
  if (!documentEl) return;

  const styles = [...document.styleSheets]
    .flatMap((sheet) => {
      try {
        return [...sheet.cssRules].map((rule) => rule.cssText);
      } catch {
        return [];
      }
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel">
<head>
<meta charset="utf-8" />
<style>${styles}</style>
</head>
<body>${documentEl.outerHTML}</body>
</html>`;

  const blob = new Blob(["\ufeff", html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  downloadBlob(blob, filename);
}

export {
  findPrintDocument,
  getDocumentOrientation,
  mountPrintEngine,
  printViaEngine,
  TITAN_PAGE_MM,
  TITAN_PRINT_MARGIN_MM,
};
