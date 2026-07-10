import { useEffect, useMemo, useState } from "react";

import {
  COMPANY_SECTION_UI,
  COMPANY_BUSINESS_SITE_TYPES,
  COMPANY_EMPLOYEE_STATUS,
  getCompanySectionById,
} from "../../config/companyWorkspaceArchitecture";
import { FoundationActionBar, TitanMetricCard } from "../../foundation/uiKit";
import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import {
  getCompanyProfile,
  removeBusinessSite,
  removeDepartment,
  removeEmployee,
  removePosition,
  saveBusinessSite,
  saveDepartment,
  saveEmployee,
  savePosition,
  updateCompanyBranding,
  updateCompanyMaster,
  updateDocumentFooter,
} from "../../utils/companyWorkspaceService";
import CompanySectionPreview from "./CompanySectionPreview";

function buildOrganizationTree(profile) {
  const departments = profile.departments ?? [];
  const employees = profile.employees ?? [];
  return [
    `${profile.companyMaster?.companyName || "Company"}`,
    ...departments.map((dept) => {
      const deptEmployees = employees.filter((employee) => employee.departmentId === dept.id);
      const employeeText = deptEmployees.length
        ? deptEmployees.map((employee) => `    - ${employee.name}`).join("\n")
        : "    - 등록 직원 없음";
      return `  - ${dept.name} (${dept.code})\n${employeeText}`;
    }),
  ].join("\n");
}

function buildSectionMetrics(sectionId, profile) {
  const master = profile.companyMaster ?? {};
  const footer = profile.documentFooter ?? {};
  const branding = profile.branding ?? {};
  const employees = profile.employees ?? [];
  const activeEmployees = employees.filter((row) => row.status !== "retired");

  const metricsBySection = {
    information: [
      { title: "필수 정보", value: [master.companyName, master.businessNumber, master.representative].filter(Boolean).length, description: "회사명 · 사업자번호 · 대표자", tone: "blue" },
      { title: "연락 정보", value: [master.phone, master.email].filter(Boolean).length, description: "연락처 · Email", tone: "green" },
      { title: "주소", value: master.address ? "등록" : "미등록", description: master.address || "-", tone: "purple" },
    ],
    sites: [
      { title: "사업장", value: profile.businessSites?.length ?? 0, description: "등록 사업장", tone: "green" },
      { title: "가동", value: (profile.businessSites ?? []).filter((row) => row.status === "active").length, description: "활성 사업장", tone: "blue" },
    ],
    organization: [
      { title: "부서", value: profile.departments?.length ?? 0, description: "조직 구성", tone: "purple" },
      { title: "직원", value: activeEmployees.length, description: "재직 기준", tone: "mint" },
    ],
    departments: [
      { title: "부서", value: profile.departments?.length ?? 0, description: "등록 부서", tone: "blue" },
    ],
    employees: [
      { title: "직원", value: employees.length, description: "전체 직원", tone: "orange" },
      { title: "재직", value: activeEmployees.length, description: "재직 상태", tone: "green" },
    ],
    positions: [
      { title: "직급", value: profile.positions?.length ?? 0, description: "등록 직급", tone: "purple" },
    ],
    branding: [
      { title: "Logo", value: branding.logo ? "등록" : "미등록", description: "회사 로고", tone: "pink" },
      { title: "직인", value: branding.stamp ? "등록" : "미등록", description: "Branding Asset", tone: "amber" },
      { title: "서명", value: branding.signature ? "등록" : "미등록", description: "대표이사 서명", tone: "mint" },
    ],
    documentFooter: [
      { title: "Footer 회사명", value: footer.companyName ? "등록" : "미등록", description: footer.companyName || "-", tone: "blue" },
      { title: "Footer 연락처", value: [footer.phone, footer.email].filter(Boolean).length, description: "전화 · Email", tone: "green" },
    ],
  };

  return metricsBySection[sectionId] ?? [];
}

function getEditableDraft(sectionId, profile) {
  if (sectionId === "information") return profile.companyMaster ?? {};
  if (sectionId === "documentFooter") return profile.documentFooter ?? {};
  if (sectionId === "branding") return profile.branding ?? {};
  return {};
}

const EDITABLE_SECTIONS = new Set(["information", "branding", "documentFooter"]);
const TABLE_CRUD_SECTIONS = new Set(["sites", "departments", "employees", "positions"]);

function emptyTableDraft(sectionId, profile) {
  if (sectionId === "sites") return { name: "", type: "factory", address: "", phone: "", status: "active" };
  if (sectionId === "departments") return { code: "", name: "", status: "active" };
  if (sectionId === "employees") {
    return {
      employeeNo: "",
      name: "",
      departmentId: profile.departments?.[0]?.id ?? "",
      positionId: profile.positions?.[0]?.id ?? "",
      phone: "",
      email: "",
      status: "active",
    };
  }
  if (sectionId === "positions") return { code: "", name: "", rank: (profile.positions?.length ?? 0) + 1, status: "active" };
  return {};
}

function getTableFormFields(sectionId, profile) {
  if (sectionId === "sites") {
    return [
      { key: "name", label: "사업장명", required: true },
      { key: "type", label: "유형", type: "select", options: COMPANY_BUSINESS_SITE_TYPES },
      { key: "address", label: "주소", type: "textarea" },
      { key: "phone", label: "연락처" },
      { key: "status", label: "상태", type: "select", options: [{ id: "active", label: "가동" }, { id: "inactive", label: "비활성" }] },
    ];
  }
  if (sectionId === "departments") {
    return [
      { key: "code", label: "부서코드", required: true },
      { key: "name", label: "부서명", required: true },
      { key: "status", label: "상태", type: "select", options: [{ id: "active", label: "사용" }, { id: "inactive", label: "비활성" }] },
    ];
  }
  if (sectionId === "employees") {
    return [
      { key: "employeeNo", label: "사번", required: true },
      { key: "name", label: "이름", required: true },
      { key: "departmentId", label: "부서", type: "select", options: (profile.departments ?? []).map((row) => ({ id: row.id, label: row.name })) },
      { key: "positionId", label: "직급", type: "select", options: (profile.positions ?? []).map((row) => ({ id: row.id, label: row.name })) },
      { key: "phone", label: "연락처" },
      { key: "email", label: "Email", inputType: "email" },
      { key: "status", label: "재직상태", type: "select", options: COMPANY_EMPLOYEE_STATUS },
    ];
  }
  if (sectionId === "positions") {
    return [
      { key: "rank", label: "순위", inputType: "number", required: true },
      { key: "code", label: "직급코드", required: true },
      { key: "name", label: "직급명", required: true },
      { key: "status", label: "상태", type: "select", options: [{ id: "active", label: "사용" }, { id: "inactive", label: "비활성" }] },
    ];
  }
  return [];
}

function saveTableRow(sectionId, payload) {
  if (sectionId === "sites") return saveBusinessSite(payload);
  if (sectionId === "departments") return saveDepartment(payload);
  if (sectionId === "employees") return saveEmployee(payload);
  if (sectionId === "positions") return savePosition(payload);
  return null;
}

function removeTableRow(sectionId, rowId) {
  if (sectionId === "sites") return removeBusinessSite(rowId);
  if (sectionId === "departments") return removeDepartment(rowId);
  if (sectionId === "employees") return removeEmployee(rowId);
  if (sectionId === "positions") return removePosition(rowId);
  return null;
}

function CompanyTableCrudForm({ fields, values, onChange }) {
  return (
    <div className="company-master-form">
      {fields.map((field) => (
        <label
          key={field.key}
          className={`company-master-form__field${field.type === "textarea" ? " company-master-form__field--wide" : ""}`}
        >
          <span>{field.label}{field.required ? " *" : ""}</span>
          {field.type === "textarea" ? (
            <textarea value={values?.[field.key] ?? ""} onChange={(event) => onChange(field.key, event.target.value)} rows={3} />
          ) : field.type === "select" ? (
            <select value={values?.[field.key] ?? ""} onChange={(event) => onChange(field.key, event.target.value)}>
              {(field.options ?? []).map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          ) : (
            <input type={field.inputType ?? "text"} value={values?.[field.key] ?? ""} onChange={(event) => onChange(field.key, event.target.value)} />
          )}
        </label>
      ))}
    </div>
  );
}

export default function CompanySectionPage({ sectionId }) {
  const section = getCompanySectionById(sectionId);
  const ui = COMPANY_SECTION_UI[sectionId] ?? {};
  const [profile, setProfile] = useState(() => getCompanyProfile());
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => getEditableDraft(sectionId, getCompanyProfile()));
  const [tableModal, setTableModal] = useState(null);
  const [tableDraft, setTableDraft] = useState(() => emptyTableDraft(sectionId, getCompanyProfile()));
  const [sectionMessage, setSectionMessage] = useState("");

  useEffect(() => {
    const nextProfile = getCompanyProfile();
    setProfile(nextProfile);
    setDraft(getEditableDraft(sectionId, nextProfile));
    setTableDraft(emptyTableDraft(sectionId, nextProfile));
    setTableModal(null);
    setEditing(false);
    setSectionMessage("");
  }, [sectionId]);

  const organizationTree = useMemo(() => buildOrganizationTree(profile), [profile]);
  const metrics = useMemo(() => buildSectionMetrics(sectionId, profile), [sectionId, profile]);
  const canEdit = EDITABLE_SECTIONS.has(sectionId);
  const canTableCrud = TABLE_CRUD_SECTIONS.has(sectionId);

  if (!section) return null;

  const handleDraftChange = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setSectionMessage("");
  };

  const refreshProfile = () => {
    const nextProfile = getCompanyProfile();
    setProfile(nextProfile);
    setDraft(getEditableDraft(sectionId, nextProfile));
  };

  const handleSave = () => {
    if (sectionId === "information") updateCompanyMaster(draft, "company-workspace");
    if (sectionId === "documentFooter") updateDocumentFooter(draft, "company-workspace");
    if (sectionId === "branding") updateCompanyBranding(draft, "company-workspace");
    refreshProfile();
    setEditing(false);
    setSectionMessage(
      sectionId === "branding"
        ? "Branding Center 변경사항이 Company Master에 저장되었습니다."
        : "변경사항이 저장되었습니다."
    );
  };

  const handleReset = () => {
    setDraft(getEditableDraft(sectionId, profile));
    setEditing(false);
    setSectionMessage("변경사항을 초기화했습니다.");
  };

  const openTableRegister = () => {
    setTableDraft(emptyTableDraft(sectionId, profile));
    setTableModal({ mode: "register", row: null });
  };

  const openTableEdit = (row) => {
    setTableDraft({ ...emptyTableDraft(sectionId, profile), ...row });
    setTableModal({ mode: "edit", row });
  };

  const handleTableDelete = (row) => {
    if (!row?.id) return;
    const label = row.name || row.code || row.employeeNo || row.id;
    if (!window.confirm(`${label} 항목을 삭제하시겠습니까?`)) return;
    removeTableRow(sectionId, row.id);
    refreshProfile();
  };

  const handleTableSubmit = () => {
    const requiredFields = getTableFormFields(sectionId, profile).filter((field) => field.required);
    const missingField = requiredFields.find((field) => !String(tableDraft[field.key] ?? "").trim());
    if (missingField) {
      window.alert(`${missingField.label}은(는) 필수입니다.`);
      return;
    }
    saveTableRow(sectionId, tableDraft);
    setTableModal(null);
    refreshProfile();
  };

  const actions = canEdit
    ? editing
      ? [
          { id: "save", label: "저장", variant: "primary", onClick: handleSave },
          { id: "reset", label: "초기화", variant: "secondary", onClick: handleReset },
        ]
      : [{ id: "edit", label: "수정", onClick: () => setEditing(true) }]
    : canTableCrud
      ? [{ id: "register", label: "등록", variant: "primary", onClick: openTableRegister }]
      : [];

  return (
    <div className="company-workspace-section-page">
      {actions.length ? (
        <div className="company-workspace-section-head__actions company-workspace-section-head__actions--solo">
          <FoundationActionBar actions={actions} align="end" size="compact" ariaLabel={`${section.label} 작업`} />
        </div>
      ) : null}

      <section className="company-workspace-section-metrics" aria-label={`${section.label} 현황`}>
        {metrics.map((metric) => (
          <TitanMetricCard
            key={`${metric.title}-${metric.description}`}
            title={metric.title}
            value={metric.value}
            description={metric.description}
            tone={metric.tone}
          />
        ))}
      </section>

      <CompanySectionPreview
        sectionId={sectionId}
        layout={ui.layout}
        previewNote={ui.previewNote}
        organizationTree={organizationTree}
        profile={profile}
        draft={draft}
        editing={editing}
        onDraftChange={handleDraftChange}
        onProfileChange={refreshProfile}
        onEditRow={openTableEdit}
        onDeleteRow={handleTableDelete}
      />
      {sectionMessage ? (
        <p className="company-workspace-section-message" role="status">
          {sectionMessage}
        </p>
      ) : null}
      <TitanRegisterModal
        open={Boolean(tableModal)}
        onClose={() => setTableModal(null)}
        onSubmit={handleTableSubmit}
        title={`${section.label} ${tableModal?.mode === "edit" ? "수정" : "등록"}`}
        submitLabel={tableModal?.mode === "edit" ? "저장" : "등록"}
      >
        <CompanyTableCrudForm
          fields={getTableFormFields(sectionId, profile)}
          values={tableDraft}
          onChange={(key, value) => setTableDraft((current) => ({ ...current, [key]: value }))}
        />
      </TitanRegisterModal>
    </div>
  );
}
