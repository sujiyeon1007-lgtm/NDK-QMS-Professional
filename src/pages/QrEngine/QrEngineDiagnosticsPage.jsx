import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { QR_ENGINE_COPY, QR_ENGINE_ROUTES } from "../../config/qrEngineArchitecture";
import { SecondaryButton, TitanDashboardCard } from "../../foundation/uiKit";
import { buildQrEngineDiagnosticsReport } from "../../utils/qrEngineDiagnostics";
import { isTitanAdminUser } from "../../utils/titanAdminAccess";
import QrEnginePageShell, { qrEngineBreadcrumbTrail } from "./QrEnginePageShell";

function formatTime(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("ko-KR");
  } catch {
    return iso;
  }
}

function StatusBadge({ ok, label }) {
  return (
    <span className={`qr-engine-diagnostics__badge${ok ? " is-ok" : " is-warn"}`}>{label}</span>
  );
}

export default function QrEngineDiagnosticsPage() {
  const isAdmin = isTitanAdminUser();
  const [report, setReport] = useState(() => buildQrEngineDiagnosticsReport());

  useEffect(() => {
    setReport(buildQrEngineDiagnosticsReport());
  }, []);

  if (!isAdmin) {
    return (
      <QrEnginePageShell
        breadcrumbItems={qrEngineBreadcrumbTrail(QR_ENGINE_COPY.diagnosticsTitle)}
        title={QR_ENGINE_COPY.diagnosticsTitle}
        description={QR_ENGINE_COPY.adminOnlyHint}
      >
        <TitanDashboardCard title={QR_ENGINE_COPY.diagnosticsTitle}>
          <p className="qr-engine-status qr-engine-status--error">{QR_ENGINE_COPY.adminOnlyHint}</p>
          <Link to={QR_ENGINE_ROUTES.dashboard} className="qr-engine-inline-link">
            {QR_ENGINE_COPY.backToDashboard}
          </Link>
        </TitanDashboardCard>
      </QrEnginePageShell>
    );
  }

  const duplicateOk =
    report.registry.duplicateEntityKeys.length === 0 && report.registry.duplicateRegistryIds.length === 0;

  return (
    <QrEnginePageShell
      breadcrumbItems={qrEngineBreadcrumbTrail(QR_ENGINE_COPY.diagnosticsTitle)}
      title={QR_ENGINE_COPY.diagnosticsTitle}
      description={QR_ENGINE_COPY.diagnosticsIntro}
    >
      <div className="qr-engine-page qr-engine-diagnostics">
        <div className="qr-engine-diagnostics__toolbar">
          <SecondaryButton type="button" onClick={() => setReport(buildQrEngineDiagnosticsReport())}>
            새로고침
          </SecondaryButton>
          <Link to={QR_ENGINE_ROUTES.testMode} className="qr-engine-inline-link">
            QR Test Mode
          </Link>
          <span className="qr-engine-diagnostics__generated">{formatTime(report.generatedAt)}</span>
        </div>

        <TitanDashboardCard title="QR Registry / URL">
          <dl className="qr-engine-diagnostics__kv">
            <div>
              <dt>Registry 총건수</dt>
              <dd>{report.registry.total}</dd>
            </div>
            <div>
              <dt>설비 QR</dt>
              <dd>{report.registry.equipmentCount}</dd>
            </div>
            <div>
              <dt>LOT QR</dt>
              <dd>{report.registry.lotCount}</dd>
            </div>
            <div>
              <dt>UUID 중복</dt>
              <dd>
                <StatusBadge
                  ok={duplicateOk}
                  label={duplicateOk ? "OK" : `${report.registry.duplicateRegistryIds.length}건`}
                />
              </dd>
            </div>
            <div>
              <dt>EntityKey 중복</dt>
              <dd>
                <StatusBadge
                  ok={report.registry.duplicateEntityKeys.length === 0}
                  label={
                    report.registry.duplicateEntityKeys.length === 0
                      ? "OK"
                      : `${report.registry.duplicateEntityKeys.length}건`
                  }
                />
              </dd>
            </div>
            <div>
              <dt>Base URL</dt>
              <dd>{report.baseUrl || "-"}</dd>
            </div>
            <div>
              <dt>Runtime Origin</dt>
              <dd>{report.runtimeOrigin || "-"}</dd>
            </div>
            <div>
              <dt>금일 스캔</dt>
              <dd>{report.scanStats.totalToday ?? 0}</dd>
            </div>
          </dl>
        </TitanDashboardCard>

        <TitanDashboardCard title="설비 QR 생성 여부">
          <div className="qr-engine-diagnostics__table-wrap">
            <table className="qr-engine-diagnostics__table">
              <thead>
                <tr>
                  <th>설비</th>
                  <th>설비명</th>
                  <th>QR</th>
                  <th>QR ID</th>
                  <th>Browser URL</th>
                  <th>작업 경로</th>
                </tr>
              </thead>
              <tbody>
                {report.equipmentCoverage.map((row) => (
                  <tr key={row.code}>
                    <td>{row.code}</td>
                    <td>{row.name}</td>
                    <td>
                      <StatusBadge ok={row.hasQr} label={row.hasQr ? "Y" : "N"} />
                    </td>
                    <td>{row.displayQrId || "-"}</td>
                    <td className="qr-engine-diagnostics__mono">{row.browserUrl || "-"}</td>
                    <td>
                      <Link to={row.workPath}>{row.workPath}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TitanDashboardCard>

        <TitanDashboardCard title="마지막 스캔 기록">
          <ul className="qr-engine-diagnostics__list">
            {(report.recentScans ?? []).length ? (
              report.recentScans.map((scan) => (
                <li key={scan.id}>
                  <strong>{scan.label}</strong>
                  <span>{scan.type}</span>
                  <span>{formatTime(scan.at)}</span>
                  {scan.navigationPath ? (
                    <Link to={scan.navigationPath}>{scan.navigationPath}</Link>
                  ) : null}
                </li>
              ))
            ) : (
              <li>스캔 기록 없음</li>
            )}
          </ul>
        </TitanDashboardCard>

        <TitanDashboardCard title="Workflow / Lifecycle">
          <div className="qr-engine-diagnostics__table-wrap">
            <table className="qr-engine-diagnostics__table">
              <thead>
                <tr>
                  <th>설비</th>
                  <th>상태</th>
                  <th>현재 LOT</th>
                  <th>대기 LOT</th>
                  <th>Lifecycle</th>
                </tr>
              </thead>
              <tbody>
                {report.equipmentWorkflow.map((row) => (
                  <tr key={row.equipmentId}>
                    <td>
                      <Link to={row.workPath}>{row.equipmentId}</Link>
                    </td>
                    <td>{row.status}</td>
                    <td>{row.currentLot || "-"}</td>
                    <td>{row.chargeableLotCount}</td>
                    <td>{row.lifecycleEventCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="qr-engine-diagnostics__table-wrap">
            <table className="qr-engine-diagnostics__table">
              <thead>
                <tr>
                  <th>LOT</th>
                  <th>관리번호</th>
                  <th>Workflow</th>
                  <th>Lifecycle</th>
                  <th>Traceability</th>
                </tr>
              </thead>
              <tbody>
                {report.lotSamples.map((row) => (
                  <tr key={`${row.lotNo}-${row.managementId}`}>
                    <td>
                      <Link to={row.lifecyclePath}>{row.lotNo}</Link>
                    </td>
                    <td>{row.managementId || "-"}</td>
                    <td>{row.workflowStatus}</td>
                    <td>{row.lifecycleEventCount}</td>
                    <td>{row.traceabilityEventCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TitanDashboardCard>

        <TitanDashboardCard title="저장 키 (Session)">
          <ul className="qr-engine-diagnostics__list">
            {report.persistence.map((row) => (
              <li key={row.key}>
                <code>{row.key}</code>
                <StatusBadge ok={row.present} label={row.present ? `${row.bytes}B` : "empty"} />
              </li>
            ))}
          </ul>
        </TitanDashboardCard>
      </div>
    </QrEnginePageShell>
  );
}
