import { SecondaryButton } from "./Button";

/**
 * 리스트 마지막 컬럼 [작업] — [상세] + 페이지별 추가 버튼
 */
export default function TitanTableRowActions({ onDetail, children, detailDisabled = false }) {
  return (
    <div className="titan-table-row-actions">
      <SecondaryButton
        type="button"
        className="titan-btn--table-action"
        disabled={detailDisabled}
        onClick={(event) => {
          event.stopPropagation();
          if (!detailDisabled) onDetail?.();
        }}
      >
        상세
      </SecondaryButton>
      {children}
    </div>
  );
}
