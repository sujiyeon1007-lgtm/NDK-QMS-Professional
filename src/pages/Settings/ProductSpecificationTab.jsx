import { useMemo } from "react";

import TitanDataTable from "../../foundation/components/DataTable";
import { buildProductSpecificationView } from "../../utils/productSpecificationView";

import "./ProductSpecification.css";

/**
 * Sprint 9 Phase 1 — Product Specification 탭 (Additive · 조회 전용)
 *
 * Blueprint §3.2 · §5.2 · §7.1 — 업체+품번 목표 품질 SSOT 표시.
 * 기존 Sprint 8 Product Popup 탭/레이아웃/CSS 를 재사용하며 신규 CSS 를 만들지 않는다.
 */

const HARDNESS_COLUMNS = [
  { key: "label", label: "항목" },
  {
    key: "spec",
    label: "목표 Spec",
    render: (row) =>
      row.spec === "—" ? (
        <span className="company-detail-section__muted">미설정</span>
      ) : (
        <span>
          {row.spec}
          {row.unit ? <span className="company-detail-section__unit"> {row.unit}</span> : null}
        </span>
      ),
  },
];

const DIMENSION_COLUMNS = [
  { key: "label", label: "치수 항목", render: (row) => row.label },
  { key: "spec", label: "Spec", render: (row) => row.spec },
];

function AppearanceChips({ items }) {
  return (
    <ul className="company-detail-tags" aria-label="외관 검사 항목">
      {items.map((item) => (
        <li
          key={item.key}
          className={`company-detail-tag${item.enabled ? " is-on" : " is-off"}`}
        >
          {item.label}
          <span className="company-detail-tag__state">{item.enabled ? "검사" : "제외"}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ProductSpecificationTab({ product }) {
  const view = useMemo(() => buildProductSpecificationView(product), [product]);

  const ht = view.heatTreatment;

  return (
    <section className="company-detail-section" aria-label="품질 Specification">
      <div className="company-detail-section__notice" role="note">
        업체 + 품번 기준 <strong>목표 품질(Specification)</strong> 입니다. 도면/고객 요구 품질을
        정의하며, 검사 · 성적서(TDE) 판정의 기준이 됩니다.
        {view.hasSpecification ? null : (
          <span className="company-detail-section__notice-sub">
            {" "}
            아직 품질 Spec 이 등록되지 않았습니다. (열처리 계산 기본값 기준 표시)
          </span>
        )}
      </div>

      <dl className="company-detail-section__grid company-detail-section__grid--trade">
        <div>
          <dt>업체명</dt>
          <dd>{view.identity.company}</dd>
        </div>
        <div>
          <dt>품번</dt>
          <dd>{view.identity.partNo}</dd>
        </div>
        <div>
          <dt>품명</dt>
          <dd>{view.identity.partName}</dd>
        </div>
        <div>
          <dt>재질</dt>
          <dd>{view.identity.material}</dd>
        </div>
        <div>
          <dt>도면번호</dt>
          <dd>{view.identity.drawingNo}</dd>
        </div>
        <div>
          <dt>규격</dt>
          <dd>{view.identity.spec}</dd>
        </div>
      </dl>

      <h4 className="company-detail-section__subtitle">경도 목표 ({view.hardness.unit})</h4>
      <div className="company-detail-section__contacts-table master-data-grid">
        <TitanDataTable
          className="inbound-page__table company-detail-section__contacts-table-inner"
          columns={HARDNESS_COLUMNS}
          rows={view.hardness.items}
          emptyMessage="경도 목표 항목이 없습니다."
        />
      </div>

      <h4 className="company-detail-section__subtitle">열처리 계산 기준</h4>
      <dl className="company-detail-section__grid company-detail-section__grid--trade">
        <div>
          <dt>유효경화깊이 기준</dt>
          <dd>{ht.effectiveDepthBasis}</dd>
        </div>
        {ht.showSpecifiedHv ? (
          <div>
            <dt>지정 HV</dt>
            <dd>{ht.specifiedHv} HV</dd>
          </div>
        ) : null}
        <div>
          <dt>연마여유</dt>
          <dd>{ht.grindingAllowanceMm} mm</dd>
        </div>
        <div>
          <dt>성적서 출력 방식</dt>
          <dd>{ht.certificateOutputMode}</dd>
        </div>
        <div className="company-detail-section__grid-span-2">
          <dt>성적서 출력 항목</dt>
          <dd>{ht.outputFieldLabels.length ? ht.outputFieldLabels.join(" · ") : "—"}</dd>
        </div>
      </dl>

      <h4 className="company-detail-section__subtitle">외관 검사 항목</h4>
      {view.appearance.enabled ? (
        <AppearanceChips items={view.appearance.items} />
      ) : (
        <p className="company-detail-section__empty">외관 검사 항목이 비활성화되어 있습니다.</p>
      )}

      {view.dimension.enabled ? (
        <>
          <h4 className="company-detail-section__subtitle">치수 Spec ({view.dimension.unit})</h4>
          <div className="company-detail-section__contacts-table master-data-grid">
            <TitanDataTable
              className="inbound-page__table company-detail-section__contacts-table-inner"
              columns={DIMENSION_COLUMNS}
              rows={view.dimension.items}
              emptyMessage="치수 Spec 항목이 없습니다."
            />
          </div>
        </>
      ) : null}

      <h4 className="company-detail-section__subtitle">조직 · 기타 고객 요구</h4>
      <dl className="company-detail-section__grid company-detail-section__grid--trade">
        <div>
          <dt>조직사진 필요</dt>
          <dd>{view.microstructure.required ? "필요" : "불필요"}</dd>
        </div>
        <div className="company-detail-section__grid-span-2">
          <dt>기타 고객 요구</dt>
          <dd>{view.other.note}</dd>
        </div>
      </dl>
    </section>
  );
}
