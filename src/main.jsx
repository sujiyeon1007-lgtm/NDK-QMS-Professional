import React from "react";
import ReactDOM from "react-dom/client";
import "./foundation/styles/foundation.css";
import "./foundation/styles/titan-design-system.css";
import App from "./App.jsx";
import "./utils/masterData";
import { getTitanDataEngine } from "./foundation/data";
import { getTitanWorkflowEngine } from "./foundation/workflow";
import { initTitanWorkflowIntegration } from "./utils/titanWorkflowIntegration";
import { assertMenuIntegrityInDev } from "./utils/menuIntegrity";
import {
  applyHydratedMasterToSession,
  bootV11MasterRepository,
} from "./utils/v11MasterRepositoryBoot.js";

const BOOT_REPOSITORY_TIMEOUT_MS = 8000;

function bootRepositoryWithTimeout() {
  return Promise.race([
    bootV11MasterRepository(),
    new Promise((resolve) => {
      globalThis.setTimeout(
        () =>
          resolve({
            ok: false,
            backend: "session",
            hydrated: false,
            message: "Repository boot timeout — session fallback",
          }),
        BOOT_REPOSITORY_TIMEOUT_MS
      );
    }),
  ]);
}

async function bootstrap() {
  assertMenuIntegrityInDev();

  let boot = { ok: false, backend: "session", hydrated: false };
  try {
    boot = await bootRepositoryWithTimeout();
    if (boot.hydrated) {
      applyHydratedMasterToSession(boot.categories);
    }
    if (boot.ok && boot.backend === "sqlite") {
      const { setRepositoryBackend } = await import("./repositories/index.js");
      setRepositoryBackend("sqlite");
    }
  } catch (error) {
    console.error("[TITAN bootstrap] Repository boot failed — session fallback", error);
  }

  getTitanDataEngine();
  getTitanWorkflowEngine();
  initTitanWorkflowIntegration();

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

function renderFatalBootstrapMessage(error) {
  const root = document.getElementById("root");
  if (!root) return;
  const message = error instanceof Error ? error.message : String(error);
  root.innerHTML = `
    <div style="font-family:Segoe UI,sans-serif;padding:32px;color:#1e293b;background:#f4f7fb;min-height:100vh;">
      <div style="max-width:720px;margin:0 auto;background:#fff;border:1px solid #d5dee8;border-radius:12px;padding:24px 28px;">
        <h1 style="margin:0 0 12px;font-size:20px;">Project TITAN 시작 오류</h1>
        <p style="margin:0 0 10px;line-height:1.5;">앱 초기화에 실패했습니다. 관리자에게 문의하거나 앱을 다시 실행하세요.</p>
        <code style="display:block;white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;padding:10px;border-radius:8px;font-size:12px;">${message}</code>
      </div>
    </div>
  `;
}

bootstrap().catch((error) => {
  console.error("[TITAN bootstrap] Fatal — rendering with session fallback", error);
  try {
    getTitanDataEngine();
    getTitanWorkflowEngine();
    initTitanWorkflowIntegration();
    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (fallbackError) {
    console.error("[TITAN bootstrap] Fallback render failed", fallbackError);
    renderFatalBootstrapMessage(fallbackError);
  }
});
