import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { registerMesOracleHandlers } from "./oracle/mesOracleHandlers.mjs";
import { registerTitanDbHandlers } from "./sqlite/titanDbHandlers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

dotenv.config({ path: path.join(projectRoot, ".env") });

const forceProd =
  process.env.ELECTRON_PROD === "1" || process.env.ELECTRON_PROD === "true";
const isDev = !app.isPackaged && !forceProd;
const VITE_DEV_URL = process.env.VITE_DEV_SERVER_URL ?? "http://localhost:5173";
const distIndexPath = path.join(projectRoot, "dist", "index.html");

/** @type {import("electron").BrowserWindow | null} */
let mainWindow = null;

function focusMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  if (!mainWindow.isVisible()) mainWindow.show();
  mainWindow.focus();
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

  if (isDev) {
    mainWindow.loadURL(VITE_DEV_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(distIndexPath);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

if (gotSingleInstanceLock) {
  app.on("second-instance", () => {
    focusMainWindow();
  });

  app.whenReady().then(() => {
    registerMesOracleHandlers(ipcMain);
    registerTitanDbHandlers(ipcMain);
    createWindow();

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
