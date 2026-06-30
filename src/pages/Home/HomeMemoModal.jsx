import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Save } from "lucide-react";
import "./HomeMemoModal.css";

const emptyForm = { title: "", time: "" };

function getDefaultTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function HomeMemoModal({ mode, variant, initialItem, onSave, onClose }) {
  const [form, setForm] = useState(() =>
    initialItem
      ? { title: initialItem.title ?? "", time: initialItem.time === "메모" ? "" : initialItem.time ?? "" }
      : { ...emptyForm, time: getDefaultTime() }
  );
  const [error, setError] = useState("");

  const title =
    mode === "edit"
      ? variant === "quality"
        ? "이슈 수정"
        : "알림 메모 수정"
      : variant === "quality"
        ? "이슈 추가"
        : "알림 메모 추가";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("home-memo-modal-open");
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("home-memo-modal-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("내용을 입력하세요.");
      return;
    }
    onSave({ title: form.title.trim(), time: form.time.trim() });
  };

  return createPortal(
    <div className="home-memo-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="home-memo-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-memo-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="home-memo-modal-header">
          <h2 id="home-memo-modal-title">{title}</h2>
          <button type="button" className="home-memo-modal-close" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>

        <form className="home-memo-modal-body" onSubmit={handleSubmit}>
          <label className="home-memo-field">
            <span>내용</span>
            <textarea
              rows={3}
              value={form.title}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, title: e.target.value }));
                setError("");
              }}
              placeholder={
                variant === "quality"
                  ? "예) SCR420 경도 편차 발생"
                  : "예) 금일 고객 입회 예정"
              }
              autoFocus
            />
          </label>

          <label className="home-memo-field">
            <span>시간 (선택)</span>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
            />
          </label>

          {error && <p className="home-memo-error">{error}</p>}

          <div className="home-memo-modal-actions">
            <button type="button" className="home-memo-btn ghost" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="home-memo-btn primary">
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

export default HomeMemoModal;
