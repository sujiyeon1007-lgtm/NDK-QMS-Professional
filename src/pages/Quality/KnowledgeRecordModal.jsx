import { useEffect, useMemo, useState } from "react";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import { KR_INSPECTION_FIELDS, KR_RESULT_OPTIONS } from "../../config/knowledgeRecordModel";
import {
  getActualWorkRecordsForKnowledge,
  resolveKnowledgeTemplateLabel,
} from "../../utils/knowledgeRecordStore";
import { getActualWorkRecordById } from "../../utils/actualWorkRecordStore";

function buildInspectionState(source) {
  const values = source && typeof source === "object" ? source : {};
  const out = {};
  KR_INSPECTION_FIELDS.forEach((field) => {
    out[field.key] = values[field.key] ?? "";
  });
  return out;
}

function buildInitialForm(initialRow) {
  if (initialRow) {
    return {
      actualWorkRecordId: initialRow.actualWorkRecordId ?? "",
      company: initialRow.company ?? "",
      partNo: initialRow.partNo ?? "",
      partName: initialRow.partName ?? "",
      quantity: initialRow.quantity ?? "",
      inspectionResult: buildInspectionState(initialRow.inspectionResult),
      result: initialRow.result ?? "PASS",
      inspectorName: initialRow.inspectorName ?? "",
      inspectedAt: initialRow.inspectedAt ?? "",
      knowledgeMemo: initialRow.knowledgeMemo ?? "",
    };
  }
  return {
    actualWorkRecordId: "",
    company: "",
    partNo: "",
    partName: "",
    quantity: "",
    inspectionResult: buildInspectionState(null),
    result: "PASS",
    inspectorName: "",
    inspectedAt: "",
    knowledgeMemo: "",
  };
}

/**
 * Sprint 9 Phase 4 · Knowledge Record 등록/수정 모달
 * 완료된 실제 작업 기록(Actual Work Record) 선택 + 검사 결과 입력.
 * Recipe Snapshot · Actual Snapshot은 선택 작업기록에서 자동 복사됩니다 (재사용).
 */
export default function KnowledgeRecordModal({ open, onClose, onSave, mode = "add", initialRow = null }) {
  const [form, setForm] = useState(() => buildInitialForm(initialRow));
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(initialRow));
      setError("");
    }
  }, [open, initialRow]);

  // 등록: 완료된 미귀속 작업기록. 수정: 기존 연결 작업기록도 함께 노출.
  const candidates = useMemo(() => {
    if (!open) return [];
    const list = getActualWorkRecordsForKnowledge();
    if (mode === "edit" && initialRow?.actualWorkRecordId) {
      const existing = getActualWorkRecordById(initialRow.actualWorkRecordId);
      if (existing && !list.some((row) => row.id === existing.id)) {
        return [existing, ...list];
      }
    }
    return list;
  }, [open, mode, initialRow]);

  const selectedAwr = useMemo(
    () => (form.actualWorkRecordId ? getActualWorkRecordById(form.actualWorkRecordId) : null),
    [form.actualWorkRecordId]
  );

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const updateInspection = (key, value) => {
    setForm((prev) => ({
      ...prev,
      inspectionResult: { ...prev.inspectionResult, [key]: value },
    }));
  };

  const handleSubmit = () => {
    if (!form.actualWorkRecordId) {
      setError("완료된 실제 작업 기록을 선택하세요.");
      return;
    }
    onSave(form);
  };

  if (!open) return null;

  return (
    <TitanRegisterModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      kicker="Knowledge Record"
      title={mode === "edit" ? "기술 데이터 수정" : "기술 데이터 등록"}
      submitLabel={mode === "edit" ? "수정" : "등록"}
    >
      {error ? (
        <p className="master-register-modal__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="awr-modal__section">
        <h4 className="awr-modal__subtitle">실제 작업 기록 (완료 · Snapshot 복사)</h4>
        <div className="master-register-modal__grid">
          <label className="master-register-modal__field span-2">
            <span>완료된 작업 기록 *</span>
            <select
              value={form.actualWorkRecordId}
              onChange={(event) => updateField("actualWorkRecordId", event.target.value)}
              disabled={mode === "edit"}
            >
              <option value="">선택</option>
              {candidates.map((awr) => (
                <option key={awr.id} value={awr.id}>
                  {awr.lotNo} · {awr.recipeName} · {awr.processName}
                </option>
              ))}
            </select>
          </label>
          {selectedAwr ? (
            <div className="awr-modal__ref span-2">
              표준 Recipe <strong>{selectedAwr.recipeName || "—"}</strong> ·{" "}
              {resolveKnowledgeTemplateLabel(selectedAwr)} · Version{" "}
              <strong>{selectedAwr.recipeVersionNo || "V1"}</strong>
              <em> — 표준/실제 조건은 작업기록 Snapshot으로 저장됩니다.</em>
            </div>
          ) : (
            <p className="awr-modal__hint span-2">
              완료된 작업 기록이 없으면 실제 작업 조건(Phase 3)에서 상태를 완료로 변경하세요.
            </p>
          )}
        </div>
      </div>

      <div className="awr-modal__section">
        <h4 className="awr-modal__subtitle">제품 · 귀속 정보</h4>
        <div className="master-register-modal__grid">
          <label className="master-register-modal__field">
            <span>업체</span>
            <input
              type="text"
              value={form.company}
              onChange={(event) => updateField("company", event.target.value)}
              placeholder="예) 서암기계공업"
            />
          </label>
          <label className="master-register-modal__field">
            <span>품명</span>
            <input
              type="text"
              value={form.partName}
              onChange={(event) => updateField("partName", event.target.value)}
              placeholder="예) 샤프트"
            />
          </label>
          <label className="master-register-modal__field">
            <span>품번</span>
            <input
              type="text"
              value={form.partNo}
              onChange={(event) => updateField("partNo", event.target.value)}
              placeholder="예) SA-4032"
            />
          </label>
          <label className="master-register-modal__field">
            <span>수량</span>
            <input
              type="text"
              value={form.quantity}
              onChange={(event) => updateField("quantity", event.target.value)}
              placeholder="예) 120"
            />
          </label>
        </div>
      </div>

      <div className="awr-modal__section">
        <h4 className="awr-modal__subtitle">검사 결과 (Inspection Result)</h4>
        <div className="master-register-modal__grid">
          {KR_INSPECTION_FIELDS.map((field) => (
            <label key={field.key} className="master-register-modal__field">
              <span>
                {field.label}
                {field.unit ? ` (${field.unit})` : ""}
              </span>
              <input
                type="text"
                value={form.inspectionResult[field.key] ?? ""}
                onChange={(event) => updateInspection(field.key, event.target.value)}
                placeholder="측정값"
              />
            </label>
          ))}
          <label className="master-register-modal__field">
            <span>판정</span>
            <select value={form.result} onChange={(event) => updateField("result", event.target.value)}>
              {KR_RESULT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="master-register-modal__field">
            <span>검사자</span>
            <input
              type="text"
              value={form.inspectorName}
              onChange={(event) => updateField("inspectorName", event.target.value)}
              placeholder="예) 박검사"
            />
          </label>
          <label className="master-register-modal__field">
            <span>검사일시</span>
            <input
              type="text"
              value={form.inspectedAt}
              onChange={(event) => updateField("inspectedAt", event.target.value)}
              placeholder="예) 2026-07-08 16:00"
            />
          </label>
          <label className="master-register-modal__field span-2">
            <span>기술 메모</span>
            <textarea
              rows={2}
              value={form.knowledgeMemo}
              onChange={(event) => updateField("knowledgeMemo", event.target.value)}
              placeholder="기술 데이터 특이사항"
            />
          </label>
        </div>
      </div>
    </TitanRegisterModal>
  );
}
