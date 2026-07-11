import { useCallback, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SecondaryButton } from "../../foundation/components/Button";
import HardnessConversionHint from "./HardnessConversionHint";
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

const CELL_ORDER = ["depth", "hv"];

function focusCell(refs, rowId, cellKey) {
  refs.current[`${rowId}:${cellKey}`]?.focus();
}

export default function HardeningDepthDataTable({
  rows = [],
  editable = false,
  tableClass = "ir-table",
  spec = null,
  onChange,
  onLoadPrevious,
  canLoadPrevious = false,
}) {
  const cellRefs = useRef({});

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
      window.setTimeout(() => focusCell(cellRefs, added.id, "depth"), 0);
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

  const navigateCell = (rowId, cellKey, direction) => {
    const normalized = normalizeHardeningDepthRows(rows);
    const rowIndex = normalized.findIndex((row) => row.id === rowId);
    if (rowIndex < 0) return;

    const cellIndex = CELL_ORDER.indexOf(cellKey);
    if (cellIndex < 0) return;

    if (direction === "next") {
      if (cellIndex < CELL_ORDER.length - 1) {
        focusCell(cellRefs, rowId, CELL_ORDER[cellIndex + 1]);
        return;
      }
      if (rowIndex < normalized.length - 1) {
        focusCell(cellRefs, normalized[rowIndex + 1].id, CELL_ORDER[0]);
        return;
      }
      handleAddRow();
      return;
    }

    if (direction === "prev") {
      if (cellIndex > 0) {
        focusCell(cellRefs, rowId, CELL_ORDER[cellIndex - 1]);
        return;
      }
      if (rowIndex > 0) {
        const prevRow = normalized[rowIndex - 1];
        focusCell(cellRefs, prevRow.id, prevRow.isCore ? "hv" : "hv");
      }
      return;
    }

    if (direction === "down" && rowIndex < normalized.length - 1) {
      focusCell(cellRefs, normalized[rowIndex + 1].id, cellKey);
      return;
    }

    if (direction === "up" && rowIndex > 0) {
      focusCell(cellRefs, normalized[rowIndex - 1].id, cellKey);
    }
  };

  const handleCellKeyDown = (rowId, cellKey, rowIndex, event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      navigateCell(rowId, cellKey, event.shiftKey ? "prev" : "next");
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (cellKey === "hv") {
        const normalized = normalizeHardeningDepthRows(rows);
        if (rowIndex === normalized.length - 1) {
          handleAddRow();
          return;
        }
        focusCell(cellRefs, normalized[rowIndex + 1].id, "depth");
        return;
      }
      navigateCell(rowId, cellKey, "next");
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      navigateCell(rowId, cellKey, "down");
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      navigateCell(rowId, cellKey, "up");
    }
  };

  const normalizedRows = normalizeHardeningDepthRows(rows);

  const coreEligibleIndex = (() => {
    if (normalizedRows.length === 0) return -1;
    for (let index = normalizedRows.length - 1; index >= 0; index -= 1) {
      const row = normalizedRows[index];
      const hasData =
        row.isCore ||
        String(row.hv ?? "").trim() !== "" ||
        String(row.depth ?? "").trim() !== "";
      if (hasData) return index;
    }
    return normalizedRows.length - 1;
  })();

  return (
    <div className="ir-hv-editor" onPaste={handlePaste}>
      {editable ? (
        <div className="ir-hv-editor__toolbar">
          <SecondaryButton type="button" onClick={handleAddRow}>
            <Plus size={14} aria-hidden="true" />
            행 추가
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
          <span className="ir-hv-editor__hint">
            Tab/Shift+Tab · Enter · 화살표 이동 · Ctrl+V 붙여넣기
          </span>
        </div>
      ) : null}

      <div className="ir-hv-table-wrap">
        <table className={`${tableClass} ir-hv-rows-table`}>
          <thead>
            <tr>
              <th>거리(mm)</th>
              <th>HV</th>
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
                          cellRefs.current[`${row.id}:depth`] = node;
                        }}
                        type="text"
                        className="ir-field-input ir-hv-row-input"
                        value={row.depth}
                        onChange={(event) => handleDepthChange(row.id, event.target.value)}
                        onKeyDown={(event) => handleCellKeyDown(row.id, "depth", index, event)}
                        placeholder="0.05"
                      />
                    ) : (
                      row.isCore ? "CORE" : row.depth || "—"
                    )}
                  </td>
                  <td>
                    {editable ? (
                      <div className="ir-hardness-measured-cell">
                        <input
                          ref={(node) => {
                            cellRefs.current[`${row.id}:hv`] = node;
                          }}
                          type="number"
                          className="ir-field-input ir-hv-row-input"
                          value={row.hv === "" ? "" : row.hv}
                          onChange={(event) => handleHvChange(row.id, event.target.value)}
                          onKeyDown={(event) => handleCellKeyDown(row.id, "hv", index, event)}
                          placeholder="입력"
                        />
                        <HardnessConversionHint
                          value={row.hv}
                          fromUnit="HV"
                          spec={spec}
                          targetUnits={["HRC"]}
                          maxTargets={1}
                        />
                      </div>
                    ) : (
                      row.hv === "" ? "—" : row.hv
                    )}
                  </td>
                  {editable ? (
                    <td className="ir-hv-rows-table__core">
                      <label className={index !== coreEligibleIndex ? "ir-hv-rows-table__core--disabled" : ""}>
                        <input
                          type="checkbox"
                          checked={row.isCore}
                          disabled={index !== coreEligibleIndex}
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
