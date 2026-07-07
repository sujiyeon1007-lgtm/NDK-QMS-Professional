import { useMemo } from "react";

import {
  buildLotTraceabilityView,
  listLotTraceabilitySummaryRows,
} from "../../../utils/lotTraceabilityModel";

/**
 * LOT Traceability — 장입 Workflow 연동 조회 패널
 */
export default function LotTraceabilityPanel({ lotNo }) {
  const view = useMemo(() => {
    const key = String(lotNo ?? "").trim();
    if (!key) return null;
    return buildLotTraceabilityView(key);
  }, [lotNo]);

  const summaryRows = useMemo(
    () => (view ? listLotTraceabilitySummaryRows(view.lotNo) : []),
    [view]
  );

  if (!lotNo) {
    return (
      <section className="equipment-monitor-detail equipment-monitor-detail--inline" aria-label="LOT Traceability">
        <h3 className="equipment-monitor-detail__head">LOT Traceability</h3>
        <p className="home-empty">LOT를 선택하거나 장입 중인 LOT가 있으면 추적 정보가 표시됩니다.</p>
      </section>
    );
  }

  if (!view) {
    return (
      <section className="equipment-monitor-detail equipment-monitor-detail--inline" aria-label="LOT Traceability">
        <h3 className="equipment-monitor-detail__head">LOT Traceability</h3>
        <p className="home-empty">LOT '{lotNo}' 추적 정보를 찾을 수 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="equipment-monitor-detail equipment-monitor-detail--inline" aria-label="LOT Traceability">
      <h3 className="equipment-monitor-detail__head">LOT Traceability · {view.lotNo}</h3>

      <dl className="equipment-monitor-detail__grid">
        {summaryRows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>

      {view.certificate.linkPrep?.readyForIssue ? (
        <p className="equipment-monitor-detail__lot-no">
          성적서 연동 준비: {view.certificate.linkPrep.pdfStatus === "ready" ? "발행 가능" : "대기"}
        </p>
      ) : null}

      {view.timeline.length > 0 ? (
        <ol className="equipment-monitor-detail__timeline">
          {view.timeline.map((row) => (
            <li key={`${row.time}-${row.title}-${row.detail}`}>
              <time>{row.time}</time>
              <strong>{row.title}</strong>
              <span>{row.detail}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="home-empty">Timeline 이력이 없습니다.</p>
      )}
    </section>
  );
}
