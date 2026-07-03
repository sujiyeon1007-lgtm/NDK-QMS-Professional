import React from "react";
import ReactDOM from "react-dom/client";
import "./foundation/styles/foundation.css";
import App from "./App.jsx";
import { assertMenuIntegrityInDev } from "./utils/menuIntegrity";

assertMenuIntegrityInDev();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
