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

bootstrap().catch((error) => {
  console.error("[TITAN bootstrap] Fatal — rendering with session fallback", error);
  try {
    getTitanDataEngine();
    getTitanWorkflowEngine();
    initTitanWorkflowIntegration();
  } catch {
    /* engine init best-effort */
  }
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
