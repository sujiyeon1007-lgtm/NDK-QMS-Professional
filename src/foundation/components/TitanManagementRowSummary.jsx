import { PrimaryButton, SecondaryButton } from "./Button";
import TitanMultilineText from "./TitanMultilineText";
import TitanProductRowSummary from "./TitanProductRowSummary";
import { PROCESS_FLOW_PANEL_TITLE } from "../../utils/processFlow";
import { TitanRowSummary, TitanRowSummaryCard } from "./TitanRowSummary";

/**
 * 입고·출고·생산일보·성적서 — HOME 스타일 요약 Card
 */
export default function TitanManagementRowSummary({
  record,
  emptyMessage = "리스트에서 항목을 선택하세요.",
  infoTitle = "제품 정보",
  detailContent,
  processFlowSteps = [],
  showProcessFlow = true,
  processFlowTitle = PROCESS_FLOW_PANEL_TITLE,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  secondaryActionLabel,
  secondaryActionIcon: SecondaryActionIcon,
  onSecondaryAction,
  actionsTitle = "작업",
  traceRecord = null,
  onSelectCoLotProduct,
  showTraceability = false,
}) {
  if (!record) {
    return <TitanRowSummary hasSelection={false} emptyMessage={emptyMessage} />;
  }

  const hasPrimaryAction = Boolean(actionLabel && onAction);
  const hasSecondaryAction = Boolean(secondaryActionLabel && onSecondaryAction);
  const hasActions = hasPrimaryAction || hasSecondaryAction;
  const rawRecord = traceRecord ?? record?.record ?? record;

  return (
    <TitanRowSummary>
      <TitanRowSummaryCard title={infoTitle}>{detailContent}</TitanRowSummaryCard>

      {showProcessFlow && processFlowSteps.length > 0 ? (
        <TitanRowSummaryCard title={processFlowTitle}>
          <ol className="inbound-tasks">
            {processFlowSteps.map((task) => (
              <li key={task.id} className={`inbound-tasks__item inbound-tasks__item--${task.state}`}>
                <strong>{task.label}</strong>
                <span>{task.desc}</span>
              </li>
            ))}
          </ol>
        </TitanRowSummaryCard>
      ) : null}

      {hasActions ? (
        <TitanRowSummaryCard title={actionsTitle}>
          <div className="titan-row-summary__actions">
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
          </div>
        </TitanRowSummaryCard>
      ) : null}

      {showTraceability && rawRecord ? (
        <TitanProductRowSummary
          record={rawRecord}
          onSelectCoLotProduct={onSelectCoLotProduct}
          showProductInfo={false}
          embedMode
        />
      ) : null}
    </TitanRowSummary>
  );
}
