import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { QR_ENGINE_COPY, QR_ENGINE_ROUTES } from "../../config/qrEngineArchitecture";
import { PrimaryButton, SecondaryButton, TitanDashboardCard, TitanEmptyState } from "../../foundation/uiKit";
import { buildQrEngineDashboard } from "../../utils/qrEngineService";
import { scheduleQrEngineAutoRegistrySync } from "../../utils/qrEngineRegistryService";

function formatScanTime(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function scanTypeLabel(type) {
  if (type === "lot") return "LOT QR";
  if (type === "equipment") return "설비 QR";
  if (type === "inbound") return "입고등록 QR";
  if (type === "outbound") return "출고등록 QR";
  if (type === "product") return "제품 QR";
  if (type === "material") return "재질 QR";
  if (type === "document") return "문서 QR";
  if (type === "worker") return "작업자 QR";
  return "QR";
}

export default function QrEngineDashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(() => buildQrEngineDashboard());

  useEffect(() => {
    let cancelled = false;
    scheduleQrEngineAutoRegistrySync().then(() => {
      if (!cancelled) setDashboard(buildQrEngineDashboard());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="qr-engine-page">
      <div className="qr-engine-scan-actions" aria-label="QR Quick Action">
        <PrimaryButton type="button" onClick={() => navigate(QR_ENGINE_ROUTES.scan)}>
          QR 스캔
        </PrimaryButton>
        <SecondaryButton type="button" onClick={() => navigate(QR_ENGINE_ROUTES.generator)}>
          QR 생성
        </SecondaryButton>
        <SecondaryButton type="button" onClick={() => navigate(QR_ENGINE_ROUTES.generator)}>
          QR 출력
        </SecondaryButton>
        <SecondaryButton type="button" onClick={() => navigate(QR_ENGINE_ROUTES.registry)}>
          {QR_ENGINE_COPY.registryTitle}
        </SecondaryButton>
      </div>

      <div className="qr-engine-kpi-grid" aria-label="QR Dashboard KPI">
        <div className="qr-engine-kpi">
          <div className="qr-engine-kpi__label">등록된 QR</div>
          <div className="qr-engine-kpi__value">{dashboard.totalQrCount}</div>
        </div>
        <div className="qr-engine-kpi">
          <div className="qr-engine-kpi__label">설비 QR</div>
          <div className="qr-engine-kpi__value">{dashboard.equipmentQrCount}</div>
        </div>
        <div className="qr-engine-kpi">
          <div className="qr-engine-kpi__label">LOT QR</div>
          <div className="qr-engine-kpi__value">{dashboard.lotQrCount}</div>
        </div>
        <div className="qr-engine-kpi">
          <div className="qr-engine-kpi__label">금일 스캔</div>
          <div className="qr-engine-kpi__value">{dashboard.todayScanCount}</div>
        </div>
        <div className="qr-engine-kpi">
          <div className="qr-engine-kpi__label">최근 생성</div>
          <div className="qr-engine-kpi__value">{dashboard.recentGenerated.length}</div>
        </div>
        <div className="qr-engine-kpi">
          <div className="qr-engine-kpi__label">최근 출력</div>
          <div className="qr-engine-kpi__value">{dashboard.recentPrinted.length}</div>
        </div>
      </div>

      <TitanDashboardCard title="최근 스캔" aria-label="최근 스캔">
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
                  <strong>{row.label}</strong> · {scanTypeLabel(row.type)}
                </span>
                <span>{formatScanTime(row.at)}</span>
              </button>
            ))}
          </div>
        ) : (
          <TitanEmptyState title="아직 스캔 이력이 없습니다." description="QR 스캔으로 LOT Lifecycle을 확인하세요." />
        )}
      </TitanDashboardCard>

      <TitanDashboardCard title="최근 생성" aria-label="최근 생성">
        {dashboard.recentGenerated.length ? (
          <div className="qr-engine-list">
            {dashboard.recentGenerated.map((row) => (
              <button
                key={row.id}
                type="button"
                className="qr-engine-list__row"
                onClick={() => navigate(row.navigationPath)}
              >
                <span>{row.label}</span>
                <span>{formatScanTime(row.at)}</span>
              </button>
            ))}
          </div>
        ) : (
          <TitanEmptyState title="최근 생성 QR이 없습니다." description="QR 생성 화면에서 QR을 등록하세요." />
        )}
      </TitanDashboardCard>

      <TitanDashboardCard title="최근 출력" aria-label="최근 출력">
        {dashboard.recentPrinted.length ? (
          <div className="qr-engine-list">
            {dashboard.recentPrinted.map((row) => (
              <Link key={row.id} to={row.navigationPath} className="qr-engine-list__row">
                <span>
                  {row.label}
                  {row.printCount ? ` · ${row.printCount}회` : ""}
                </span>
                <span>{formatScanTime(row.at)}</span>
              </Link>
            ))}
          </div>
        ) : (
          <TitanEmptyState title="최근 출력 이력이 없습니다." description="QR 출력 화면에서 라벨을 출력하세요." />
        )}
      </TitanDashboardCard>
    </div>
  );
}
