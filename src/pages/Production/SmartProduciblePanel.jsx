import { useMemo } from "react";

import StatusChip from "../../foundation/components/StatusChip";
import TitanDataTable from "../../foundation/components/DataTable";
import {
  buildSmartProducibleWorkList,
  countProducibleBySource,
  getProducibleSourceMeta,
} from "../../utils/smartProducibleWorkList";

/** Smart Workflow — 설비별 생산 가능 목록 (기존 테이블 스타일 재사용) */
export default function SmartProduciblePanel({ equipmentContext, refreshKey = 0, onSelectRecord }) {
  const items = useMemo(
    () => buildSmartProducibleWorkList(equipmentContext),
    [equipmentContext, refreshKey]
  );

  const counts = useMemo(() => countProducibleBySource(items), [items]);

  const rows = useMemo(
    () =>
      items.map(({ record, source }) => {
        const meta = getProducibleSourceMeta(source);
        return {
          id: record.id,
          source,
          sourceLabel: meta.label,
          sourceVariant: meta.chipVariant,
          sourceEmoji: meta.emoji,
          company: record.company ?? "—",
          partName: record.partName ?? "—",
          partNo: record.partNo ?? "—",
          material: record.material ?? "—",
          qty: record.qty ?? "—",
          incomingDate: record.incomingDate ?? "—",
          record,
        };
      }),
    [items]
  );

  const columns = useMemo(
    () => [
      {
        key: "sourceLabel",
        label: "구분",
        widthPercent: 12,
        render: (row) => (
          <StatusChip variant={row.sourceVariant}>
            {row.sourceEmoji} {row.sourceLabel}
          </StatusChip>
        ),
      },
      { key: "company", label: "업체명", widthPercent: 14 },
      { key: "partName", label: "품명", widthPercent: 18 },
      { key: "partNo", label: "품번", widthPercent: 14 },
      { key: "material", label: "재질", widthPercent: 10 },
      { key: "qty", label: "수량", widthPercent: 8 },
      { key: "incomingDate", label: "입고일", widthPercent: 12 },
    ],
    []
  );

  if (!equipmentContext) return null;

  return (
    <section className="smart-producible-panel" aria-label="Smart 생산 가능 목록">
      <header className="smart-producible-panel__head">
        <div>
          <h3 className="smart-producible-panel__title">
            Smart 생산 가능 목록 · {equipmentContext.name}
          </h3>
          <p className="smart-producible-panel__desc">
            공정 <strong>{equipmentContext.process}</strong> · 🟢 금일 입고 {counts.todayInbound}건 ·
            🔵 기존 재고 {counts.existingStock}건 · 총 {counts.total}건
          </p>
        </div>
      </header>

      <TitanDataTable
        className="inbound-page__table"
        columns={columns}
        rows={rows}
        onRowClick={(row) => onSelectRecord?.(row.record)}
        onRowDoubleClick={(row) => onSelectRecord?.(row.record)}
        emptyMessage="해당 설비 공정에 생산 가능한 품목이 없습니다."
      />
    </section>
  );
}
