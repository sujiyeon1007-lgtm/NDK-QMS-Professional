/**
 * Project TITAN Mobile QR Portal Blueprint (Architecture Only)
 * Desktop = management workspace, Mobile = QR field work portal.
 */
import { defineBlueprint } from "./blueprintSections.js";

export const MOBILE_QR_PORTAL_BLUEPRINT = defineBlueprint({
  id: "mobileQrPortal",
  label: "Mobile QR Portal",
  labelKo: "\uBAA8\uBC14\uC77C QR Portal",
  order: 50,
  menuId: null,
  route: "/mobile/qr/:type/:uuid",
  docPath: "docs/blueprints/V2.0/mobile-qr-portal.md",
  status: "pm-approved",
  reviewStatus: "pm-approved",
  implementationStatus: "architecture-only",
  phase: "Phase 5 — QR / Mobile / AI",
  desktopMobileSeparation: {
    desktop: "TITAN Desktop — \uAD00\uB9AC \uC5C5\uBB34 Workspace",
    mobile: "TITAN Mobile QR Portal — \uD604\uC7A5 \uC791\uC5C5 \uC218\uD589",
    sharedData: "\uB3D9\uC77C API · \uB3D9\uC77C DB · \uB3D9\uC77C QR Registry",
    separatedUi: true,
  },
  purpose:
    "QR scan from a phone opens a mobile-only field work portal, not the desktop management UI.",
  role: {
    allowed: [
      "QR target summary optimized for phone scan",
      "Field actions with large touch buttons",
      "Equipment, LOT, worker, document portal cards",
      "Future work start/end, inspection, attachment, photo, signature actions",
    ],
    forbidden: [
      "Desktop Sidebar",
      "Dashboard / Launcher",
      "Complex navigation",
      "Environment settings / statistics / management menus",
      "Shrinking desktop layout into mobile",
    ],
  },
  taskScope: {
    workspaceRole: "QR based field task portal",
    accessOnlyByQr: true,
    showOnly: [
      "QR target identity",
      "Current status",
      "Current required field actions",
      "Minimal context needed for worker decision",
    ],
    hide: [
      "Sidebar",
      "Dashboard",
      "Launcher",
      "Admin settings",
      "Statistics",
      "Master CRUD",
      "Desktop table/list workspace",
    ],
    targetTypes: {
      equipment: {
        route: "/mobile/qr/equipment/{UUID}",
        display: ["\uC124\uBE44\uBA85", "\uC124\uBE44 \uC0C1\uD0DC", "\uD604\uC7AC \uC791\uC5C5", "\uD604\uC7AC LOT"],
        actions: ["\uC7A5\uC785 \uC2DC\uC791", "\uC7A5\uC785 \uC644\uB8CC", "\uC791\uC5C5 \uD604\uD669", "\uC810\uAC80 \uC774\uB825"],
      },
      lot: {
        route: "/mobile/qr/lot/{UUID}",
        display: ["LOT \uBC88\uD638", "\uD488\uBA85", "\uC7AC\uC9C8", "\uADDC\uACA9", "\uC218\uB7C9", "\uD604\uC7AC \uACF5\uC815"],
        actions: ["LOT \uC815\uBCF4", "\uAC80\uC0AC \uB4F1\uB85D", "\uC131\uC801\uC11C \uBCF4\uAE30", "\uCD9C\uACE0 \uD604\uD669"],
      },
      worker: {
        route: "/mobile/qr/worker/{UUID}",
        display: ["\uC791\uC5C5\uC790\uBA85", "\uB2F4\uB2F9 \uACF5\uC815"],
        actions: ["\uC791\uC5C5 \uC2DC\uC791", "\uC791\uC5C5 \uC885\uB8CC", "\uC791\uC5C5 \uC774\uB825"],
      },
      document: {
        route: "/mobile/qr/document/{UUID}",
        display: ["\uBB38\uC11C\uC81C\uBAA9", "\uBB38\uC11C\uC720\uD615", "\uAD00\uB828 LOT", "\uCCA8\uBD80\uD30C\uC77C"],
        actions: ["\uBB38\uC11C \uBCF4\uAE30", "\uCCA8\uBD80\uD30C\uC77C", "\uAD00\uB828 LOT", "\uC2B9\uC778/\uD655\uC778"],
      },
    },
  },
  exitCondition: {
    completeWhen: "Mobile action completes or user closes portal",
    nextScreen: "Stay in mobile portal or return to QR scan/camera",
    desktopRedirect: false,
    engine: "Same API / same DB / same Workflow Engine as desktop",
  },
  layout: [
    "MobilePortalShell — no AppShell/sidebar",
    "Target summary card",
    "Status card",
    "Large action button grid",
    "Optional detail sections under vertical scroll",
  ],
  data: {
    api: "Same API / DB / Registry as Desktop TITAN",
    registry: "QR stores Mobile Portal URL, not Desktop URL",
    urlPolicy: [
      "/mobile/qr/equipment/{UUID}",
      "/mobile/qr/lot/{UUID}",
      "/mobile/qr/document/{UUID}",
      "/mobile/qr/master/{type}/{UUID}",
      "/mobile/qr/data/{type}/{UUID}",
      "/mobile/qr/menu/{shortcutId}",
    ],
    menuShortcutPolicy: {
      status: "blueprint-only",
      rule: "Menu Shortcut QR is fixed and reusable. It links to a mobile route, not a Desktop AppShell route.",
      route: "/mobile/qr/menu/{shortcutId}",
      examples: ["production-shot-status", "equipment-scan", "incoming-register"],
    },
  },
  workflow: [
    "Phone camera scans QR",
    "Mobile Portal resolves UUID",
    "Portal loads target summary",
    "Worker performs one field action",
    "Action writes through shared backend/workflow engine",
  ],
  automation: {
    system: ["Resolve QR UUID", "Load target status", "Show next field action"],
    user: ["Tap large action button", "View attachment/document", "Future photo/signature upload"],
  },
  connectedScreens: ["QR Registry", "Equipment", "LOT Lifecycle", "Inspection", "Certificate", "Outbound", "Attachments"],
  outputs: ["None by default", "Future: mobile confirmation/signature/photo upload"],
  completionCriteria: [
    "Desktop and Mobile UI separation is preserved",
    "No sidebar/dashboard/launcher in mobile portal",
    "QR payload opens mobile URL",
    "Large touch target UI verified on phone viewport",
    "Shared data/API contract verified",
    "PM approval before implementation",
  ],
  foundationMobileComponents: [
    "MobilePortalShell",
    "MobileQrSummaryCard",
    "MobileQrActionButton",
    "MobileQrStatusCard",
    "MobileAttachmentList",
  ],
  futureExpansion: [
    "\uC791\uC5C5 \uC2DC\uC791/\uC885\uB8CC",
    "\uC124\uBE44 \uC0C1\uD0DC \uBCC0\uACBD",
    "LOT \uC9C4\uD589 \uC0C1\uD0DC \uD655\uC778",
    "\uAC80\uC0AC \uACB0\uACFC \uC870\uD68C",
    "\uC131\uC801\uC11C \uC870\uD68C",
    "\uCCA8\uBD80\uD30C\uC77C \uD655\uC778",
    "\uC0AC\uC9C4 \uC5C5\uB85C\uB4DC",
    "\uC804\uC790\uC11C\uBA85",
    "\uC791\uC5C5 \uC2B9\uC778",
  ],
});

export const MOBILE_QR_PORTAL_URL_POLICY = Object.freeze({
  equipment: "/mobile/qr/equipment/{UUID}",
  lot: "/mobile/qr/lot/{UUID}",
  document: "/mobile/qr/document/{UUID}",
  worker: "/mobile/qr/worker/{UUID}",
  master: "/mobile/qr/master/{type}/{UUID}",
  data: "/mobile/qr/data/{type}/{UUID}",
  menuShortcut: "/mobile/qr/menu/{shortcutId}",
});