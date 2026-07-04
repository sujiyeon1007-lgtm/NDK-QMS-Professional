import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import { addHomeNotice, getHomeNoticeAuthorDefault } from "../../utils/homeNoticesSession";
import "./HomeTaskModal.css";

export default function HomeNoticeRegisterModal({ onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author] = useState(() => getHomeNoticeAuthorDefault());
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

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    const result = addHomeNotice({ title, body, author });
    if (!result.ok) {
      setError(result.message ?? "등록에 실패했습니다.");
      return;
    }
    onSave?.(result.notice);
    onClose();
  };

  return createPortal(
    <div className="home-task-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="home-task-modal home-notice-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-notice-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="home-task-modal-header">
          <h2 id="home-notice-modal-title">공지 등록</h2>
          <button type="button" className="home-task-modal-close" onClick={onClose} aria-label="닫기">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <form className="home-task-modal-body" onSubmit={handleSubmit}>
          <label className="home-task-field">
            <span>제목</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공지 제목"
              autoFocus
            />
          </label>

          <label className="home-task-field">
            <span>내용</span>
            <textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="공지 내용"
            />
          </label>

          <label className="home-task-field">
            <span>작성자</span>
            <input type="text" value={author} readOnly aria-readonly="true" />
          </label>

          {error ? <p className="home-task-error">{error}</p> : null}

          <div className="home-task-modal-actions">
            <SecondaryButton type="button" onClick={onClose}>
              취소
            </SecondaryButton>
            <PrimaryButton type="submit">등록</PrimaryButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
