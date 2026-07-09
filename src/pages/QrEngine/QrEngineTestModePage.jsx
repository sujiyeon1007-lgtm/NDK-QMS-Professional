import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { QR_ENGINE_COPY, QR_ENGINE_ROUTES } from "../../config/qrEngineArchitecture";
import { PrimaryButton, SecondaryButton, TitanDashboardCard } from "../../foundation/uiKit";
import { getEquipmentGeneratorOptions } from "../../utils/qrEngineRegistryService";
import { resolveEquipmentWorkEntry } from "../../utils/qrEngineService";
import { isTitanAdminUser } from "../../utils/titanAdminAccess";
import QrEnginePageShell, { qrEngineBreadcrumbTrail } from "./QrEnginePageShell";

const TEST_STEPS = [
  "설비 선택",
  "LOT 선택 (작업 화면)",
  "작업 화면 이동",
  "작업 시작",
  "작업 완료",
  "Lifecycle 확인",
  "데이터 저장 확인",
];

export default function QrEngineTestModePage() {
  const navigate = useNavigate();
  const isAdmin = isTitanAdminUser();
  const equipmentOptions = useMemo(() => getEquipmentGeneratorOptions(), []);
  const [equipmentCode, setEquipmentCode] = useState(equipmentOptions[0]?.value ?? "");
  const [manualCode, setManualCode] = useState("");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const refreshPreview = useCallback((code) => {
    const result = resolveEquipmentWorkEntry(code, { recordScan: false });
    if (!result.ok) {
      setPreview(null);
      setError(result.message ?? "");
      return;
    }
    setError("");
    setPreview(result);
  }, []);

  useEffect(() => {
    if (equipmentCode) refreshPreview(equipmentCode);
  }, [equipmentCode, refreshPreview]);

  const openWorkScreen = useCallback(
    (code) => {
      const result = resolveEquipmentWorkEntry(code, { recordScan: true });
      if (!result.ok) {
        setError(result.message ?? "");
        return;
      }
      setError("");
      navigate(result.navigationPath);
    },
    [navigate]
  );

  const handleEquipmentChange = (event) => {
    const next = event.target.value;
    setEquipmentCode(next);
    setManualCode("");
    refreshPreview(next);
  };

  const handleManualSubmit = (event) => {
    event.preventDefault();
    openWorkScreen(manualCode || equipmentCode);
  };

  if (!isAdmin) {
    return (
      <QrEnginePageShell
        breadcrumbItems={qrEngineBreadcrumbTrail(QR_ENGINE_COPY.testModeTitle)}
        title={QR_ENGINE_COPY.testModeTitle}
        description={QR_ENGINE_COPY.adminOnlyHint}
      >
        <TitanDashboardCard title={QR_ENGINE_COPY.testModeTitle}>
          <p className="qr-engine-status qr-engine-status--error">
            {QR_ENGINE_COPY.adminOnlyHint}
          </p>
          <Link to={QR_ENGINE_ROUTES.dashboard} className="qr-engine-inline-link">
            {QR_ENGINE_COPY.backToDashboard}
          </Link>
        </TitanDashboardCard>
      </QrEnginePageShell>
    );
  }

  return (
    <QrEnginePageShell
      breadcrumbItems={qrEngineBreadcrumbTrail(QR_ENGINE_COPY.testModeTitle)}
      title={QR_ENGINE_COPY.testModeTitle}
      description={QR_ENGINE_COPY.testModeIntro}
    >
      <div className="qr-engine-page qr-engine-test-mode">
        <TitanDashboardCard title="설비 바로가기 (QR 생략)">
          <form className="qr-engine-test-mode__form" onSubmit={handleManualSubmit}>
            <label className="qr-engine-test-mode__field">
              <span>설비</span>
              <select value={equipmentCode} onChange={handleEquipmentChange}>
                {equipmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="qr-engine-test-mode__field">
              <span>설비 직접 입력</span>
              <input
                value={manualCode}
                onChange={(event) => setManualCode(event.target.value)}
                placeholder="3S-1 / NDK://EQ/3S-1"
                autoComplete="off"
              />
            </label>

            <div className="qr-engine-test-mode__actions">
              <PrimaryButton type="submit">작업 화면 열기</PrimaryButton>
              <SecondaryButton
                type="button"
                onClick={() => refreshPreview(manualCode || equipmentCode)}
              >
                LOT 미리보기
              </SecondaryButton>
              <SecondaryButton type="button" onClick={() => navigate(QR_ENGINE_ROUTES.diagnostics)}>
                QR Diagnostics
              </SecondaryButton>
            </div>
          </form>

          {error ? <p className="qr-engine-status qr-engine-status--error">{error}</p> : null}

          {preview ? (
            <section className="qr-engine-test-mode__preview" aria-label="LOT preview">
              <header>
                <strong>{preview.equipment?.name ?? preview.equipmentId}</strong>
                <span>{preview.navigationPath}</span>
              </header>
              <p>{`대기 LOT ${(preview.availableLots?.length ?? 0).toLocaleString("ko-KR")}건`}</p>
              <ol>
                {(preview.availableLots ?? []).slice(0, 6).map((lot) => (
                  <li key={lot.lotNo ?? lot.id}>{lot.lotNo ?? lot.label ?? "-"}</li>
                ))}
              </ol>
            </section>
          ) : null}
        </TitanDashboardCard>

        <TitanDashboardCard title="Workflow 테스트 체크리스트">
          <ol className="qr-engine-test-mode__checklist">
            {TEST_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="qr-engine-test-mode__hint">
            QR 스캔 없이 동일 설비 작업 엔진을 사용합니다. 작업 시작/완료는 이동한 작업 화면에서
            진행하세요.
          </p>
        </TitanDashboardCard>
      </div>
    </QrEnginePageShell>
  );
}
