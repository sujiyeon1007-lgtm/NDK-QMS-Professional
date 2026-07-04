import DocumentStatusChip from "./DocumentStatusChip";
import TitanProductRowSummary from "../../foundation/components/TitanProductRowSummary";
import { TitanRowSummary, TitanRowSummaryCard } from "../../foundation/components/TitanRowSummary";
import {
  buildProductDocumentHistoryRows,
  buildProductRevisionHistoryRows,
} from "../../utils/productDocumentStatus";

/**
 * 문서관리 — 리스트 하단 HOME 스타일 요약 Card
 */
export default function DocumentMasterDetailPanel({
  product,
  traceRecord,
  onSelectCoLotProduct,
  emptyMessage = "리스트에서 제품을 선택하세요.",
}) {
  if (!product) {
    return <TitanRowSummary hasSelection={false} emptyMessage={emptyMessage} />;
  }

  const documentHistory = buildProductDocumentHistoryRows(product);
  const revisionHistory = buildProductRevisionHistoryRows(product);

  return (
    <TitanRowSummary>
      <TitanRowSummaryCard title="제품 정보">
        <dl className="titan-row-summary__meta inbound-detail">
          <div>
            <dt>품번</dt>
            <dd>{product.partNo}</dd>
          </div>
          <div>
            <dt>품명</dt>
            <dd>{product.name}</dd>
          </div>
          <div>
            <dt>재질</dt>
            <dd>{product.material}</dd>
          </div>
          <div>
            <dt>규격</dt>
            <dd>{product.spec}</dd>
          </div>
          <div>
            <dt>거래처</dt>
            <dd>{product.company}</dd>
          </div>
          <div>
            <dt>문서상태</dt>
            <dd>
              <DocumentStatusChip statusId={product.documentStatusId} />
            </dd>
          </div>
          <div>
            <dt>Revision</dt>
            <dd>{product.revision}</dd>
          </div>
          <div>
            <dt>최종 수정일</dt>
            <dd>{product.lastModified}</dd>
          </div>
        </dl>
      </TitanRowSummaryCard>

      <TitanRowSummaryCard title="문서 이력">
        <ul className="titan-row-summary__events">
          {documentHistory.map((row) => (
            <li key={`${row.date}-${row.label}`} className="titan-row-summary__event">
              <strong>{row.date}</strong>
              <span>{row.label}</span>
            </li>
          ))}
        </ul>
      </TitanRowSummaryCard>

      <TitanRowSummaryCard title="Revision 이력">
        <ul className="titan-row-summary__events">
          {revisionHistory.map((row) => (
            <li key={`${row.revision}-${row.note}`} className="titan-row-summary__event">
              <strong>{row.revision}</strong>
              <span>{row.note}</span>
            </li>
          ))}
        </ul>
      </TitanRowSummaryCard>

      {traceRecord ? (
        <TitanProductRowSummary
          record={traceRecord}
          onSelectCoLotProduct={onSelectCoLotProduct}
          showProductInfo={false}
          showWorkflow={false}
          embedMode
        />
      ) : null}
    </TitanRowSummary>
  );
}
