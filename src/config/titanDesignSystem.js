export const TITAN_DESIGN_SYSTEM_VERSION = "Sprint 12.5";

export const TITAN_UI_KIT_SOURCE_OF_TRUTH = {
  components: "src/foundation/components",
  styles: "src/foundation/styles",
  legacyComponentsUi: "src/components/ui",
  legacyPolicy: "Do not extend legacy src/components/ui for new Workspace UI.",
};

export const TITAN_WORKSPACE_SEQUENCE = [
  "Workspace Header",
  "Quick Launcher",
  "KPI Summary",
  "Dashboard",
  "Search / Filter",
  "Data Table",
  "Pagination",
];

export const TITAN_UI_VARIANTS = {
  button: ["primary", "secondary", "danger", "ghost", "icon", "loading", "disabled"],
  badge: ["blue", "green", "orange", "red", "gray"],
  status: ["success", "pending", "processing", "error", "inactive"],
  card: ["launcher", "kpi", "dashboard", "activity", "notification"],
  loading: ["skeleton", "card", "table", "popup", "launcher"],
};

export const TITAN_STATUS_COLOR_POLICY = {
  success: { token: "--titan-success", badge: "green" },
  pending: { token: "--titan-pending", badge: "orange" },
  processing: { token: "--titan-processing", badge: "blue" },
  error: { token: "--titan-danger", badge: "red" },
  inactive: { token: "--titan-inactive", badge: "gray" },
};

export const TITAN_DESIGN_SYSTEM_TARGETS = [
  "HOME",
  "Company Workspace",
  "Environment Workspace",
  "QR Engine",
  "Accounting",
  "Finance",
  "TDE",
];
