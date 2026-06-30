import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Save } from "lucide-react";
import { HOME_TASK_PRIORITIES } from "../../utils/homeTasksSession";
import { getCurrentTitanUser } from "../../utils/titanHistorySession";
import "./HomeTaskModal.css";

const emptyForm = {
  title: "",
  assignee: getCurrentTitanUser(),
  time: "",
  priority: "normal",
  memo: "",
};

function getInitialForm(initialTask) {
  if (!initialTask) {
    return { ...emptyForm };
  }
  return {
    title: initialTask.title ?? "",
    assignee: initialTask.assignee ?? getCurrentTitanUser(),
    time: initialTask.time ?? "",
    priority: initialTask.priority ?? "normal",
    memo: initialTask.memo ?? "",
  };
}

function HomeTaskModal({ mode, initialTask, onSave, onClose }) {
  const [form, setForm] = useState(() => getInitialForm(initialTask));
  const [error, setError] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("home-task-modal-open");
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("home-task-modal-open");
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
      setError("내용을 입력하세요.");
      return;
    }
    onSave({
      title: form.title.trim(),
      assignee: form.assignee.trim(),
      time: form.time.trim(),
      priority: form.priority,
      memo: form.memo.trim(),
    });
  };

  const title = mode === "edit" ? "할 일 수정" : "할 일 추가";

  return createPortal(
    <div className="home-task-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="home-task-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-task-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="home-task-modal-header">
          <h2 id="home-task-modal-title">{title}</h2>
          <button type="button" className="home-task-modal-close" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>

        <form className="home-task-modal-body" onSubmit={handleSubmit}>
          <label className="home-task-field">
            <span>제목</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="진행 업무를 입력하세요"
              autoFocus
            />
          </label>

          <label className="home-task-field">
            <span>담당자</span>
            <input
              type="text"
              value={form.assignee}
              onChange={(e) => updateField("assignee", e.target.value)}
              placeholder="담당자 입력"
            />
          </label>

          <label className="home-task-field">
            <span>예정 시간</span>
            <input
              type="time"
              value={form.time}
              onChange={(e) => updateField("time", e.target.value)}
            />
          </label>

          <fieldset className="home-task-field home-task-priority">
            <legend>우선순위</legend>
            <div className="home-task-priority-options">
              {HOME_TASK_PRIORITIES.map(({ value, label }) => (
                <label key={value} className={`priority-option ${value}`}>
                  <input
                    type="radio"
                    name="priority"
                    value={value}
                    checked={form.priority === value}
                    onChange={() => updateField("priority", value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="home-task-field">
            <span>메모</span>
            <textarea
              rows={3}
              value={form.memo}
              onChange={(e) => updateField("memo", e.target.value)}
              placeholder="상세 메모를 입력하세요"
            />
          </label>

          {error && <p className="home-task-error">{error}</p>}

          <div className="home-task-modal-actions">
            <button type="button" className="home-task-btn ghost" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="home-task-btn primary">
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

export default HomeTaskModal;
