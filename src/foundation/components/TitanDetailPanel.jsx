import CollapsePanel from "./CollapsePanel";
import { PrimaryButton, SecondaryButton } from "./Button";
import TitanMultilineText from "./TitanMultilineText";
import { PROCESS_FLOW_PANEL_TITLE } from "../../utils/processFlow";

/**
 * Project TITAN V1.0 — 좌측 Widget 패널 공통
 * ① 상세정보 → ② 공정 흐름도 → ③ 주요 기능 버튼
 */
export default function TitanDetailPanel({
  detailContent,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  secondaryActionLabel,
  secondaryActionIcon: SecondaryActionIcon,
  onSecondaryAction,
  processFlowSteps = [],
  showProcessFlow = true,
  className = "",
}) {
  const hasPrimaryAction = Boolean(actionLabel && onAction);
  const hasSecondaryAction = Boolean(secondaryActionLabel && onSecondaryAction);
  const hasActions = hasPrimaryAction || hasSecondaryAction;

  return (
    <aside className={`titan-detail-panel inbound-page__detail ${className}`.trim()}>
      <CollapsePanel title="상세정보" defaultOpen>
        {detailContent}
      </CollapsePanel>

      {showProcessFlow ? (
        <>
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
        </>
      ) : null}

      {hasActions ? (
        <>
          <hr className="titan-detail-panel__divider" />

          {hasPrimaryAction ? (
            <PrimaryButton type="button" className="titan-detail-panel__action" onClick={onAction}>
              {ActionIcon ? <ActionIcon size={14} aria-hidden="true" className="titan-btn__icon" /> : null}
              <TitanMultilineText text={actionLabel} format={false} />
            </PrimaryButton>
          ) : null}

          {hasSecondaryAction ? (
            <SecondaryButton
              type="button"
              className="titan-detail-panel__action titan-detail-panel__action--secondary"
              onClick={onSecondaryAction}
            >
              {SecondaryActionIcon ? (
                <SecondaryActionIcon size={14} aria-hidden="true" className="titan-btn__icon" />
              ) : null}
              <TitanMultilineText text={secondaryActionLabel} format={false} />
            </SecondaryButton>
          ) : null}
        </>
      ) : null}
    </aside>
  );
}
