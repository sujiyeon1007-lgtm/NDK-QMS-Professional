import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, Save } from "lucide-react";
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
import { addInspectionLog } from "../../utils/inspectionLogSession";
import { createInspectionReport } from "../../utils/inspectionReportSession";
import { upsertDevelopmentInspection, getDevelopmentInspectionById } from "../../utils/developmentInspectionSession";
import { upsertOtherInspection, getOtherInspectionById } from "../../utils/otherInspectionSession";
import "./InspectionReport.css";

export default function InspectionLogRegisterView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);

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
    const hardnessRows = report.hardnessRows.map((row, rowIndex) => {
      if (rowIndex !== index) return row;
      if (field === "measured") {
        return { ...row, measuredRaw: value, measured: value };
      }
      return { ...row, [field]: value };
    });
    updateReport({ hardnessRows });
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
    microstructurePhotos[index] = dataUrl;
    updateReport({ microstructurePhotos });
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
      const payload = reportToInspectionLogPayload(synced);
      const log = addInspectionLog({ ...payload, category });
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

      navigate("/quality/inspection/mass", {
        replace: true,
        state: { inspectionRefresh: true, activeId: log.managementId || log.id },
      });
    } finally {
      setSaving(false);
    }
  };

  const previewReport = useMemo(() => syncReportJudgments(report), [report]);

  return (
    <div className="ir-page">
      <div className="ir-page__toolbar">
        <div className="ir-page__toolbar-title">
          <h2>검사일지 등록</h2>
          <span>검사 리포트 작성 · 입력과 동시에 리포트가 완성됩니다</span>
        </div>
        <div className="ir-page__toolbar-actions">
          <SecondaryButton type="button" onClick={() => navigate("/quality/inspection")}>
            <ArrowLeft size={14} aria-hidden="true" />
            취소
          </SecondaryButton>
          <SecondaryButton type="button" onClick={() => setPreviewOpen(true)}>
            <Eye size={14} aria-hidden="true" />
            미리보기
          </SecondaryButton>
          <PrimaryButton type="button" onClick={handleSave} disabled={saving}>
            <Save size={14} aria-hidden="true" />
            저장
          </PrimaryButton>
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
          onAppearanceChange={handleAppearanceChange}
          onMicrostructureToggle={handleMicrostructureToggle}
          onMicrostructureJudgment={handleMicrostructureJudgment}
          onMicroPhotoUpload={handleMicroPhotoUpload}
          onOtherChange={handleOtherChange}
          onRemarksChange={handleRemarksChange}
          onSpecificationChange={handleSpecificationChange}
          onHeatTreatmentCalcChange={handleHeatTreatmentCalcChange}
        />
      </div>

      <p className="ir-page__back-link">
        <Link to="/quality/inspection">← 검사일지 목록</Link>
      </p>

      <TitanPrintPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="검사 리포트 미리보기"
        onPrint={() => {}}
        onPdf={() => {}}
        excelEnabled={false}
      >
        {previewReport ? <InspectionReportPrint report={previewReport} /> : null}
      </TitanPrintPreviewModal>
    </div>
  );
}
