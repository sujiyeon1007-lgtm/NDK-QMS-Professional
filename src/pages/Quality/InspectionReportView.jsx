import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye, FileDown, FileSpreadsheet, Printer } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import InspectionReportDocument from "../../components/quality/InspectionReportDocument";
import InspectionReportPrint from "../../components/print/InspectionReportPrint";
import TitanPrintPreviewModal from "../../components/print/TitanPrintPreviewModal";
import { normalizeInspectionReport } from "../../utils/inspectionReportModel";
import { syncReportJudgments, updateHeatTreatmentCalculation } from "../../utils/inspectionReportEditor";
import {
  getInspectionReportByLogId,
  saveInspectionReport,
} from "../../utils/inspectionReportSession";
import {
  exportInspectionReportXlsx,
  exportTitanPdf,
  printTitanDocument,
} from "../../utils/titanPrintExport";
import { getPrintDocumentMeta, TITAN_PRINT_DOCUMENT_TYPES } from "../../config/titanPrintDocuments";
import "./InspectionReport.css";

export default function InspectionReportView() {
  const { logId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(() => getInspectionReportByLogId(logId));
  const [previewOpen, setPreviewOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const reportMeta = getPrintDocumentMeta(TITAN_PRINT_DOCUMENT_TYPES.INSPECTION_REPORT);

  const persistReport = useCallback(
    (nextReport) => {
      const normalized = normalizeInspectionReport(nextReport);
      setReport(normalized);
      saveInspectionReport(logId, normalized);
      return normalized;
    },
    [logId]
  );

  const handleHardeningDepthChange = (patch) => {
    if (!report) return;
    persistReport(syncReportJudgments({ ...report, ...patch }));
  };

  const handleHeatTreatmentCalcChange = (fieldKey, value) => {
    if (!report) return;
    persistReport(updateHeatTreatmentCalculation(report, fieldKey, value));
  };

  const handleSpecificationChange = (patch) => {
    if (!report) return;
    persistReport(syncReportJudgments({ ...report, ...patch }));
  };

  const handleMicrostructureToggle = (hasPhoto) => {
    if (!report) return;
    persistReport({
      ...report,
      hasMicrostructurePhoto: hasPhoto,
      microstructureSummary: hasPhoto ? report.microstructureSummary || "합격" : "—",
      resultSummary: report.resultSummary.map((row) =>
        row.category === "조직검사"
          ? { ...row, result: hasPhoto ? "합격" : "—", note: hasPhoto ? "—" : "미실시" }
          : row
      ),
    });
  };

  const handlePrint = async (documentEl) => {
    setBusy(true);
    try {
      await printTitanDocument(documentEl);
    } finally {
      setBusy(false);
    }
  };

  const handlePdf = async (documentEl) => {
    setBusy(true);
    try {
      await exportTitanPdf(documentEl, `${report?.reportNo || "inspection-report"}.pdf`);
    } finally {
      setBusy(false);
    }
  };

  const handleExcel = async () => {
    if (!report) return;
    setBusy(true);
    try {
      await exportInspectionReportXlsx({
        report,
        filename: `${report.reportNo || "inspection-report"}.xlsx`,
      });
    } finally {
      setBusy(false);
    }
  };

  const previewReport = useMemo(() => report, [report]);

  if (!report) {
    return (
      <div className="ir-page">
        <div className="ir-page__toolbar">
          <div className="ir-page__toolbar-title">
            <h2>검사 리포트</h2>
            <span>검사일지를 찾을 수 없습니다.</span>
          </div>
          <SecondaryButton type="button" onClick={() => navigate("/quality/inspection")}>
            <ArrowLeft size={14} aria-hidden="true" />
            검사일지로 돌아가기
          </SecondaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="ir-page">
      <div className="ir-page__toolbar">
        <div className="ir-page__toolbar-title">
          <h2>검사 리포트</h2>
          <span>
            {report.reportNo} · {report.company} · {report.partName}
          </span>
        </div>
        <div className="ir-page__toolbar-actions">
          <SecondaryButton type="button" onClick={() => navigate("/quality/inspection")}>
            <ArrowLeft size={14} aria-hidden="true" />
            검사일지
          </SecondaryButton>
          <SecondaryButton type="button" onClick={() => setPreviewOpen(true)}>
            <Eye size={14} aria-hidden="true" />
            미리보기
          </SecondaryButton>
          <SecondaryButton type="button" onClick={handleExcel} disabled={busy}>
            <FileSpreadsheet size={14} aria-hidden="true" />
            엑셀 저장
          </SecondaryButton>
          <SecondaryButton type="button" onClick={() => setPreviewOpen(true)} disabled={busy}>
            <FileDown size={14} aria-hidden="true" />
            PDF 저장
          </SecondaryButton>
          <PrimaryButton type="button" onClick={() => setPreviewOpen(true)} disabled={busy}>
            <Printer size={14} aria-hidden="true" />
            인쇄
          </PrimaryButton>
        </div>
      </div>

      <div className="ir-page__body">
        <InspectionReportDocument
          report={report}
          mode="screen"
          editable
          onHardeningDepthChange={handleHardeningDepthChange}
          onHeatTreatmentCalcChange={handleHeatTreatmentCalcChange}
          onMicrostructureToggle={handleMicrostructureToggle}
          onSpecificationChange={handleSpecificationChange}
        />
      </div>

      <p className="ir-page__back-link">
        <Link to="/quality/inspection">← 검사일지 목록</Link>
      </p>

      <TitanPrintPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={`${reportMeta?.label ?? "검사 리포트"} 출력 미리보기`}
        onPrint={handlePrint}
        onPdf={handlePdf}
        onExcel={handleExcel}
        excelEnabled
        busy={busy}
      >
        {previewReport ? <InspectionReportPrint report={previewReport} /> : null}
      </TitanPrintPreviewModal>
    </div>
  );
}
