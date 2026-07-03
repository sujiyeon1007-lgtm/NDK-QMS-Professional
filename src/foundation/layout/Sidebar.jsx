import { NavLink } from "react-router-dom";
import { TITAN_MENU_CATALOG } from "../../config/menuConfig";
import { buildSidebarGroups } from "../../config/menuFreezeV1";
import { getVisibleSidebarMenu } from "../../utils/titanEditionMenu";
import { getTitanEditionDisplayLabel } from "../../utils/titanEditionSession";
import "./Sidebar.css";

export default function Sidebar() {
  const menuItems = getVisibleSidebarMenu();
  const menuById = Object.fromEntries(menuItems.map((item) => [item.id, item]));
  const groups = buildSidebarGroups(menuItems.map((item) => item.id));

  return (
    <aside className="titan-sidebar">
      <div className="titan-sidebar__brand">
        <strong>NDK PQMS</strong>
        <span>Project TITAN · Menu Freeze V1.3</span>
        <span className="titan-sidebar__edition">{getTitanEditionDisplayLabel()}</span>
      </div>

      <nav className="titan-sidebar__nav" aria-label="메인 메뉴">
        {groups.map((group, groupIndex) => (
          <div
            key={group.id}
            className={`titan-sidebar__group${groupIndex > 0 ? " titan-sidebar__group--divider" : ""}`}
          >
            {group.items.map(({ id }) => {
              const item = menuById[id] ?? TITAN_MENU_CATALOG[id];
              if (!item) return null;
              const Icon = item.icon;
              return (
                <NavLink
                  key={id}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `titan-sidebar__link${isActive ? " active" : ""}`
                  }
                >
                  <Icon size={16} aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="titan-sidebar__footer">Presentation V1.3 · © NDK</div>
    </aside>
  );
}
