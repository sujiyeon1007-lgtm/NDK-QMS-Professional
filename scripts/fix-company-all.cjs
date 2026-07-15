const fs = require("fs");
const path = require("path");
const dir = "src/pages/Company";
const utf8 = (text, file) => {
  const p = path.join(dir, file);
  fs.writeFileSync(p, text, "utf8");
  if (fs.readFileSync(p).includes(0)) throw new Error("utf16: " + file);
  console.log("ok", file);
};

utf8(`import { useState } from "react";

import { COMPANY_WORKSPACE_COPY } from "../../config/companyWorkspaceArchitecture";
import { PrimaryButton } from "../../foundation/components/Button";
import { getCompanyProfile, updateCompanyMaster } from "../../utils/companyWorkspaceService";
import CompanyPageShell, { companyWorkspaceBreadcrumbTrail } from "./CompanyPageShell";

const FIELDS = [
  { key: "companyName", label: "\uD68C\uC0AC\uBA85" },
  { key: "englishName", label: "\uC601\uBB38\uBA85" },
  { key: "businessNumber", label: "\uC0AC\uC5C5\uC790\uB4F1\uB85D\uBC88\uD638" },
  { key: "corporateNumber", label: "\uBC95\uC778\uB4F1\uB85D\uBC88\uD638" },
  { key: "representative", label: "\uB300\uD45C\uC790" },
  { key: "businessType", label: "\uC5C5\uD0DC" },
  { key: "businessItem", label: "\uC885\uBAA9" },
  { key: "address", label: "\uC8FC\uC18C", span: 2 },
  { key: "phone", label: "\uC804\uD654" },
  { key: "fax", label: "\uD329\uC2A4" },
  { key: "email", label: "\uC774\uBA54\uC77C" },
  { key: "website", label: "\uD648\uD398\uC774\uC9C0" },
];

export default function CompanyInformationPage() {
  const initial = getCompanyProfile().companyMaster ?? {};
  const [form, setForm] = useState({ ...initial });
  const [saved, setSaved] = useState(false);

  function onChange(key, value) {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSave() {
    updateCompanyMaster(form);
    setSaved(true);
  }

  return (
    <CompanyPageShell
      title={COMPANY_WORKSPACE_COPY.informationTitle}
      breadcrumbItems={companyWorkspaceBreadcrumbTrail(COMPANY_WORKSPACE_COPY.informationTitle)}
    >
      <div className="company-workspace-panel">
        <div className="company-workspace-form-grid">
          {FIELDS.map((field) => (
            <div
              key={field.key}
              className="company-workspace-field"
              style={field.span === 2 ? { gridColumn: "1 / -1" } : undefined}
            >
              <label htmlFor={"company-" + field.key}>{field.label}</label>
              <input
                id={"company-" + field.key}
                value={form[field.key] ?? ""}
                onChange={(event) => onChange(field.key, event.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="company-workspace-toolbar" style={{ marginTop: 16 }}>
          <PrimaryButton type="button" onClick={onSave}>
            \uC800\uC7A5
          </PrimaryButton>
          {saved ? (
            <span role="status" style={{ color: "var(--titan-success)" }}>
              \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4.
            </span>
          ) : null}
        </div>
      </div>
    </CompanyPageShell>
  );
}
`, "CompanyInformationPage.jsx");

utf8(`import { useMemo, useState } from "react";

import { COMPANY_WORKSPACE_COPY } from "../../config/companyWorkspaceArchitecture";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import { listDepartments, removeDepartment, saveDepartment } from "../../utils/companyWorkspaceService";
import CompanyPageShell, { companyWorkspaceBreadcrumbTrail } from "./CompanyPageShell";

const EMPTY_FORM = { id: "", code: "", name: "", status: "active" };

export default function CompanyDepartmentsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const rows = useMemo(() => listDepartments(), [refreshKey]);
  const columns = [
    { key: "code", label: "\uBD80\uC11C\uCF54\uB4DC", widthPercent: 14 },
    { key: "name", label: "\uBD80\uC11C\uBA85", widthPercent: 22 },
    { key: "status", label: "\uC0C1\uD0DC", widthPercent: 12 },
  ];

  function refresh() { setRefreshKey((v) => v + 1); }
  function onRowDoubleClick(row) { setForm({ ...EMPTY_FORM, ...row }); }
  function onSave() {
    if (!String(form.name ?? "").trim()) return;
    saveDepartment(form);
    setForm(EMPTY_FORM);
    refresh();
  }
  function onDelete() {
    if (!form.id) return;
    removeDepartment(form.id);
    setForm(EMPTY_FORM);
    refresh();
  }

  return (
    <CompanyPageShell title={COMPANY_WORKSPACE_COPY.departmentsTitle} breadcrumbItems={companyWorkspaceBreadcrumbTrail(COMPANY_WORKSPACE_COPY.departmentsTitle)}>
      <div className="company-workspace-panel" style={{ marginBottom: 16 }}>
        <div className="company-workspace-form-grid">
          <div className="company-workspace-field">
            <label htmlFor="dept-code">\uBD80\uC11C\uCF54\uB4DC</label>
            <input id="dept-code" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} />
          </div>
          <div className="company-workspace-field">
            <label htmlFor="dept-name">\uBD80\uC11C\uBA85</label>
            <input id="dept-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
        </div>
        <div className="company-workspace-toolbar" style={{ marginTop: 16 }}>
          <PrimaryButton type="button" onClick={onSave}>{form.id ? "\uC218\uC815" : "\uB4F1\uB85D"}</PrimaryButton>
          <SecondaryButton type="button" onClick={() => setForm(EMPTY_FORM)}>\uCD08\uAE30\uD654</SecondaryButton>
          {form.id ? <SecondaryButton type="button" onClick={onDelete}>\uC0AD\uC81C</SecondaryButton> : null}
        </div>
      </div>
      <TitanDataTable layout="compact" columns={columns} rows={rows} onRowDoubleClick={onRowDoubleClick} emptyMessage="\uB4F1\uB85D\uB41C \uBD80\uC11C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." />
    </CompanyPageShell>
  );
}
`, "CompanyDepartmentsPage.jsx");

utf8(`import { useMemo, useState } from "react";

import { COMPANY_EMPLOYEE_STATUS, COMPANY_WORKSPACE_COPY } from "../../config/companyWorkspaceArchitecture";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import { listDepartments, listEmployees, listPositions, removeEmployee, resolveEmployeeStatusLabel, saveEmployee } from "../../utils/companyWorkspaceService";
import CompanyPageShell, { companyWorkspaceBreadcrumbTrail } from "./CompanyPageShell";

const EMPTY_FORM = { id: "", employeeNo: "", name: "", departmentId: "", positionId: "", phone: "", email: "", status: "active" };

export default function CompanyEmployeesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const departments = useMemo(() => listDepartments(), [refreshKey]);
  const positions = useMemo(() => listPositions(), [refreshKey]);
  const rows = useMemo(() => listEmployees().map((row) => ({ ...row, statusLabel: resolveEmployeeStatusLabel(row.status) })), [refreshKey]);
  const columns = [
    { key: "employeeNo", label: "\uC0AC\uBC88", widthPercent: 12 },
    { key: "name", label: "\uC774\uB984", widthPercent: 12 },
    { key: "departmentName", label: "\uBD80\uC11C", widthPercent: 14 },
    { key: "positionName", label: "\uC9C1\uAE09", widthPercent: 12 },
    { key: "phone", label: "\uC5F0\uB77D\uCC98", widthPercent: 14 },
    { key: "email", label: "\uC774\uBA54\uC77C", widthPercent: 18 },
    { key: "statusLabel", label: "\uC7AC\uC9C1\uC0C1\uD0DC", widthPercent: 10 },
  ];

  function refresh() { setRefreshKey((v) => v + 1); }
  function onRowDoubleClick(row) {
    setForm({ ...EMPTY_FORM, id: row.id, employeeNo: row.employeeNo ?? "", name: row.name ?? "", departmentId: row.departmentId ?? "", positionId: row.positionId ?? "", phone: row.phone ?? "", email: row.email ?? "", status: row.status ?? "active" });
  }
  function onSave() { if (!String(form.name ?? "").trim()) return; saveEmployee(form); setForm(EMPTY_FORM); refresh(); }
  function onDelete() { if (!form.id) return; removeEmployee(form.id); setForm(EMPTY_FORM); refresh(); }

  return (
    <CompanyPageShell title={COMPANY_WORKSPACE_COPY.employeesTitle} breadcrumbItems={companyWorkspaceBreadcrumbTrail(COMPANY_WORKSPACE_COPY.employeesTitle)}>
      <div className="company-workspace-panel" style={{ marginBottom: 16 }}>
        <div className="company-workspace-form-grid">
          <div className="company-workspace-field"><label htmlFor="emp-no">\uC0AC\uBC88</label><input id="emp-no" value={form.employeeNo} onChange={(e) => setForm((p) => ({ ...p, employeeNo: e.target.value }))} /></div>
          <div className="company-workspace-field"><label htmlFor="emp-name">\uC774\uB984</label><input id="emp-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div className="company-workspace-field"><label htmlFor="emp-dept">\uBD80\uC11C</label><select id="emp-dept" value={form.departmentId} onChange={(e) => setForm((p) => ({ ...p, departmentId: e.target.value }))}><option value="">\uC120\uD0DD</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          <div className="company-workspace-field"><label htmlFor="emp-pos">\uC9C1\uAE09</label><select id="emp-pos" value={form.positionId} onChange={(e) => setForm((p) => ({ ...p, positionId: e.target.value }))}><option value="">\uC120\uD0DD</option>{positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="company-workspace-field"><label htmlFor="emp-phone">\uC5F0\uB77D\uCC98</label><input id="emp-phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></div>
          <div className="company-workspace-field"><label htmlFor="emp-email">\uC774\uBA54\uC77C</label><input id="emp-email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
          <div className="company-workspace-field"><label htmlFor="emp-status">\uC7AC\uC9C1\uC0C1\uD0DC</label><select id="emp-status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>{COMPANY_EMPLOYEE_STATUS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
        </div>
        <div className="company-workspace-toolbar" style={{ marginTop: 16 }}>
          <PrimaryButton type="button" onClick={onSave}>{form.id ? "\uC218\uC815" : "\uB4F1\uB85D"}</PrimaryButton>
          <SecondaryButton type="button" onClick={() => setForm(EMPTY_FORM)}>\uCD08\uAE30\uD654</SecondaryButton>
          {form.id ? <SecondaryButton type="button" onClick={onDelete}>\uC0AD\uC81C</SecondaryButton> : null}
        </div>
      </div>
      <TitanDataTable layout="compact" columns={columns} rows={rows} onRowDoubleClick={onRowDoubleClick} emptyMessage="\uB4F1\uB85D\uB41C \uC9C1\uC6D0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." />
    </CompanyPageShell>
  );
}
`, "CompanyEmployeesPage.jsx");

utf8(`import { useMemo, useState } from "react";

import { COMPANY_BUSINESS_SITE_TYPES, COMPANY_WORKSPACE_COPY } from "../../config/companyWorkspaceArchitecture";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import { listBusinessSites, removeBusinessSite, resolveBusinessSiteTypeLabel, saveBusinessSite } from "../../utils/companyWorkspaceService";
import CompanyPageShell, { companyWorkspaceBreadcrumbTrail } from "./CompanyPageShell";

const EMPTY_FORM = { id: "", name: "", type: "headquarters", address: "", phone: "", status: "active" };

export default function CompanyBusinessSitesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const rows = useMemo(() => listBusinessSites().map((row) => ({ ...row, typeLabel: resolveBusinessSiteTypeLabel(row.type) })), [refreshKey]);
  const columns = [
    { key: "name", label: "\uC0AC\uC5C5\uC7A5\uBA85", widthPercent: 18 },
    { key: "typeLabel", label: "\uC720\uD615", widthPercent: 12 },
    { key: "address", label: "\uC8FC\uC18C", widthPercent: 30 },
    { key: "phone", label: "\uC804\uD654", widthPercent: 14 },
    { key: "status", label: "\uC0C1\uD0DC", widthPercent: 10 },
  ];

  function refresh() { setRefreshKey((v) => v + 1); }
  function onRowDoubleClick(row) { setForm({ ...EMPTY_FORM, ...row }); }
  function onSave() { if (!String(form.name ?? "").trim()) return; saveBusinessSite(form); setForm(EMPTY_FORM); refresh(); }
  function onDelete() { if (!form.id) return; removeBusinessSite(form.id); setForm(EMPTY_FORM); refresh(); }

  return (
    <CompanyPageShell title={COMPANY_WORKSPACE_COPY.sitesTitle} breadcrumbItems={companyWorkspaceBreadcrumbTrail(COMPANY_WORKSPACE_COPY.sitesTitle)}>
      <div className="company-workspace-panel" style={{ marginBottom: 16 }}>
        <div className="company-workspace-form-grid">
          <div className="company-workspace-field"><label htmlFor="site-name">\uC0AC\uC5C5\uC7A5\uBA85</label><input id="site-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div className="company-workspace-field"><label htmlFor="site-type">\uC720\uD615</label><select id="site-type" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>{COMPANY_BUSINESS_SITE_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
          <div className="company-workspace-field" style={{ gridColumn: "1 / -1" }}><label htmlFor="site-address">\uC8FC\uC18C</label><input id="site-address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} /></div>
          <div className="company-workspace-field"><label htmlFor="site-phone">\uC804\uD654</label><input id="site-phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></div>
        </div>
        <div className="company-workspace-toolbar" style={{ marginTop: 16 }}>
          <PrimaryButton type="button" onClick={onSave}>{form.id ? "\uC218\uC815" : "\uB4F1\uB85D"}</PrimaryButton>
          <SecondaryButton type="button" onClick={() => setForm(EMPTY_FORM)}>\uCD08\uAE30\uD654</SecondaryButton>
          {form.id ? <SecondaryButton type="button" onClick={onDelete}>\uC0AD\uC81C</SecondaryButton> : null}
        </div>
      </div>
      <TitanDataTable layout="compact" columns={columns} rows={rows} onRowDoubleClick={onRowDoubleClick} emptyMessage="\uB4F1\uB85D\uB41C \uC0AC\uC5C5\uC7A5\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." />
    </CompanyPageShell>
  );
}
`, "CompanyBusinessSitesPage.jsx");

utf8(`import { useMemo, useState } from "react";

import { COMPANY_WORKSPACE_COPY } from "../../config/companyWorkspaceArchitecture";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import TitanDataTable from "../../foundation/components/DataTable";
import { listPositions, removePosition, savePosition } from "../../utils/companyWorkspaceService";
import CompanyPageShell, { companyWorkspaceBreadcrumbTrail } from "./CompanyPageShell";

const EMPTY_FORM = { id: "", code: "", name: "", rank: 1, status: "active" };

export default function CompanyPositionsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const rows = useMemo(() => listPositions(), [refreshKey]);
  const columns = [
    { key: "rank", label: "\uC21C\uC704", widthPercent: 10 },
    { key: "code", label: "\uC9C1\uAE09\uCF54\uB4DC", widthPercent: 14 },
    { key: "name", label: "\uC9C1\uAE09\uBA85", widthPercent: 20 },
    { key: "status", label: "\uC0C1\uD0DC", widthPercent: 12 },
  ];

  function refresh() { setRefreshKey((v) => v + 1); }
  function onRowDoubleClick(row) { setForm({ ...EMPTY_FORM, ...row }); }
  function onSave() { if (!String(form.name ?? "").trim()) return; savePosition(form); setForm(EMPTY_FORM); refresh(); }
  function onDelete() { if (!form.id) return; removePosition(form.id); setForm(EMPTY_FORM); refresh(); }

  return (
    <CompanyPageShell title={COMPANY_WORKSPACE_COPY.positionsTitle} breadcrumbItems={companyWorkspaceBreadcrumbTrail(COMPANY_WORKSPACE_COPY.positionsTitle)}>
      <div className="company-workspace-panel" style={{ marginBottom: 16 }}>
        <div className="company-workspace-form-grid">
          <div className="company-workspace-field"><label htmlFor="pos-rank">\uC21C\uC704</label><input id="pos-rank" type="number" min={1} value={form.rank} onChange={(e) => setForm((p) => ({ ...p, rank: Number(e.target.value) || 1 }))} /></div>
          <div className="company-workspace-field"><label htmlFor="pos-code">\uC9C1\uAE09\uCF54\uB4DC</label><input id="pos-code" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} /></div>
          <div className="company-workspace-field"><label htmlFor="pos-name">\uC9C1\uAE09\uBA85</label><input id="pos-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
        </div>
        <div className="company-workspace-toolbar" style={{ marginTop: 16 }}>
          <PrimaryButton type="button" onClick={onSave}>{form.id ? "\uC218\uC815" : "\uB4F1\uB85D"}</PrimaryButton>
          <SecondaryButton type="button" onClick={() => setForm(EMPTY_FORM)}>\uCD08\uAE30\uD654</SecondaryButton>
          {form.id ? <SecondaryButton type="button" onClick={onDelete}>\uC0AD\uC81C</SecondaryButton> : null}
        </div>
      </div>
      <TitanDataTable layout="compact" columns={columns} rows={rows} onRowDoubleClick={onRowDoubleClick} emptyMessage="\uB4F1\uB85D\uB41C \uC9C1\uAE09\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." />
    </CompanyPageShell>
  );
}
`, "CompanyPositionsPage.jsx");