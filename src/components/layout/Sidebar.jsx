import { NavLink, useLocation } from "react-router-dom";
import NdkLogo from "../common/NdkLogo";
import { NAV_SECTIONS, matchNavTarget } from "../../config/navigation";
import "./Sidebar.css";

function SidebarNavLink({ to, label, icon: Icon, end, className = "sidebar-link" }) {
  const location = useLocation();
  const active = matchNavTarget(to, location);

  return (
    <NavLink
      to={to}
      end={end}
      className={`${className}${active ? " active" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={className.includes("sub") ? 15 : 16} aria-hidden="true" />
      <span className="sidebar-link-label">{label}</span>
    </NavLink>
  );
}

function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <NdkLogo className="ndk-logo--sidebar" />
        <p>Navigation</p>
        <span>NDK QMS</span>
      </div>

      <nav className="sidebar-nav" aria-label="Project TITAN 메뉴">
        {NAV_SECTIONS.map(({ id, label, icon: Icon, children }) => (
          <div key={id} className="sidebar-menu-group">
            <div className="sidebar-group-label">
              <Icon size={16} aria-hidden="true" />
              <span>{label}</span>
            </div>
            <div className="sidebar-subnav">
              {children.map(({ to, label: childLabel, icon: ChildIcon, end }) => (
                <SidebarNavLink
                  key={to}
                  to={to}
                  label={childLabel}
                  icon={ChildIcon}
                  end={end}
                  className="sidebar-link sidebar-sub-link"
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        Ver 1.0
        <br />
        © NDK MES
      </div>
    </aside>
  );
}

export default Sidebar;
