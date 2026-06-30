import CollapsePanel from "./CollapsePanel";
import { PrimaryButton } from "./Button";
import TitanMultilineText from "./TitanMultilineText";
import { PROCESS_FLOW_PANEL_TITLE } from "../../utils/processFlow";

/**
 * Project TITAN V1.0 — 우측 패널 공통
 * ① 상세정보 → ② 주요 기능 버튼 → ③ 공정 흐름도
 */
export default function TitanDetailPanel({
  detailContent,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  processFlowSteps = [],
  className = "",
}) {
  return (
    <aside className={`titan-detail-panel inbound-page__detail ${className}`.trim()}>
      <CollapsePanel title="상세정보" defaultOpen>
        {detailContent}
      </CollapsePanel>

      <hr className="titan-detail-panel__divider" />

      <PrimaryButton type="button" className="titan-detail-panel__action" onClick={onAction}>
        {ActionIcon ? <ActionIcon size={14} aria-hidden="true" className="titan-btn__icon" /> : null}
        <TitanMultilineText text={actionLabel} />
      </PrimaryButton>

      <hr className="titan-detail-panel__divider" />

      <CollapsePanel title={PROCESS_FLOW_PANEL_TITLE} defaultOpen>
        <ol className="inbound-tasks">
          {processFlowSteps.map((task) => (
            <li key={task.id} className={`inbound-tasks__item inbound-tasks__item--${task.state}`}>
              <strong>{task.label}</strong>
              <span>{task.desc}</span>
            </li>
          ))}
        </ol>
      </CollapsePanel>
    </aside>
  );
}
