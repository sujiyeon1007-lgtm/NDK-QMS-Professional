import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileSpreadsheet,
  Maximize2,
  Minus,
  Plus,
  Printer,
  X,
} from "lucide-react";
import { getDocumentOrientation, getPrintPreviewPageSizePx } from "../../utils/titanPrintEngine";
import "./TitanPrintPreviewModal.css";

function getPrintPageElements(documentEl) {
  if (!documentEl) return [];
  const pages = [...documentEl.querySelectorAll(".titan-print-page")];
  if (pages.length) return pages;
  const statementPage = documentEl.querySelector(".ts-page");
  return statementPage ? [statementPage] : [];
}

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

function clampZoom(value) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
}

function getPageSizePx(orientation) {
  return getPrintPreviewPageSizePx(orientation);
}

/** Project TITAN 공통 출력 미리보기 Modal (Excel Print Preview 방식) */
function TitanPrintPreviewModal({
  open,
  onClose,
  title = "출력 미리보기",
  children,
  onPrint,
  onPdf,
  onExcel,
  excelEnabled = false,
  busy = false,
  onMarkComplete,
  markCompleteLabel = "출력 완료",
  footerPrintLabel = "인쇄",
  footerCloseLabel = "닫기",
  simplifiedFooter = false,
}) {
  const viewportRef = useRef(null);
  const documentWrapRef = useRef(null);
  const pageRefs = useRef([]);

  const [zoomMode, setZoomMode] = useState("fit");
  const [zoom, setZoom] = useState(1);
  const [fitZoom, setFitZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orientation, setOrientation] = useState("portrait");
  const [paperSize, setPaperSize] = useState("A4");
  const [margin, setMargin] = useState("normal");
  const [fitToWidth, setFitToWidth] = useState(true);
  const [printBackground, setPrintBackground] = useState(true);

  const refreshViewport = useCallback(() => {
    const viewport = viewportRef.current;
    const documentEl = documentWrapRef.current?.querySelector(".titan-print-document") ?? null;

    if (!documentEl) {
      pageRefs.current = [];
      setTotalPages(1);
      setFitZoom(1);
      return;
    }

    const orient = getDocumentOrientation(documentEl);
    const pages = getPrintPageElements(documentEl);
    pageRefs.current = pages;
    setOrientation(orient);
    setTotalPages(Math.max(pages.length, 1));

    if (!viewport) return;

    const { width, height } = getPageSizePx(orient);
    const padding = 48;
    const availableWidth = viewport.clientWidth - padding;
    const availableHeight = viewport.clientHeight - padding;
    const nextFit = fitToWidth
      ? clampZoom(availableWidth / width)
      : clampZoom(Math.min(availableWidth / width, availableHeight / height));

    setFitZoom(nextFit);
  }, [fitToWidth]);

  const effectiveZoom = zoomMode === "fit" ? fitZoom : zoom;

  const scrollToPage = useCallback((pageNumber) => {
    const pageEl = pageRefs.current[pageNumber - 1];
    if (!pageEl || !viewportRef.current) return;
    pageEl.scrollIntoView({ behavior: "smooth", block: "start" });
    setCurrentPage(pageNumber);
  }, []);

  const handleZoomIn = () => {
    setZoomMode("custom");
    setZoom((prev) => clampZoom((zoomMode === "fit" ? fitZoom : prev) + ZOOM_STEP));
  };

  const handleZoomOut = () => {
    setZoomMode("custom");
    setZoom((prev) => clampZoom((zoomMode === "fit" ? fitZoom : prev) - ZOOM_STEP));
  };

  const handleZoom100 = () => {
    setZoomMode("custom");
    setZoom(1);
  };

  const handleFitPage = () => {
    setFitToWidth(false);
    setZoomMode("fit");
  };

  const handleFitWidth = () => {
    setFitToWidth(true);
    setZoomMode("fit");
  };

  const handlePrevPage = () => {
    scrollToPage(Math.max(1, currentPage - 1));
  };

  const handleNextPage = () => {
    scrollToPage(Math.min(totalPages, currentPage + 1));
  };

  const handleViewportDoubleClick = () => {
    if (zoomMode === "custom" && Math.abs(zoom - 1) < 0.01) {
      handleFitPage();
      return;
    }
    handleZoom100();
  };

  const handleViewportWheel = (event) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoomMode("custom");
    setZoom((prev) => clampZoom((zoomMode === "fit" ? fitZoom : prev) + delta));
  };

  const runExport = async (handler) => {
    const documentEl = documentWrapRef.current?.querySelector(".titan-print-document") ?? null;
    if (!documentEl || !handler) return;
    await handler(documentEl);
  };

  useEffect(() => {
    if (!open) return undefined;

    document.body.classList.add("titan-print-modal-open");
    return () => {
      document.body.classList.remove("titan-print-modal-open");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const onScroll = () => {
      const pages = pageRefs.current;
      if (!pages.length) return;

      const viewportTop = viewport.scrollTop + 24;
      let activeIndex = 0;
      pages.forEach((page, index) => {
        if (page.offsetTop <= viewportTop + 40) {
          activeIndex = index;
        }
      });
      setCurrentPage(activeIndex + 1);
    };

    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", onScroll);
  }, [open, totalPages]);

  useEffect(() => {
    if (!open) return undefined;

    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const frame = window.requestAnimationFrame(() => {
      refreshViewport();
    });

    const observer = new ResizeObserver(() => {
      refreshViewport();
    });

    observer.observe(viewport);
    const documentEl = documentWrapRef.current?.querySelector(".titan-print-document");
    if (documentEl) {
      observer.observe(documentEl);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [open, children, fitToWidth, refreshViewport]);

  useEffect(() => {
    if (zoomMode === "fit") {
      refreshViewport();
    }
  }, [zoomMode, fitToWidth, refreshViewport]);

  if (!open) return null;

  const zoomPercent = Math.round(effectiveZoom * 100);
  const pageSize = getPageSizePx(orientation);
  const marginClass = `titan-print-modal-margin-${margin}`;

  return createPortal(
    <div className="titan-print-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="titan-print-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="titan-print-modal-header">
          <div className="titan-print-modal-title-block">
            <p className="titan-print-modal-kicker">Print Preview</p>
            <h2>{title}</h2>
          </div>

          <div className="titan-print-modal-quick-actions">
            {onPrint && (
              <button
                type="button"
                className="titan-print-modal-icon-btn"
                disabled={busy}
                onClick={() => runExport(onPrint)}
                title="인쇄"
              >
                <Printer size={18} />
              </button>
            )}
            {onPdf && (
              <button
                type="button"
                className="titan-print-modal-icon-btn"
                disabled={busy}
                onClick={() => runExport(onPdf)}
                title="PDF 저장"
              >
                <FileDown size={18} />
              </button>
            )}
            {excelEnabled && onExcel && (
              <button
                type="button"
                className="titan-print-modal-icon-btn"
                disabled={busy}
                onClick={() => onExcel()}
                title="Excel 저장"
              >
                <FileSpreadsheet size={18} />
              </button>
            )}
            <button
              type="button"
              className="titan-print-modal-icon-btn close"
              onClick={onClose}
              title="닫기 (ESC)"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="titan-print-modal-body">
          <section className="titan-print-modal-viewport-wrap">
            <div className="titan-print-modal-toolbar">
              <div className="titan-print-modal-toolbar-group">
                <button type="button" className="titan-print-modal-tool-btn" onClick={handleZoomOut}>
                  <Minus size={16} />
                </button>
                <span className="titan-print-modal-zoom-label">{zoomPercent}%</span>
                <button type="button" className="titan-print-modal-tool-btn" onClick={handleZoomIn}>
                  <Plus size={16} />
                </button>
                <button type="button" className="titan-print-modal-tool-btn" onClick={handleZoom100}>
                  100%
                </button>
                <button type="button" className="titan-print-modal-tool-btn" onClick={handleFitPage}>
                  <Maximize2 size={16} />
                  페이지 맞춤
                </button>
                <button type="button" className="titan-print-modal-tool-btn" onClick={handleFitWidth}>
                  가로 맞춤
                </button>
              </div>

              <div className="titan-print-modal-toolbar-group">
                <button
                  type="button"
                  className="titan-print-modal-tool-btn"
                  disabled={currentPage <= 1}
                  onClick={handlePrevPage}
                >
                  <ChevronLeft size={16} />
                  이전
                </button>
                <span className="titan-print-modal-page-indicator">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  className="titan-print-modal-tool-btn"
                  disabled={currentPage >= totalPages}
                  onClick={handleNextPage}
                >
                  다음
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div
              ref={viewportRef}
              className="titan-print-modal-viewport"
              onWheel={handleViewportWheel}
              onDoubleClick={handleViewportDoubleClick}
            >
              <div
                className={`titan-print-modal-document-stage ${marginClass}`}
                style={{
                  width: pageSize.width * effectiveZoom,
                  minHeight: pageSize.height * effectiveZoom * totalPages,
                }}
              >
                <div
                  ref={documentWrapRef}
                  className="titan-print-modal-document-wrap"
                  style={{
                    transform: `scale(${effectiveZoom})`,
                    width: pageSize.width,
                  }}
                >
                  {children}
                </div>
              </div>
            </div>
          </section>

          <aside className="titan-print-modal-settings">
            <h3>인쇄 설정</h3>

            <label className="titan-print-modal-field">
              <span>용지 방향</span>
              <select value={orientation} disabled>
                <option value="portrait">세로</option>
                <option value="landscape">가로</option>
              </select>
              <em className="titan-print-modal-field-hint">문서 자동 설정</em>
            </label>

            <label className="titan-print-modal-field">
              <span>용지 크기</span>
              <select value={paperSize} onChange={(event) => setPaperSize(event.target.value)}>
                <option value="A4">A4</option>
                <option value="A3" disabled>
                  A3 (향후)
                </option>
              </select>
            </label>

            <label className="titan-print-modal-field">
              <span>여백</span>
              <select value={margin} onChange={(event) => setMargin(event.target.value)}>
                <option value="normal">보통</option>
                <option value="narrow">좁게</option>
                <option value="wide">넓게</option>
              </select>
            </label>

            <label className="titan-print-modal-field">
              <span>배율</span>
              <div className="titan-print-modal-scale-row">
                <input
                  type="range"
                  min={25}
                  max={200}
                  step={5}
                  value={zoomPercent}
                  onChange={(event) => {
                    setZoomMode("custom");
                    setZoom(clampZoom(Number(event.target.value) / 100));
                  }}
                />
                <strong>{zoomPercent}%</strong>
              </div>
            </label>

            <fieldset className="titan-print-modal-fieldset">
              <legend>인쇄 옵션</legend>
              <label className="titan-print-modal-check">
                <input
                  type="checkbox"
                  checked={printBackground}
                  onChange={(event) => setPrintBackground(event.target.checked)}
                />
                배경 및 표 테두리 출력
              </label>
            </fieldset>
          </aside>
        </div>

        <footer className="titan-print-modal-footer">
          {onPrint && (
            <button
              type="button"
              className="titan-print-modal-footer-btn primary"
              disabled={busy}
              onClick={() => runExport(onPrint)}
            >
              <Printer size={18} />
              {footerPrintLabel}
            </button>
          )}
          {onMarkComplete && (
            <button
              type="button"
              className="titan-print-modal-footer-btn"
              disabled={busy}
              onClick={() => onMarkComplete()}
            >
              {markCompleteLabel}
            </button>
          )}
          {!simplifiedFooter && onPdf && (
            <button
              type="button"
              className="titan-print-modal-footer-btn"
              disabled={busy}
              onClick={() => runExport(onPdf)}
            >
              <FileDown size={18} />
              PDF 저장
            </button>
          )}
          {!simplifiedFooter && excelEnabled && onExcel && (
            <button
              type="button"
              className="titan-print-modal-footer-btn"
              disabled={busy}
              onClick={() => onExcel()}
            >
              <FileSpreadsheet size={18} />
              Excel 저장
            </button>
          )}
          <button type="button" className="titan-print-modal-footer-btn" onClick={onClose}>
            {footerCloseLabel}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}

export default TitanPrintPreviewModal;
