import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FileSpreadsheet, RotateCcw, Upload, X } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import {
  getMasterExcelConfig,
  MASTER_EXCEL_STEP_LABELS,
} from "../../config/masterExcelImport";
import {
  analyzeMasterImport,
  executeMasterImport,
  formatMasterChangeSummary,
  parseMasterExcelFile,
} from "../../utils/masterExcelImport";
import { canUndoMasterImport, undoLastMasterImport } from "../../utils/masterExcelImportLog";

const STEPS = ["select", "preview", "validation", "duplicate", "importing", "result"];

function formatCellValue(key, value) {
  if (value == null || value === "") return "—";
  if (key === "unitPrice") return Number(value).toLocaleString();
  return String(value);
}

function mapPreviewRow(row, columns) {
  const payload = row.payload ?? {};
  const mapped = {
    id: String(row.rowIndex),
    rowIndex: row.rowIndex,
    statusLabel: row.valid ? "정상" : row.errors?.join(", "),
  };
  columns.forEach((col) => {
    mapped[col.key] = formatCellValue(col.key, payload[col.key]);
  });
  return mapped;
}

function buildPreviewColumns(config) {
  return [
    { key: "rowIndex", label: "행", widthPercent: 6 },
    ...config.columns.map((col) => ({
      key: col.key,
      label: col.exportLabel ?? col.labels[0],
      widthPercent: col.widthPercent ?? 12,
    })),
  ];
}

export default function MasterExcelImportModal({ masterType, open, onClose, onComplete }) {
  const config = getMasterExcelConfig(masterType);

  const [step, setStep] = useState("select");
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [conflictPolicy, setConflictPolicy] = useState("keep");
  const [importResult, setImportResult] = useState(null);
  const [parseError, setParseError] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [undoAvailable, setUndoAvailable] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("titan-modal-open");
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape" && step !== "importing") onClose();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("titan-modal-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, step]);

  useEffect(() => {
    if (!open) {
      setStep("select");
      setFileName("");
      setParsedRows([]);
      setAnalysis(null);
      setConflictPolicy("keep");
      setImportResult(null);
      setParseError("");
      setIsParsing(false);
      setImportProgress({ current: 0, total: 0, percent: 0 });
      setUndoAvailable(canUndoMasterImport(masterType));
    }
  }, [open, masterType]);

  const previewColumns = useMemo(
    () => (config ? buildPreviewColumns(config) : []),
    [config]
  );

  const previewRows = useMemo(
    () => (config ? parsedRows.map((row) => mapPreviewRow(row, config.columns)) : []),
    [parsedRows, config]
  );

  if (!open || !config) return null;

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setParseError("");
    setIsParsing(true);
    const parsed = await parseMasterExcelFile(masterType, file);
    setIsParsing(false);

    if (!parsed.ok) {
      setParseError(parsed.message);
      return;
    }

    setFileName(parsed.fileName);
    setParsedRows(parsed.rows);
    setAnalysis(analyzeMasterImport(masterType, parsed.rows));
    setStep("preview");
  };

  const handleExecuteImport = async () => {
    if (!analysis) return;
    setStep("importing");
    setImportProgress({ current: 0, total: 0, percent: 0 });

    const result = await executeMasterImport(analysis, {
      masterType,
      conflictPolicy,
      fileName,
      onProgress: setImportProgress,
    });

    setImportResult(result);
    setUndoAvailable(canUndoMasterImport(masterType));
    setStep("result");
    onComplete?.(result);
  };

  const handleUndo = () => {
    const undone = undoLastMasterImport(masterType, config.categoryKey);
    if (undone.ok) {
      setUndoAvailable(false);
      onComplete?.({ undone: true });
    }
  };

  const stepIndex = STEPS.indexOf(step);
  const conflictCount = analysis?.keyConflicts?.length ?? 0;
  const conflictLabel = masterType === "products" ? "업체·품번 중복" : "키 중복";

  return createPortal(
    <div className="titan-modal-overlay" role="presentation" onClick={step === "importing" ? undefined : onClose}>
      <div
        className="titan-modal titan-modal--wide master-excel-import-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="master-excel-import-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="titan-modal__header">
          <div>
            <p className="titan-modal__kicker">{config.kicker}</p>
            <h2 id="master-excel-import-title">Excel 가져오기</h2>
          </div>
          <button
            type="button"
            className="titan-modal__close"
            onClick={onClose}
            aria-label="닫기"
            disabled={step === "importing"}
          >
            <X size={18} />
          </button>
        </header>

        <div className="titan-modal__body master-excel-import-modal__body">
          <ol className="master-excel-import-modal__steps" aria-label="Import 절차">
            {MASTER_EXCEL_STEP_LABELS.map((label, index) => (
              <li
                key={label}
                className={`master-excel-import-modal__step${
                  index === stepIndex ? " is-active" : index < stepIndex ? " is-done" : ""
                }`}
              >
                {label}
              </li>
            ))}
          </ol>

          {step === "select" ? (
            <section className="master-excel-import-modal__panel">
              <p className="master-excel-import-modal__desc">
                {config.title} Excel(.xlsx · .xls)을 선택하면 미리보기 · 검증 · 중복 검사 후 Import 합니다.
              </p>
              <ul className="master-excel-import-modal__columns">
                {config.columns.map((column) => (
                  <li key={column.key}>{column.exportLabel ?? column.labels[0]}</li>
                ))}
              </ul>
              <label className="master-excel-import-modal__upload">
                <FileSpreadsheet size={18} aria-hidden="true" />
                <span>{fileName || "Excel 파일 선택 (.xlsx · .xls)"}</span>
                <input
                  type="file"
                  accept={config.accept}
                  onChange={handleFileChange}
                  disabled={isParsing}
                />
              </label>
              {parseError ? <p className="master-excel-import-modal__error">{parseError}</p> : null}
              {isParsing ? <p className="master-excel-import-modal__hint">파일을 읽는 중…</p> : null}
            </section>
          ) : null}

          {step === "preview" ? (
            <section className="master-excel-import-modal__panel">
              <div className="master-excel-import-modal__summary">
                <span>파일: {fileName}</span>
                <span>총 {parsedRows.length}건</span>
                <span>신규 {analysis?.newRows?.length ?? 0}건</span>
                <span>코드 중복 {analysis?.codeDuplicates?.length ?? 0}건</span>
                <span>
                  {conflictLabel} {conflictCount}건
                </span>
              </div>
              <div className="master-excel-import-modal__table-wrap">
                <TitanDataTable columns={previewColumns} rows={previewRows.slice(0, 100)} />
              </div>
              {previewRows.length > 100 ? (
                <p className="master-excel-import-modal__hint">미리보기는 상위 100건만 표시합니다.</p>
              ) : null}
            </section>
          ) : null}

          {step === "validation" ? (
            <section className="master-excel-import-modal__panel">
              <div className="master-excel-import-modal__summary">
                <span>검증 통과 {analysis?.validCount ?? 0}건</span>
                <span>오류 {analysis?.invalidRows?.length ?? 0}건</span>
              </div>
              {analysis?.invalidRows?.length ? (
                <ul className="master-excel-import-modal__errors">
                  {analysis.invalidRows.slice(0, 50).map((row) => (
                    <li key={row.rowIndex}>
                      {row.rowIndex}행 {row.errors.join(", ")}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="master-excel-import-modal__hint">검증 오류 없음 — 중복 검사를 진행할 수 있습니다.</p>
              )}
            </section>
          ) : null}

          {step === "duplicate" ? (
            <section className="master-excel-import-modal__panel">
              {config.conflictPolicy ? (
                <div className="master-excel-import-modal__policy">
                  <p>
                    {conflictLabel} {conflictCount}건 — 처리 방식을 선택하세요.
                  </p>
                  <label>
                    <input
                      type="radio"
                      name="conflictPolicy"
                      checked={conflictPolicy === "keep"}
                      onChange={() => setConflictPolicy("keep")}
                    />
                    기존 데이터 유지
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="conflictPolicy"
                      checked={conflictPolicy === "update"}
                      onChange={() => setConflictPolicy("update")}
                    />
                    Excel 데이터로 업데이트
                  </label>
                </div>
              ) : null}

              {analysis?.codeDuplicates?.length ? (
                <div className="master-excel-import-modal__block">
                  <h3>코드 중복 — 등록하지 않음 ({analysis.codeDuplicates.length}건)</h3>
                  <ul>
                    {analysis.codeDuplicates.slice(0, 8).map((row) => (
                      <li key={`code-${row.rowIndex}`}>
                        {row.rowIndex}행 · {row.payload.code ?? "—"} · {row.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {conflictCount ? (
                <div className="master-excel-import-modal__block">
                  <h3>{conflictLabel} — 변경 비교</h3>
                  <ul className="master-excel-import-modal__changes">
                    {analysis.keyConflicts.slice(0, 12).map((row) => (
                      <li key={`conflict-${row.rowIndex}`}>
                        <strong>
                          {row.rowIndex}행 ·{" "}
                          {masterType === "products"
                            ? `${row.payload.company} · ${row.payload.partNo}`
                            : row.payload.code}
                        </strong>
                        <span>{formatMasterChangeSummary(row.changes)}</span>
                        {row.changes?.length ? (
                          <em>
                            {row.changes
                              .map((change) => `${change.label}: ${change.from ?? "—"} → ${change.to ?? "—"}`)
                              .join(" / ")}
                          </em>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="master-excel-import-modal__hint">{conflictLabel} 없음 — Import를 진행할 수 있습니다.</p>
              )}
            </section>
          ) : null}

          {step === "importing" ? (
            <section className="master-excel-import-modal__panel master-excel-import-modal__progress">
              <p className="master-excel-import-modal__progress-label">
                Import 중… {importProgress.current} / {importProgress.total}{" "}
                {importProgress.percent}%
              </p>
              <div className="master-excel-import-modal__progress-bar" role="progressbar" aria-valuenow={importProgress.percent}>
                <span style={{ width: `${importProgress.percent}%` }} />
              </div>
            </section>
          ) : null}

          {step === "result" && importResult ? (
            <section className="master-excel-import-modal__panel master-excel-import-modal__result">
              <dl>
                <div>
                  <dt>총 건수</dt>
                  <dd>{importResult.total}건</dd>
                </div>
                <div>
                  <dt>신규 등록</dt>
                  <dd>{importResult.created}건</dd>
                </div>
                <div>
                  <dt>업데이트</dt>
                  <dd>{importResult.updated}건</dd>
                </div>
                <div>
                  <dt>중복</dt>
                  <dd>{importResult.duplicate + importResult.skipped}건</dd>
                </div>
                <div>
                  <dt>실패</dt>
                  <dd>{importResult.failed}건</dd>
                </div>
              </dl>
              <p className="master-excel-import-modal__hint">
                Import 완료 — {config.title}에서 즉시 검색할 수 있습니다.
              </p>
              {importResult.errors?.length ? (
                <ul className="master-excel-import-modal__errors">
                  {importResult.errors.slice(0, 20).map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              ) : null}
              {undoAvailable ? (
                <SecondaryButton type="button" onClick={handleUndo}>
                  <RotateCcw size={14} aria-hidden="true" />
                  마지막 Import Undo
                </SecondaryButton>
              ) : null}
            </section>
          ) : null}
        </div>

        <footer className="titan-modal__footer">
          <SecondaryButton type="button" onClick={onClose} disabled={step === "importing"}>
            {step === "result" ? "닫기" : "취소"}
          </SecondaryButton>
          {step === "preview" ? (
            <PrimaryButton type="button" onClick={() => setStep("validation")}>
              데이터 검증
            </PrimaryButton>
          ) : null}
          {step === "validation" ? (
            <PrimaryButton type="button" onClick={() => setStep("duplicate")}>
              중복 검사
            </PrimaryButton>
          ) : null}
          {step === "duplicate" ? (
            <PrimaryButton type="button" onClick={handleExecuteImport}>
              <Upload size={14} aria-hidden="true" />
              Import 실행
            </PrimaryButton>
          ) : null}
        </footer>
      </div>
    </div>,
    document.body
  );
}
