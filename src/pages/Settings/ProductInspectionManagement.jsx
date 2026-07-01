import { useEffect, useMemo, useState } from "react";
import { Download, Maximize2, Pencil, Plus, Trash2, ClipboardCheck } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanSearchPanel from "../../foundation/components/TitanSearchPanel";
import TitanDataTable from "../../foundation/components/DataTable";
import TitanTableFooter from "../../foundation/components/TitanTableFooter";
import TitanDetailPanel from "../../foundation/components/TitanDetailPanel";
import TitanKpiBarSlot from "../../foundation/components/TitanKpiBarSlot";
import TitanWorkflowStatusChipBar from "../../foundation/components/TitanWorkflowStatusChipBar";
import { buildMetricChipItems } from "../../utils/kpiMetricChipItems";
import { EMPTY_BASIC_SEARCH } from "../../config/listSearchStandard";
import { useTitanListSearch } from "../../foundation/hooks/useTitanListSearch";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  deleteProductInspection,
  getProductInspectionByProductId,
  getProductInspectionRecords,
} from "../../utils/productInspectionSession";
import {
  downloadRevisionFile,
  getCurrentDrawingRevision,
} from "../../utils/productDrawingSession";
import ProductInspectionRegisterModal from "./ProductInspectionRegisterModal";
import MasterDataDeleteDialog from "./MasterDataDeleteDialog";
import "../InOut/InboundManagement.css";
import SectionPageActions from "../../foundation/layout/SectionPageActions";
import "./ProductInspectionManagement.css";
import "./ProductDrawingManagement.css";

function createEmptySearch() {
  return { ...EMPTY_BASIC_SEARCH };
}

function buildListRows(products, inspections) {
  return products.map((product) => {
    const inspection =
      inspections.find((row) => row.productId === product.id) ??
      inspections.find((row) => row.partNo === product.partNo) ??
      null;
    const drawing = getCurrentDrawingRevision(product.id);
    const hasDrawingFile = Boolean(drawing?.dataUrl);
    return {
      id: product.id,
      partNo: product.partNo,
      partName: product.name,
      company: product.company || "—",
      criteriaLabel: inspection ? "등록" : "미등록",
      drawingLabel: hasDrawingFile ? "첨부" : drawing?.drawingNo ? "정보만" : "없음",
      revision: drawing?.revision || "—",
      product,
      inspection,
      drawing,
    };
  });
}

import { getInspectionCriteriaSummary } from "../../utils/inspectionCriteriaModel";

export default function ProductInspectionManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { search, draft, onDraftChange, onSearch, onReset } = useTitanListSearch(createEmptySearch, {
    storageKey: "master-inspection",
  });

  const rows = useMemo(() => {
    const products = getMasterDataByCategory("products");
    const inspections = getProductInspectionRecords();
    const merged = buildListRows(products, inspections);
    const keyword = [search.company, search.partName, search.partNo, search.material]
      .filter(Boolean)
      .join(" ")
      .trim()
      .toLowerCase();
    if (!keyword) return merged;
    return merged.filter((row) =>
      [row.partNo, row.partName, row.company, row.criteriaLabel, row.drawingLabel]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [search, refreshKey]);

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedRows,
    setPage,
    setPageSize,
  } = useListPagination(rows);

  const activeRow = rows.find((row) => row.id === activeId) ?? null;

  const kpiCards = useMemo(() => {
    const registered = rows.filter((row) => row.inspection).length;
    const withDrawing = rows.filter((row) => row.drawing?.dataUrl).length;
    return [
      {
        id: "products",
        label: "등록 제품",
        value: rows.length.toLocaleString("ko-KR"),
        unit: "건",
        tone: "blue",
        icon: ClipboardCheck,
        subLabel: "제품관리 연동",
      },
      {
        id: "criteria",
        label: "검사기준 등록",
        value: registered.toLocaleString("ko-KR"),
        unit: "건",
        tone: "green",
        icon: ClipboardCheck,
        subLabel: "제품별 기준",
      },
      {
        id: "drawing",
        label: "도면 첨부",
        value: withDrawing.toLocaleString("ko-KR"),
        unit: "건",
        tone: "purple",
        icon: ClipboardCheck,
        subLabel: "PDF · JPG · PNG",
      },
    ];
  }, [rows]);

  const metricChipItems = useMemo(() => buildMetricChipItems(kpiCards), [kpiCards]);

  const columns = useMemo(
    () => [
      { key: "partNo", label: "품번", widthPercent: 14 },
      { key: "partName", label: "품명", widthPercent: 16 },
      { key: "company", label: "업체명", widthPercent: 12 },
      { key: "criteriaLabel", label: "검사기준", widthPercent: 10 },
      { key: "drawingLabel", label: "도면", widthPercent: 10 },
      { key: "revision", label: "Rev", widthPercent: 8 },
    ],
    []
  );

  const handleDelete = () => {
    if (!deleteTarget?.product?.id) return;
    deleteProductInspection(deleteTarget.product.id);
    setDeleteTarget(null);
    setActiveId(null);
    setRefreshKey((key) => key + 1);
  };

  const downloadDrawing = () => {
    const drawing = activeRow?.drawing;
    if (!drawing?.dataUrl) return;
    downloadRevisionFile(drawing);
  };

  return (
    <div className="inbound-page product-inspection-page">
      <SectionPageActions>
        <PrimaryButton type="button" onClick={() => setRegisterOpen(true)}>
          <Plus size={14} aria-hidden="true" />
          검사기준 등록
        </PrimaryButton>
      </SectionPageActions>

      <TitanKpiBarSlot ariaLabel="현황판" className="inbound-page__kpi">
        <TitanWorkflowStatusChipBar items={metricChipItems} ariaLabel="현황판" />
      </TitanKpiBarSlot>

      <TitanSearchPanel
        draft={draft}
        onDraftChange={onDraftChange}
        onSearch={onSearch}
        onReset={onReset}
        advancedOpen={false}
        onAdvancedToggle={() => {}}
        companies={getMasterDataByCategory("companies")}
        records={rows}
      />

      <div className="inbound-page__workspace">
        <div className="inbound-page__list">
          <TitanDataTable
            className="inbound-page__table"
            columns={columns}
            rows={pagedRows}
            activeRowId={activeRow?.id ?? null}
            onRowClick={(row) => setActiveId(row.id)}
            emptyMessage="제품관리에 등록된 제품이 없습니다."
          />
          <TitanTableFooter
            totalCount={totalCount}
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>

        {activeRow ? (
          <TitanDetailPanel
            showProcessFlow={false}
            actionLabel={activeRow.inspection ? "수정" : "등록"}
            actionIcon={activeRow.inspection ? Pencil : Plus}
            onAction={() => setRegisterOpen(true)}
            secondaryActionLabel={activeRow.inspection ? "삭제" : undefined}
            secondaryActionIcon={Trash2}
            onSecondaryAction={
              activeRow.inspection ? () => setDeleteTarget(activeRow) : undefined
            }
            detailContent={
              <div className="product-inspection-detail">
                <dl className="inbound-detail">
                  <div><dt>업체명</dt><dd>{activeRow.product.company || "—"}</dd></div>
                  <div><dt>품명</dt><dd>{activeRow.product.name || "—"}</dd></div>
                  <div><dt>품번</dt><dd>{activeRow.product.partNo || "—"}</dd></div>
                  <div><dt>도번</dt><dd>{activeRow.product.drawingNo || "—"}</dd></div>
                  <div><dt>재질</dt><dd>{activeRow.product.material || "—"}</dd></div>
                  <div>
                    <dt>검사기준</dt>
                    <dd>{getInspectionCriteriaSummary(activeRow.inspection?.specification)}</dd>
                  </div>
                  <div>
                    <dt>현재 Revision</dt>
                    <dd>{activeRow.drawing?.revision ? `Rev ${activeRow.drawing.revision}` : "—"}</dd>
                  </div>
                  <div>
                    <dt>개정일</dt>
                    <dd>{activeRow.drawing?.revisionDate || "—"}</dd>
                  </div>
                </dl>

                {activeRow.drawing?.dataUrl ? (
                  <div className="product-inspection-detail__drawing">
                    <div className="product-inspection-detail__drawing-head">
                      <strong>최신 도면 미리보기</strong>
                      <div className="product-inspection-detail__drawing-actions">
                        <SecondaryButton type="button" onClick={() => setPreviewOpen(true)}>
                          <Maximize2 size={14} />
                          확대
                        </SecondaryButton>
                        <SecondaryButton type="button" onClick={downloadDrawing}>
                          <Download size={14} />
                          다운로드
                        </SecondaryButton>
                      </div>
                    </div>
                    {activeRow.drawing.mimeType === "application/pdf" ? (
                      <iframe
                        title="도면 미리보기"
                        src={activeRow.drawing.dataUrl}
                        className="product-inspection-detail__preview product-inspection-detail__preview--pdf"
                      />
                    ) : (
                      <img
                        src={activeRow.drawing.dataUrl}
                        alt={activeRow.drawing.fileName || "도면"}
                        className="product-inspection-detail__preview"
                      />
                    )}
                  </div>
                ) : (
                  <p className="product-drawing-detail__empty">제품관리에 등록된 도면이 없습니다.</p>
                )}
              </div>
            }
          />
        ) : null}
      </div>

      <ProductInspectionRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        initialProductId={activeRow?.product?.id ?? null}
        initialInspection={activeRow?.inspection ?? getProductInspectionByProductId(activeRow?.product?.id)}
        onSaved={() => {
          setRegisterOpen(false);
          setRefreshKey((key) => key + 1);
        }}
      />

      {deleteTarget ? (
        <MasterDataDeleteDialog
          row={{ code: deleteTarget.partNo, name: deleteTarget.partName }}
          categoryLabel="제품별 검사기준"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      ) : null}

      {previewOpen && activeRow?.drawing?.dataUrl ? (
        <div className="product-inspection-preview-overlay" role="presentation" onClick={() => setPreviewOpen(false)}>
          <div className="product-inspection-preview-modal" role="dialog" onClick={(event) => event.stopPropagation()}>
            {activeRow.drawing.mimeType === "application/pdf" ? (
              <iframe title="도면 확대" src={activeRow.drawing.dataUrl} className="product-inspection-preview-modal__frame" />
            ) : (
              <img src={activeRow.drawing.dataUrl} alt="도면 확대" className="product-inspection-preview-modal__image" />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
