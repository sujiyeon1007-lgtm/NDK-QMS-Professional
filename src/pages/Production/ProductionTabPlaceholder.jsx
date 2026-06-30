import PagePlaceholder from "../../foundation/pages/PagePlaceholder";

const TAB_NOTES = {
  results: "생산 실적 조회 · 집계 · 화면 설계 승인 후 구현",
};

export default function ProductionTabPlaceholder({ tabId, title }) {
  return (
    <PagePlaceholder
      section="생산관리"
      title={title}
      note={TAB_NOTES[tabId] ?? "화면 설계 승인 후 구현"}
    />
  );
}
