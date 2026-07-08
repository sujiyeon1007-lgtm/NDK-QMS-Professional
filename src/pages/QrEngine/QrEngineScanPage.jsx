import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { QR_ENGINE_COPY } from "../../config/qrEngineArchitecture";
import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import { processQrEngineScan } from "../../utils/qrEngineService";

const DEMO_SCANS = [
  { label: "설비 3S-3", value: "NDK://EQ/3S-3" },
  { label: "LOT LOT-20260707-001", value: "LOT-20260707-001" },
];

export default function QrEngineScanPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [payload, setPayload] = useState("");
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState("");

  const runScan = useCallback(
    async (raw) => {
      const text = String(raw ?? "").trim();
      if (!text) {
        setError("QR 코드를 입력하세요.");
        return;
      }

      setError("");
      setPhase("processing");
      await new Promise((resolve) => setTimeout(resolve, 180));
      setPhase("resolving");
      await new Promise((resolve) => setTimeout(resolve, 180));

      const result = processQrEngineScan(text);
      if (!result.ok) {
        setPhase("idle");
        setError(result.message ?? "QR 처리 실패");
        return;
      }

      navigate(result.navigationPath, { replace: true });
    },
    [navigate]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    runScan(payload);
  };

  return (
    <div className="qr-engine-page">
      <form className="qr-engine-scan-panel" onSubmit={handleSubmit}>
        <label htmlFor="qr-engine-scan-input" className="sr-only">
          QR Scan
        </label>
        <input
          id="qr-engine-scan-input"
          ref={inputRef}
          className="qr-engine-scan-input"
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          placeholder={QR_ENGINE_COPY.scanPlaceholder}
          autoComplete="off"
          disabled={phase !== "idle"}
        />

        {phase === "processing" ? (
          <p className="qr-engine-status" role="status">
            {QR_ENGINE_COPY.scanProcessing}
          </p>
        ) : null}
        {phase === "resolving" ? (
          <p className="qr-engine-status" role="status">
            {QR_ENGINE_COPY.scanResolving}
          </p>
        ) : null}
        {error ? (
          <p className="home-empty" role="alert">
            {error}
          </p>
        ) : null}

        <div className="qr-engine-scan-actions">
          <PrimaryButton type="submit" disabled={phase !== "idle"}>
            Scan
          </PrimaryButton>
          <SecondaryButton
            type="button"
            disabled={phase !== "idle"}
            onClick={() => {
              setPayload("");
              setError("");
              inputRef.current?.focus();
            }}
          >
            초기화
          </SecondaryButton>
        </div>

        <div className="qr-engine-demo-row" aria-label="Demo QR">
          {DEMO_SCANS.map((demo) => (
            <button
              key={demo.value}
              type="button"
              className="qr-engine-demo-chip"
              disabled={phase !== "idle"}
              onClick={() => {
                setPayload(demo.value);
                runScan(demo.value);
              }}
            >
              {demo.label}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}