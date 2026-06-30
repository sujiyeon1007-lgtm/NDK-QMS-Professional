function ProductionPlanLotCancelDialog({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="production-plan-dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="production-plan-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lot-cancel-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="lot-cancel-title">LOT 취소</h3>
        <p>
          선택한 LOT를 취소하시겠습니까?
          <br />
          취소된 LOT는 생산작업계획 대기목록으로 복원됩니다.
        </p>
        <div className="production-plan-dialog-actions">
          <button type="button" className="production-plan-dialog-btn" onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className="production-plan-dialog-btn danger"
            onClick={onConfirm}
          >
            LOT 취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductionPlanLotCancelDialog;
