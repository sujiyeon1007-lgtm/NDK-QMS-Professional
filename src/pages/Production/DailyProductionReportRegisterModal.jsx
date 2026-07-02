import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

import Input from "../../foundation/components/Input";
import { SecondaryButton } from "../../foundation/components/Button";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import { createEmptyProductionDailyReportRegister } from "../../config/listSearchStandard";
import {
  PRODUCTION_DAILY_EDIT_MODAL_TITLE,
  PRODUCTION_DAILY_REGISTER_LABEL,
} from "../../config/registerModalStandard";
import { getActiveEquipmentByHeatTreatment, getActiveWorkers } from "../../utils/masterData";
import {
  validateLotNoEquipmentMatch,
  validateLotNoForDailyReportRegister,
} from "../../utils/lotFormatValidation";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import {
  buildProductionDailyReportFormFromLot,
  formatHeatTreatmentConditionRows,
  hasHeatTreatmentConditionInput,
  mapRecordToChargeProduct,
} from "../../utils/productionDailyReportRegister";
import {
  getRecordsForProductionLot,
  normalizeProductionLotKey,
} from "../../utils/productionDailyReportPrintData";
import { generateProductionLotNo } from "../../utils/productionLotNumber";
import {
  getPendingDailyReportWorkRequests,
  onDailyReportStarted,
} from "../../utils/titanWorkflowStatus";
import { getPrintOutputDate } from "../../utils/titanPrintDates";
import "./ProductionManagement.css";

function buildInitialForm(mode, initialManagementId = "", editLotNo = "", pendingRequests = []) {
  const workers = getActiveWorkers();
  const baseForm = {
    ...createEmptyProductionDailyReportRegister(),
    workDate: getPrintOutputDate(),
    worker: workers[0]?.name ?? "관리자",
  };

  if (mode === "edit" && editLotNo) {
    return buildProductionDailyReportFormFromLot(editLotNo);
  }

  if (!initialManagementId) return baseForm;

  const record = pendingRequests.find((item) => item.id === initialManagementId);
  if (!record) return baseForm;

  onDailyReportStarted(initialManagementId);
  return {
    ...baseForm,
    chargeProducts: [mapRecordToChargeProduct(record)].filter(Boolean),
  };
}

export default function DailyProductionReportRegisterModal({
  open,
  onClose,
  onRegister,
  initialManagementId = "",
  mode = "register",
  editLotNo = "",
}) {
  const [form, setForm] = useState(createEmptyProductionDailyReportRegister());
  const [productPickerId, setProductPickerId] = useState("");
  const editBaselineRef = useRef({ workDate: "", equipment: "", lotNo: "" });
  const lotNoManualRef = useRef(false);
  const lastAutoSourceRef = useRef({ workDate: "", equipment: "" });
  const isEditMode = mode === "edit";

  const resolvedHeatTreatment = useMemo(() => {
    const processes = [
      ...new Set(form.chargeProducts.map((product) => product.process).filter(Boolean)),
    ];
    if (processes.length === 1) return processes[0];
    return "";
  }, [form.chargeProducts]);

  const pendingRequests = useMemo(
    () => (open ? getPendingDailyReportWorkRequests() : []),
    [open]
  );
  const lotRecordsForEdit = useMemo(() => {
    if (!open || !isEditMode || !editLotNo) return [];
    return getRecordsForProductionLot(editLotNo);
  }, [open, isEditMode, editLotNo]);
  const equipmentList = useMemo(
    () => (open ? getActiveEquipmentByHeatTreatment(resolvedHeatTreatment) : []),
    [open, resolvedHeatTreatment]
  );
  const workerList = useMemo(() => (open ? getActiveWorkers() : []), [open]);

  const selectableRequests = useMemo(() => {
    if (isEditMode) {
      const lotIds = new Set(lotRecordsForEdit.map((record) => record.id));
      const extras = pendingRequests.filter((record) => !lotIds.has(record.id));
      return [...lotRecordsForEdit, ...extras];
    }
    return pendingRequests;
  }, [isEditMode, lotRecordsForEdit, pendingRequests]);

  const availableRequests = useMemo(
    () =>
      selectableRequests.filter(
        (record) => !form.chargeProducts.some((item) => item.managementId === record.id)
      ),
    [selectableRequests, form.chargeProducts]
  );

  useEffect(() => {
    if (!open) return;
    setProductPickerId("");
    const initialForm = buildInitialForm(
      mode,
      initialManagementId,
      editLotNo,
      getPendingDailyReportWorkRequests()
    );
    setForm(initialForm ?? createEmptyProductionDailyReportRegister());
    lotNoManualRef.current = Boolean(isEditMode && initialForm?.lotNo?.trim());
    lastAutoSourceRef.current = {
      workDate: initialForm?.workDate ?? "",
      equipment: initialForm?.equipment ?? "",
    };
    if (isEditMode && initialForm) {
      editBaselineRef.current = {
        workDate: initialForm.workDate ?? "",
        equipment: initialForm.equipment ?? "",
        lotNo: initialForm.lotNo ?? "",
      };
    } else {
      editBaselineRef.current = { workDate: "", equipment: "", lotNo: "" };
    }
  }, [open, initialManagementId, mode, editLotNo]);

  useEffect(() => {
    if (!open || !form.workDate || !form.equipment) return;

    const baseline = editBaselineRef.current;
    if (
      isEditMode &&
      form.workDate === baseline.workDate &&
      form.equipment === baseline.equipment
    ) {
      return;
    }

    const sourceChanged =
      lastAutoSourceRef.current.workDate !== form.workDate ||
      lastAutoSourceRef.current.equipment !== form.equipment;

    if (sourceChanged) {
      lotNoManualRef.current = false;
      lastAutoSourceRef.current = {
        workDate: form.workDate,
        equipment: form.equipment,
      };
    }

    if (lotNoManualRef.current) return;

    const generatedLotNo = generateProductionLotNo({
      workDate: form.workDate,
      equipment: form.equipment,
      records: getSessionProductionRecords(),
      existingLotNo: isEditMode ? baseline.lotNo : "",
      excludeLotNo: isEditMode ? editLotNo : "",
    });

    if (!generatedLotNo) return;

    setForm((prev) => (prev.lotNo === generatedLotNo ? prev : { ...prev, lotNo: generatedLotNo }));
  }, [open, isEditMode, editLotNo, form.workDate, form.equipment]);

  useEffect(() => {
    if (!open || !form.equipment || equipmentList.length === 0) return;
    const exists = equipmentList.some((item) => (item.name ?? item.code) === form.equipment);
    if (!exists) {
      setForm((prev) => ({ ...prev, equipment: "", lotNo: "" }));
    }
  }, [open, equipmentList, form.equipment]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateConditionRow = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      heatTreatmentConditionRows: prev.heatTreatmentConditionRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row
      ),
    }));
  };

  const addConditionRow = () => {
    setForm((prev) => ({
      ...prev,
      heatTreatmentConditionRows: [...prev.heatTreatmentConditionRows, { temperature: "", duration: "" }],
    }));
  };

  const removeConditionRow = (index) => {
    setForm((prev) => {
      if (prev.heatTreatmentConditionRows.length <= 1) return prev;
      return {
        ...prev,
        heatTreatmentConditionRows: prev.heatTreatmentConditionRows.filter(
          (_, rowIndex) => rowIndex !== index
        ),
      };
    });
  };

  const addChargeProduct = (managementId) => {
    const trimmed = managementId?.trim();
    if (!trimmed) return;

    const record = selectableRequests.find((item) => item.id === trimmed);
    if (!record) return;
    if (form.chargeProducts.some((item) => item.managementId === trimmed)) return;

    if (!isEditMode) {
      onDailyReportStarted(trimmed);
    }
    setForm((prev) => ({
      ...prev,
      chargeProducts: [...prev.chargeProducts, mapRecordToChargeProduct(record)],
    }));
    setProductPickerId("");
  };

  const removeChargeProduct = (managementId) => {
    setForm((prev) => ({
      ...prev,
      chargeProducts: prev.chargeProducts.filter((item) => item.managementId !== managementId),
    }));
  };

  const validateLotForSubmit = () => {
    const equipmentCheck = validateLotNoEquipmentMatch(form.lotNo, form.equipment);
    if (!equipmentCheck.ok) return equipmentCheck;

    if (isEditMode) {
      const records = getSessionProductionRecords();
      const editLotKey = normalizeProductionLotKey(editLotNo);
      const nextLotKey = normalizeProductionLotKey(equipmentCheck.lotNo);
      const bundleIds = new Set(form.chargeProducts.map((item) => item.managementId));

      if (nextLotKey !== editLotKey) {
        const conflict = records.find(
          (record) =>
            record.registered &&
            normalizeProductionLotKey(record.lotNo) === nextLotKey &&
            !bundleIds.has(record.id)
        );
        if (conflict) {
          return {
            ok: false,
            message: `LOT ${equipmentCheck.lotNo}는 이미 다른 생산일보에 사용 중입니다.`,
          };
        }
      }

      return equipmentCheck;
    }

    for (const product of form.chargeProducts) {
      const existing = getSessionProductionRecords().find((record) => record.id === product.managementId);
      const lotCheck = validateLotNoForDailyReportRegister(equipmentCheck.lotNo, existing);
      if (!lotCheck.ok) return lotCheck;
    }

    return equipmentCheck;
  };

  const handleSubmit = () => {
    if (!form.chargeProducts.length) {
      window.alert("장입 제품을 1건 이상 추가하세요.");
      return;
    }

    if (!hasHeatTreatmentConditionInput(form.heatTreatmentConditionRows)) {
      window.alert("열처리 조건(온도 · 시간)을 입력하세요.");
      return;
    }

    const lotCheck = validateLotForSubmit();
    if (!lotCheck.ok) {
      window.alert(lotCheck.message);
      return;
    }

    for (const product of form.chargeProducts) {
      const existing = getSessionProductionRecords().find((record) => record.id === product.managementId);
      if (!existing) {
        window.alert(`관리번호 ${product.managementId}를 찾을 수 없습니다.`);
        return;
      }
      if (!existing.htlNo?.trim()) {
        window.alert("열처리 작업 요청 리스트 출력 후 생산일보를 등록할 수 있습니다.");
        return;
      }
    }

    onRegister(
      {
        ...form,
        heatTreatmentConditions: formatHeatTreatmentConditionRows(form.heatTreatmentConditionRows),
        lotNo: lotCheck.lotNo ?? form.lotNo.trim(),
      },
      { mode, editLotNo }
    );
    onClose();
  };

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      kicker="생산관리"
      title={isEditMode ? PRODUCTION_DAILY_EDIT_MODAL_TITLE : PRODUCTION_DAILY_REGISTER_LABEL}
      submitLabel={isEditMode ? "수정" : undefined}
      titleId="daily-report-modal-title"
      size="wide"
    >
      <div className="titan-modal__section daily-report-register">
        <label className="daily-report-register__lot-field">
          <span className="daily-report-register__label">로트번호</span>
          <Input
            className="daily-report-register__line-input"
            value={form.lotNo}
            onChange={(e) => {
              lotNoManualRef.current = true;
              updateField("lotNo", e.target.value);
            }}
            placeholder="작업일 · 설비 선택 시 자동 생성 (예: 260626-3S3A)"
          />
          <span className="titan-modal__hint">
            YYMMDD-설비코드+순번 · 자동 생성 후 직접 수정 가능 · 260626-3S3A = 26.06.26 · 3S-3 · A차
          </span>
        </label>
      </div>

      <div className="titan-modal__section daily-report-register">
        <div className="daily-report-register__section-head">
          <p className="titan-modal__section-title">장입 제품 리스트</p>
          {availableRequests.length > 0 ? (
            <div className="daily-report-register__product-picker">
              <select
                value={productPickerId}
                onChange={(e) => {
                  const value = e.target.value;
                  setProductPickerId(value);
                  if (value) addChargeProduct(value);
                }}
              >
                <option value="">제품 추가</option>
                {availableRequests.map((record) => (
                  <option key={record.id} value={record.id}>
                    {record.id} · {record.company} · {record.partName} · {record.partNo}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        {!isEditMode && pendingRequests.length === 0 ? (
          <p className="titan-modal__hint">
            작업 요청 리스트 출력 후 등록 가능한 제품이 없습니다.
          </p>
        ) : null}

        <div className="daily-report-register__charge-list" aria-label="장입 제품 리스트">
          {form.chargeProducts.length > 0 ? (
            form.chargeProducts.map((product) => (
              <div key={product.managementId} className="daily-report-register__charge-line">
                <span>
                  {product.managementId} · {product.company} · {product.partName} · {product.partNo}
                  {product.qty ? ` · ${product.qty} EA` : ""}
                </span>
                <button
                  type="button"
                  className="daily-report-register__remove-btn"
                  onClick={() => removeChargeProduct(product.managementId)}
                  aria-label={`${product.managementId} 제거`}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
            ))
          ) : (
            <>
              <div className="daily-report-register__charge-line daily-report-register__charge-line--empty" />
              <div className="daily-report-register__charge-line daily-report-register__charge-line--empty" />
            </>
          )}
        </div>
      </div>

      <div className="titan-modal__section daily-report-register">
        <p className="titan-modal__section-title">열처리 조건</p>
        <div className="daily-report-register__condition-list">
          {form.heatTreatmentConditionRows.map((row, index) => (
            <div key={`condition-${index}`} className="daily-report-register__condition-row">
              <Input
                className="daily-report-register__line-input daily-report-register__condition-input"
                value={row.temperature}
                onChange={(e) => updateConditionRow(index, "temperature", e.target.value)}
                placeholder="온도"
                inputMode="decimal"
              />
              <span className="daily-report-register__condition-unit">℃</span>
              <Input
                className="daily-report-register__line-input daily-report-register__condition-input"
                value={row.duration}
                onChange={(e) => updateConditionRow(index, "duration", e.target.value)}
                placeholder="시간"
                inputMode="decimal"
              />
              <span className="daily-report-register__condition-unit">시간</span>
              {index === form.heatTreatmentConditionRows.length - 1 ? (
                <SecondaryButton type="button" className="daily-report-register__add-btn" onClick={addConditionRow}>
                  <Plus size={14} aria-hidden="true" />
                  추가
                </SecondaryButton>
              ) : (
                <button
                  type="button"
                  className="daily-report-register__remove-btn"
                  onClick={() => removeConditionRow(index)}
                  aria-label="열처리 조건 삭제"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="titan-modal__section">
        <p className="titan-modal__section-title">작업 정보</p>
        <div className="titan-modal__grid">
          <label className="titan-modal__field">
            <span>작업일</span>
            <Input
              type="date"
              value={form.workDate}
              onChange={(e) => updateField("workDate", e.target.value)}
            />
          </label>
          <label className="titan-modal__field">
            <span>설비</span>
            <select value={form.equipment} onChange={(e) => updateField("equipment", e.target.value)}>
              <option value="">선택</option>
              {equipmentList.map((item) => (
                <option key={item.id} value={item.name ?? item.code}>
                  {item.name ?? item.code}
                  {item.equipType ? ` · ${item.equipType}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="titan-modal__field">
            <span>작업자</span>
            <select value={form.worker} onChange={(e) => updateField("worker", e.target.value)}>
              <option value="">작업자 선택</option>
              {workerList.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                  {item.department ? ` · ${item.department}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="titan-modal__field titan-modal__field--full">
            <span>비고</span>
            <Input
              value={form.note}
              onChange={(e) => updateField("note", e.target.value)}
              placeholder="비고"
            />
          </label>
        </div>
      </div>
    </TitanRegisterModal>
  );
}
