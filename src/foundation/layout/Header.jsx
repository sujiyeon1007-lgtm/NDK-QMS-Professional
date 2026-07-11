import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Building2,
  Calculator,
  Database,
  Factory,
  FileText,
  Home,
  LogOut,
  Package,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { getWorkspaceHeaderKpiItems } from "../../utils/titanWorkspaceHeaderMetrics";

import SidebarBrand from "./SidebarBrand";
import { SecondaryButton } from "../components/Button";
import { getAuthDisplayUser, clearAuthSession } from "../../utils/titanAuthSession";
import { TITAN_LOGIN_STORAGE } from "../../config/titanLoginSystem";
import { isDemoAdminModeActive } from "../../utils/titanAdminAccess";
import {
  TITAN_GLOBAL_NAV_V2_UTILITIES,
  getVisibleGlobalNavV2Items,
  isGlobalNavItemActive,
  resolveGlobalNavSectionId,
  getWorkspaceHeaderMetaV2,
} from "../../config/menuConfig";
import { useTitanModuleFlags } from "../../hooks/useTitanModuleFlags";

const GLOBAL_NAV_UTILITY_ICONS = {
  notifications: Bell,
  admin: Shield,
};

const WORKSPACE_HEADER_ICONS = {
  home: Home,
  operations: Package,
  production: Factory,
  quality: ShieldCheck,
  documents: FileText,
  statistics: BarChart3,
  accountingClerk: Wallet,
  accounting: Calculator,
  masterData: Database,
  company: Building2,
  environment: Settings,
};

const BANNER_CHIPS = [
  { id: "company-notice", label: "회사 공지", tone: "info" },
  { id: "system-stable", label: "시스템 안정", tone: "success" },
  { id: "server-status", label: "서버 정상", tone: "neutral" },
];

function formatTodayLabel(date) {
  const pad = (value) => String(value).padStart(2, "0");
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `금일 ${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} (${weekdays[date.getDay()]})`;
}

export function TitanBanner() {
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());
  const [user, setUser] = useState(() => getAuthDisplayUser());
  const [dismissedChips, setDismissedChips] = useState(() => new Set());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000 * 60);
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

  const userLabel = user.isProgramAdministrator
    ? user.name
    : [user.name, user.department, user.rank || "사원"].filter(Boolean).join(" / ");

  const visibleChips = BANNER_CHIPS.filter((chip) => !dismissedChips.has(chip.id));

  return (
    <header className="titan-banner" aria-label="시스템 배너">
      <div className="titan-banner__chips" aria-label="시스템 알림">
        {visibleChips.map((chip) => (
          <span key={chip.id} className={`titan-banner__chip titan-banner__chip--${chip.tone}`}>
            {chip.id === "server-status" ? <Server size={12} aria-hidden="true" /> : null}
            {chip.label}
            <button
              type="button"
              className="titan-banner__chip-dismiss"
              aria-label={`${chip.label} 닫기`}
              onClick={() => setDismissedChips((prev) => new Set([...prev, chip.id]))}
            >
              <X size={10} aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>

      <div className="titan-banner__spacer" />

      {isDemoAdminModeActive() ? (
        <div className="titan-banner__demo-admin" aria-label="Demo Admin Mode">
          DEMO ADMIN
        </div>
      ) : null}

      <div className="titan-banner__meta" aria-label="세션 정보">
        <span className="titan-banner__date">{formatTodayLabel(now)}</span>
        <span className="titan-banner__site">사업장 · NDK 1공장</span>
        <div className="titan-banner__user">
          <UserRound size={15} aria-hidden="true" />
          <strong>{userLabel}</strong>
        </div>
        <button
          type="button"
          className="titan-banner__notify"
          aria-label="알림"
          onClick={() => navigate("/environment/notifications")}
        >
          <Bell size={16} aria-hidden="true" />
        </button>
        <SecondaryButton type="button" className="titan-banner__logout" onClick={handleLogout}>
          <LogOut size={14} aria-hidden="true" />
          로그아웃
        </SecondaryButton>
      </div>
    </header>
  );
}

export function GlobalNav() {
  const location = useLocation();
  const { flags } = useTitanModuleFlags();
  const navItems = getVisibleGlobalNavV2Items(flags);

  return (
    <nav className="titan-global-nav" aria-label="전역 업무 메뉴">
      <div className="titan-global-nav__brand">
        <SidebarBrand />
      </div>
      <div className="titan-global-nav__workflow">
        {navItems.map((item) => {
          const active = isGlobalNavItemActive(item, location.pathname);
          return (
            <NavLink
              key={item.id}
              to={item.path}
              data-section={item.id}
              className={`titan-global-nav__link${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </NavLink>
          );
        })}
      </div>
      <div className="titan-global-nav__utilities" aria-label="시스템 유틸리티">
        {TITAN_GLOBAL_NAV_V2_UTILITIES.map((item) => {
          const Icon = GLOBAL_NAV_UTILITY_ICONS[item.id];
          const active = isGlobalNavItemActive(item, location.pathname);
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={`titan-global-nav__utility${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {Icon ? <Icon size={14} aria-hidden="true" /> : null}
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export function TitanWorkspaceHeader() {
  const location = useLocation();
  const sectionId = resolveGlobalNavSectionId(location.pathname);
  const meta = getWorkspaceHeaderMetaV2(sectionId);
  const Icon = WORKSPACE_HEADER_ICONS[sectionId] ?? Home;
  const kpiItems = getWorkspaceHeaderKpiItems(sectionId);

  return (
    <header
      className="titan-shell-workspace-header"
      data-section={sectionId}
      aria-label={`${meta.title} Workspace`}
    >
      <div className="titan-shell-workspace-header__identity">
        <span className="titan-shell-workspace-header__icon" aria-hidden="true">
          <Icon size={22} strokeWidth={2.2} />
        </span>
        <div className="titan-shell-workspace-header__main">
          <h1 className="titan-shell-workspace-header__title">{meta.title}</h1>
          <p className="titan-shell-workspace-header__description">{meta.description}</p>
        </div>
      </div>
      {kpiItems.length ? (
        <div className="titan-shell-workspace-header__kpi" aria-label="Workspace KPI">
          {kpiItems.map((item, index) => (
            <span key={item.id} className="titan-shell-workspace-header__kpi-item">
              {index > 0 ? (
                <span className="titan-shell-workspace-header__kpi-sep" aria-hidden="true">
                  ·
                </span>
              ) : null}
              {item.label} <strong>{item.display}</strong>
            </span>
          ))}
        </div>
      ) : null}
    </header>
  );
}

/** @deprecated Use TitanBanner */
export function Banner() {
  return <TitanBanner />;
}

/** @deprecated Use TitanBanner */
export default function Header() {
  return <TitanBanner />;
}
