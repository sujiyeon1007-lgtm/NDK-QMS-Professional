import { Link } from "react-router-dom";

import { EQUIPMENT_RUN_STATUS_META } from "../../../config/equipmentConfig";
import { PrimaryButton, SecondaryButton } from "../../../foundation/components/Button";
import StatusChip from "../../../foundation/components/StatusChip";
import HomeAnimatedProgressBar from "../../Home/HomeAnimatedProgressBar";
import "./QrWorkflowTechnologyStack.css";

function SectionCard({ title, badge, children, emptyMessage }) {
  const isEmpty = !children;
  return (
    <section className="qr-tech-stack__section" aria-label={title}>
      <header className="qr-tech-stack__section-head">
        <h3>{title}</h3>
        {badge ? <span className="qr-tech-stack__badge">{badge}</span> : null}
      </header>
      {isEmpty ? (
        <p className="qr-tech-stack__empty">{emptyMessage ?? "No linked data."}</p>
      ) : (
        children
      )}
    </section>
  );
}

function FieldGrid({ rows }) {
  return (
    <dl className="qr-tech-stack__grid">
      {(rows ?? []).map((row) => (
        <div key={`${row.label}-${row.value}`}>
          <dt>{row.label}</dt>
          <dd>{row.value ?? "-"}</dd>
        </div>
      ))}
    </dl>
  );
}

function QrWorkflowActionBar({ links, lotNo }) {
  const disabledTitle = "Sprint 10 Phase 1 placeholder";
  return (
    <footer className="qr-tech-stack__actions" aria-label="QR Workflow actions">
      <PrimaryButton type="button" disabled title={disabledTitle}>작업 시작</PrimaryButton>
      <SecondaryButton type="button" disabled title={disabledTitle}>작업 완료</SecondaryButton>
      <SecondaryButton type="button" disabled title={disabledTitle}>검사 등록</SecondaryButton>
      {lotNo ? (
        <Link to={links?.lotLifecycle ?? `/quality/lot-lifecycle?lot=${encodeURIComponent(lotNo)}`}>
          <SecondaryButton type="button">LOT Lifecycle 이동</SecondaryButton>
        </Link>
      ) : (
        <SecondaryButton type="button" disabled>LOT Lifecycle 이동</SecondaryButton>
      )}
      {lotNo ? (
        <Link to={links?.documents ?? `/quality/lot-lifecycle?lot=${encodeURIComponent(lotNo)}`}>
          <SecondaryButton type="button">관련 문서 보기</SecondaryButton>
        </Link>
      ) : (
        <SecondaryButton type="button" disabled>관련 문서 보기</SecondaryButton>
      )}
    </footer>
  );
}

export default function QrWorkflowTechnologyStack({ view }) {
  if (!view) return null;
  const summary = view.equipmentSummary;
  const statusMeta = EQUIPMENT_RUN_STATUS_META[summary?.status] ?? EQUIPMENT_RUN_STATUS_META.idle;

  return (
    <div className="qr-tech-stack" aria-label="QR Workflow Technology Stack">
      <SectionCard title="Equipment Summary" badge={summary?.process} emptyMessage={null}>
        <div className="qr-tech-stack__summary">
          <div className="qr-tech-stack__summary-head">
            <strong>{summary?.equipmentName ?? "-"}</strong>
            <StatusChip variant={statusMeta.variant}>{statusMeta.emoji} {statusMeta.label}</StatusChip>
          </div>
          <FieldGrid rows={[
            { label: "현재 작업", value: summary?.currentWork },
            { label: "현재 LOT", value: summary?.currentLotNo },
            { label: "작업자", value: summary?.operator },
            { label: "시작시간", value: summary?.startTime },
            { label: "예상 종료", value: summary?.expectedEndTime },
          ]} />
          <div className="qr-tech-stack__progress">
            <span>진행률</span>
            <HomeAnimatedProgressBar percent={summary?.progress ?? 0} processKey="production" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Recipe" badge={view.recipe?.recipeVersionNo} emptyMessage="LOT에 연결된 Recipe가 없습니다.">
        {view.recipe ? (
          <>
            <FieldGrid rows={[
              { label: "적용 Recipe", value: view.recipe.recipeName },
              { label: "Recipe Template", value: view.recipe.templateLabel },
              { label: "공정", value: view.recipe.processName },
            ]} />
            {view.recipe.processSteps?.length ? (
              <div className="qr-tech-stack__steps">
                <h4>공정 순서</h4>
                <ol>{view.recipe.processSteps.map((step) => (
                  <li key={step.order}><span>{step.order}</span><strong>{step.label}</strong><em>{step.fieldCount}항목</em></li>
                ))}</ol>
              </div>
            ) : null}
            {view.recipe.conditionRows?.length ? (
              <div className="qr-tech-stack__table-wrap">
                <h4>작업 조건 (표준)</h4>
                <table className="qr-tech-stack__table"><thead><tr><th>구분</th><th>항목</th><th>표준값</th></tr></thead>
                <tbody>{view.recipe.conditionRows.slice(0, 8).map((row) => (
                  <tr key={`${row.section}-${row.label}`}><td>{row.section}</td><td>{row.label}</td><td>{row.value}</td></tr>
                ))}</tbody></table>
              </div>
            ) : null}
          </>
        ) : null}
      </SectionCard>

      <SectionCard title="Actual Work" badge={view.actualWork?.statusLabel} emptyMessage="연결된 Actual Work Record가 없습니다.">
        {view.actualWork ? (
          <>
            <FieldGrid rows={view.actualWork.fields} />
            {view.actualWork.workMemo ? <p className="qr-tech-stack__memo"><strong>작업내용</strong>{view.actualWork.workMemo}</p> : null}
          </>
        ) : null}
      </SectionCard>

      <SectionCard title="Inspection" badge={view.inspection?.resultLabel}>
        <FieldGrid rows={[
          { label: "검사 상태", value: view.inspection?.inspectionStatus ?? "미검사" },
          { label: "품질 상태", value: view.inspection?.qualityStatus ?? "-" },
          { label: "판정", value: view.inspection?.resultLabel ?? "-" },
          { label: "검사자", value: view.inspection?.inspectorName ?? "-" },
          { label: "검사일시", value: view.inspection?.inspectedAt ?? "-" },
        ]} />
        {view.inspection?.fields?.length ? (
          <div className="qr-tech-stack__table-wrap">
            <table className="qr-tech-stack__table"><thead><tr><th>항목</th><th>결과</th></tr></thead>
            <tbody>{view.inspection.fields.map((row) => (<tr key={row.key}><td>{row.label}</td><td>{row.value}</td></tr>))}</tbody></table>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard title="Knowledge" badge={view.knowledge?.deviationJudgment} emptyMessage="축적된 Knowledge Record가 없습니다.">
        {view.knowledge ? (
          <>
            {view.knowledge.summaryFields?.length ? <FieldGrid rows={view.knowledge.summaryFields} /> : null}
            {view.knowledge.tips?.length ? <ul className="qr-tech-stack__tips">{view.knowledge.tips.map((tip) => (<li key={tip}>{tip}</li>))}</ul> : null}
            {view.knowledge.recommendedConditions?.length ? (
              <div className="qr-tech-stack__table-wrap">
                <h4>추천 조건 (표준 대비)</h4>
                <table className="qr-tech-stack__table"><thead><tr><th>항목</th><th>표준</th><th>실제</th><th>편차</th></tr></thead>
                <tbody>{view.knowledge.recommendedConditions.map((row) => (
                  <tr key={row.label}><td>{row.label}</td><td>{row.standard}</td><td>{row.actual}</td><td>{row.deviation}</td></tr>
                ))}</tbody></table>
              </div>
            ) : null}
          </>
        ) : null}
      </SectionCard>

      <SectionCard title="LOT Lifecycle" badge={view.lotNo || "-"}>
        {view.lotLifecycle ? (
          <>
            <FieldGrid rows={[
              { label: "현재 공정", value: view.lotLifecycle.currentProcess },
              { label: "관리번호", value: view.lotLifecycle.managementId },
              { label: "진행률", value: `${view.lotLifecycle.progress ?? 0}%` },
            ]} />
            {view.lotLifecycle.traceabilitySteps?.length ? (
              <div className="qr-tech-stack__steps qr-tech-stack__steps--inline">
                {view.lotLifecycle.traceabilitySteps.map((step) => (
                  <div key={step.label} className="qr-tech-stack__trace-step"><span>{step.label}</span><strong>{step.value}</strong></div>
                ))}
              </div>
            ) : null}
            {view.lotLifecycle.timeline?.length ? (
              <ol className="qr-tech-stack__timeline">{view.lotLifecycle.timeline.map((row) => (
                <li key={`${row.time}-${row.label}`}><time>{row.time}</time><strong>{row.label}</strong><span>{row.detail}</span></li>
              ))}</ol>
            ) : (<p className="qr-tech-stack__empty">Timeline 이력이 없습니다.</p>)}
            {view.lotLifecycle.relatedDocuments?.length ? (
              <ul className="qr-tech-stack__docs">{view.lotLifecycle.relatedDocuments.map((doc) => (
                <li key={doc.documentId}>{doc.documentId} - {doc.documentType}</li>
              ))}</ul>
            ) : (<p className="qr-tech-stack__empty">Related Document JSON 없음</p>)}
          </>
        ) : (<p className="qr-tech-stack__empty">LOT를 선택하면 Lifecycle 정보가 표시됩니다.</p>)}
      </SectionCard>

      <QrWorkflowActionBar links={view.links} lotNo={view.lotNo} />
    </div>
  );
}