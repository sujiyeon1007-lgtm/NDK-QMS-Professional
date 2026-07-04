import TitanManagementRowSummary from "./TitanManagementRowSummary";

/**
 * @deprecated use TitanManagementRowSummary
 */
export default function TitanManagementMasterDetail({
  record,
  emptyMessage,
  detailPanelProps,
  panelTitle,
  showTraceability = false,
  onSelectCoLotProduct,
  traceabilityProps: _traceabilityProps,
  ...rest
}) {
  const props = detailPanelProps ?? {};
  const rawRecord = record?.record ?? record;

  return (
    <TitanManagementRowSummary
      record={record}
      emptyMessage={emptyMessage}
      infoTitle={panelTitle === "선택한 Row의 상세정보" ? "제품 정보" : panelTitle || "제품 정보"}
      detailContent={props.detailContent}
      processFlowSteps={props.processFlowSteps}
      showProcessFlow={props.showProcessFlow ?? true}
      processFlowTitle={props.processFlowTitle}
      actionLabel={props.actionLabel}
      actionIcon={props.actionIcon}
      onAction={props.onAction}
      secondaryActionLabel={props.secondaryActionLabel}
      secondaryActionIcon={props.secondaryActionIcon}
      onSecondaryAction={props.onSecondaryAction}
      actionsTitle={props.actionsTitle}
      showTraceability={showTraceability}
      traceRecord={showTraceability ? rawRecord : null}
      onSelectCoLotProduct={onSelectCoLotProduct}
      {...rest}
    />
  );
}
