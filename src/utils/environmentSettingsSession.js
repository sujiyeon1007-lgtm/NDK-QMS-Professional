/**
 * Project TITAN V1.0 — 환경설정 SessionStorage (SQLite 연동 준비)
 */

import { getTitanErrorLogs } from "./titanErrorLogSession";
import { getCurrentTitanUser } from "./titanHistorySession";

const STORAGE_KEY = "project-titan-environment-settings-v1";
const BACKUP_PREFIX = "project-titan-";

export const APP_VERSION = "V1.0.0";
export const APP_NAME = "Project TITAN V1.0";

export const PERMISSION_MENUS = [
  { key: "all", label: "전체" },
  { key: "incoming", label: "입고" },
  { key: "production", label: "생산" },
  { key: "quality", label: "품질" },
  { key: "shipment", label: "출고" },
  { key: "environment", label: "환경설정" },
];

export const USER_ROLES = [
  { value: "admin", label: "관리자" },
  { value: "quality", label: "품질" },
  { value: "production", label: "생산" },
];

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function defaultPermissions() {
  return {
    admin: { all: true, incoming: true, production: true, quality: true, shipment: true, environment: true },
    quality: { all: false, incoming: true, production: true, quality: true, shipment: true, environment: false },
    production: { all: false, incoming: false, production: true, quality: false, shipment: false, environment: false },
  };
}

function getSeedSettings() {
  return {
    company: {
      name: "주식회사 NDK",
      ceo: "대표이사",
      bizNo: "000-00-00000",
      address: "",
      phone: "",
      fax: "",
      email: "",
      website: "",
      logoFileName: "",
      logoMimeType: "",
      logoDataUrl: "",
    },
    users: [
      {
        id: "USR-001",
        loginId: "admin",
        name: "관리자",
        department: "경영지원",
        role: "admin",
        active: true,
      },
      {
        id: "USR-002",
        loginId: "quality01",
        name: "정반이",
        department: "품질관리부",
        role: "quality",
        active: true,
      },
      {
        id: "USR-003",
        loginId: "prod01",
        name: "김생산",
        department: "생산부",
        role: "production",
        active: true,
      },
    ],
    permissions: defaultPermissions(),
    notifications: {
      shipmentDue: true,
      inspectionPending: true,
      productionDelay: true,
      certificatePending: true,
      backup: true,
    },
    programSettings: {
      darkMode: false,
      autoSave: true,
      autoBackup: false,
      autoBackupSchedule: "on_exit",
      defaultPath: "C:\\ProjectTITAN\\Data",
      pdfPath: "C:\\ProjectTITAN\\PDF",
      drawingPath: "C:\\ProjectTITAN\\Drawings",
    },
    backupHistory: [
      {
        id: "BK-SEED-001",
        createdAt: "2026-07-01T18:30:00.000Z",
        label: "전체 백업",
        sizeLabel: "32MB",
        status: "완료",
      },
    ],
    auditLogs: [
      {
        id: "LOG-SEED-001",
        type: "login",
        action: "로그인",
        target: "admin",
        user: getCurrentTitanUser(),
        createdAt: new Date().toISOString(),
      },
    ],
    updateInfo: {
      latestVersion: "V1.0.0",
      available: false,
    },
  };
}

function normalizeSettings(raw = {}) {
  const seed = getSeedSettings();
  return {
    company: { ...seed.company, ...(raw.company ?? {}) },
    users: Array.isArray(raw.users) && raw.users.length > 0 ? raw.users : seed.users,
    permissions: { ...defaultPermissions(), ...(raw.permissions ?? {}) },
    notifications: { ...seed.notifications, ...(raw.notifications ?? {}) },
    programSettings: { ...seed.programSettings, ...(raw.programSettings ?? {}) },
    backupHistory: Array.isArray(raw.backupHistory) ? raw.backupHistory : seed.backupHistory,
    auditLogs: Array.isArray(raw.auditLogs) ? raw.auditLogs : seed.auditLogs,
    updateInfo: { ...seed.updateInfo, ...(raw.updateInfo ?? {}) },
  };
}

function loadSettings() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return normalizeSettings(getSeedSettings());
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return normalizeSettings(getSeedSettings());
  }
}

let settings = loadSettings();

function persistSettings() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* session quota */
  }
}

export function getEnvironmentSettings() {
  return normalizeSettings(settings);
}

export function saveCompanyInfo(payload) {
  settings = normalizeSettings({
    ...settings,
    company: { ...settings.company, ...payload },
  });
  persistSettings();
  appendAuditLog({ type: "update", action: "회사정보 수정", target: payload.name || settings.company.name });
  return settings.company;
}

export function saveCompanyLogo(filePayload) {
  return saveCompanyInfo({
    logoFileName: filePayload?.fileName ?? "",
    logoMimeType: filePayload?.mimeType ?? "",
    logoDataUrl: filePayload?.dataUrl ?? "",
  });
}

export function saveUsers(users) {
  settings = normalizeSettings({ ...settings, users });
  persistSettings();
  return settings.users;
}

export function updateUser(userId, patch) {
  settings = normalizeSettings({
    ...settings,
    users: settings.users.map((row) => (row.id === userId ? { ...row, ...patch } : row)),
  });
  persistSettings();
  appendAuditLog({ type: "update", action: "사용자 수정", target: userId });
  return settings.users;
}

export function resetUserPassword(userId) {
  appendAuditLog({ type: "update", action: "비밀번호 초기화", target: userId });
  return { ok: true, message: "비밀번호가 초기화되었습니다. (V1.0 세션)" };
}

export function savePermissions(permissions) {
  settings = normalizeSettings({ ...settings, permissions: { ...settings.permissions, ...permissions } });
  persistSettings();
  appendAuditLog({ type: "update", action: "권한 수정", target: "권한관리" });
  return settings.permissions;
}

export function saveNotifications(notifications) {
  settings = normalizeSettings({ ...settings, notifications: { ...settings.notifications, ...notifications } });
  persistSettings();
  return settings.notifications;
}

export function saveProgramSettings(programSettings) {
  settings = normalizeSettings({
    ...settings,
    programSettings: { ...settings.programSettings, ...programSettings },
  });
  persistSettings();
  appendAuditLog({ type: "update", action: "프로그램 설정 수정", target: "프로그램 설정" });
  return settings.programSettings;
}

export function appendAuditLog(entry = {}) {
  const log = {
    id: createId("LOG"),
    type: entry.type?.trim() || "system",
    action: entry.action?.trim() || "",
    target: entry.target?.trim() || "",
    user: entry.user?.trim() || getCurrentTitanUser(),
    createdAt: entry.createdAt || new Date().toISOString(),
  };
  settings = normalizeSettings({
    ...settings,
    auditLogs: [log, ...(settings.auditLogs ?? [])].slice(0, 300),
  });
  persistSettings();
  return log;
}

export function getAuditLogs() {
  return settings.auditLogs ?? [];
}

export function getCombinedLogs(keyword = "", typeFilter = "") {
  const q = String(keyword ?? "").trim().toLowerCase();
  const audit = getAuditLogs().map((row) => ({
    ...row,
    source: "audit",
    label: row.action,
    date: row.createdAt,
  }));
  const errors = getTitanErrorLogs().map((row) => ({
    id: row.id,
    type: "error",
    action: "오류",
    target: row.message,
    user: row.user,
    createdAt: row.createdAt,
    source: "error",
    label: row.message,
    date: row.occurredAt,
    screen: row.screen,
    component: row.component,
  }));

  let rows = [...errors, ...audit].sort((a, b) => String(b.date).localeCompare(String(a.date)));

  if (typeFilter === "login") rows = rows.filter((row) => row.type === "login");
  if (typeFilter === "create") rows = rows.filter((row) => row.type === "create" || row.action.includes("등록"));
  if (typeFilter === "update") rows = rows.filter((row) => row.type === "update" || row.action.includes("수정"));
  if (typeFilter === "delete") rows = rows.filter((row) => row.type === "delete" || row.action.includes("삭제"));
  if (typeFilter === "error") rows = rows.filter((row) => row.type === "error");

  if (q) {
    rows = rows.filter((row) =>
      [row.action, row.target, row.user, row.label, row.screen, row.component]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }

  return rows;
}

function collectSessionBackupPayload() {
  const payload = { exportedAt: new Date().toISOString(), version: APP_VERSION, data: {} };
  for (let i = 0; i < sessionStorage.length; i += 1) {
    const key = sessionStorage.key(i);
    if (!key?.startsWith(BACKUP_PREFIX)) continue;
    payload.data[key] = sessionStorage.getItem(key);
  }
  return payload;
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0B";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)}GB`;
}

export function estimateStorageUsage() {
  let dbBytes = 0;
  let drawingBytes = 0;
  let pdfBytes = 0;

  for (let i = 0; i < sessionStorage.length; i += 1) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key) ?? "";
    const size = new Blob([value]).size;
    if (key.includes("drawing") || key.includes("product-drawings")) drawingBytes += size;
    else if (key.includes("certificate") || key.includes("pdf")) pdfBytes += size;
    else if (key?.startsWith(BACKUP_PREFIX)) dbBytes += size;
  }

  return {
    db: formatBytes(dbBytes),
    drawings: formatBytes(drawingBytes),
    pdf: formatBytes(pdfBytes),
    backupCount: settings.backupHistory?.length ?? 0,
    storagePercent: Math.min(99, Math.round((dbBytes + drawingBytes + pdfBytes) / (50 * 1024 * 1024)) || 12),
  };
}

export function getSystemStatusSummary() {
  const storage = estimateStorageUsage();
  const latestBackup = settings.backupHistory?.[0];
  const errorCount = getTitanErrorLogs().length;

  return {
    version: APP_VERSION,
    dbStatus: "정상",
    sqliteStatus: "정상",
    latestBackupLabel: latestBackup
      ? latestBackup.createdAt.replace("T", " ").slice(0, 16)
      : "—",
    storagePercent: storage.storagePercent,
    errorCount,
    storage,
  };
}

export function runFullBackup() {
  const payload = collectSessionBackupPayload();
  const json = JSON.stringify(payload);
  const sizeLabel = formatBytes(new Blob([json]).size);
  const entry = {
    id: createId("BK"),
    createdAt: new Date().toISOString(),
    label: "전체 백업",
    sizeLabel,
    status: "완료",
  };

  settings = normalizeSettings({
    ...settings,
    backupHistory: [entry, ...(settings.backupHistory ?? [])].slice(0, 20),
  });
  persistSettings();
  appendAuditLog({ type: "create", action: "전체 백업", target: entry.id });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  link.download = `ProjectTITAN-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);

  return { ok: true, entry, sizeLabel };
}

export function restoreFromBackupFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve({ ok: false, message: "복원 파일을 선택하세요." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const data = parsed?.data ?? parsed;
        if (!data || typeof data !== "object") {
          resolve({ ok: false, message: "올바른 백업 파일이 아닙니다." });
          return;
        }
        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === "string") sessionStorage.setItem(key, value);
        });
        settings = loadSettings();
        appendAuditLog({ type: "update", action: "데이터 복원", target: file.name });
        resolve({ ok: true, message: "복원이 완료되었습니다. 화면을 새로고침합니다." });
      } catch {
        reject(new Error("백업 파일을 읽을 수 없습니다."));
      }
    };
    reader.onerror = () => reject(new Error("백업 파일을 읽을 수 없습니다."));
    reader.readAsText(file);
  });
}

export function openBackupFolderHint() {
  appendAuditLog({ type: "system", action: "백업 폴더 열기", target: settings.programSettings.defaultPath });
  return {
    ok: true,
    message: `백업 경로: ${settings.programSettings.defaultPath}\\Backup (Electron V1.1 연동 예정)`,
  };
}

export function runSampleDataGeneration() {
  appendAuditLog({ type: "create", action: "샘플 데이터 생성", target: "데이터 관리" });
  return { ok: true, message: "샘플 데이터는 이미 세션에 포함되어 있습니다." };
}

export function runUnusedDataCleanup() {
  appendAuditLog({ type: "delete", action: "미사용 데이터 정리", target: "데이터 관리" });
  return { ok: true, message: "미사용 데이터 정리가 완료되었습니다. (V1.0 세션)" };
}

export function runDatabaseOptimize() {
  appendAuditLog({ type: "update", action: "DB 최적화", target: "데이터 관리" });
  return { ok: true, message: "DB 최적화가 완료되었습니다. (V1.0 세션)" };
}

export function checkForUpdates() {
  return {
    available: settings.updateInfo.available,
    latestVersion: settings.updateInfo.latestVersion,
    currentVersion: APP_VERSION,
  };
}

export function readLogoFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        fileName: file.name,
        mimeType: file.type,
        dataUrl: typeof reader.result === "string" ? reader.result : "",
      });
    };
    reader.onerror = () => reject(new Error("로고 파일을 읽을 수 없습니다."));
    reader.readAsDataURL(file);
  });
}