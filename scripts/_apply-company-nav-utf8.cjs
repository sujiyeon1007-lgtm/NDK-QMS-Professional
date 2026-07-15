const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function writeUtf8(rel, text) {
  const filePath = path.join(root, rel);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text.replace(/\r?\n/g, "\n"), { encoding: "utf8" });
}

function decodeFile(rel) {
  const buf = fs.readFileSync(path.join(root, rel));
  if (buf.length >= 2 && buf[1] === 0 && buf[0] < 0x80) {
    const body = buf[0] === 0xff && buf[1] === 0xfe ? buf.slice(2) : buf;
    return body.toString("utf16le");
  }
  if (buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.slice(2).toString("utf16le");
  }
  return buf.toString("utf8");
}

const layout = `import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import {
  COMPANY_WORKSPACE_COPY,
  COMPANY_WORKSPACE_ROUTES,
} from "../../config/companyWorkspaceArchitecture";
import { ensureCompanyWorkspaceSeeded } from "../../utils/companyWorkspaceService";
import CompanyWorkspaceNav from "./components/CompanyWorkspaceNav";
import "../../foundation/styles/titan-hub-page.css";
import "./Company.css";

function isCompanyWorkspaceShellPath(pathname) {
  return pathname === "/company" || pathname.startsWith("/company/");
}

const MAIN_NAV = [
  { to: COMPANY_WORKSPACE_ROUTES.dashboard, label: COMPANY_WORKSPACE_COPY.dashboardTitle },
  { to: COMPANY_WORKSPACE_ROUTES.information, label: COMPANY_WORKSPACE_COPY.informationTitle },
  { to: COMPANY_WORKSPACE_ROUTES.sites, label: COMPANY_WORKSPACE_COPY.sitesTitle },
  { to: COMPANY_WORKSPACE_ROUTES.organization, label: COMPANY_WORKSPACE_COPY.organizationTitle },
  { to: COMPANY_WORKSPACE_ROUTES.departments, label: COMPANY_WORKSPACE_COPY.departmentsTitle },
  { to: COMPANY_WORKSPACE_ROUTES.employees, label: COMPANY_WORKSPACE_COPY.employeesTitle },
  { to: COMPANY_WORKSPACE_ROUTES.positions, label: COMPANY_WORKSPACE_COPY.positionsTitle },
  { to: COMPANY_WORKSPACE_ROUTES.branding, label: COMPANY_WORKSPACE_COPY.brandingTitle },
  { to: COMPANY_WORKSPACE_ROUTES.documentFooter, label: COMPANY_WORKSPACE_COPY.documentFooterTitle },
];

export default function CompanyLayout() {
  const location = useLocation();
  const isWorkspaceHome = location.pathname === COMPANY_WORKSPACE_ROUTES.dashboard;

  useEffect(() => {
    ensureCompanyWorkspaceSeeded();
  }, [location.pathname]);

  if (!isCompanyWorkspaceShellPath(location.pathname)) {
    return <Outlet />;
  }

  return (
    <div className={\`company-workspace titan-section-page\${isWorkspaceHome ? " company-workspace--home" : ""}\`}>
      <header className="company-workspace-header" aria-label="Company Workspace Header">
        <div className="company-workspace-header__main">
          <span className="company-workspace-header__kicker">{COMPANY_WORKSPACE_COPY.workspaceKicker}</span>
          <h1 className="company-workspace-header__title">{COMPANY_WORKSPACE_COPY.workspaceTitle}</h1>
          <p className="company-workspace-header__intro">{COMPANY_WORKSPACE_COPY.workspaceIntro}</p>
        </div>
        <span className="company-workspace-header__note">{COMPANY_WORKSPACE_COPY.environmentSeparationNote}</span>
      </header>

      <nav className="company-workspace-nav" aria-label="Company Workspace">
        {MAIN_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === COMPANY_WORKSPACE_ROUTES.dashboard}
            className={({ isActive }) =>
              \`company-workspace-nav__link\${isActive ? " company-workspace-nav__link--active" : ""}\`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="company-workspace-shell">
        <CompanyWorkspaceNav />
        <div className="company-workspace-shell__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
`;

const nav = `import { NavLink } from "react-router-dom";

import {
  COMPANY_WORKSPACE_COPY,
  COMPANY_WORKSPACE_QUICK_LINKS,
  COMPANY_WORKSPACE_ROUTES,
} from "../../../config/companyWorkspaceArchitecture";

export default function CompanyWorkspaceNav() {
  return (
    <aside className="company-workspace-rail" aria-label="Company Workspace sidebar">
      <div className="company-workspace-rail__brand">
        <span className="company-workspace-rail__kicker">{COMPANY_WORKSPACE_COPY.workspaceKicker}</span>
        <NavLink to={COMPANY_WORKSPACE_ROUTES.dashboard} className="company-workspace-rail__home" end>
          {COMPANY_WORKSPACE_COPY.workspaceTitle}
        </NavLink>
        <p className="company-workspace-rail__desc">{COMPANY_WORKSPACE_COPY.workspaceLauncherDesc}</p>
      </div>

      <div className="company-workspace-rail__section company-workspace-rail__section--quick">
        <span className="company-workspace-rail__section-label">Quick Links</span>
        <ul className="company-workspace-rail__list">
          {COMPANY_WORKSPACE_QUICK_LINKS.map((item) => (
            <li key={item.id}>
              <NavLink to={item.path} className="company-workspace-rail__link company-workspace-rail__link--quick">
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
`;

writeUtf8("src/pages/Company/CompanyLayout.jsx", layout);
writeUtf8("src/pages/Company/components/CompanyWorkspaceNav.jsx", nav);

let css = decodeFile("src/pages/Company/Company.css");
css = css.replace(/\uFEFF/g, "");
css = css.replace(/\/\* Company Workspace \?\?Launcher-centric/, "/* Company Workspace — Launcher-centric");

if (!css.includes("company-workspace-rail__home")) {
  const titleBlock = `.company-workspace-rail__title {
  font-size: 15px;
  font-weight: 800;
  color: #f8fafc;
}
`;
  const railHomeBlock = `.company-workspace-rail__home {
  display: block;
  margin: 0;
  padding: 0;
  font-size: 15px;
  font-weight: 800;
  color: #f8fafc;
  text-decoration: none;
  line-height: 1.35;
  word-break: keep-all;
}

.company-workspace-rail__home:hover {
  color: #93c5fd;
}

.company-workspace-rail__desc {
  margin: 6px 0 0;
  padding: 0;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.45;
  color: #94a3b8;
  word-break: keep-all;
}
`;
  if (css.includes(titleBlock)) {
    css = css.replace(titleBlock, railHomeBlock);
  } else {
    css = css.replace(
      ".company-workspace-rail__kicker {",
      ".company-workspace-rail__kicker {"
    );
    css = css.replace(
      /(\.company-workspace-rail__kicker \{[\s\S]*?\})\n\n/,
      `$1\n\n${railHomeBlock}\n`
    );
  }
}

css = css.replace(
  /\.company-workspace-nav--secondary\s*\{[\s\S]*?\}\n\n?/g,
  ""
);

if (!/\.company-workspace-nav\s*\{[^}]*min-height:\s*44px/.test(css)) {
  css = css.replace(
    ".company-workspace-nav {\n  display: flex;",
    ".company-workspace-nav {\n  min-height: 44px;\n  display: flex;"
  );
}

css = css.replace(
  /\.company-workspace-rail__section--quick\s*\{[^}]*\}/,
  `.company-workspace-rail__section--quick {
  padding-top: 0;
}`
);

if (!/grid-template-columns:\s*200px/.test(css)) {
  css = css.replace(
    /grid-template-columns:\s*240px/,
    "grid-template-columns: 200px"
  );
}

writeUtf8("src/pages/Company/Company.css", css);

for (const rel of [
  "src/pages/Company/CompanyLayout.jsx",
  "src/pages/Company/components/CompanyWorkspaceNav.jsx",
  "src/pages/Company/Company.css",
]) {
  const b = fs.readFileSync(path.join(root, rel));
  const utf16 = b.length > 2 && b[1] === 0;
  console.log(rel, "bytes", b.length, "utf16le=", utf16, "bom0", b[0]);
}

