import { NavLink } from "react-router-dom";
import { getVisibleSidebarMenu } from "../../utils/titanEditionMenu";
import { getTitanEditionDisplayLabel } from "../../utils/titanEditionSession";
import "./Sidebar.css";

export default function Sidebar() {
  const menuItems = getVisibleSidebarMenu();

  return (
    <aside className="titan-sidebar">
      <div className="titan-sidebar__brand">
        <strong>NDK PQMS</strong>
        <span>Project TITAN V1.0</span>
        <span className="titan-sidebar__edition">{getTitanEditionDisplayLabel()}</span>
      </div>

      <nav className="titan-sidebar__nav" aria-label="메인 메뉴">
        {menuItems.map(({ id, label, icon: Icon, path, end }) => (
          <NavLink
            key={id}
            to={path}
            end={end}
            className={({ isActive }) => `titan-sidebar__link${isActive ? " active" : ""}`}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="titan-sidebar__footer">Ver 1.0 · © NDK MES</div>
    </aside>
  );
}
