import { useMemo, useState } from "react";
import { FolderTree, HardDrive, RefreshCw } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/uiKit";
import {
  STORAGE_ARCHITECTURE,
  STORAGE_MANAGER,
} from "../../config/titanV12OfficialArchitecture";
import {
  estimateStorageUsage,
  getEnvironmentSettings,
} from "../../utils/environmentSettingsSession";
import { isTitanAdminUser } from "../../utils/titanAdminAccess";

function SettingsPanel({ title, desc, children }) {
  return (
    <section className="environment-content-panel titan-card">
      <div className="environment-content-head">
        <div>
          <h3>{title}</h3>
          {desc ? <p>{desc}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function StorageManagementSection({ onRefresh }) {
  const [message, setMessage] = useState("");
  const isAdmin = isTitanAdminUser();
  const storageEstimate = useMemo(() => estimateStorageUsage(), [onRefresh]);
  const programPath = getEnvironmentSettings().programSettings?.defaultPath ?? "—";

  const handleAction = (label) => {
    setMessage(`${label} — SQLite · Storage 폴더 연동은 추후 개발 예정입니다.`);
    onRefresh?.();
  };

  if (!isAdmin) {
    return (
      <SettingsPanel title="Storage 관리" desc="SQLite 메타데이터 · 파일 경로 · Storage 폴더">
        <div className="environment-poc-access-denied">
          <strong>접근 권한 없음</strong>
          <p>관리자 전용 메뉴입니다.</p>
        </div>
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel
      title="Storage 관리"
      desc={STORAGE_ARCHITECTURE.principle}
    >
      <p className="environment-form-note">{STORAGE_ARCHITECTURE.userPolicy}</p>

      <dl className="environment-info-list">
        <div>
          <dt>Storage 루트 (설정)</dt>
          <dd>{programPath}</dd>
        </div>
        <div>
          <dt>SessionStorage 사용량 (Presentation)</dt>
          <dd>{storageEstimate.totalLabel ?? "—"}</dd>
        </div>
      </dl>

      <div className="environment-permission-grid">
        {STORAGE_MANAGER.metrics.map((metric) => (
          <div key={metric.id} className="environment-permission-card">
            <h4>{metric.label}</h4>
            <p className="environment-empty-note">— (SQLite 연동 후 집계)</p>
          </div>
        ))}
      </div>

      <h4 className="environment-subtitle">
        <FolderTree size={16} aria-hidden="true" /> Storage 폴더 구조
      </h4>
      <ul className="titan-storage-tree">
        <li>
          <strong>{STORAGE_ARCHITECTURE.tree.root}</strong>
          <ul>
            <li>{STORAGE_ARCHITECTURE.tree.database.engine} — {STORAGE_ARCHITECTURE.tree.database.role}</li>
            <li>
              Storage/
              <ul>
                {STORAGE_ARCHITECTURE.tree.storage.folders.map((folder) => (
                  <li key={folder.id}>
                    {folder.label}/ — {folder.assetTypes.join(" · ")}
                  </li>
                ))}
              </ul>
            </li>
            <li>Config/ — {STORAGE_ARCHITECTURE.tree.config.role}</li>
          </ul>
        </li>
      </ul>

      <p className="environment-form-note">
        SQLite 저장 필드: {STORAGE_ARCHITECTURE.sqliteMetadataFields.join(" · ")}
      </p>

      <div className="environment-actions">
        {STORAGE_MANAGER.functions.map((fn) => (
          <SecondaryButton key={fn.id} type="button" onClick={() => handleAction(fn.label)}>
            {fn.id === "inspect" ? <HardDrive size={14} /> : <RefreshCw size={14} />}
            {fn.label}
          </SecondaryButton>
        ))}
      </div>

      {message ? <p className="environment-form-note">{message}</p> : null}
    </SettingsPanel>
  );
}
