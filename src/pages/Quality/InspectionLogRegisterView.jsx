import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Printer, Save } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import InspectionReportDocument from "../../components/quality/InspectionReportDocument";
import InspectionReportPrint from "../../components/print/InspectionReportPrint";
import TitanPrintPreviewModal from "../../components/print/TitanPrintPreviewModal";
import {
  applyProductToReport,
  loadRegisterReportFromSearchParams,
  reportToInspectionLogPayload,
  syncReportJudgments,
  updateHeatTreatmentCalculation,
} from "../../utils/inspectionReportEditor";
import { getProductByCompanyAndPartNo } from "../../utils/productRegistrationSession";
import { addInspectionLog } from "../../utils/inspectionLogSession";
import { createInspectionReport } from "../../utils/inspectionReportSession";
import { resolveInspectionLogMetaFromContext } from "../../config/inspectionManagement";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import { resolveChargeQty } from "../../utils/equipmentChargingQty";
import { upsertDevelopmentInspection, getDevelopmentInspectionById } from "../../utils/developmentInspectionSession";
import { upsertOtherInspection, getOtherInspectionById } from "../../utils/otherInspectionSession";
import {
  exportInspectionReportXlsx,
  exportTitanPdf,
  printTitanDocument,
} from "../../utils/titanPrintExport";
import TitanWorkflowNextStepDialog from "../../foundation/components/TitanWorkflowNextStepDialog";
import TitanWorkflowNavigation from "../../foundation/components/TitanWorkflowNavigation";
import { getWorkflowCompletionDialog } from "../../config/workflowNavigation";
import { getPrintDocumentMeta, TITAN_PRINT_DOCUMENT_TYPES } from "../../config/titanPrintDocuments";
import "./InspectionReport.css";

export default function InspectionLogRegisterView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [workflowNextStep, setWorkflowNextStep] = useState(null);

  const reportMeta = getPrintDocumentMeta(TITAN_PRINT_DOCUMENT_TYPES.INSPECTION_REPORT);

  const initialReport = useMemo(
    () => loadRegisterReportFromSearchParams(searchParams),
    [searchParams]
  );

  const [report, setReport] = useState(initialReport);

  useEffect(() => {
    setReport(initialReport);
  }, [initialReport]);

  const updateReport = useCallback((patch) => {
    setReport((prev) => syncReportJudgments({ ...prev, ...patch }));
  }, []);

  const handleBasicChange = (field, value) => {
    if (field === "managementId") {
      const trimmed = String(value ?? "").trim();
      const record = getSessionProductionRecords().find((item) => item.id === trimmed);
      if (record) {
        const product = getProductByCompanyAndPartNo(record.company, record.partNo);
        setReport((prev) =>
          syncReportJudgments(
            applyProductToReport(
              {
                ...prev,
                managementId: trimmed,
                company: record.company || prev.company,
                partName: record.partName || prev.partName,
                partNo: record.partNo || prev.partNo,
                lotNo: record.lotNo || prev.lotNo,
                material: record.material || prev.material,
                qty: resolveChargeQty(record, { lotNo: record.lotNo }) || prev.qty,
                unit: record.unit || prev.unit,
                purchaseOrderNo: record.purchaseOrderNo || prev.purchaseOrderNo,
                customerLotNo: record.customerLotNo || prev.customerLotNo,
              },
              record.partNo,
              record.company
            )
          )
        );
        return;
      }
      updateReport({ managementId: trimmed });
      return;
    }
    if (field === "partNo") {
      setReport((prev) => applyProductToReport({ ...prev, partNo: value }, value, prev.company));
      return;
    }
    if (field === "company") {
      setReport((prev) => applyProductToReport({ ...prev, company: value }, prev.partNo, value));
      return;
    }
    updateReport({ [field]: value });
  };

  const handleSpecificationChange = (patch) => {
    updateReport(patch);
  };

  const handlePartNoApply = (partNo) => {
    setReport((prev) => applyProductToReport(prev, partNo));
  };

  const handleHardeningDepthChange = (patch) => {
    updateReport(patch);
  };

  const handleHardnessChange = (index, field, value) => {
    const manualRows = report.hardnessRows.filter((row) => !row.autoCalculated);
    const target = manualRows[index];
    if (!target) return;

    const hardnessRows = report.hardnessRows.map((row) => {
      if (row.key !== target.key) return row;
      if (field === "measured") {
        return { ...row, measuredRaw: value, measured: value };
      }
      return { ...row, [field]: value };
    });
    updateReport({ hardnessRows });
  };

  const handleCoreHardnessChange = (value) => {
    updateReport({ coreHardnessHv: value });
  };

  const handleDimensionChange = (index, field, value) => {
    const dimensionRows = report.dimensionRows.map((row, rowIndex) => {
      if (rowIndex !== index) return row;
      if (field === "measured") {
        return { ...row, measuredRaw: value, measured: value };
      }
      return { ...row, [field]: value };
    });
    updateReport({ dimensionRows });
  };

  const handleDimensionInspectionChange = (index, field, value) => {
    const dimensionInspectionRows = report.dimensionInspectionRows.map((row, rowIndex) => {
      if (rowIndex !== index) return row;
      return { ...row, [field]: value };
    });
    updateReport({ dimensionInspectionRows });
  };

  const handleAppearanceChange = (index, value) => {
    const appearanceRows = report.appearanceRows.map((row, rowIndex) =>
      rowIndex === index ? { ...row, result: value } : row
    );
    updateReport({ appearanceRows });
  };

  const handleMicrostructureToggle = (hasPhoto) => updateReport({ hasMicrostructurePhoto: hasPhoto });

  const handleMicrostructureJudgment = (value) => updateReport({ microstructureJudgment: value });

  const handleMicroPhotoUpload = (index, dataUrl) => {
    const microstructurePhotos = [...(report.microstructurePhotos || ["", "", ""])];
    while (microstructurePhotos.length < 3) microstructurePhotos.push("");
    microstructurePhotos[index] = dataUrl;
    updateReport({
      microstructurePhotos,
      hasMicrostructurePhoto: true,
    });
  };

  const handleMicroPhotosChange = (nextPhotos) => {
    const microstructurePhotos = [...nextPhotos];
    while (microstructurePhotos.length < 3) microstructurePhotos.push("");
    updateReport({
      microstructurePhotos: microstructurePhotos.slice(0, 3),
      hasMicrostructurePhoto:
        microstructurePhotos.some((photo) => Boolean(photo)) || report.hasMicrostructurePhoto,
    });
  };

  const handleOtherChange = (index, field, value) => {
    const otherRows = report.otherRows.map((row, rowIndex) =>
      rowIndex === index ? { ...row, [field]: value } : row
    );
    updateReport({ otherRows });
  };

  const handleHeatTreatmentCalcChange = (fieldKey, value) => {
    setReport((prev) => updateHeatTreatmentCalculation(prev, fieldKey, value));
  };

  const handleRemarksChange = (value) => updateReport({ remarks: value });

  const handleSave = () => {
    if (!report.partNo?.trim()) {
      window.alert("품번을 입력해 주세요.");
      return;
    }

    setSaving(true);
    try {
      const synced = syncReportJudgments(report);
      const category = searchParams.get("category")?.trim() || "양산";
      const devId = searchParams.get("devId")?.trim();
      const otherId = searchParams.get("otherId")?.trim();
      const managementId = synced.managementId?.trim() || searchParams.get("managementId")?.trim() || "";
      const record = managementId
        ? getSessionProductionRecords().find((item) => item.id === managementId)
        : null;
      const otherRecord = otherId ? getOtherInspectionById(otherId) : null;
      const inspectionMeta = resolveInspectionLogMetaFromContext({
        categoryLabel: category,
        managementId,
        record,
        otherRecord,
      });
      const payload = reportToInspectionLogPayload(synced);
      const log = addInspectionLog({ ...payload, ...inspectionMeta });
      createInspectionReport(log.id, { ...synced, logId: log.id });

      if (devId) {
        const dev = getDevelopmentInspectionById(devId);
        if (dev) {
          upsertDevelopmentInspection({ ...dev, status: "완료", inspectionLogId: log.id });
        }
      }
      if (otherId) {
        const other = getOtherInspectionById(otherId);
        if (other) {
          upsertOtherInspection({ ...other, status: "완료", inspectionLogId: log.id });
        }
      }

      setWorkflowNextStep(getWorkflowCompletionDialog("inspectionComplete"));
    } finally {
      setSaving(false);
    }
  };

  const previewReport = useMemo(() => syncReportJudgments(report), [report]);

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
      await exportTitanPdf(documentEl, `${previewReport?.reportNo || "inspection-report"}.pdf`);
    } finally {
      setBusy(false);
    }
  };

  const handleExcel = async () => {
    if (!previewReport) return;
    setBusy(true);
    try {
      await exportInspectionReportXlsx(previewReport);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ir-page ir-page--register">
      <TitanWorkflowNavigation stepId="inspectionRegister" className="ir-page__workflow-nav" />
      <div className="ir-page__toolbar">
        <div className="ir-page__toolbar-title">
          <h2>검사 리포트</h2>
          <span>검사등록 · 성적서 기준 자동 판정</span>
        </div>
        <div className="ir-page__toolbar-actions">
          <SecondaryButton type="button" disabled title="준비 중">
            <Save size={14} aria-hidden="true" />
            임시저장
          </SecondaryButton>
          <SecondaryButton type="button" onClick={() => setPreviewOpen(true)}>
            <Printer size={14} aria-hidden="true" />
            미리보기
          </SecondaryButton>
          <PrimaryButton type="button" onClick={handleSave} disabled={saving}>
            <Save size={14} aria-hidden="true" />
            검사 완료
          </PrimaryButton>
          <SecondaryButton type="button" onClick={() => navigate("/quality/inspection")}>
            <ArrowLeft size={14} aria-hidden="true" />
            취소
          </SecondaryButton>
        </div>
      </div>

      <div className="ir-page__body">
        <InspectionReportDocument
          report={report}
          mode="screen"
          editable
          onBasicChange={handleBasicChange}
          onPartNoApply={handlePartNoApply}
          onHardeningDepthChange={handleHardeningDepthChange}
          onHardnessChange={handleHardnessChange}
          onDimensionChange={handleDimensionChange}
          onDimensionInspectionChange={handleDimensionInspectionChange}
          onAppearanceChange={handleAppearanceChange}
          onMicrostructureToggle={handleMicrostructureToggle}
          onMicrostructureJudgment={handleMicrostructureJudgment}
          onMicroPhotoUpload={handleMicroPhotoUpload}
          onMicroPhotosChange={handleMicroPhotosChange}
          onOtherChange={handleOtherChange}
          onRemarksChange={handleRemarksChange}
          onSpecificationChange={handleSpecificationChange}
          onHeatTreatmentCalcChange={handleHeatTreatmentCalcChange}
          onCoreHardnessChange={handleCoreHardnessChange}
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

      <TitanWorkflowNextStepDialog
        open={Boolean(workflowNextStep)}
        step={workflowNextStep}
        onNavigate={(path) => {
          navigate(path);
          setWorkflowNextStep(null);
        }}
        onStay={() => setWorkflowNextStep(null)}
        onClose={() => setWorkflowNextStep(null)}
      />
    </div>
  );
}
