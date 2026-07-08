import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Database, Link2, Play, ShieldAlert } from "lucide-react";

import { PrimaryButton, SecondaryButton, TitanDataTable } from "../../foundation/uiKit";
import {
  MES_ORACLE_CONNECTION_STATUS_LABELS,
  MES_ORACLE_REAL_POC_VERSION,
  MES_ORACLE_REAL_QUERIES,
} from "../../config/mesOracleRealPoc";
import {
  MES_ORACLE_ENVIRONMENT,
  MES_POC_CHECKLIST,
  MES_POC_CHECKLIST_STATUS_LABELS,
  MES_POC_COMPLETION_LEVELS,
  MES_POC_DATA_TEST_STATUS_LABELS,
  MES_POC_READ_ONLY_DATA_TESTS,
  MES_POC_REFERENCE,
  MES_POC_VERSION,
} from "../../config/mesIntegrationPoc";
import { isMesOracleBridgeAvailable } from "../../services/mesOracleBridge";
import {
  getMesIntegrationPocSummary,
  resetMesIntegrationPocResults,
  runMesPocQueryTest,
  runRepositorySimulation,
  saveMesPocConnection,
  simulateQualityIntake,
  testOracleConnectionAsync,
  updateMesPocDataTest,
} from "../../utils/mesIntegrationPocSession";
import { getCurrentTitanUser } from "../../utils/titanHistorySession";

function StatusBadge({ status, labels, tonePrefix = "environment-poc-status" }) {
  const label = labels[status] ?? status;
  return <span className={`${tonePrefix} ${tonePrefix}--${status}`}>{label}</span>;
}

function buildGridColumns(columnDefs, rows) {
  if (columnDefs?.length) {
    return columnDefs.map((col) =>
      typeof col === "string"
        ? { key: col, label: col, widthPercent: 10 }
        : { key: col.key, label: col.label ?? col.key, widthPercent: col.widthPercent ?? 10 }
    );
  }
  if (rows?.length) {
    return Object.keys(rows[0]).map((key) => ({ key, label: key, widthPercent: 10 }));
  }
  return [];
}

export default function MesIntegrationPocPanel({ refreshKey = 0, onRefresh }) {
  const summary = useMemo(() => getMesIntegrationPocSummary(), [refreshKey]);
  const [message, setMessage] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [queryLoading, setQueryLoading] = useState(null);
  const [bridgeAvailable, setBridgeAvailable] = useState(() => isMesOracleBridgeAvailable());
  const [connForm, setConnForm] = useState(() => ({
    host: summary.connection.host,
    port: summary.connection.port,
    service: summary.connection.service,
    user: summary.connection.user,
    password: "",
  }));
  const [intakeNo, setIntakeNo] = useState(summary.qualityIntakeDemo?.lastManagementNo ?? "");
  const [activeQueryGrid, setActiveQueryGrid] = useState("inbound");

  useEffect(() => {
    setBridgeAvailable(isMesOracleBridgeAvailable());
  }, [refreshKey]);

  const handleDataTestChange = (testId, status) => {
    updateMesPocDataTest(testId, { status }, { updatedBy: getCurrentTitanUser() });
    setMessage("");
    onRefresh?.();
  };

  const handleDataTestNote = (testId, note) => {
    updateMesPocDataTest(testId, { note }, { updatedBy: getCurrentTitanUser() });
    onRefresh?.();
  };

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    setMessage("");
    try {
      saveMesPocConnection(connForm, { updatedBy: getCurrentTitanUser() });
      const result = await testOracleConnectionAsync(connForm);
      setMessage(result.message ?? "");
      onRefresh?.();
    } finally {
      setConnecting(false);
    }
  }, [connForm, onRefresh]);

  const handleRunQuery = useCallback(
    async (queryId) => {
      setQueryLoading(queryId);
      setActiveQueryGrid(queryId);
      setMessage("");
      try {
        const result = await runMesPocQueryTest(queryId, { updatedBy: getCurrentTitanUser() });
        setMessage(result.message ?? (result.ok ? "조회 성공" : "조회 실패"));
        if (queryId === "inbound" && result.rows?.length) {
          const first = result.rows[0];
          const mgmt =
            first.SADVLO ?? first.mesManagementNo ?? first.MANAGEMENT_NO ?? first.managementNo ?? "";
          if (mgmt) setIntakeNo(String(mgmt));
        }
        onRefresh?.();
      } finally {
        setQueryLoading(null);
      }
    },
    [onRefresh]
  );

  const handleRepositorySim = () => {
    runRepositorySimulation({ updatedBy: getCurrentTitanUser() });
    setMessage(`Repository 시뮬레이션 — UI → getRepositories() → ${summary.repositoryBackend}`);
    onRefresh?.();
  };

  const handleQualityIntake = () => {
    const sourceRow = summary.qualityIntakeDemo?.sourceRow ?? null;
    const result = simulateQualityIntake(intakeNo, sourceRow);
    setMessage(result.ok ? result.result.action : result.message);
    onRefresh?.();
  };

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(summary.report);
      setMessage("PoC Report가 클립보드에 복사되었습니다.");
    } catch {
      setMessage("복사에 실패했습니다. Report 영역에서 직접 선택하세요.");
    }
  };

  const handleReset = () => {
    if (!window.confirm("MES PoC 검증 결과를 초기화할까요?")) return;
    resetMesIntegrationPocResults();
    setMessage("PoC 검증 결과가 초기화되었습니다.");
    onRefresh?.();
  };

  const recommendationTone =
    summary.recommendation.path === "v1.1-mes-oracle"
      ? "success"
      : summary.recommendation.path === "v1.1-csv-import"
        ? "warning"
        : "info";

  const connStatus = summary.connectionTestResult?.status ?? "idle";
  const connStatusLabel =
    MES_ORACLE_CONNECTION_STATUS_LABELS[connStatus] ??
    MES_POC_DATA_TEST_STATUS_LABELS[connStatus] ??
    connStatus;
  const driverInfo = summary.connectionTestResult?.driver;

  const activeQueryResult = summary.queryResults?.[activeQueryGrid] ?? {
    rows: [],
    columns: [],
    status: "blocked",
  };
  const gridColumns = buildGridColumns(activeQueryResult.columns, activeQueryResult.rows);
  const gridRows = (activeQueryResult.rows ?? []).map((row, index) => ({
    ...row,
    _gridId: `${activeQueryGrid}-${index}`,
  }));

  return (
    <div className="environment-poc-panel">
      <div className="environment-poc-watermark" aria-label="Demo Read Only">
        <span>DEMO</span>
        <span>READ ONLY</span>
      </div>

      <div className="environment-poc-head">
        <div>
          <h4 className="environment-subtitle">MES 연동 PoC ({MES_POC_VERSION} REAL)</h4>
          <p className="environment-form-note">
            Electron Main → Oracle · Repository PoC · 진행 {summary.progressLabel} ·{" "}
            {MES_ORACLE_REAL_POC_VERSION}
          </p>
        </div>
        <SecondaryButton type="button" onClick={handleReset}>
          초기화
        </SecondaryButton>
      </div>

      <div className="environment-poc-bridge-banner">
        <strong>Electron Bridge:</strong>{" "}
        {bridgeAvailable ? (
          <span className="environment-poc-bridge-banner--ok">사용 가능 (Main Process)</span>
        ) : (
          <span className="environment-poc-bridge-banner--warn">
            브라우저 단독 — npm run electron:dev 필요
          </span>
        )}
      </div>

      <div className="environment-poc-principles">
        <ShieldAlert size={16} aria-hidden />
        <ul>
          {MES_POC_REFERENCE.securityPrinciples.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <section className="environment-poc-section">
        <h5 className="environment-poc-section__title">1. MES Oracle Environment</h5>
        <dl className="environment-info-list environment-info-list--architecture">
          <div>
            <dt>Host</dt>
            <dd>{MES_ORACLE_ENVIRONMENT.host}</dd>
          </div>
          <div>
            <dt>Port</dt>
            <dd>{MES_ORACLE_ENVIRONMENT.port}</dd>
          </div>
          <div>
            <dt>Service</dt>
            <dd>{MES_ORACLE_ENVIRONMENT.service}</dd>
          </div>
          <div>
            <dt>User</dt>
            <dd>{MES_ORACLE_ENVIRONMENT.user}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{MES_ORACLE_ENVIRONMENT.source}</dd>
          </div>
          <div>
            <dt>Probe SQL</dt>
            <dd>{MES_POC_REFERENCE.probeScript}</dd>
          </div>
        </dl>
        <ul className="environment-poc-analysis-list">
          {MES_ORACLE_ENVIRONMENT.analysisChecks.map((check) => (
            <li key={check.id} className="environment-poc-analysis-item environment-poc-analysis-item--pass">
              <span className="environment-poc-analysis-item__mark" aria-hidden>✓</span>
              <div>
                <strong>{check.label}</strong>
                <p>{check.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="environment-poc-section">
        <h5 className="environment-poc-section__title">2. Oracle Connection Test (Real · REV.5)</h5>
        <p className="environment-form-note">
          Electron Main Process → node-oracledb · DUAL probe · 비밀번호는 메모리에만 유지 (저장 안 함)
        </p>
        <div className="environment-form-grid">
          <label>
            <span>Host</span>
            <input
              value={connForm.host}
              onChange={(e) => setConnForm((p) => ({ ...p, host: e.target.value }))}
            />
          </label>
          <label>
            <span>Port</span>
            <input
              type="number"
              value={connForm.port}
              onChange={(e) => setConnForm((p) => ({ ...p, port: e.target.value }))}
            />
          </label>
          <label>
            <span>Service</span>
            <input
              value={connForm.service}
              onChange={(e) => setConnForm((p) => ({ ...p, service: e.target.value }))}
            />
          </label>
          <label>
            <span>User</span>
            <input
              value={connForm.user}
              onChange={(e) => setConnForm((p) => ({ ...p, user: e.target.value }))}
            />
          </label>
          <label className="span-2">
            <span>Password (메모리 전용 · 저장 안 함)</span>
            <input
              type="password"
              value={connForm.password}
              onChange={(e) => setConnForm((p) => ({ ...p, password: e.target.value }))}
              autoComplete="off"
            />
          </label>
        </div>
        <div className="environment-actions">
          <PrimaryButton type="button" onClick={handleConnect} disabled={connecting}>
            <Database size={14} />
            {connecting ? "Connecting…" : "Connect (Real Oracle)"}
          </PrimaryButton>
        </div>
        {summary.connectionTestResult?.message ? (
          <div className="environment-poc-connection-result-block">
            <p className="environment-poc-connection-result">{summary.connectionTestResult.message}</p>
            <div className="environment-poc-connection-meta">
              <StatusBadge
                status={connStatus === "idle" ? "blocked" : connStatus}
                labels={{
                  ...MES_POC_DATA_TEST_STATUS_LABELS,
                  ...MES_ORACLE_CONNECTION_STATUS_LABELS,
                }}
              />
              {summary.connectionTestResult.connectionTimeMs ? (
                <span>{summary.connectionTestResult.connectionTimeMs}ms</span>
              ) : null}
            </div>
            {driverInfo ? (
              <dl className="environment-info-list environment-poc-driver-info">
                <div>
                  <dt>node-oracledb</dt>
                  <dd>{driverInfo.available ? driverInfo.driverVersion ?? "loaded" : "미설치"}</dd>
                </div>
                <div>
                  <dt>Instant Client</dt>
                  <dd>{driverInfo.instantClient ?? "—"}</dd>
                </div>
              </dl>
            ) : null}
          </div>
        ) : null}
        {!bridgeAvailable ? (
          <p className="environment-poc-bridge-hint">
            {connStatusLabel}: Electron Main Process required —{" "}
            <code>npm run electron:dev</code>
          </p>
        ) : null}
      </section>

      <section className="environment-poc-section">
        <h5 className="environment-poc-section__title">3. Real Query Test (REV.5)</h5>
        <p className="environment-form-note">
          SELECT only · max 20 rows · SQL은 .env (MES_ORACLE_SQL_*) · DBA 템플릿: scripts/mes-poc/queries/
        </p>
        <div className="environment-poc-query-actions">
          {Object.values(MES_ORACLE_REAL_QUERIES).map((query) => {
            const qr = summary.queryResults?.[query.id];
            return (
              <SecondaryButton
                key={query.id}
                type="button"
                onClick={() => handleRunQuery(query.id)}
                disabled={queryLoading === query.id || !bridgeAvailable}
              >
                <Play size={14} />
                {queryLoading === query.id ? "조회 중…" : query.label}
                {qr?.rowCount != null && qr.status === "success" ? ` (${qr.rowCount})` : ""}
              </SecondaryButton>
            );
          })}
        </div>
        <div className="environment-poc-query-tabs">
          {Object.values(MES_ORACLE_REAL_QUERIES).map((query) => (
            <button
              key={query.id}
              type="button"
              className={`environment-poc-query-tab${activeQueryGrid === query.id ? " environment-poc-query-tab--active" : ""}`}
              onClick={() => setActiveQueryGrid(query.id)}
            >
              {query.label}
              {summary.queryResults?.[query.id]?.status === "success" ? " ✓" : ""}
            </button>
          ))}
        </div>
        <div className="environment-poc-query-grid-wrap">
          {gridRows.length > 0 ? (
            <TitanDataTable
              columns={gridColumns}
              rows={gridRows}
              getRowId={(row) => row._gridId}
            />
          ) : (
            <p className="environment-empty-note">
              Connect 성공 후 쿼리 버튼을 실행하면 Real Oracle 결과가 표시됩니다.
            </p>
          )}
        </div>
        {activeQueryResult.message ? (
          <p className="environment-form-note environment-poc-query-meta">
            {activeQueryResult.message}
            {activeQueryResult.queryTimeMs ? ` · ${activeQueryResult.queryTimeMs}ms` : ""}
          </p>
        ) : null}
      </section>

      <section className="environment-poc-section">
        <h5 className="environment-poc-section__title">4. Read Only Data Test (Manual Record)</h5>
        <ul className="environment-poc-list">
          {MES_POC_READ_ONLY_DATA_TESTS.map((test) => {
            const item = summary.dataTests[test.id] ?? { status: "blocked", note: "" };
            return (
              <li key={test.id} className="environment-poc-item">
                <div className="environment-poc-item__head">
                  <span className="environment-poc-item__priority">{test.priority}</span>
                  <div>
                    <strong>{test.label}</strong>
                    <p>{test.description}</p>
                  </div>
                  <select
                    value={item.status ?? "blocked"}
                    onChange={(e) => handleDataTestChange(test.id, e.target.value)}
                    aria-label={`${test.label} 검증 결과`}
                  >
                    {Object.entries(MES_POC_DATA_TEST_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="environment-poc-item__status-row">
                  <StatusBadge status={item.status} labels={MES_POC_DATA_TEST_STATUS_LABELS} />
                </div>
                <p className="environment-poc-item__hint">{test.verifyHint}</p>
                {test.mesFieldHints?.length ? (
                  <p className="environment-poc-item__fields">
                    MES 필드: {test.mesFieldHints.join(" · ")}
                  </p>
                ) : null}
                {test.titanTarget ? (
                  <p className="environment-poc-item__target">TITAN: {test.titanTarget}</p>
                ) : null}
                <textarea
                  className="environment-poc-item__note"
                  value={item.note ?? ""}
                  onChange={(e) => handleDataTestNote(test.id, e.target.value)}
                  placeholder="검증 메모 (DBA · 현장 · Export 파일명 등)"
                  rows={2}
                />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="environment-poc-section">
        <h5 className="environment-poc-section__title">5. Sample Preview</h5>
        {summary.preview.visible ? (
          <div className="environment-poc-preview-wrap">
            <table className="environment-poc-preview-table">
              <thead>
                <tr>
                  {summary.preview.columns.map((col) => (
                    <th key={col.key ?? col}>{typeof col === "string" ? col : col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.preview.rows.map((row, idx) => (
                  <tr key={row.mesManagementNo ?? row._raw?.SADVLO ?? idx}>
                    {summary.preview.columns.map((col) => {
                      const key = typeof col === "string" ? col : col.key;
                      return <td key={key}>{row[key] ?? row._raw?.[key] ?? "—"}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="environment-form-note">
              {summary.preview.source === "real-oracle"
                ? "Real Oracle inbound query 결과 (max 10)"
                : "Demo 샘플 — Real query 또는 수동 성공 기록 시 표시"}
            </p>
          </div>
        ) : (
          <p className="environment-empty-note">
            Real inbound query 또는 입고/제품 Master 테스트 성공 시 Preview가 표시됩니다.
          </p>
        )}
      </section>

      <section className="environment-poc-section">
        <h5 className="environment-poc-section__title">6. Repository Simulation</h5>
        <div className="environment-poc-arch-stack">
          <div className="environment-poc-arch-layer">React UI</div>
          <div className="environment-poc-arch-arrow">↓ getRepositories()</div>
          <div
            className={`environment-poc-arch-layer${summary.repositoryBackendActive === "oracle" ? " environment-poc-arch-layer--current" : ""}`}
          >
            {summary.repositoryBackend}
            {summary.repositoryBackendActive === "oracle" ? " (Active · REV.5)" : " (V1.0)"}
          </div>
          <div className="environment-poc-arch-arrow">↓ PoC read-only</div>
          <div className="environment-poc-arch-layer environment-poc-arch-layer--future">
            Oracle MES (Read Only)
          </div>
        </div>
        <div className="environment-actions">
          <SecondaryButton type="button" onClick={handleRepositorySim}>
            시뮬레이션 실행
          </SecondaryButton>
        </div>
        {summary.repositorySimulation?.lastRunAt ? (
          <p className="environment-form-note">
            최근 실행: {summary.repositorySimulation.lastRunAt.replace("T", " ").slice(0, 19)} ·{" "}
            {summary.repositorySimulation.note}
          </p>
        ) : null}
      </section>

      <section className="environment-poc-section">
        <h5 className="environment-poc-section__title">7. MES → TITAN 품질접수 Simulation</h5>
        <p className="environment-form-note">
          Real inbound row 선택 시 해당 행 사용 · Demo only — 저장하지 않음
        </p>
        <div className="environment-poc-intake-row">
          <input
            type="text"
            value={intakeNo}
            onChange={(e) => setIntakeNo(e.target.value)}
            placeholder="MES 관리번호 (예: DL260702-016)"
          />
          <PrimaryButton type="button" onClick={handleQualityIntake}>
            <Link2 size={14} />
            품질접수 Demo
          </PrimaryButton>
        </div>
        {summary.qualityIntakeDemo?.result ? (
          <dl className="environment-info-list environment-poc-intake-result">
            <div>
              <dt>관리번호</dt>
              <dd>{summary.qualityIntakeDemo.result.managementNo}</dd>
            </div>
            <div>
              <dt>업체</dt>
              <dd>{summary.qualityIntakeDemo.result.linkedData?.company}</dd>
            </div>
            <div>
              <dt>품번</dt>
              <dd>{summary.qualityIntakeDemo.result.linkedData?.partNo}</dd>
            </div>
            <div>
              <dt>LOT</dt>
              <dd>{summary.qualityIntakeDemo.result.linkedData?.lotNo}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{summary.qualityIntakeDemo.result.mesSource}</dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section className="environment-poc-section">
        <h5 className="environment-poc-section__title">8. PoC Execution Logs</h5>
        {summary.pocLogs?.length ? (
          <ul className="environment-poc-logs">
            {summary.pocLogs.slice(0, 20).map((log, index) => (
              <li
                key={`${log.at}-${index}`}
                className={`environment-poc-log environment-poc-log--${log.level ?? "info"}`}
              >
                <time dateTime={log.at}>{log.at?.replace("T", " ").slice(0, 19)}</time>
                <span>{log.message}</span>
                {log.meta?.rowCount != null ? (
                  <span className="environment-poc-log__meta">{log.meta.rowCount} rows</span>
                ) : null}
                {log.meta?.queryTime != null ? (
                  <span className="environment-poc-log__meta">{log.meta.queryTime}ms</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="environment-empty-note">Connect · Query 실행 시 로그가 기록됩니다.</p>
        )}
      </section>

      <section className="environment-poc-section">
        <h5 className="environment-poc-section__title">9. PoC Checklist (자동 관리)</h5>
        <ul className="environment-poc-checklist">
          {MES_POC_CHECKLIST.map((item) => {
            const status = summary.checklistStatusById[item.id] ?? "waiting";
            return (
              <li key={item.id} className="environment-poc-checklist-item">
                <span className="environment-poc-item__priority">{item.priority}</span>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.description}</p>
                </div>
                <StatusBadge
                  status={status}
                  labels={MES_POC_CHECKLIST_STATUS_LABELS}
                  tonePrefix="environment-poc-checklist-status"
                />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="environment-poc-section">
        <h5 className="environment-poc-section__title">10. Integration Readiness</h5>
        <div className="environment-poc-readiness">
          <div
            className="environment-poc-progress-bar"
            role="progressbar"
            aria-valuenow={summary.readiness.percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="environment-poc-progress-bar__fill"
              style={{ width: `${summary.readiness.percent}%` }}
            />
          </div>
          <p className="environment-poc-readiness__label">{summary.readiness.percent}% 준비</p>
          <ul className="environment-poc-readiness__bullets">
            <li>
              체크리스트: {summary.readiness.checklistComplete}/{summary.readiness.checklistTotal} (
              {summary.readiness.checklistPercent}%)
            </li>
            <li>
              데이터 테스트: {summary.readiness.dataSuccess}/{summary.readiness.dataTotal} (
              {summary.readiness.dataPercent}%)
            </li>
            <li>현재 Level: {summary.readiness.currentLevel} / 7</li>
          </ul>
        </div>
        <div className={`environment-poc-recommendation environment-poc-recommendation--${recommendationTone}`}>
          <strong>{summary.recommendation.label}</strong>
          <span>{summary.recommendation.summary}</span>
        </div>
      </section>

      <section className="environment-poc-section">
        <h5 className="environment-poc-section__title">11. PoC Report</h5>
        <div className="environment-actions">
          <SecondaryButton type="button" onClick={handleCopyReport}>
            <Copy size={14} />
            Report 복사
          </SecondaryButton>
        </div>
        <pre className="environment-poc-report">{summary.report}</pre>
      </section>

      <section className="environment-poc-section">
        <h5 className="environment-poc-section__title">12. PoC Completion Levels</h5>
        <ul className="environment-poc-levels">
          {MES_POC_COMPLETION_LEVELS.map((levelDef) => {
            const achieved = summary.readiness.levels.find((l) => l.level === levelDef.level)?.achieved;
            return (
              <li
                key={levelDef.level}
                className={`environment-poc-level ${achieved ? "environment-poc-level--achieved" : ""}`}
              >
                <span className="environment-poc-level__badge">L{levelDef.level}</span>
                <div>
                  <strong>{levelDef.label}</strong>
                  <p>{levelDef.description}</p>
                </div>
                <span className="environment-poc-level__state">{achieved ? "달성" : "—"}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {message ? (
        <p className="environment-action-message environment-action-message--info">{message}</p>
      ) : null}
    </div>
  );
}
