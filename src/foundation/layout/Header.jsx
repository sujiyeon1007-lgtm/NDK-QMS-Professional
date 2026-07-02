import { useEffect, useState } from "react";
import { isDemoAdminModeActive } from "../../utils/titanAdminAccess";
import { getCurrentTitanUser } from "../../utils/titanHistorySession";
import { getTitanEditionDisplayLabel } from "../../utils/titanEditionSession";

function parseCurrentUser(raw = "") {
  const text = String(raw ?? "").trim();
  if (!text) return { name: "사용자", department: "—" };
  if (text.includes("/")) {
    const [department, rest] = text.split("/").map((part) => part.trim());
    return {
      department: department || "—",
      name: rest?.replace(/\s*사원\s*$/, "") || text,
    };
  }
  return { name: text, department: "—" };
}

function formatClock(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDate(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function Header() {
  const [now, setNow] = useState(() => new Date());
  const user = parseCurrentUser(getCurrentTitanUser());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000 * 30);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="titan-header">
      <h1 className="titan-header__title">NDK QMS Professional</h1>
      <span className="titan-header__note">Project TITAN V1.0</span>
      <div className="titan-header__spacer" />
      {isDemoAdminModeActive() ? (
        <div className="titan-header__demo-admin" aria-label="Demo Admin Mode">
          DEMO ADMIN
        </div>
      ) : null}
      <div className="titan-header__edition" aria-label="실행 Edition">
        {getTitanEditionDisplayLabel()}
      </div>
      {import.meta.env.VITE_BETA_DEMO === "true" ? (
        <div className="titan-header__beta" aria-label="Beta Demo Build">
          <span>Project TITAN</span>
          <span>V1.0 Beta</span>
          <span>Demo Build</span>
        </div>
      ) : null}
      <div className="titan-header__user" aria-label="사용자 정보">
        <strong>{user.name}님</strong>
        <span>{user.department}</span>
        <span>{formatDate(now)}</span>
        <span className="titan-header__clock">{formatClock(now)}</span>
      </div>
    </header>
  );
}
