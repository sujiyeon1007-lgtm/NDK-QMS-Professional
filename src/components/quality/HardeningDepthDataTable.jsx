import { useCallback, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SecondaryButton } from "../../foundation/components/Button";
import {
  HARDENING_DEPTH_TEMPLATES,
  addHardeningDepthRow,
  applyHardeningDepthRows,
  normalizeHardeningDepthRows,
  parseHardeningDepthPaste,
  rowsFromTemplate,
  removeHardeningDepthRow,
  updateHardeningDepthRow,
} from "../../utils/hardeningDepthModel";

export default function HardeningDepthDataTable({
  rows = [],
  editable = false,
  tableClass = "ir-table",
  onChange,
  onLoadPrevious,
  canLoadPrevious = false,
}) {
  const depthRefs = useRef({});
  const hvRefs = useRef({});

  const emitRows = useCallback(
    (nextRows) => {
      onChange?.(applyHardeningDepthRows({}, nextRows));
    },
    [onChange]
  );

  const handleDepthChange = (rowId, value) => {
    emitRows(updateHardeningDepthRow(rows, rowId, { depth: value, isCore: false }));
  };

  const handleHvChange = (rowId, value) => {
    emitRows(updateHardeningDepthRow(rows, rowId, { hv: value }));
  };

  const handleCoreToggle = (rowId, checked) => {
    emitRows(
      updateHardeningDepthRow(rows, rowId, {
        isCore: checked,
        depth: checked ? "CORE" : "",
      })
    );
  };

  const handleDelete = (rowId) => {
    emitRows(removeHardeningDepthRow(rows, rowId));
  };

  const handleAddRow = () => {
    const nextRows = addHardeningDepthRow(rows);
    emitRows(nextRows);
    const added = nextRows[nextRows.length - 1];
    if (added?.id) {
      window.setTimeout(() => depthRefs.current[added.id]?.focus(), 0);
    }
  };

  const handleTemplateChange = (event) => {
    const templateId = event.target.value;
    if (!templateId) return;
    emitRows(rowsFromTemplate(templateId));
    event.target.value = "";
  };

  const handlePaste = (event) => {
    if (!editable) return;
    const text = event.clipboardData?.getData("text/plain");
    if (!text?.trim()) return;
    const parsed = parseHardeningDepthPaste(text);
    if (parsed.length === 0) return;
    event.preventDefault();
    emitRows(parsed);
  };

  const handleHvKeyDown = (rowId, rowIndex, event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const normalized = normalizeHardeningDepthRows(rows);
    if (rowIndex === normalized.length - 1) {
      handleAddRow();
      return;
    }
    const nextRow = normalized[rowIndex + 1];
    if (nextRow?.id) {
      hvRefs.current[nextRow.id]?.focus();
    }
  };

  const normalizedRows = normalizeHardeningDepthRows(rows);

  return (
    <div className="ir-hv-editor" onPaste={handlePaste}>
      {editable ? (
        <div className="ir-hv-editor__toolbar">
          <SecondaryButton type="button" onClick={handleAddRow}>
            <Plus size={14} aria-hidden="true" />
            깊이 추가
          </SecondaryButton>
          <label className="ir-hv-editor__template">
            <span>측정 포인트 템플릿</span>
            <select defaultValue="" onChange={handleTemplateChange}>
              <option value="">템플릿 선택</option>
              {Object.values(HARDENING_DEPTH_TEMPLATES).map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
          </label>
          {canLoadPrevious ? (
            <SecondaryButton type="button" onClick={onLoadPrevious}>
              이전 데이터 불러오기
            </SecondaryButton>
          ) : null}
          <span className="ir-hv-editor__hint">Ctrl+V 붙여넣기 · Enter로 다음 행 추가</span>
        </div>
      ) : null}

      <div className="ir-hv-table-wrap">
        <table className={`${tableClass} ir-hv-rows-table`}>
          <thead>
            <tr>
              <th>깊이(mm)</th>
              <th>Hv</th>
              {editable ? <th>CORE</th> : null}
              {editable ? <th>삭제</th> : null}
            </tr>
          </thead>
          <tbody>
            {normalizedRows.length === 0 ? (
              <tr>
                <td colSpan={editable ? 4 : 2} className="ir-hv-rows-table__empty">
                  {editable
                    ? "측정 데이터를 입력하거나 템플릿/붙여넣기를 사용하세요."
                    : "—"}
                </td>
              </tr>
            ) : (
              normalizedRows.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    {editable && !row.isCore ? (
                      <input
                        ref={(node) => {
                          depthRefs.current[row.id] = node;
                        }}
                        type="text"
                        className="ir-field-input ir-hv-row-input"
                        value={row.depth}
                        onChange={(event) => handleDepthChange(row.id, event.target.value)}
                        placeholder="0.05"
                      />
                    ) : (
                      row.isCore ? "CORE" : row.depth || "—"
                    )}
                  </td>
                  <td>
                    {editable ? (
                      <input
                        ref={(node) => {
                          hvRefs.current[row.id] = node;
                        }}
                        type="number"
                        className="ir-field-input ir-hv-row-input"
                        value={row.hv === "" ? "" : row.hv}
                        onChange={(event) => handleHvChange(row.id, event.target.value)}
                        onKeyDown={(event) => handleHvKeyDown(row.id, index, event)}
                        placeholder="입력"
                      />
                    ) : (
                      row.hv === "" ? "—" : row.hv
                    )}
                  </td>
                  {editable ? (
                    <td className="ir-hv-rows-table__core">
                      <label>
                        <input
                          type="checkbox"
                          checked={row.isCore}
                          onChange={(event) => handleCoreToggle(row.id, event.target.checked)}
                        />
                        CORE
                      </label>
                    </td>
                  ) : null}
                  {editable ? (
                    <td>
                      <button
                        type="button"
                        className="ir-hv-row-delete"
                        onClick={() => handleDelete(row.id)}
                        aria-label="행 삭제"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        삭제
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
