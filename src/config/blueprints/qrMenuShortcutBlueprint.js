/**
 * Project TITAN QR Menu Shortcut Blueprint (Architecture Only)
 * Fixed menu shortcut QR is independent from data/detail QR.
 */
import { defineBlueprint } from "./blueprintSections.js";

export const QR_MENU_SHORTCUT_ROUTES = Object.freeze({
  inbound: "/mobile/inbound",
  shipment: "/mobile/shipment",
  inspection: "/mobile/inspection",
  productionDaily: "/mobile/production/daily-report",
  productionPlan: "/mobile/production/plan",
  shot: "/mobile/shot",
  equipmentInspection: "/mobile/equipment/inspection",
  document: "/mobile/document",
  inventory: "/mobile/inventory",
  incomingDocumentArchive: "/mobile/document/incoming-archive",
  lotCreate: "/mobile/lot/create",
  qrCenter: "/mobile/qr-center",
});

export const QR_MENU_SHORTCUT_ITEMS = Object.freeze([
  { id: "inbound", labelKo: "\uC785\uACE0\uB4F1\uB85D", route: QR_MENU_SHORTCUT_ROUTES.inbound, placementKo: "\uD604\uC7A5 \uC785\uAD6C" },
  { id: "shipment", labelKo: "\uCD9C\uACE0\uB4F1\uB85D", route: QR_MENU_SHORTCUT_ROUTES.shipment, placementKo: "\uCD9C\uACE0\uC7A5" },
  { id: "inspection", labelKo: "\uAC80\uC0AC\uB4F1\uB85D", route: QR_MENU_SHORTCUT_ROUTES.inspection, placementKo: "\uAC80\uC0AC\uC2E4" },
  { id: "productionDaily", labelKo: "\uC0DD\uC0B0\uC77C\uBCF4", route: QR_MENU_SHORTCUT_ROUTES.productionDaily, placementKo: "\uC0DD\uC0B0\uD604\uC7A5" },
  { id: "productionPlan", labelKo: "\uC0DD\uC0B0\uACC4\uD68D", route: QR_MENU_SHORTCUT_ROUTES.productionPlan, placementKo: "\uC0DD\uC0B0\uC0AC\uBB34\uC2E4" },
  { id: "shot", labelKo: "\uC1FC\uD2B8 \uC791\uC5C5\uD604\uD669", route: QR_MENU_SHORTCUT_ROUTES.shot, placementKo: "\uC1FC\uD2B8 \uC791\uC5C5\uC7A5" },
  { id: "equipmentInspection", labelKo: "\uC124\uBE44\uC810\uAC80", route: QR_MENU_SHORTCUT_ROUTES.equipmentInspection, placementKo: "\uC124\uBE44 \uC8FC\uBCC0" },
  { id: "document", labelKo: "\uBB38\uC11C\uAD00\uB9AC", route: QR_MENU_SHORTCUT_ROUTES.document, placementKo: "\uBB38\uC11C\uAD00\uB9AC\uC2E4" },
  { id: "inventory", labelKo: "\uC7AC\uACE0\uC870\uD68C", route: QR_MENU_SHORTCUT_ROUTES.inventory, placementKo: "\uCC3D\uACE0/\uC790\uC7AC\uC7A5" },
  { id: "incomingDocumentArchive", labelKo: "\uC218\uC2E0\uBB38\uC11C \uBCF4\uAD00\uD568", route: QR_MENU_SHORTCUT_ROUTES.incomingDocumentArchive, placementKo: "\uBB38\uC11C\uAD00\uB9AC\uC2E4" },
  { id: "lotCreate", labelKo: "LOT \uC0DD\uC131", route: QR_MENU_SHORTCUT_ROUTES.lotCreate, placementKo: "\uC0DD\uC0B0\uD604\uC7A5" },
  { id: "qrCenter", labelKo: "QR \uC0DD\uC131\uC13C\uD130", route: QR_MENU_SHORTCUT_ROUTES.qrCenter, placementKo: "\uC0AC\uBB34\uC2E4/\uAD00\uB9AC\uC790" },
]);

export const QR_MENU_SHORTCUT_BLUEPRINT = defineBlueprint({
  id: "qrMenuShortcut",
  label: "QR Menu Shortcut",
  labelKo: "QR \uBA54\uB274 \uBC14\uB85C\uAC00\uAE30",
  order: 51,
  menuId: null,
  route: "/mobile/qr/menu/:shortcutId",
  docPath: "docs/blueprints/V2.0/qr-menu-shortcut.md",
  status: "pm-approved",
  reviewStatus: "pm-approved",
  implementationStatus: "architecture-only",
  phase: "Phase 5 — QR / Mobile / AI",
  purpose:
    "Provide fixed reusable QR codes that open mobile work menus directly, independent from data/detail QR codes.",
  qrSeparation: {
    menuShortcutQr: "Fixed QR for opening a mobile menu or task screen. Reusable after one generation.",
    dataQr: "Variable QR for data/detail lookup. Uses existing on-demand generation policy.",
    independentRegistryCategory: true,
  },
  role: {
    allowed: [
      "Select fixed menu shortcut",
      "Preview QR",
      "Export PNG/PDF",
      "Reprint existing shortcut QR",
      "Optional company logo and menu label print layout",
    ],
    forbidden: [
      "Data detail lookup",
      "LOT/document UUID generation",
      "Replacing existing Data QR policy",
      "Desktop route as mobile scan target",
    ],
  },
  taskScope: {
    workspaceRole: "Fixed mobile menu entry QR management",
    showOnly: [
      "Shortcut menu list",
      "Mobile route",
      "QR preview",
      "Print/reprint actions",
      "Placement recommendation",
    ],
    hide: ["Data QR registry rows", "LOT/document detail generation", "Workflow state editing"],
    menuItems: QR_MENU_SHORTCUT_ITEMS,
  },
  exitCondition: {
    completeWhen: "Shortcut QR is generated or reprinted",
    nextScreen: "Worker scans printed QR and opens the mobile route directly",
    engine: "No Workflow stage change. Mobile route may start workflow after user action.",
  },
  layout: [
    "QR Engine > Menu Shortcut tab/section (Blueprint only)",
    "Menu selector",
    "QR preview card",
    "PNG / PDF / Reprint actions",
    "Optional logo + menu label print template",
  ],
  data: {
    registryCategory: "menuShortcut",
    immutableTarget: true,
    mobileRoutes: QR_MENU_SHORTCUT_ROUTES,
    payloadPolicy: "Store mobile menu route or shortcut resolver URL, not data UUID.",
  },
  workflow: [
    "Admin selects menu shortcut",
    "System resolves fixed mobile route",
    "QR preview is shown",
    "Admin exports PNG/PDF or reprints",
    "Worker scans QR with phone",
    "Mobile Portal opens target task screen immediately",
  ],
  automation: {
    user: ["Menu select", "PNG export", "PDF export", "Reprint"],
    system: ["Resolve route", "Render preview", "Record print/reprint history"],
  },
  connectedScreens: ["QR Engine", "Mobile QR Portal", "Inbound", "Shipment", "Inspection", "Production", "Document", "Inventory"],
  outputs: ["Menu Shortcut QR PNG", "Menu Shortcut QR PDF", "Optional company-logo menu label"],
  completionCriteria: [
    "Menu Shortcut QR and Data QR are independent",
    "Fixed shortcut QR is reusable after generation",
    "Mobile route opens without Desktop AppShell",
    "PNG/PDF/reprint policy is defined",
    "QR Engine UI requirement is documented only",
    "PM approval before implementation",
  ],
  qaTargets: [
    "Mobile route opens correct task",
    "Printed QR remains stable after reprint",
    "Data QR on-demand policy unaffected",
    "No Desktop sidebar/launcher on phone scan",
  ],
});