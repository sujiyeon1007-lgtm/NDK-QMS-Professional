import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { BookMarked, ClipboardList, FileJson, Layers, Search } from "lucide-react";

import { SecondaryButton } from "../../foundation/components/Button";
import {
  buildLotLifecycleSummary,
  buildLotLifecycleView,
} from "../../utils/lotTechnologyLifecycle";
import {
  generateAndSaveTechnologyDocumentJson,
  getTitanDocumentJsonByKnowledgeId,
} from "../../utils/titanDocumentJsonBuilder";
import { LOT_DETAIL_TABS } from "../../config/detailTabs/lotDetailTabs";
import { TDE_RENDER_SLOTS } from "../../config/titanDocumentJsonModel";

import "../InOut/InboundManagement.css";
import "../Settings/CompanyManagement.css";
import "../Production/ActualWorkRecord.css";
import "./LotLifecycle.css";

const CATEGORY_ICON = {
  knowledge: BookMarked,
  actual: ClipboardList,
  linked: Layers,
};

function deviationClass(key) {
  if (key === "normal") return "lot-lifecycle-deviation is-normal";
  if (key === "check") return "lot-lifecycle-deviation is-check";
  return "lot-lifecycle-deviation is-review";
}

/** Sprint 9 Phase 5 · LOT Lifecycle — Knowledge + Actual Work + Document JSON (TDE ❌) */
export default function LotLifecyclePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLot = searchParams.get("lot") ?? "";
  const [lotInput, setLotInput] = useState(initialLot);
  const [activeLot, setActiveLot] = useState(initialLot);
  const [activeTab, setActiveTab] = useState("basicInfo");
  const [documentJson, setDocumentJson] = useState(null);
  const [docMessage, setDocMessage] = useState("");

  const summaryKpis = useMemo(() => buildLotLifecycleSummary(), [activeLot]);
  const lifecycleView = useMemo(
    () => (activeLot ? buildLotLifecycleView(activeLot) : null),
    [activeLot]
  );

  const handleSearch = () => {
    const key = lotInput.trim();
    setActiveLot(key);
    setDocumentJson(null);
    setDocMessage("");
    if (key) {
      setSearchParams({ lot: key });
    } else {
      setSearchParams({});
    }
  };

  const handleGenerateDocumentJson = () => {
    const knowledgeId = lifecycleView?.technology?.knowledgeRecordId;
    if (!knowledgeId) {
      setDocMessage("Knowledge Record가 없는 LOT입니다. 품질관리 → Knowledge Record를 먼저 등록하세요.");
      return;
    }
    const existing = getTitanDocumentJsonByKnowledgeId(knowledgeId);
    if (existing) {
      setDocumentJson(existing);
      setDocMessage("기존 Document JSON을 표시합니다. (TDE Rendering Engine 미구현)");
      return;
    }
    const result = generateAndSaveTechnologyDocumentJson(knowledgeId);
    if (!result.ok) {
      setDocMessage(result.message ?? "Document JSON 생성 실패");
      return;
    }
    setDocumentJson(result.document);
    setDocMessage("Document JSON 생성 완료 — TDE Interface (Rendering Only · Engine ❌)");
  };

  const technology = lifecycleView?.technology;
  const traceability = lifecycleView?.traceability;

  return (
    <div className="company-management-page lot-lifecycle-page">
      <div className="company-management-page__head">
        <div>
          <h2>LOT Lifecycle (Technology Summary)</h2>
          <p className="company-management-page__intro">
            LOT에 <strong>Knowledge Record</strong>와 <strong>Actual Work Record</strong>를 연결하여
            Technology Summary를 조회합니다. Document JSON은 TDE Interface용 구조만 생성합니다.{" "}
            <strong>TDE Rendering Engine 미구현</strong> (Sprint 9 Phase 5)
          </p>
        </div>
      </div>

      <section className="company-master-kpis" aria-label="LOT Lifecycle 현황">
        {summaryKpis.map((kpi) => {
          const Icon = CATEGORY_ICON[kpi.id] ?? Layers;
          return (
            <div key={kpi.id} className="company-master-kpi">
              <div className="company-master-kpi__head">
                <span className="company-master-kpi__icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="company-master-kpi__label">{kpi.label}</span>
              </div>
              <div className="company-master-kpi__value">
                {Number(kpi.value ?? 0).toLocaleString("ko-KR")}
                <em>{kpi.unit}</em>
              </div>
            </div>
          );
        })}
      </section>

      <div className="lot-lifecycle-search">
        <input
          type="search"
          value={lotInput}
          onChange={(event) => setLotInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSearch();
          }}
          placeholder="LOT.NO 입력 (예: LOT-20260707-001)"
          aria-label="LOT 검색"
        />
        <SecondaryButton type="button" onClick={handleSearch}>
          <Search size={14} aria-hidden="true" />
          조회
        </SecondaryButton>
      </div>

      {!activeLot ? (
        <div className="lot-lifecycle-empty">
          <Layers size={36} aria-hidden="true" />
          <p>LOT.NO를 입력하면 Technology Summary가 표시됩니다.</p>
        </div>
      ) : !lifecycleView?.hasTechnology ? (
        <div className="lot-lifecycle-empty">
          <p>LOT '{activeLot}'에 연결된 Knowledge 또는 Actual Work 기록이 없습니다.</p>
          <span>생산관리 → 실제 작업 조건 · 품질관리 → Knowledge Record를 확인하세요.</span>
        </div>
      ) : (
        <div className="lot-lifecycle-workspace">
          <header className="lot-lifecycle-workspace__head">
            <div>
              <h3>{technology.lotNo}</h3>
              <span>
                {technology.recipeName} · {technology.recipeVersionNo} · {technology.templateLabel}
              </span>
            </div>
            <div className="lot-lifecycle-workspace__badges">
              <span className={deviationClass(technology.deviationJudgmentKey)}>
                편차 {technology.deviationJudgment}
              </span>
              {technology.hasKnowledge ? (
                <span className="lot-lifecycle-badge is-knowledge">Knowledge 연결</span>
              ) : null}
              {technology.hasActualWork ? (
                <span className="lot-lifecycle-badge is-actual">Actual Work 연결</span>
              ) : null}
            </div>
          </header>

          <nav className="company-detail-tabs" aria-label="LOT Lifecycle 상세">
            {LOT_DETAIL_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`company-detail-tabs__btn${activeTab === tab.id ? " is-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="lot-lifecycle-workspace__body">
            {activeTab === "basicInfo" || activeTab === "processHistory" ? (
              <section className="company-detail-section" aria-label="Technology Summary">
                <p className="company-detail-section__notice company-detail-section__notice--recipe" role="note">
                  Blueprint §6.1.1 — 대표 온도 · 대표 시간 · Version · 편차 · 판정 요약만 표시합니다.
                  전체 Recipe는 기준정보 Recipe Workspace에서 조회하세요.
                </p>

                {lifecycleView.knowledgeSummaryBlock ? (
                  <div className="lot-lifecycle-knowledge-block">
                    <h4 className="company-detail-section__subtitle">Knowledge Summary Block</h4>
                    <dl className="company-detail-section__grid company-detail-section__grid--profile">
                      {lifecycleView.knowledgeSummaryBlock.fields.map((field) => (
                        <div key={field.label}>
                          <dt>{field.label}</dt>
                          <dd>{field.value || "—"}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}

                <dl className="company-detail-section__grid company-detail-section__grid--profile">
                  {lifecycleView.displayRows.map((row) => (
                    <div key={row.label}>
                      <dt>{row.label}</dt>
                      <dd>{row.value || "—"}</dd>
                    </div>
                  ))}
                </dl>

                {technology.comparisonRows.length ? (
                  <table className="awr-condition-table lot-lifecycle-table">
                    <thead>
                      <tr>
                        <th>항목</th>
                        <th>표준 (Recipe)</th>
                        <th>실제 (작업)</th>
                        <th>편차</th>
                      </tr>
                    </thead>
                    <tbody>
                      {technology.comparisonRows.map((row) => (
                        <tr key={row.key}>
                          <td>{row.label}</td>
                          <td className="awr-condition-table__std">{row.standard}</td>
                          <td className="awr-condition-table__act">{row.actual}</td>
                          <td
                            className={`awr-condition-table__dev${
                              row.deviation !== "정상" && row.deviation !== "—" ? " is-diff" : ""
                            }`}
                          >
                            {row.deviation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : null}

                <div className="lot-lifecycle-links">
                  <Link className="lot-lifecycle-link" to="/production/actual-work">
                    Actual Work Record →
                  </Link>
                  <Link className="lot-lifecycle-link" to="/quality/knowledge">
                    Knowledge Record →
                  </Link>
                </div>
              </section>
            ) : null}

            {["inspectionHistory", "outboundHistory", "qr", "attachments", "memo"].includes(activeTab) ? (
              <section className="company-detail-section" aria-label="Traceability">
                {traceability ? (
                  <dl className="company-detail-section__grid company-detail-section__grid--trade">
                    <div>
                      <dt>관리번호</dt>
                      <dd>{traceability.managementId || "—"}</dd>
                    </div>
                    <div>
                      <dt>제품명</dt>
                      <dd>{traceability.productName || "—"}</dd>
                    </div>
                    <div>
                      <dt>현재 공정</dt>
                      <dd>{traceability.process || "—"}</dd>
                    </div>
                    <div>
                      <dt>설비</dt>
                      <dd>{traceability.equipmentName || "—"}</dd>
                    </div>
                    {activeTab === "inspectionHistory" ? (
                      <>
                        <div>
                          <dt>검사</dt>
                          <dd>{traceability.inspection?.status || "—"}</dd>
                        </div>
                        <div>
                          <dt>성적서</dt>
                          <dd>{traceability.certificate?.status || "—"}</dd>
                        </div>
                      </>
                    ) : activeTab === "outboundHistory" ? (
                      <div>
                        <dt>출고</dt>
                        <dd>{traceability.shipment?.status || "—"}</dd>
                      </div>
                    ) : (
                      <>
                        <div>
                          <dt>생산일보</dt>
                          <dd>{traceability.dailyReport?.status || "—"}</dd>
                        </div>
                        <div>
                          <dt>검사</dt>
                          <dd>{traceability.inspection?.status || "—"}</dd>
                        </div>
                        <div>
                          <dt>출고</dt>
                          <dd>{traceability.shipment?.status || "—"}</dd>
                        </div>
                      </>
                    )}
                  </dl>
                ) : (
                  <p className="company-detail-section__empty">Traceability 정보가 없습니다.</p>
                )}
              </section>
            ) : null}

            {activeTab === "qr" ? (
              <section className="company-detail-section" aria-label="Document JSON">
                <p className="company-detail-section__notice company-detail-section__notice--recipe" role="note">
                  TITAN이 Document JSON을 생성합니다. TDE는 Header · Body · Table · Graph · Photo ·
                  Approval · Footer를 <strong>Rendering Only</strong>로 처리합니다 (Engine 미구현).
                </p>

                <div className="lot-lifecycle-doc-slots">
                  <span className="lot-lifecycle-doc-slots__label">TDE Rendering Slots:</span>
                  {TDE_RENDER_SLOTS.map((slot) => (
                    <span key={slot} className="lot-lifecycle-doc-slot">
                      {slot}
                    </span>
                  ))}
                </div>

                <SecondaryButton type="button" onClick={handleGenerateDocumentJson}>
                  <FileJson size={14} aria-hidden="true" />
                  Document JSON 생성
                </SecondaryButton>

                {docMessage ? <p className="lot-lifecycle-doc-message">{docMessage}</p> : null}

                {documentJson ? (
                  <pre className="awr-knowledge-preview">{JSON.stringify(documentJson, null, 2)}</pre>
                ) : null}
              </section>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
