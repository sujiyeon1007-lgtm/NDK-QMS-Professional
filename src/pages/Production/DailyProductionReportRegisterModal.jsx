import { useEffect, useMemo, useState } from "react";

import Input from "../../foundation/components/Input";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import { createEmptyProductionDailyReportRegister } from "../../config/listSearchStandard";
import { PRODUCTION_DAILY_REGISTER_LABEL } from "../../config/registerModalStandard";
import { getProductionProcessCodes } from "../../config/productionProcessCodes";
import {
  getActiveEquipment,
  getActiveMasterNames,
  getActiveWorkers,
} from "../../utils/masterData";
import { validateLotNoForDailyReportRegister } from "../../utils/lotFormatValidation";
import { getSessionProductionRecords } from "../../utils/productionRecords";
import {
  getPendingDailyReportWorkRequests,
  onDailyReportStarted,
} from "../../utils/titanWorkflowStatus";

function applyWorkRequestToForm(record, prev = createEmptyProductionDailyReportRegister()) {
  if (!record) return createEmptyProductionDailyReportRegister();

  return {
    ...prev,
    managementId: record.id,
    lotNo: record.lotNo?.trim() || "",
    company: record.company || "",
    partName: record.partName || "",
    partNo: record.partNo || "",
    material: record.material || "",
    qty: record.qty != null ? String(record.qty) : "",
    process: record.heatTreatment || "",
    workDate: record.workDate || prev.workDate,
    equipment: record.equipment || "",
    worker: record.registrar || "",
    heatTreatmentConditions: record.heatTreatmentConditions || "",
    note: record.note || "",
    htlNo: record.htlNo || "",
  };
}

export default function DailyProductionReportRegisterModal({
  open,
  onClose,
  onRegister,
  initialManagementId = "",
}) {
  const [form, setForm] = useState(createEmptyProductionDailyReportRegister());
  const [selectedId, setSelectedId] = useState("");

  const pendingRequests = useMemo(
    () => getPendingDailyReportWorkRequests(),
    [open]
  );

  const companyOptions = useMemo(() => getActiveMasterNames("companies"), [open]);
  const equipmentList = useMemo(() => getActiveEquipment(), [open]);
  const workerList = useMemo(() => getActiveWorkers(), [open]);
  const processCodes = getProductionProcessCodes();

  useEffect(() => {
    if (!open) return;
    setForm(createEmptyProductionDailyReportRegister());
    setSelectedId("");
  }, [open]);

  useEffect(() => {
    if (!open || !initialManagementId) return;
    const record = pendingRequests.find((item) => item.id === initialManagementId);
    if (record) {
      setSelectedId(initialManagementId);
      onDailyReportStarted(initialManagementId);
      setForm(applyWorkRequestToForm(record));
    }
  }, [open, initialManagementId, pendingRequests]);

  const handleSelectWorkRequest = (managementId) => {
    setSelectedId(managementId);
    const record = pendingRequests.find((item) => item.id === managementId);
    if (record) {
      onDailyReportStarted(managementId);
      setForm(applyWorkRequestToForm(record));
    }
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.managementId.trim()) return;

    const existing = getSessionProductionRecords().find((r) => r.id === form.managementId.trim());
    const lotCheck = validateLotNoForDailyReportRegister(form.lotNo, existing);
    if (!lotCheck.ok) {
      window.alert(lotCheck.message);
      return;
    }

    onRegister({ ...form, lotNo: lotCheck.lotNo });
    onClose();
  };

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      kicker="생산관리"
      title={PRODUCTION_DAILY_REGISTER_LABEL}
      titleId="daily-report-modal-title"
      size="wide"
    >
      <div className="titan-modal__section">
        <p className="titan-modal__section-title">열처리 작업 요청 리스트 (미작성)</p>
        {pendingRequests.length === 0 ? (
          <p className="titan-modal__hint">
            작업 요청 리스트 출력 후 등록 가능한 항목이 없습니다.
          </p>
        ) : (
          <label className="titan-modal__field titan-modal__field--full">
            <span>작업 선택</span>
            <select
              value={selectedId}
              onChange={(e) => handleSelectWorkRequest(e.target.value)}
            >
              <option value="">작업 요청 리스트 선택</option>
              {pendingRequests.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.htlNo} · {record.id} · {record.company} · {record.partName}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {selectedId ? (
        <>
          <div className="titan-register-summary titan-modal__section">
            <p>
              HTL 번호
              <br />
              {form.htlNo || "—"}
            </p>
            <p>
              관리번호
              <br />
              {form.managementId}
            </p>
            <p>
              {form.company} · {form.partName} · {form.partNo}
            </p>
          </div>

          <div className="titan-modal__grid">
            <label className="titan-modal__field">
              <span>LOT.NO</span>
              <Input
                value={form.lotNo}
                onChange={(e) => updateField("lotNo", e.target.value)}
                placeholder="예: 26060206-3S2A"
              />
            </label>
            <label className="titan-modal__field">
              <span>업체명</span>
              <select value={form.company} onChange={(e) => updateField("company", e.target.value)}>
                <option value="">업체 선택</option>
                {companyOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="titan-modal__field">
              <span>품명</span>
              <Input
                value={form.partName}
                onChange={(e) => updateField("partName", e.target.value)}
              />
            </label>
            <label className="titan-modal__field">
              <span>품번</span>
              <Input
                value={form.partNo}
                onChange={(e) => updateField("partNo", e.target.value)}
              />
            </label>
            <label className="titan-modal__field">
              <span>재질</span>
              <Input value={form.material} readOnly disabled />
            </label>
            <label className="titan-modal__field">
              <span>수량</span>
              <Input value={form.qty} readOnly disabled />
            </label>
            <label className="titan-modal__field">
              <span>공정</span>
              <select value={form.process} onChange={(e) => updateField("process", e.target.value)}>
                <option value="">선택</option>
                {processCodes.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
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
              <span>열처리 조건</span>
              <Input
                value={form.heatTreatmentConditions}
                onChange={(e) => updateField("heatTreatmentConditions", e.target.value)}
                placeholder="열처리 조건"
              />
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
        </>
      ) : null}
    </TitanRegisterModal>
  );
}
