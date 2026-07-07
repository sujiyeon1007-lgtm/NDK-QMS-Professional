import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Save } from "lucide-react";
import {
  MANUAL_JOURNAL_CATEGORIES,
  getJournalReferenceDate,
} from "../../utils/workJournalData";
import {
  resolveAssigneeWorkerOptions,
  resolveDefaultAssigneeFromAuth,
} from "../../utils/titanAssigneeResolver";
import "./WorkJournalEntryModal.css";

const emptyForm = {
  date: getJournalReferenceDate(),
  time: "",
  category: MANUAL_JOURNAL_CATEGORIES[0],
  title: "",
  assignee: resolveDefaultAssigneeFromAuth(),
  company: "",
  managementId: "",
  lotNo: "",
  note: "",
};

function getDefaultTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function getInitialForm(initialEntry, defaultCategory = MANUAL_JOURNAL_CATEGORIES[0]) {
  if (!initialEntry) {
    return { ...emptyForm, time: getDefaultTime(), assignee: resolveDefaultAssigneeFromAuth(), category: defaultCategory };
  }
  return {
    date: initialEntry.date ?? getJournalReferenceDate(),
    time: initialEntry.time ?? "",
    category: initialEntry.category ?? defaultCategory,
    title: initialEntry.title ?? "",
    assignee: initialEntry.assignee ?? resolveDefaultAssigneeFromAuth(),
    company: initialEntry.company ?? "",
    managementId: initialEntry.managementId ?? "",
    lotNo: initialEntry.lotNo ?? "",
    note: initialEntry.note ?? "",
  };
}

function WorkJournalEntryModal({ mode, initialEntry, manualCategories = MANUAL_JOURNAL_CATEGORIES, onSave, onClose }) {
  const defaultCategory = manualCategories[0] ?? MANUAL_JOURNAL_CATEGORIES[0];
  const [form, setForm] = useState(() => getInitialForm(initialEntry, defaultCategory));
  const [error, setError] = useState("");
  const isAuto = initialEntry?.source === "auto";
  const workerOptions = resolveAssigneeWorkerOptions();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("wj-modal-open");
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("wj-modal-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("업무내용을 입력하세요.");
      return;
    }
    if (!form.time.trim()) {
      setError("시간을 입력하세요.");
      return;
    }
    if (!form.assignee.trim()) {
      setError("담당자를 선택하세요.");
      return;
    }
    onSave(form);
  };

  const title = mode === "edit" ? "업무 수정" : "업무 수동 등록";

  return createPortal(
    <div className="wj-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="wj-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wj-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="wj-modal-header">
          <div>
            <p className="wj-modal-kicker">Work Journal</p>
            <h2 id="wj-modal-title">{title}</h2>
          </div>
          <button type="button" className="wj-modal-close" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>

        <form className="wj-modal-body" onSubmit={handleSubmit}>
          <div className="wj-form-row">
            <label className="wj-field">
              <span>날짜</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
              />
            </label>
            <label className="wj-field">
              <span>시간</span>
              <input
                type="time"
                value={form.time}
                onChange={(e) => updateField("time", e.target.value)}
              />
            </label>
          </div>

          <label className="wj-field">
            <span>담당자</span>
            <select
              value={form.assignee}
              onChange={(e) => updateField("assignee", e.target.value)}
              disabled={isAuto}
            >
              <option value="">담당자 선택</option>
              {workerOptions.map((worker) => (
                <option key={worker.id} value={worker.name}>
                  {worker.name}
                  {worker.department ? ` · ${worker.department}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="wj-field">
            <span>업무구분</span>
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              disabled={isAuto}
            >
              {(isAuto ? [form.category] : manualCategories).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label className="wj-field">
            <span>업무내용</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="수행한 업무를 입력하세요"
              autoFocus
            />
          </label>

          <div className="wj-form-row">
            <label className="wj-field">
              <span>업체</span>
              <input
                type="text"
                value={form.company}
                onChange={(e) => updateField("company", e.target.value)}
              />
            </label>
            <label className="wj-field">
              <span>관리번호 (선택)</span>
              <input
                type="text"
                value={form.managementId}
                onChange={(e) => updateField("managementId", e.target.value)}
              />
            </label>
          </div>

          <label className="wj-field">
            <span>LOT (선택)</span>
            <input
              type="text"
              value={form.lotNo}
              onChange={(e) => updateField("lotNo", e.target.value)}
            />
          </label>

          <label className="wj-field">
            <span>비고</span>
            <textarea
              rows={3}
              value={form.note}
              onChange={(e) => updateField("note", e.target.value)}
              placeholder="추가 메모"
            />
          </label>

          {error && <p className="wj-form-error">{error}</p>}

          <div className="wj-modal-actions">
            <button type="button" className="wj-btn ghost" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="wj-btn primary">
              <Save size={15} />
              저장
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default WorkJournalEntryModal;
