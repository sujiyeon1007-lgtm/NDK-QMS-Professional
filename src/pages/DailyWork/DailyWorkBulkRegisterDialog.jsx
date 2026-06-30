function DailyWorkBulkRegisterDialog({ open, count, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="daily-work-dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="daily-work-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-bulk-register-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="daily-bulk-register-title">생산일보 일괄 등록</h3>
        <p>
          선택한 {count}개의 제품을
          <br />
          동시에 생산일보 등록하시겠습니까?
        </p>
        <div className="daily-work-dialog-actions">
          <button type="button" className="daily-work-dialog-btn" onClick={onClose}>
            취소
          </button>
          <button type="button" className="daily-work-dialog-btn primary" onClick={onConfirm}>
            등록
          </button>
        </div>
      </div>
    </div>
  );
}

export default DailyWorkBulkRegisterDialog;
