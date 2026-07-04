import { NavLink } from "react-router-dom";
import { TITAN_MENU_CATALOG } from "../../config/menuConfig";
import { MENU_FREEZE_SIDEBAR_ORDER, buildSidebarGroups } from "../../config/menuFreezeV1";
import { MODULE_SIDEBAR_EXTRAS } from "../../config/titanV12ModuleExpansion";
import { getVisibleSidebarMenu } from "../../utils/titanEditionMenu";
import { getTitanEditionDisplayLabel } from "../../utils/titanEditionSession";
import { useTitanModuleFlags } from "../../hooks/useTitanModuleFlags";
import { useTitanAuth } from "../../hooks/useTitanAuth";
import "./Sidebar.css";

export default function Sidebar() {
  useTitanModuleFlags();
  useTitanAuth();
  const menuItems = getVisibleSidebarMenu();
  const menuById = Object.fromEntries(menuItems.map((item) => [item.id, item]));

  const frozenIds = menuItems
    .filter((item) => MENU_FREEZE_SIDEBAR_ORDER.includes(item.id))
    .map((item) => item.id);
  const extraItems = menuItems.filter((item) => MODULE_SIDEBAR_EXTRAS.includes(item.id));

  const groups = buildSidebarGroups(frozenIds);

  const renderLink = (id) => {
    const item = menuById[id] ?? TITAN_MENU_CATALOG[id];
    if (!item) return null;
    const Icon = item.icon;
    return (
      <NavLink
        key={id}
        to={item.path}
        end={item.end}
        className={({ isActive }) => `titan-sidebar__link${isActive ? " active" : ""}`}
      >
        <Icon size={16} aria-hidden="true" />
        {item.label}
      </NavLink>
    );
  };

  return (
    <aside className="titan-sidebar">
      <div className="titan-sidebar__brand">
        <strong>NDK PQMS</strong>
        <span>Project TITAN · Menu Freeze V1.0</span>
        <span className="titan-sidebar__edition">{getTitanEditionDisplayLabel()}</span>
      </div>

      <nav className="titan-sidebar__nav" aria-label="메인 메뉴">
        {groups.map((group, groupIndex) => (
          <div
            key={group.id}
            className={`titan-sidebar__group${groupIndex > 0 ? " titan-sidebar__group--divider" : ""}`}
          >
            {group.items.map(({ id }) => renderLink(id))}
          </div>
        ))}

        {extraItems.length > 0 ? (
          <div className="titan-sidebar__group titan-sidebar__group--divider">
            {extraItems.map((item) => renderLink(item.id))}
          </div>
        ) : null}
      </nav>

      <div className="titan-sidebar__footer">Menu Freeze V1.0 · © NDK</div>
    </aside>
  );
}
