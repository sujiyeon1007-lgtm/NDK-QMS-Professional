import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Maximize2, RotateCcw, Plus, FileText, RefreshCw, Upload, ExternalLink } from "lucide-react";

import { SecondaryButton } from "../../foundation/components/Button";
import { setTitanErrorContext, clearTitanErrorContext } from "../../utils/titanErrorContext";

import {
  downloadDocumentFile,
  downloadRevisionFile,
  getCurrentDrawingRevision,
  getDrawingRevisionHistory,
  getProductHistory,
  getProductPhoto,
  getRelatedDocuments,
  readDrawingFile,
  restoreDrawingRevision,
  setProductPhoto,
} from "../../utils/productDrawingSession";

import { getProductInspectionByProductId } from "../../utils/productInspectionSession";

import { getInspectionCriteriaDetailLines } from "../../utils/inspectionCriteriaModel";

import ProductDrawingRevisionModal from "./ProductDrawingRevisionModal";
import ProductRelatedDocumentModal from "./ProductRelatedDocumentModal";

const DETAIL_TABS = [
  { id: "basic", label: "기본정보" },
  { id: "inspection", label: "검사기준" },
  { id: "drawing", label: "도면" },
  { id: "documents", label: "관련문서" },
  { id: "history", label: "이력" },
];

const HISTORY_CATEGORY_LABELS = {
  product: "제품",
  revision: "Revision",
  document: "관련문서",
};

function renderDetailValue(row, field) {
  if (field.render === "active") return row.activeLabel ?? (row.active === false ? "미사용" : "사용");
  const value = row[field.key];
  return value != null && String(value).trim() !== "" ? value : "—";
}

function RevisionStatusBadge({ isCurrent }) {
  if (isCurrent) {
    return <span className="product-revision-badge product-revision-badge--current">현재 사용</span>;
  }
  return <span className="product-revision-badge product-revision-badge--previous">이전</span>;
}

function FilePreviewOverlay({ file, onClose }) {
  if (!file?.dataUrl) return null;

  return (
    <div className="product-drawing-preview-overlay" role="presentation" onClick={onClose}>
      <div className="product-drawing-preview-modal" role="dialog" onClick={(event) => event.stopPropagation()}>
        {file.mimeType === "application/pdf" ? (
          <iframe title="문서 미리보기" src={file.dataUrl} className="product-drawing-preview-modal__frame" />
        ) : (
          <img src={file.dataUrl} alt={file.fileName || "미리보기"} className="product-drawing-preview-modal__image" />
        )}
      </div>
    </div>
  );
}

function DrawingPreview({ drawing, onExpand }) {
  if (!drawing?.dataUrl) {
    return (
      <p className="product-drawing-detail__empty">
        등록된 도면이 없습니다.
        {drawing?.revision ? ` (Rev ${drawing.revision} · ${drawing.revisionDate || "—"})` : ""}
      </p>
    );
  }

  return (
    <div className="product-drawing-detail__drawing">
      <div className="product-drawing-detail__drawing-head">
        <strong>
          {drawing.drawingNo || "도면"}
          {drawing.revision ? ` · Rev ${drawing.revision}` : ""}
        </strong>
        <div className="product-drawing-detail__drawing-actions">
          <SecondaryButton type="button" onClick={onExpand}>
            <Maximize2 size={14} />
            확대
          </SecondaryButton>
          <SecondaryButton type="button" onClick={() => downloadRevisionFile(drawing)}>
            <Download size={14} />
            다운로드
          </SecondaryButton>
        </div>
      </div>
      {drawing.mimeType === "application/pdf" ? (
        <iframe
          title="도면 미리보기"
          src={drawing.dataUrl}
          className="product-drawing-detail__preview product-drawing-detail__preview--pdf"
        />
      ) : (
        <img src={drawing.dataUrl} alt={drawing.fileName || "도면"} className="product-drawing-detail__preview" />
      )}
    </div>
  );
}

function ProductPhotoSection({ product, photo, onRefresh }) {
  const fileInputRef = useRef(null);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    try {
      const payload = await readDrawingFile(file);
      if (!payload) return;
      const result = setProductPhoto(product.id, payload);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setError("");
      onRefresh?.();
    } catch (attachError) {
      setError(attachError.message || "사진을 등록할 수 없습니다.");
    }
  };

  return (
    <div className="product-drawing-detail__photo">
      <div className="product-drawing-detail__section-head">
        <h4>제품 사진</h4>
        <SecondaryButton type="button" onClick={() => fileInputRef.current?.click()}>
          <Upload size={14} />
          사진 등록
        </SecondaryButton>
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          className="product-drawing-detail__photo-input"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </div>
      {error ? (
        <p className="product-drawing-modal__error" role="alert">
          {error}
        </p>
      ) : null}
      {!photo?.dataUrl ? (
        <p className="product-drawing-detail__empty">등록된 제품 사진이 없습니다.</p>
      ) : (
        <div className="product-drawing-detail__photo-preview">
          <img
            src={photo.dataUrl}
            alt={photo.fileName || "제품 사진"}
            role="presentation"
            onClick={() => setPreviewOpen(true)}
          />
          <div className="product-drawing-detail__photo-actions">
            <SecondaryButton type="button" onClick={() => setPreviewOpen(true)}>
              <Maximize2 size={14} />
              미리보기
            </SecondaryButton>
          </div>
          <span>{photo.fileName || "제품 사진"}</span>
        </div>
      )}
      <FilePreviewOverlay file={previewOpen ? photo : null} onClose={() => setPreviewOpen(false)} />
    </div>
  );
}

export default function ProductDrawingDetailPanel({ product, detailFields, refreshKey, onRefresh }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [documentOpen, setDocumentOpen] = useState(false);
  const [replaceDocument, setReplaceDocument] = useState(null);
  const [previewDrawing, setPreviewDrawing] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);

  const currentDrawing = useMemo(
    () => getCurrentDrawingRevision(product.id),
    [product.id, refreshKey]
  );
  const revisionHistory = useMemo(
    () => getDrawingRevisionHistory(product.id),
    [product.id, refreshKey]
  );
  const relatedDocuments = useMemo(
    () => getRelatedDocuments(product.id),
    [product.id, refreshKey]
  );
  const productPhoto = useMemo(() => getProductPhoto(product.id), [product.id, refreshKey]);
  const changeHistory = useMemo(() => getProductHistory(product.id), [product.id, refreshKey]);
  const inspection = useMemo(
    () => getProductInspectionByProductId(product.id),
    [product.id, refreshKey]
  );
  const hasInspectionCriteria = Boolean(inspection?.specification);
  const inspectionLines = useMemo(() => {
    if (!inspection?.specification) return [];
    return getInspectionCriteriaDetailLines(inspection.specification);
  }, [inspection?.specification]);

  const handleRestore = (revisionId) => {
    const result = restoreDrawingRevision(product.id, revisionId);
    if (result.ok) onRefresh?.();
  };

  useEffect(() => {
    setTitanErrorContext({
      screen: "제품관리",
      component: "ProductDrawingDetailPanel",
      productPartNo: product?.partNo ?? "",
      productName: product?.name ?? "",
      path: typeof window !== "undefined" ? window.location.pathname : "",
    });
    return () => clearTitanErrorContext(["component", "productPartNo", "productName"]);
  }, [product?.id, product?.partNo, product?.name]);

  const hasDrawingData = Boolean(currentDrawing || revisionHistory.length > 0);

  return (
    <div className="product-drawing-detail">
      <div className="product-drawing-detail__tabs" role="tablist" aria-label="제품 상세정보">
        {DETAIL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`product-drawing-detail__tab${activeTab === tab.id ? " is-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "basic" ? (
        <section className="product-drawing-detail__section">
          <dl className="inbound-detail">
            {detailFields.map((field) => (
              <div key={field.key}>
                <dt>{field.label}</dt>
                <dd>{renderDetailValue(product, field)}</dd>
              </div>
            ))}
          </dl>
          <ProductPhotoSection product={product} photo={productPhoto} onRefresh={onRefresh} />
        </section>
      ) : null}

      {activeTab === "inspection" ? (
        <section className="product-drawing-detail__section">
          {hasInspectionCriteria ? (
            <>
              <dl className="inbound-detail">
                {inspectionLines.map((line) => (
                  <div key={line.label}>
                    <dt>{line.label}</dt>
                    <dd>{line.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="product-drawing-detail__inspection-action">
                <SecondaryButton type="button" onClick={() => navigate("/settings/inspection")}>
                  <ExternalLink size={14} />
                  검사기준관리 열기
                </SecondaryButton>
              </div>
            </>
          ) : (
            <>
              <p className="product-drawing-detail__empty">등록된 검사기준이 없습니다.</p>
              <div className="product-drawing-detail__inspection-action">
                <SecondaryButton type="button" onClick={() => navigate("/settings/inspection")}>
                  <ExternalLink size={14} />
                  검사기준관리 열기
                </SecondaryButton>
              </div>
            </>
          )}
        </section>
      ) : null}

      {activeTab === "drawing" ? (
        <>
          {!hasDrawingData ? (
            <section className="product-drawing-detail__section">
              <p className="product-drawing-detail__empty">등록된 도면이 없습니다.</p>
              <div className="product-drawing-detail__section-head">
                <SecondaryButton type="button" onClick={() => setRevisionOpen(true)}>
                  <Plus size={14} />
                  Revision 등록
                </SecondaryButton>
              </div>
            </section>
          ) : (
            <>
          <section className="product-drawing-detail__section">
            <div className="product-drawing-detail__section-head">
              <div className="product-drawing-detail__revision-current">
                <span className="product-drawing-detail__revision-label">현재 Revision</span>
                <div className="product-drawing-detail__revision-headline">
                  <strong>{currentDrawing?.revision ? `Rev ${currentDrawing.revision}` : "—"}</strong>
                  {currentDrawing?.isCurrent ? <RevisionStatusBadge isCurrent /> : null}
                </div>
              </div>
              <SecondaryButton type="button" onClick={() => setRevisionOpen(true)}>
                <Plus size={14} />
                Revision 등록
              </SecondaryButton>
            </div>
            <DrawingPreview drawing={currentDrawing} onExpand={() => setPreviewDrawing(currentDrawing)} />
          </section>

          <section className="product-drawing-detail__section">
            <h3>Revision 이력</h3>
            {revisionHistory.length === 0 ? (
              <p className="product-drawing-detail__empty">등록된 Revision 이력이 없습니다.</p>
            ) : (
              <ul className="product-drawing-detail__history">
                {revisionHistory.map((revision) => (
                  <li key={revision.id} className={revision.isCurrent ? "is-current" : ""}>
                    <div className="product-drawing-detail__history-main">
                      <span className="product-drawing-detail__rev">Rev {revision.revision || "—"}</span>
                      <RevisionStatusBadge isCurrent={revision.isCurrent} />
                      <span>{revision.revisionDate || "—"}</span>
                      <span>{revision.fileName || (revision.dataUrl ? "PDF" : "정보만")}</span>
                      {revision.note ? <span>비고 {revision.note}</span> : null}
                    </div>
                    <div className="product-drawing-detail__history-actions">
                      {revision.dataUrl ? (
                        <>
                          <button type="button" onClick={() => setPreviewDrawing(revision)}>
                            열람
                          </button>
                          <button type="button" onClick={() => downloadRevisionFile(revision)}>
                            다운로드
                          </button>
                        </>
                      ) : null}
                      {!revision.isCurrent ? (
                        <button type="button" onClick={() => handleRestore(revision.id)}>
                          <RotateCcw size={12} aria-hidden="true" />
                          현재 Revision 복원
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
            </>
          )}
        </>
      ) : null}

      {activeTab === "documents" ? (
        <section className="product-drawing-detail__section">
          <div className="product-drawing-detail__section-head">
            <h3>관련 문서</h3>
            <SecondaryButton type="button" onClick={() => setDocumentOpen(true)}>
              <Plus size={14} />
              문서 등록
            </SecondaryButton>
          </div>
          {relatedDocuments.length === 0 ? (
            <p className="product-drawing-detail__empty">등록된 관련 문서가 없습니다.</p>
          ) : (
            <ul className="product-drawing-detail__documents">
              {relatedDocuments.map((document) => (
                <li key={document.id}>
                  <div className="product-drawing-detail__document-main">
                    <FileText size={14} aria-hidden="true" />
                    <div>
                      <strong>{document.title}</strong>
                      <span>
                        {document.typeLabel}
                        {document.fileName ? ` · ${document.fileName}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="product-drawing-detail__document-actions">
                    {document.dataUrl ? (
                      <>
                        <SecondaryButton type="button" onClick={() => setPreviewDocument(document)}>
                          <Maximize2 size={14} />
                          미리보기
                        </SecondaryButton>
                        <SecondaryButton type="button" onClick={() => downloadDocumentFile(document)}>
                          <Download size={14} />
                          다운로드
                        </SecondaryButton>
                      </>
                    ) : null}
                    <SecondaryButton type="button" onClick={() => setReplaceDocument(document)}>
                      <RefreshCw size={14} />
                      교체
                    </SecondaryButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {activeTab === "history" ? (
        <section className="product-drawing-detail__section">
          <h3>변경 이력</h3>
          {changeHistory.length === 0 ? (
            <p className="product-drawing-detail__empty">등록된 변경 이력이 없습니다.</p>
          ) : (
            <ul className="product-drawing-detail__change-history">
              {changeHistory.map((entry) => (
                <li key={entry.id}>
                  <div className="product-drawing-detail__change-main">
                    <span className="product-drawing-detail__change-category">
                      {HISTORY_CATEGORY_LABELS[entry.category] ?? entry.category}
                    </span>
                    <strong>{entry.action}</strong>
                    <span>{entry.summary}</span>
                  </div>
                  <div className="product-drawing-detail__change-meta">
                    <span>등록자 {entry.registeredBy || "—"}</span>
                    <span>수정자 {entry.updatedBy || "—"}</span>
                    <span>등록일 {entry.registeredDate || entry.date || "—"}</span>
                    <span>수정일 {entry.updatedDate || entry.date || "—"}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <ProductDrawingRevisionModal
        open={revisionOpen}
        onClose={() => setRevisionOpen(false)}
        product={product}
        currentDrawing={currentDrawing}
        onSaved={() => {
          setRevisionOpen(false);
          onRefresh?.();
        }}
      />

      <ProductRelatedDocumentModal
        open={documentOpen}
        onClose={() => setDocumentOpen(false)}
        product={product}
        onSaved={() => {
          setDocumentOpen(false);
          onRefresh?.();
        }}
      />

      <ProductRelatedDocumentModal
        open={Boolean(replaceDocument)}
        onClose={() => setReplaceDocument(null)}
        product={product}
        mode="replace"
        initialDocument={replaceDocument}
        onSaved={() => {
          setReplaceDocument(null);
          onRefresh?.();
        }}
      />

      <FilePreviewOverlay file={previewDrawing} onClose={() => setPreviewDrawing(null)} />
      <FilePreviewOverlay file={previewDocument} onClose={() => setPreviewDocument(null)} />
    </div>
  );
}
