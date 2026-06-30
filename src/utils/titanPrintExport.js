import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { buildHtlPrintLayout, HTL_PRINT_TITLE } from "./htlWorkListPrintLayout";
import { buildOutboundPrintLayout, OUTBOUND_PRINT_TITLE } from "./outboundListPrintLayout";
import { formatQtyWithUnit } from "./productUnits";
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
  printDate = "",
  workDate = "",
  workMemo = "",
  printDateTime = "",
  printUser = "",
  filename = "document.xlsx",
}) {
  const XLSX = await import("xlsx");
  const { columns, columnWidths } = buildHtlPrintLayout(rows, workDate);
  const sheetRows = [
    [HTL_PRINT_TITLE],
    [`리스트 No. ${listNo}`, printDate ? `작업일 ${printDate}` : ""],
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
