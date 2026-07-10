import { useEffect, useMemo, useState } from "react";
import Input from "../../foundation/components/Input";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import TitanCascadeProductPicker from "../../foundation/components/TitanCascadeProductPicker";
import TitanSearchableSelect from "../../foundation/components/TitanSearchableSelect";
import { DEFECT_REGISTER_LABEL } from "../../config/registerModalStandard";
import { getProductionProcessCodes } from "../../config/productionProcessCodes";
import { getActiveMasterNames, getActiveWorkers, getMasterDataByCategory } from "../../utils/masterData";
import { mapProductToFormAutofill } from "../../utils/productMasterSearch";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import {
  DEFECT_HANDLING_STATUS,
  DEFECT_TYPE_OPTIONS,
  createEmptyDefectRegister,
} from "../../utils/defectHistorySession";

export default function DefectHistoryRegisterModal({ open, onClose, onRegister }) {
  const [form, setForm] = useState(createEmptyDefectRegister());

  const companyOptions = useMemo(() => getActiveMasterNames("companies"), [open]);
  const processOptions = useMemo(
    () => getProductionProcessCodes().map((item) => item.name),
    [open]
  );
  const equipmentOptions = useMemo(
    () =>
      getMasterDataByCategory("equipment")
        .filter((item) => item.active !== false)
        .map((item) => item.name ?? item.code)
        .filter(Boolean),
    [open]
  );
  const workerList = useMemo(() => getActiveWorkers(), [open]);

  useEffect(() => {
    if (open) {
      setForm(createEmptyDefectRegister());
    }
  }, [open]);

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "managementId") {
        const existing = getSessionProductionRecords().find((r) => r.id === value.trim());
        if (existing) {
          return {
            ...next,
            company: existing.company || prev.company,
            lotNo: existing.lotNo?.trim() || prev.lotNo,
            process: existing.heatTreatment || prev.process,
            partName: existing.partName || prev.partName,
            partNo: existing.partNo || prev.partNo,
            material: existing.material || prev.material,
            equipment: existing.equipment || prev.equipment,
            worker: existing.registrar || prev.worker,
            fourM: {
              ...prev.fourM,
              man: { ...prev.fourM.man, worker: existing.registrar || prev.fourM.man.worker },
              machine: {
                ...prev.fourM.machine,
                equipment: existing.equipment || prev.fourM.machine.equipment,
              },
              material: {
                ...prev.fourM.material,
                material: existing.material || prev.fourM.material,
                lotNo: existing.lotNo?.trim() || prev.fourM.material.lotNo,
              },
            },
          };
        }
      }
      return next;
    });
  };

  const updateFourM = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      fourM: {
        ...prev.fourM,
        [section]: {
          ...prev.fourM[section],
          [key]: value,
        },
      },
    }));
  };

  const updateAction = (key, value) => {
    setForm((prev) => ({
      ...prev,
      action: {
        ...prev.action,
        [key]: value,
      },
    }));
  };

  const handleCompanyChange = (value) => {
    setForm((prev) => ({
      ...prev,
      company: value,
      partName: "",
      partNo: "",
      material: "",
    }));
  };

  const handleCascadeChange = (selection, product) => {
    if (product) {
      const autofill = mapProductToFormAutofill(product);
      setForm((prev) => ({
        ...prev,
        partName: autofill.partName,
        partNo: autofill.partNo,
        material: autofill.material || prev.material,
        process: autofill.process || prev.process,
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      partName: selection.partName,
      partNo: selection.partNo,
    }));
  };

  const handleSubmit = () => {
    if (!form.managementId.trim() || !form.defectType || !form.defectQty) return;
    if (!form.fourM.man.worker.trim() || !form.action.cause.trim()) return;
    onRegister(form);
    onClose();
  };

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      kicker="생산관리"
      title={DEFECT_REGISTER_LABEL}
      titleId="defect-history-modal-title"
      size="wide"
    >
      <div className="titan-modal__grid">
        <label className="titan-modal__field">
          <span>관리번호</span>
          <Input
            value={form.managementId}
            onChange={(e) => updateField("managementId", e.target.value)}
            placeholder="관리번호"
          />
        </label>
        <label className="titan-modal__field">
          <span>LOT.NO</span>
          <Input
            value={form.lotNo}
            onChange={(e) => updateField("lotNo", e.target.value)}
            placeholder="LOT.NO"
          />
        </label>
        <TitanSearchableSelect
          className="titan-modal__field"
          label="업체명"
          value={form.company}
          onChange={handleCompanyChange}
          options={companyOptions}
          placeholder="거래처 선택"
        />
        <TitanCascadeProductPicker
          inline
          company={form.company}
          value={{
            partName: form.partName,
            partNo: form.partNo,
            drawingNo: "",
          }}
          onChange={handleCascadeChange}
          autoFields={{ material: form.material }}
          fieldClassName="titan-modal__field"
          kicker="불량이력 등록"
        />
        <label className="titan-modal__field">
          <span>재질</span>
          <Input value={form.material} onChange={(e) => updateField("material", e.target.value)} />
        </label>
        <TitanSearchableSelect
          className="titan-modal__field"
          label="공정"
          value={form.process}
          onChange={(value) => updateField("process", value)}
          options={processOptions}
          placeholder="공정 선택"
        />
        <label className="titan-modal__field">
          <span>불량유형</span>
          <select
            className="titan-search-panel__select"
            value={form.defectType}
            onChange={(e) => updateField("defectType", e.target.value)}
          >
            <option value="">선택</option>
            {DEFECT_TYPE_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="titan-modal__field">
          <span>불량수량</span>
          <Input
            type="number"
            min="1"
            value={form.defectQty}
            onChange={(e) => updateField("defectQty", e.target.value)}
          />
        </label>
        <label className="titan-modal__field">
          <span>발생일</span>
          <Input
            type="date"
            value={form.occurredDate}
            onChange={(e) => updateField("occurredDate", e.target.value)}
          />
        </label>
        <TitanSearchableSelect
          className="titan-modal__field"
          label="설비"
          value={form.equipment}
          onChange={(value) => updateField("equipment", value)}
          options={equipmentOptions}
          placeholder="설비 선택"
        />
        <label className="titan-modal__field">
          <span>작업자</span>
          <select
            className="titan-search-panel__select"
            value={form.worker}
            onChange={(e) => updateField("worker", e.target.value)}
          >
            <option value="">선택</option>
            {workerList.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="titan-modal__field">
          <span>처리상태</span>
          <select
            className="titan-search-panel__select"
            value={form.handlingStatus}
            onChange={(e) => updateField("handlingStatus", e.target.value)}
          >
            {DEFECT_HANDLING_STATUS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="titan-modal__section">
        <h3 className="titan-modal__section-title">4M 분석 (필수 입력)</h3>
        <div className="titan-modal__grid">
          <label className="titan-modal__field">
            <span>Man · 작업자</span>
            <Input
              value={form.fourM.man.worker}
              onChange={(e) => updateFourM("man", "worker", e.target.value)}
            />
          </label>
          <label className="titan-modal__field">
            <span>Man · 교육 여부</span>
            <select
              className="titan-search-panel__select"
              value={form.fourM.man.trained}
              onChange={(e) => updateFourM("man", "trained", e.target.value)}
            >
              <option value="예">예</option>
              <option value="아니오">아니오</option>
            </select>
          </label>
          <label className="titan-modal__field">
            <span>Man · 숙련도</span>
            <select
              className="titan-search-panel__select"
              value={form.fourM.man.skillLevel}
              onChange={(e) => updateFourM("man", "skillLevel", e.target.value)}
            >
              <option value="숙련">숙련</option>
              <option value="보통">보통</option>
              <option value="초급">초급</option>
            </select>
          </label>
          <label className="titan-modal__field">
            <span>Machine · 설비</span>
            <Input
              value={form.fourM.machine.equipment}
              onChange={(e) => updateFourM("machine", "equipment", e.target.value)}
            />
          </label>
          <label className="titan-modal__field">
            <span>Machine · 호기</span>
            <Input
              value={form.fourM.machine.unitNo}
              onChange={(e) => updateFourM("machine", "unitNo", e.target.value)}
            />
          </label>
          <label className="titan-modal__field">
            <span>Machine · 이상 유무</span>
            <select
              className="titan-search-panel__select"
              value={form.fourM.machine.abnormal}
              onChange={(e) => updateFourM("machine", "abnormal", e.target.value)}
            >
              <option value="없음">없음</option>
              <option value="있음">있음</option>
            </select>
          </label>
          <label className="titan-modal__field">
            <span>Material · 재질</span>
            <Input
              value={form.fourM.material.material}
              onChange={(e) => updateFourM("material", "material", e.target.value)}
            />
          </label>
          <label className="titan-modal__field">
            <span>Material · LOT.NO</span>
            <Input
              value={form.fourM.material.lotNo}
              onChange={(e) => updateFourM("material", "lotNo", e.target.value)}
            />
          </label>
          <label className="titan-modal__field">
            <span>Material · 원자재 이상 여부</span>
            <select
              className="titan-search-panel__select"
              value={form.fourM.material.materialAbnormal}
              onChange={(e) => updateFourM("material", "materialAbnormal", e.target.value)}
            >
              <option value="없음">없음</option>
              <option value="있음">있음</option>
            </select>
          </label>
          <label className="titan-modal__field">
            <span>Method · 작업방법</span>
            <Input
              value={form.fourM.method.workMethod}
              onChange={(e) => updateFourM("method", "workMethod", e.target.value)}
            />
          </label>
          <label className="titan-modal__field">
            <span>Method · 공정조건</span>
            <Input
              value={form.fourM.method.processCondition}
              onChange={(e) => updateFourM("method", "processCondition", e.target.value)}
            />
          </label>
          <label className="titan-modal__field">
            <span>Method · 작업표준 준수 여부</span>
            <select
              className="titan-search-panel__select"
              value={form.fourM.method.standardCompliance}
              onChange={(e) => updateFourM("method", "standardCompliance", e.target.value)}
            >
              <option value="준수">준수</option>
              <option value="미준수">미준수</option>
            </select>
          </label>
        </div>
      </div>

      <div className="titan-modal__section">
        <h3 className="titan-modal__section-title">조치사항</h3>
        <div className="titan-modal__grid titan-modal__grid--single">
          <label className="titan-modal__field">
            <span>원인</span>
            <Input value={form.action.cause} onChange={(e) => updateAction("cause", e.target.value)} />
          </label>
          <label className="titan-modal__field">
            <span>조치내용</span>
            <Input
              value={form.action.actionContent}
              onChange={(e) => updateAction("actionContent", e.target.value)}
            />
          </label>
          <label className="titan-modal__field">
            <span>재발방지대책</span>
            <Input
              value={form.action.prevention}
              onChange={(e) => updateAction("prevention", e.target.value)}
            />
          </label>
        </div>
      </div>
    </TitanRegisterModal>
  );
}
