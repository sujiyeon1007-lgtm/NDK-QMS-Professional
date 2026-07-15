import { app, BrowserWindow, ipcMain } from "electron";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { registerMesOracleHandlers } from "./oracle/mesOracleHandlers.mjs";
import { registerTitanDbHandlers } from "./sqlite/titanDbHandlers.mjs";
import {
  appendMainProcessLog,
  buildLoadFailureHtml,
  configureTitanUserPaths,
  getMainLogPath,
  installMainProcessDiagnostics,
  resolveDistIndexPath,
} from "./titanPaths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

configureTitanUserPaths();
installMainProcessDiagnostics();

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  appendMainProcessLog("info", "Second instance blocked — exiting");
  app.quit();
}

dotenv.config({ path: path.join(projectRoot, ".env") });

const forceProd =
  process.env.ELECTRON_PROD === "1" || process.env.ELECTRON_PROD === "true";
const isDev = !app.isPackaged && !forceProd;
const VITE_DEV_URL = process.env.VITE_DEV_SERVER_URL ?? "http://localhost:5173";
const distIndexPath = resolveDistIndexPath(projectRoot);

/** @type {import("electron").BrowserWindow | null} */
let mainWindow = null;

function focusMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  if (!mainWindow.isVisible()) mainWindow.show();
  mainWindow.focus();
}

function showLoadFailure(win, title, detail) {
  if (!win || win.isDestroyed()) return;
  const html = buildLoadFailureHtml({
    title,
    detail,
    logPath: getMainLogPath(),
  });
  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  if (!win.isVisible()) win.show();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1280,
    minHeight: 720,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    title: "Project TITAN — NDK QMS Professional",
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL) => {
      appendMainProcessLog("error", "Renderer did-fail-load", {
        errorCode,
        errorDescription,
        validatedURL,
        distIndexPath,
      });
      showLoadFailure(
        mainWindow,
        "Project TITAN 화면 로드 실패",
        `${errorDescription} (${errorCode})\n${validatedURL}`
      );
    }
  );

  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    appendMainProcessLog("error", "Renderer process gone", details);
    showLoadFailure(
      mainWindow,
      "Project TITAN 렌더러 오류",
      `${details.reason} · exitCode=${details.exitCode}`
    );
  });

  if (isDev) {
    appendMainProcessLog("info", "Starting dev renderer", { url: VITE_DEV_URL });
    mainWindow.loadURL(VITE_DEV_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
    return;
  }

  if (!fs.existsSync(distIndexPath)) {
    appendMainProcessLog("error", "dist/index.html missing", { distIndexPath });
    showLoadFailure(
      mainWindow,
      "Project TITAN 빌드 파일 없음",
      `dist/index.html not found:\n${distIndexPath}`
    );
    return;
  }

  appendMainProcessLog("info", "Loading packaged renderer", { distIndexPath });
  mainWindow.loadFile(distIndexPath).catch((error) => {
    appendMainProcessLog("error", "loadFile failed", error);
    showLoadFailure(mainWindow, "Project TITAN loadFile 실패", error?.message ?? String(error));
  });
}

if (gotSingleInstanceLock) {
  app.on("second-instance", () => {
    focusMainWindow();
  });

  app.whenReady().then(() => {
    try {
      registerMesOracleHandlers(ipcMain);
      registerTitanDbHandlers(ipcMain);
      createWindow();
    } catch (error) {
      appendMainProcessLog("error", "app.whenReady startup failed", error);
      createWindow();
      showLoadFailure(
        mainWindow,
        "Project TITAN 시작 오류",
        error instanceof Error ? error.message : String(error)
      );
    }

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      } else {
        focusMainWindow();
      }
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}
