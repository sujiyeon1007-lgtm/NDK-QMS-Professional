import TitanWorkflowStepTrack from "../../foundation/components/TitanWorkflowStepTrack";

/** 테이블 셀 — 공정 Step Indicator (현재 공정 Pulse) */
export default function HomeWorkflowStepCell({ row }) {
  if (!row?.phases?.length) {
    return <span className="home-workflow-step-cell__empty">—</span>;
  }

  return (
    <TitanWorkflowStepTrack
      phases={row.phases}
      showCaptions={false}
      className="titan-workflow-step-track--table-compact"
      ariaLabel={`${row.managementId ?? ""} 공정 진행`}
    />
  );
}
