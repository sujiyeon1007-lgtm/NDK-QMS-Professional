import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, UserRound } from "lucide-react";

import { SecondaryButton } from "../components/Button";
import { getAuthDisplayUser, clearAuthSession } from "../../utils/titanAuthSession";
import { TITAN_LOGIN_STORAGE } from "../../config/titanLoginSystem";
import { getTitanEditionDisplayLabel } from "../../utils/titanEditionSession";
import { isDemoAdminModeActive } from "../../utils/titanAdminAccess";

function formatClock(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDate(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function Header() {
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());
  const [user, setUser] = useState(() => getAuthDisplayUser());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000 * 30);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const sync = () => setUser(getAuthDisplayUser());
    window.addEventListener(TITAN_LOGIN_STORAGE.authChanged, sync);
    return () => window.removeEventListener(TITAN_LOGIN_STORAGE.authChanged, sync);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <header className="titan-header">
      <h1 className="titan-header__title">NDK PQMS Professional</h1>
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
        <UserRound size={16} aria-hidden="true" />
        {user.isProgramAdministrator ? (
          <strong>{user.name}</strong>
        ) : (
          <strong>
            {[user.name, user.department, user.rank || "사원"].filter(Boolean).join(" / ")}
          </strong>
        )}
        <span>{formatDate(now)}</span>
        <span className="titan-header__clock">{formatClock(now)}</span>
        <SecondaryButton type="button" className="titan-header__logout" onClick={handleLogout}>
          <LogOut size={14} aria-hidden="true" />
          로그아웃
        </SecondaryButton>
      </div>
    </header>
  );
}
