import fs from "node:fs";
import path from "node:path";
import { app } from "electron";

const APP_DATA_DIR_NAME = "Project TITAN";

/** @type {string | null} */
let configuredUserDataRoot = null;

/** @type {string | null} */
let mainLogPath = null;

function shouldUseDedicatedUserData() {
  return (
    app.isPackaged ||
    process.env.ELECTRON_PROD === "1" ||
    process.env.ELECTRON_PROD === "true"
  );
}

function isWritableDirectory(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Prefer per-user LOCALAPPDATA over exe-adjacent or install-dir paths.
 * Portable EXE on read-only shares breaks for non-admin users without this.
 */
export function resolveWritableUserDataRoot() {
  if (configuredUserDataRoot) return configuredUserDataRoot;

  const candidates = [
    process.env.TITAN_USER_DATA?.trim(),
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, APP_DATA_DIR_NAME)
      : null,
    process.env.APPDATA ? path.join(process.env.APPDATA, APP_DATA_DIR_NAME) : null,
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (isWritableDirectory(candidate)) {
      configuredUserDataRoot = candidate;
      return candidate;
    }
  }

  const fallback = app.getPath("userData");
  configuredUserDataRoot = fallback;
  return fallback;
}

export function configureTitanUserPaths() {
  if (!shouldUseDedicatedUserData()) return;

  const root = resolveWritableUserDataRoot();
  try {
    app.setPath("userData", root);
  } catch (error) {
    appendMainProcessLog("warn", "app.setPath(userData) failed", error);
  }

  const logsDir = path.join(app.getPath("userData"), "logs");
  try {
    fs.mkdirSync(logsDir, { recursive: true });
    mainLogPath = path.join(logsDir, "main.log");
  } catch (error) {
    appendMainProcessLog("warn", "Failed to create logs directory", error);
  }

  appendMainProcessLog("info", "Titan user paths configured", {
    userData: app.getPath("userData"),
    packaged: app.isPackaged,
    execPath: process.execPath,
    cwd: process.cwd(),
    localAppData: process.env.LOCALAPPDATA ?? null,
  });
}

/**
 * @param {"info" | "warn" | "error"} level
 * @param {string} message
 * @param {unknown} [meta]
 */
export function appendMainProcessLog(level, message, meta) {
  const normalizedMeta =
    meta instanceof Error
      ? { error: meta.message, stack: meta.stack }
      : meta ?? null;

  const line =
    JSON.stringify({
      at: new Date().toISOString(),
      level,
      message,
      meta: normalizedMeta,
    }) + "\n";

  if (mainLogPath) {
    try {
      fs.appendFileSync(mainLogPath, line, "utf8");
    } catch {
      /* best-effort file logging */
    }
  }

  const prefix = `[TITAN main] ${message}`;
  if (level === "error") {
    console.error(prefix, normalizedMeta ?? "");
  } else if (level === "warn") {
    console.warn(prefix, normalizedMeta ?? "");
  } else {
    console.log(prefix, normalizedMeta ?? "");
  }
}

export function getMainLogPath() {
  return mainLogPath;
}

export function resolveDistIndexPath(projectRoot) {
  if (app.isPackaged || process.env.ELECTRON_PROD === "1" || process.env.ELECTRON_PROD === "true") {
    return path.join(app.getAppPath(), "dist", "index.html");
  }
  return path.join(projectRoot, "dist", "index.html");
}

export function installMainProcessDiagnostics() {
  process.on("uncaughtException", (error) => {
    appendMainProcessLog("error", "uncaughtException", error);
  });

  process.on("unhandledRejection", (reason) => {
    appendMainProcessLog(
      "error",
      "unhandledRejection",
      reason instanceof Error ? reason : { reason: String(reason) }
    );
  });
}

export function buildLoadFailureHtml({ title, detail, logPath }) {
  const safeTitle = String(title ?? "Failed to load Project TITAN");
  const safeDetail = String(detail ?? "Unknown load error");
  const safeLog = logPath ? String(logPath) : "";

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>Project TITAN — Load Error</title>
  <style>
    body { font-family: "Segoe UI", sans-serif; margin: 0; background: #f4f7fb; color: #1e293b; }
    .card { max-width: 720px; margin: 48px auto; padding: 24px 28px; background: #fff; border: 1px solid #d5dee8; border-radius: 12px; }
    h1 { margin: 0 0 12px; font-size: 20px; }
    p { margin: 0 0 10px; line-height: 1.5; }
    code { display: block; white-space: pre-wrap; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${safeTitle}</h1>
    <p>앱 화면을 불러오지 못했습니다. 관리자에게 문의하거나 로그 파일을 확인하세요.</p>
    <code>${safeDetail}${safeLog ? `\n\nLog: ${safeLog}` : ""}</code>
  </div>
</body>
</html>`;
}
