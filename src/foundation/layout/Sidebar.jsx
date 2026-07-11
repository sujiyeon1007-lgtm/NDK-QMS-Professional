import { NavLink, useLocation } from "react-router-dom";
import {
  getGlobalNavSectionLabel,
  getGlobalNavSidebarItems,
  isGlobalNavSidebarItemActive,
  resolveGlobalNavSectionId,
} from "../../config/menuConfig";
import { useTitanModuleFlags } from "../../hooks/useTitanModuleFlags";
import { useTitanAuth } from "../../hooks/useTitanAuth";
import { isTitanAdminUser } from "../../utils/titanAdminAccess";
import { isMenuAllowedForUser } from "../../utils/titanPermissionRuntime";
import "./Sidebar.css";

export default function Sidebar() {
  const { flags } = useTitanModuleFlags();
  useTitanAuth();
  const location = useLocation();
  const isAdmin = isTitanAdminUser();

  const sectionId = resolveGlobalNavSectionId(location.pathname);
  const sectionLabel = getGlobalNavSectionLabel(sectionId);
  const sidebarItems = getGlobalNavSidebarItems(sectionId, { isAdmin, flags }).filter((item) =>
    item.catalogId ? isMenuAllowedForUser(item.catalogId, flags) : true
  );

  return (
    <aside className="titan-sidebar">
      <nav className="titan-sidebar__nav" aria-label={`${sectionLabel} 메뉴`}>
        <div className="titan-sidebar__group">
          <div className="titan-sidebar__group-label">{sectionLabel}</div>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isGlobalNavSidebarItemActive(item, location.pathname);
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.end}
                className={`titan-sidebar__link${active ? " active" : ""}`}
              >
                <Icon size={16} aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="titan-sidebar__footer">Menu V2 · © NDK</div>
    </aside>
  );
}
