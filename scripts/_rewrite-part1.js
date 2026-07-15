const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const files = {
  "src/config/companyWorkspaceArchitecture.js": `import {
  BadgeCheck,
  Building2,
  FileText,
  MapPin,
  Network,
  Palette,
  UserCircle,
  Users,
} from "lucide-react";

export const COMPANY_WORKSPACE_BASE_PATH = "/company";

export const COMPANY_WORKSPACE_ROUTES = {
  dashboard: \`\${COMPANY_WORKSPACE_BASE_PATH}/dashboard\`,
  information: \`\${COMPANY_WORKSPACE_BASE_PATH}/information\`,
  sites: \`\${COMPANY_WORKSPACE_BASE_PATH}/sites\`,
  organization: \`\${COMPANY_WORKSPACE_BASE_PATH}/organization\`,
  departments: \`\${COMPANY_WORKSPACE_BASE_PATH}/departments\`,
  employees: \`\${COMPANY_WORKSPACE_BASE_PATH}/employees\`,
  positions: \`\${COMPANY_WORKSPACE_BASE_PATH}/positions\`,
  branding: \`\${COMPANY_WORKSPACE_BASE_PATH}/branding\`,
  documentFooter: \`\${COMPANY_WORKSPACE_BASE_PATH}/document-footer\`,
};

export const COMPANY_WORKSPACE_GROUPS = [
  {
    id: "basic",
    label: "\uAE30\uBCF8 \uC815\uBCF4",
    description: "\uD68C\uC0AC \uD504\uB85C\uD544 \uBC0F \uC0AC\uC5C5\uC7A5 \u00B7 \uC778\uC99D \uC815\uBCF4",
  },
  {
    id: "organization",
    label: "\uC870\uC9C1 \uBC0F \uC778\uC0AC",
    description: "\uC870\uC9C1\uB3C4 \u00B7 \uBD80\uC11C \u00B7 \uC0AC\uC6D0 \u00B7 \uC9C1\uAE09 \uAD00\uB9AC",
  },
  {
    id: "brand",
    label: "\uBE0C\uB79C\uB4DC \uBC0F \uCD9C\uB825",
    description: "\uB85C\uACE0 \u00B7 \uD14C\uB9C8 \u00B7 \uCD9C\uB825\uBB3C Footer",
  },
];

export const COMPANY_WORKSPACE_SECTIONS = [
  {
    id: "information",
    label: "\uD68C\uC0AC \uAE30\uBCF8\uC815\uBCF4",
    path: COMPANY_WORKSPACE_ROUTES.information,
    description: "\uD68C\uC0AC\uBA85 \u00B7 \uC0AC\uC5C5\uC790\uB4F1\uB85D\uBC88\uD638 \u00B7 \uB300\uD45C\uC790 \u00B7 \uC5F0\uB77D\uCC98",
    groupId: "basic",
    badge: "\uAE30\uBCF8",
    badgeColor: "blue",
    icon: Building2,
    phase: 11,
  },
  {
    id: "sites",
    label: "\uC0AC\uC5C5\uC7A5 \uAD00\uB9AC",
    path: COMPANY_WORKSPACE_ROUTES.sites,
    description: "\uBCF8\uC0AC \u00B7 1\uACF5\uC7A5 \u00B7 2\uACF5\uC7A5 \u00B7 \uCC3D\uACE0",
    groupId: "basic",
    badge: "\uC0AC\uC5C5\uC7A5",
    badgeColor: "green",
    icon: MapPin,
    phase: 11,
  },
  {
    id: "organization",
    label: "\uC870\uC9C1\uB3C4",
    path: COMPANY_WORKSPACE_ROUTES.organization,
    description: "\uC870\uC9C1 \uAD6C\uC870 (Tree \uD655\uC815 \uC608\uC815)",
    groupId: "organization",
    badge: "\uC870\uC9C1",
    badgeColor: "purple",
    icon: Network,
    phase: 11,
    placeholder: true,
  },
  {
    id: "departments",
    label: "\uBD80\uC11C\uAD00\uB9AC",
    path: COMPANY_WORKSPACE_ROUTES.departments,
    description: "\uD488\uC9C8 \u00B7 \uC0DD\uC0B0 \u00B7 \uC601\uC5C5 \u00B7 \uAD00\uB9AC \u00B7 \uD68C\uACC4",
    groupId: "organization",
    badge: "\uBD80\uC11C",
    badgeColor: "cyan",
    icon: Users,
    phase: 11,
  },
  {
    id: "employees",
    label: "\uC0AC\uC6D0\uAD00\uB9AC",
    path: COMPANY_WORKSPACE_ROUTES.employees,
    description: "\uC0AC\uBC88 \u00B7 \uBD80\uC11C \u00B7 \uC9C1\uAE09 \u00B7 \uC5F0\uB77D\uC815\uBCF4",
    groupId: "organization",
    badge: "\uC778\uC0AC",
    badgeColor: "orange",
    icon: UserCircle,
    phase: 11,
  },
  {
    id: "positions",
    label: "\uC9C1\uAE09\uAD00\uB9AC",
    path: COMPANY_WORKSPACE_ROUTES.positions,
    description: "\uBD80\uC7A5 \u00B7 \uACFC\uC7A5 \u00B7 \uB300\uB9AC \u00B7 \uC0AC\uC6D0 \u00B7 \uC778\uD134 \uB4F1",
    groupId: "organization",
    badge: "\uC9C1\uAE09",
    badgeColor: "purple",
    icon: BadgeCheck,
    phase: 11,
  },
  {
    id: "branding",
    label: "Branding",
    path: COMPANY_WORKSPACE_ROUTES.branding,
    description: "\uB85C\uACE0 \u00B7 \uCEEC\uB7EC \u00B7 \uC11C\uBA85",
    groupId: "brand",
    badge: "\uBE0C\uB79C\uB4DC",
    badgeColor: "green",
    icon: Palette,
    phase: 11,
    placeholder: true,
  },
  {
    id: "documentFooter",
    label: "\uBB38\uC11C Footer",
    path: COMPANY_WORKSPACE_ROUTES.documentFooter,
    description: "\uC131\uC801\uC11C \u00B7 \uAC70\uB798\uBA85\uC138\uC11C \u00B7 QR \uCD9C\uB825 \uACF5\uD1B5 Footer",
    groupId: "brand",
    badge: "\uCD9C\uB825",
    badgeColor: "blue",
    icon: FileText,
    phase: 11,
  },
];

export const COMPANY_SECTION_UI = {
  information: {
    layout: "form",
    previewFields: [
      "\uD68C\uC0AC\uBA85",
      "\uC601\uBB38\uBA85",
      "\uC0AC\uC5C5\uC790\uB4F1\uB85D\uBC88\uD638",
      "\uBC95\uC778\uB4F1\uB85D\uBC88\uD638",
      "\uB300\uD45C\uC790",
      "\uC5C5\uD0DC \u00B7 \uC885\uBAA9",
      "\uC8FC\uC18C",
      "\uC804\uD654 \u00B7 \uD329\uC2A4 \u00B7 \uC774\uBA54\uC77C",
      "\uD648\uD398\uC774\uC9C0",
    ],
  },
  sites: {
    layout: "table",
    previewColumns: ["\uC0AC\uC5C5\uC7A5\uBA85", "\uAD6C\uBD84", "\uC8FC\uC18C", "\uC804\uD654", "\uC0C1\uD0DC"],
  },
  organization: {
    layout: "tree",
    previewNote: "\uC870\uC9C1\uB3C4 Tree Editor \u2014 \uB2E4\uC74C Sprint \uD655\uC815",
  },
  departments: {
    layout: "table",
    previewColumns: ["\uBD80\uC11C\uCF54\uB4DC", "\uBD80\uC11C\uBA85", "\uC0C1\uD0DC"],
  },
  employees: {
    layout: "table",
    previewColumns: ["\uC0AC\uBC88", "\uC774\uB984", "\uBD80\uC11C", "\uC9C1\uAE09", "\uC5F0\uB77D\uCC98", "\uC7AC\uC9C1\uC0C1\uD0DC"],
  },
  positions: {
    layout: "table",
    previewColumns: ["\uC21C\uC704", "\uC9C1\uAE09\uCF54\uB4DC", "\uC9C1\uAE09\uBA85", "\uC0C1\uD0DC"],
  },
  branding: {
    layout: "slots",
    previewSlots: ["\uD68C\uC0AC \uB85C\uACE0", "\uCEEC\uB7EC", "\uC11C\uBA85"],
  },
  documentFooter: {
    layout: "form",
    previewFields: ["\uD68C\uC0AC\uBA85", "\uC8FC\uC18C", "\uC804\uD654", "\uC774\uBA54\uC77C", "Copyright"],
  },
};

export const COMPANY_WORKSPACE_COPY = {
  workspaceTitle: "Company Workspace",
  workspaceKicker: "Company Master",
  workspaceIntro:
    "TITAN \uC804\uCCB4\uAC00 \uCC38\uC870\uD558\uB294 Company Master \u2014 \uC870\uC9C1\uB3C4 \u00B7 \uAC70\uB798\uBA85\uC138\uC11C \u00B7 QR \u00B7 Document Studio \uCD9C\uB825 Source of Truth",
  dashboardTitle: "Company Dashboard",
  dashboardWorkflow:
    "\uD68C\uC0AC \uAE30\uBCF8\uC815\uBCF4 \u2192 \uC0AC\uC5C5\uC7A5 \u2192 \uC870\uC9C1\uB3C4 \u2192 \uBD80\uC11C \u2192 \uC0AC\uC6D0 \u2192 \uC9C1\uAE09 \u2192 Branding \u2192 \uBB38\uC11C Footer",
  dashboardLauncherTitle: "Company Master \uBC14\uB85C\uAC00\uAE30",
  dashboardLauncherDesc: "\uAC01 \uC601\uC5ED\uC5D0\uC11C \uD68C\uC0AC \uB9C8\uC2A4\uD130 \uB370\uC774\uD130\uB97C \uAD00\uB9AC\uD569\uB2C8\uB2E4.",
  informationTitle: "\uD68C\uC0AC \uAE30\uBCF8\uC815\uBCF4",
  sitesTitle: "\uC0AC\uC5C5\uC7A5 \uAD00\uB9AC",
  organizationTitle: "\uC870\uC9C1\uB3C4",
  departmentsTitle: "\uBD80\uC11C\uAD00\uB9AC",
  employeesTitle: "\uC0AC\uC6D0\uAD00\uB9AC",
  positionsTitle: "\uC9C1\uAE09\uAD00\uB9AC",
  brandingTitle: "Branding",
  documentFooterTitle: "\uBB38\uC11C Footer",
  organizationPlaceholder:
    "\uC870\uC9C1\uB3C4 Tree Editor\uB294 \uB2E4\uC74C Sprint\uC5D0\uC11C \uD655\uC815\uD569\uB2C8\uB2E4. \uD604\uC7AC\uB294 Company Master \uAD6C\uC870\uB9CC \uC900\uBE44\uD569\uB2C8\uB2E4.",
  brandingPlaceholder:
    "\uB85C\uACE0 \u00B7 \uCEEC\uB7EC \u00B7 \uC11C\uBA85 \uC5C5\uB85C\uB4DC \uBC0F TDE \uC5F0\uB3D9\uC740 \uB2E4\uC74C Sprint\uC5D0\uC11C \uC5F0\uACB0\uD569\uB2C8\uB2E4.",
  environmentSeparationNote:
    "\uD68C\uC0AC\uC815\uBCF4\uB294 Environment(\uD504\uB85C\uADF8\uB7A8 \uC124\uC815)\uACFC \uBD84\uB9AC\uB41C Company Master Workspace\uC785\uB2C8\uB2E4.",
  uiPreviewBadge: "UI Preview",
  uiPreviewNote: "UI \uC124\uACC4 \uBC0F \uB370\uC774\uD130 \uC785\uB825 \u00B7 CRUD\uB294 \uB2E4\uC74C \uB2E8\uACC4\uC785\uB2C8\uB2E4.",
};

export const COMPANY_BUSINESS_SITE_TYPES = [
  { id: "headquarters", label: "\uBCF8\uC0AC" },
  { id: "factory", label: "\uACF5\uC7A5" },
  { id: "warehouse", label: "\uCC3D\uACE0" },
  { id: "office", label: "\uC0AC\uBB34\uC2E4" },
  { id: "other", label: "\uAE30\uD0C0" },
];

export const COMPANY_EMPLOYEE_STATUS = [
  { id: "active", label: "\uC7AC\uC9C1" },
  { id: "leave", label: "\uD734\uC9C1" },
  { id: "retired", label: "\uD1F4\uC0AC" },
];

export function getCompanySectionById(sectionId) {
  return COMPANY_WORKSPACE_SECTIONS.find((section) => section.id === sectionId) ?? null;
}

export function getCompanySectionsByGroup(groupId) {
  return COMPANY_WORKSPACE_SECTIONS.filter((section) => section.groupId === groupId);
}

export function getCompanySectionTitle(sectionId) {
  return COMPANY_WORKSPACE_COPY[\`\${sectionId}Title\`] ?? getCompanySectionById(sectionId)?.label ?? "";
}
`,
};

// Append JSX and CSS in part 2 - script too long, write via separate require
