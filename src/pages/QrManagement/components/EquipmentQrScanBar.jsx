import { useState } from "react";

import { SecondaryButton } from "../../../foundation/components/Button";

/**
 * 설비 QR Scan 시뮬레이션 — NDK://EQ/{code} · 설비코드 직접 입력
 */
export default function EquipmentQrScanBar({ onScan, error, disabled = false }) {
  const [draft, setDraft] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = draft.trim();
    if (!value || disabled) return;
    onScan(value);
  };

  return (
    <form className="qr-management-page__scan-bar" onSubmit={handleSubmit} aria-label="설비 QR Scan">
      <label className="qr-management-page__scan-label" htmlFor="equipment-qr-scan-input">
        설비 QR Scan
      </label>
      <div className="qr-management-page__scan-row">
        <input
          id="equipment-qr-scan-input"
          className="qr-management-page__scan-input"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="NDK://EQ/3S-1 또는 설비코드"
          disabled={disabled}
          autoComplete="off"
        />
        <SecondaryButton type="submit" disabled={disabled || !draft.trim()}>
          Scan
        </SecondaryButton>
      </div>
      {error ? (
        <p className="qr-management-page__scan-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
