import React from "react";
import ReactDOM from "react-dom/client";
import "./foundation/styles/foundation.css";
import App from "./App.jsx";
import "./utils/masterData";
import { getTitanDataEngine } from "./foundation/data";
import { getTitanWorkflowEngine } from "./foundation/workflow";
import { initTitanWorkflowIntegration } from "./utils/titanWorkflowIntegration";
import { assertMenuIntegrityInDev } from "./utils/menuIntegrity";

assertMenuIntegrityInDev();
getTitanDataEngine();
getTitanWorkflowEngine();
initTitanWorkflowIntegration();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
