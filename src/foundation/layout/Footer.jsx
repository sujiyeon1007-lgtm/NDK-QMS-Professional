import { useMemo } from "react";
import { getSystemStatusSummary } from "../../utils/environmentSettingsSession";
import { getCurrentTitanUser } from "../../utils/titanHistorySession";

function parseLoginLabel(raw = "") {
  const text = String(raw ?? "").trim();
  if (!text) return "관리자";
  if (text.includes("/")) {
    const name = text.split("/")[1]?.trim()?.replace(/\s*사원\s*$/, "");
    return name || "관리자";
  }
  return text;
}

export default function Footer() {
  const status = useMemo(() => getSystemStatusSummary(), []);
  const loginUser = parseLoginLabel(getCurrentTitanUser());
  const backupLabel = status.latestBackupLabel === "—" ? "—" : "완료";

  return (
    <footer className="titan-footer">
      <span>SQLite : {status.dbStatus}</span>
      <span>백업 : {backupLabel}</span>
      <span>{loginUser} 로그인</span>
      <span>Project TITAN V1.0</span>
    </footer>
  );
}
