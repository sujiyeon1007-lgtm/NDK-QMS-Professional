import { Link, useNavigate } from "react-router-dom";

import { QR_ENGINE_COPY, QR_ENGINE_ROUTES } from "../../config/qrEngineArchitecture";
import { PrimaryButton, SecondaryButton, TitanDashboardCard, TitanEmptyState } from "../../foundation/uiKit";
import { buildQrEngineDashboard } from "../../utils/qrEngineService";

function formatScanTime(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function QrEngineDashboardPage() {
  const navigate = useNavigate();
  const dashboard = buildQrEngineDashboard();

  return (
    <div className="qr-engine-page">
      <div className="qr-engine-scan-actions">
        <PrimaryButton type="button" onClick={() => navigate(QR_ENGINE_ROUTES.scan)}>
          {QR_ENGINE_COPY.scanTitle}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={() => navigate(QR_ENGINE_ROUTES.generator)}>
          {QR_ENGINE_COPY.generatorTitle}
        </SecondaryButton>
        <SecondaryButton type="button" onClick={() => navigate(QR_ENGINE_ROUTES.registry)}>
          {QR_ENGINE_COPY.registryTitle}
        </SecondaryButton>
      </div>

      <div className="qr-engine-kpi-grid" aria-label="QR Dashboard KPI">
        <div className="qr-engine-kpi">
          <div className="qr-engine-kpi__label">금일 Scan</div>
          <div className="qr-engine-kpi__value">{dashboard.todayScanCount}</div>
        </div>
        <div className="qr-engine-kpi">
          <div className="qr-engine-kpi__label">활성 QR (운전/준비)</div>
          <div className="qr-engine-kpi__value">{dashboard.activeEquipmentCount}</div>
        </div>
        <div className="qr-engine-kpi">
          <div className="qr-engine-kpi__label">Equipment QR 수</div>
          <div className="qr-engine-kpi__value">{dashboard.equipmentQrCount}</div>
        </div>
        <div className="qr-engine-kpi">
          <div className="qr-engine-kpi__label">LOT QR 수</div>
          <div className="qr-engine-kpi__value">{dashboard.lotQrCount}</div>
        </div>
      </div>

      <TitanDashboardCard title="최근 Scan" aria-label="최근 Scan">
        {dashboard.recentScans.length ? (
          <div className="qr-engine-list">
            {dashboard.recentScans.map((row) => (
              <button
                key={row.id}
                type="button"
                className="qr-engine-list__row"
                onClick={() => navigate(row.navigationPath)}
              >
                <span>
                  <strong>{row.label}</strong> · {row.type === "lot" ? "LOT QR" : "설비 QR"}
                </span>
                <span>{formatScanTime(row.at)}</span>
              </button>
            ))}
          </div>
        ) : (
          <TitanEmptyState title="아직 Scan 이력이 없습니다." description="QR Scan으로 시작하세요." />
        )}
      </TitanDashboardCard>

      <TitanDashboardCard title="최근 작업" aria-label="최근 작업">
        {dashboard.recentWork.length ? (
          <div className="qr-engine-list">
            {dashboard.recentWork.map((row) => (
              <Link key={`${row.path}-${row.at}`} to={row.path} className="qr-engine-list__row">
                <span>{row.label}</span>
                <span>{formatScanTime(row.at)}</span>
              </Link>
            ))}
          </div>
        ) : (
          <TitanEmptyState title="표시할 작업이 없습니다." description="설비 QR Scan 후 현재 작업 화면이 여기에 표시됩니다." />
        )}
      </TitanDashboardCard>
    </div>
  );
}