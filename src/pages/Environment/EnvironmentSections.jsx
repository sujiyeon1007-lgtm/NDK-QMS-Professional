import { useMemo, useRef, useState } from "react";
import { Download, FolderOpen, Plus, RefreshCw, RotateCcw, Trash2, Upload, Users } from "lucide-react";

import TitanRegisterModal from "../../foundation/components/TitanRegisterModal";
import {
  PRODUCT_PROCESS_CATEGORIES,
  getProductProcessDetailOptions,
} from "../../config/productProcessSelection";
import { summarizeProcessWorkflowTemplate } from "../../config/processWorkflowTemplates";
import {
  addProcessWorkflowTemplate,
  createProcessWorkflowTemplateId,
  deleteProcessWorkflowTemplate,
  getProcessWorkflowTemplates,
  resetProcessWorkflowTemplates,
  updateProcessWorkflowTemplate,
} from "../../utils/processWorkflowTemplateSession";
import { PrimaryButton, SecondaryButton, TitanDataTable, TitanEmptyState } from "../../foundation/uiKit";
import TitanComingSoonPlaceholder from "../../foundation/pages/TitanComingSoonPlaceholder";
import {
  APP_NAME,
  APP_VERSION,
  checkForUpdates,
  getCombinedLogs,
  getEnvironmentSettings,
  getSystemStatusSummary,
  openBackupFolderHint,
  readLogoFile,
  resetUserPassword,
  restoreFromBackupFile,
  runFullBackup,
  saveCompanyInfo,
  saveCompanyLogo,
  saveNotifications,
  saveProgramSettings,
} from "../../utils/environmentSettingsSession";
import { getTitanArchitectureDisplayInfo } from "../../config/mesArchitecturePolicy";
import { OFFICIAL_POLICY_DISPLAY } from "../../config/titanV1OfficialPolicy";
import {
  REPOSITORY_ARCHITECTURE_VERSION,
  REPOSITORY_BACKEND,
  REPOSITORY_REGISTRY,
  REPOSITORY_SWAP_POLICY,
  QUALITY_PRIMARY_KEY,
} from "../../config/repositoryArchitecture";
import { DEMO_ADMIN_POLICY_VERSION } from "../../config/demoAdminPolicy";
import { getEnvironmentTabById } from "../../config/environmentSettings";
import {
  MES_REPOSITORY_ADAPTER,
  TITAN_EDITION,
  EDITION_FEATURE_COMPARISON,
  getSelectableEditions,
} from "../../config/titanEditionArchitecture";
import { PLATFORM_ARCHITECTURE_VERSION, TITAN_PLATFORM_VISION, PLATFORM_LAYERS } from "../../config/titanPlatformArchitecture";
import { DEVELOPMENT_STRATEGY, CURRENT_DEVELOPMENT_VERSION } from "../../config/titanV1DevelopmentDirection";
import { getRepositoryBackendLabel, getRepositories, resetRepositoriesForDemo } from "../../repositories";
import {
  TITAN_FEATURE_PERMISSIONS,
  TITAN_MENU_PERMISSIONS,
} from "../../config/titanLoginSystem";
import {
  createAuthRole,
  createAuthUser,
  deleteAuthRole,
  deleteAuthUser,
  ensureDefaultAdminUser,
  getAuthRoles,
  getAuthUsers,
  getLoginHistory,
  getUserRoleIds,
  hasQrCreatePermission,
  setUserPermissionOverride,
  updateAuthRole,
  updateAuthUser,
} from "../../utils/titanAuthDataSession";
import { isTitanAdminUser, getTitanUserRole, isDemoAdminModeActive } from "../../utils/titanAdminAccess";
import {
  getOperationsDataMode,
  getOperationsRecordCount,
  loadQaDemoSeed,
  resetOperationsToEmpty,
  restoreOperationalFromQaDemo,
} from "../../utils/productionRecords";
import {
  OPERATIONS_DATA_MODES,
  TITAN_QA_DEMO_SEED_LABEL,
  TITAN_QA_DEMO_SEED_VERSION,
} from "../../config/presentationBuildPolicy";
import {
  getTitanEditionState,
  setTitanEdition,
  getTitanEditionDisplayLabel,
} from "../../utils/titanEditionSession";
import MesIntegrationPocPanel from "./MesIntegrationPocPanel";
import ModuleManagementSection from "./ModuleManagementSection";
import QrPrintCenterSection from "./QrPrintCenterSection";
import StorageManagementSection from "./StorageManagementSection";
import {
  CertificatePoliciesSection,
  InspectionTemplatesSection,
} from "./V11MasterAdminSections";
import { TITAN_LIST_DOCUMENT_CODES } from "../../config/titanListPrintStandard";
import { NDK_PRODUCTION_LOT_PATTERN } from "../../utils/productionLotNumber";
import { TITAN_DOCUMENT_NUMBER_TYPES, TITAN_NUMBERING_PATTERN } from "../../config/masterDataScreens";
import {
  getNumberingPrefixes,
  getNumberingRuleRows,
  resetNumberingPrefixes,
  saveNumberingPrefixes,
  validateNumberingPrefixes,
} from "../../utils/masterData";
import { getMasterDataByCategory } from "../../utils/masterData";
import {
  QR_BROWSER_BASE_URL_DEFAULT_DEV,
  buildQrBrowserUrl,
  getQrBrowserBaseUrl,
  setQrBrowserBaseUrl,
} from "../../config/qrBrowserUrlConfig";
import { RC1_QR_BASE_URL_REPRINT_NOTICE } from "../../config/rc1OperationalPolicy";
import {
  DATA_RESET_MASTER_CATEGORIES,
  DATA_RESET_OPERATIONS_TARGETS,
  DATA_RESET_SCOPES,
  DATA_RESET_UI,
} from "../../config/titanDataResetPolicy";
import {
  EQUIPMENT_QR_RULES,
  OFFICIAL_EQUIPMENT_QR_CODES,
  QR_PRINT_CENTER_OFFICIAL,
  SMART_ACCESS_ID_REGISTRY,
  SMART_ACCESS_ID_SCHEME,
} from "../../config/titanOfficialArchitecture";
import { TITAN_QR_PHILOSOPHY } from "../../config/titanQrArchitectureV17";
import { TITAN_MENU_CATALOG } from "../../config/menuConfig";
import {
  MENU_FREEZE_CHANGE_POLICY,
  MENU_FREEZE_DATE,
  MENU_FREEZE_LOCKED,
  MENU_FREEZE_SIDEBAR,
  MENU_FREEZE_SIDEBAR_GROUPS,
  MENU_FREEZE_VERSION,
  PQMS_DEVELOPMENT_PHILOSOPHY,
} from "../../config/menuFreezeV1";

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

function AdminOnlySection({ title, desc, children }) {
  if (!isTitanAdminUser()) {
    return (
      <SettingsPanel title={title} desc={desc}>
        <div className="environment-poc-access-denied">
          <strong>접근 권한 없음</strong>
          <p>관리자 전용 메뉴입니다.</p>
        </div>
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel title={title} desc={desc}>
      {children}
    </SettingsPanel>
  );
}

function ActionMessage({ message, tone = "info" }) {
  if (!message) return null;
  return <p className={`environment-action-message environment-action-message--${tone}`}>{message}</p>;
}

export function CompanySection({ refreshKey, onRefresh }) {
  const company = useMemo(() => getEnvironmentSettings().company, [refreshKey]);
  const [form, setForm] = useState(company);
  const [message, setMessage] = useState("");
  const logoInputRef = useRef(null);

  const handleSave = () => {
    saveCompanyInfo(form);
    setMessage("회사정보가 저장되었습니다.");
    onRefresh?.();
  };

  const handleLogo = async (file) => {
    try {
      const payload = await readLogoFile(file);
      if (!payload) return;
      saveCompanyLogo(payload);
      setForm((prev) => ({
        ...prev,
        logoFileName: payload.fileName,
        logoMimeType: payload.mimeType,
        logoDataUrl: payload.dataUrl,
      }));
      setMessage("회사 로고가 등록되었습니다. Header · PDF · 성적서에 적용됩니다. (V1.0 세션)");
      onRefresh?.();
    } catch (error) {
      setMessage(error.message || "로고를 등록할 수 없습니다.");
    }
  };

  return (
    <SettingsPanel title="회사정보" desc="회사 기본 정보 및 로고를 관리합니다.">
      <div className="environment-form-grid">
        <label>
          <span>회사명</span>
          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        </label>
        <label>
          <span>대표자</span>
          <input value={form.ceo} onChange={(e) => setForm((p) => ({ ...p, ceo: e.target.value }))} />
        </label>
        <label>
          <span>사업자등록번호</span>
          <input value={form.bizNo} onChange={(e) => setForm((p) => ({ ...p, bizNo: e.target.value }))} />
        </label>
        <label>
          <span>전화번호</span>
          <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        </label>
        <label className="span-2">
          <span>주소</span>
          <input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
        </label>
        <label>
          <span>팩스</span>
          <input value={form.fax} onChange={(e) => setForm((p) => ({ ...p, fax: e.target.value }))} />
        </label>
        <label>
          <span>이메일</span>
          <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        </label>
        <label className="span-2">
          <span>홈페이지</span>
          <input value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} />
        </label>
      </div>

      <div className="environment-logo-block">
        <div className="environment-logo-head">
          <strong>회사 로고</strong>
          <SecondaryButton type="button" onClick={() => logoInputRef.current?.click()}>
            <Upload size={14} />
            로고 등록
          </SecondaryButton>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            className="environment-hidden-input"
            onChange={(e) => handleLogo(e.target.files?.[0])}
          />
        </div>
        {form.logoDataUrl ? (
          <img src={form.logoDataUrl} alt={form.logoFileName || "회사 로고"} className="environment-logo-preview" />
        ) : (
          <p className="environment-empty-note">등록된 회사 로고가 없습니다.</p>
        )}
        <p className="environment-form-note">등록한 로고는 프로그램 전체(Header, PDF, 성적서 등)에 자동 적용됩니다.</p>
      </div>

      <ActionMessage message={message} />
      <div className="environment-actions">
        <PrimaryButton type="button" onClick={handleSave}>
          저장
        </PrimaryButton>
      </div>
    </SettingsPanel>
  );
}

export function UsersSection({ refreshKey, onRefresh }) {
  const users = useMemo(() => getAuthUsers(), [refreshKey]);
  const roles = useMemo(() => getAuthRoles(), [refreshKey]);
  const [message, setMessage] = useState("");
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState({
    loginId: "",
    name: "",
    department: "",
    rank: "사원",
    roleIds: [],
  });

  const toggleActive = (user) => {
    updateAuthUser(user.id, { active: !user.active });
    setMessage(`${user.name} 사용자 상태가 변경되었습니다.`);
    onRefresh?.();
  };

  const handleResetPassword = (user) => {
    const result = resetUserPassword(user.id);
    setMessage(result.message);
    onRefresh?.();
  };

  const handleDelete = (user) => {
    const result = deleteAuthUser(user.id);
    setMessage(result.ok ? `${user.name} 사용자가 삭제되었습니다.` : result.message);
    onRefresh?.();
  };

  const handleCreate = () => {
    const result = createAuthUser({
      ...draft,
      roleIds: draft.roleIds,
    });
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setFormOpen(false);
    setDraft({ loginId: "", name: "", department: "", rank: "사원", roleIds: [] });
    setMessage("사용자가 등록되었습니다. 초기 비밀번호는 1234 입니다.");
    onRefresh?.();
  };

  const columns = useMemo(
    () => [
      { key: "loginId", label: "아이디" },
      { key: "name", label: "이름" },
      { key: "department", label: "부서" },
      { key: "rank", label: "직급" },
      {
        key: "roles",
        label: "권한",
        render: (row) =>
          getUserRoleIds(row.id)
            .map((id) => roles.find((role) => role.id === id)?.label)
            .filter(Boolean)
            .join(" · ") || "—",
      },
      {
        key: "active",
        label: "상태",
        render: (row) => (
          <span className={`status-badge ${row.active === false ? "미사용" : "사용"}`}>
            {row.active === false ? "미사용" : "사용"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "관리",
        render: (row) => (
          <div className="environment-table-actions">
            <button type="button" onClick={(e) => { e.stopPropagation(); toggleActive(row); }}>
              {row.active === false ? "사용" : "미사용"}
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); handleResetPassword(row); }}>
              비밀번호 초기화
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(row); }}>
              삭제
            </button>
          </div>
        ),
      },
    ],
    [refreshKey, roles]
  );

  return (
    <SettingsPanel
      title="사용자관리"
      desc="관리자가 사용자를 생성·수정·삭제합니다. 회원가입 · 비밀번호 찾기 · 이메일/휴대폰 인증은 지원하지 않습니다."
    >
      <div className="environment-actions environment-actions--top">
        <PrimaryButton type="button" onClick={() => setFormOpen((open) => !open)}>
          사용자 추가
        </PrimaryButton>
      </div>

      {formOpen ? (
        <div className="environment-form-grid environment-user-form">
          <label>
            <span>아이디</span>
            <input value={draft.loginId} onChange={(e) => setDraft((p) => ({ ...p, loginId: e.target.value }))} />
          </label>
          <label>
            <span>이름</span>
            <input value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} />
          </label>
          <label>
            <span>부서</span>
            <input value={draft.department} onChange={(e) => setDraft((p) => ({ ...p, department: e.target.value }))} />
          </label>
          <label>
            <span>직급</span>
            <input value={draft.rank} onChange={(e) => setDraft((p) => ({ ...p, rank: e.target.value }))} />
          </label>
          <label className="span-2">
            <span>권한 (다중 선택)</span>
            <div className="environment-role-checks">
              {roles.map((role) => (
                <label key={role.id}>
                  <input
                    type="checkbox"
                    checked={draft.roleIds.includes(role.id)}
                    onChange={() =>
                      setDraft((prev) => ({
                        ...prev,
                        roleIds: prev.roleIds.includes(role.id)
                          ? prev.roleIds.filter((id) => id !== role.id)
                          : [...prev.roleIds, role.id],
                      }))
                    }
                  />
                  {role.label}
                </label>
              ))}
            </div>
          </label>
          <div className="environment-actions span-2">
            <PrimaryButton type="button" onClick={handleCreate}>
              등록
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => setFormOpen(false)}>
              취소
            </SecondaryButton>
          </div>
        </div>
      ) : null}

      <div className="environment-table-wrap">
        {users.length === 0 ? (
          <TitanEmptyState
            icon={Users}
            title="사용자가 아직 등록되지 않았습니다."
            description="관리자가 사용자 계정을 생성하면 목록에 표시됩니다."
            action={
              <div className="environment-empty-state-actions">
                <PrimaryButton type="button" onClick={() => setFormOpen(true)}>
                  사용자 등록
                </PrimaryButton>
                <SecondaryButton
                  type="button"
                  onClick={() => {
                    const result = ensureDefaultAdminUser();
                    setMessage(result.message ?? "기본 관리자 계정이 생성되었습니다.");
                    onRefresh?.();
                  }}
                >
                  Demo Admin 생성
                </SecondaryButton>
              </div>
            }
          />
        ) : (
          <TitanDataTable
            columns={columns}
            rows={users}
            getRowId={(row) => row.id}
            expandedRowId={expandedRowId}
            onExpandedRowChange={setExpandedRowId}
            renderExpandedRow={(row) => (
              <div className="titan-list-expand">
                <dl className="inbound-detail titan-list-expand__detail">
                  <div><dt>아이디</dt><dd>{row.loginId}</dd></div>
                  <div><dt>이름</dt><dd>{row.name}</dd></div>
                  <div><dt>부서</dt><dd>{row.department || "—"}</dd></div>
                  <div><dt>직급</dt><dd>{row.rank || "—"}</dd></div>
                  <div><dt>상태</dt><dd>{row.active === false ? "미사용" : "사용"}</dd></div>
                </dl>
                <label className="environment-user-qr-perm">
                  <input
                    type="checkbox"
                    checked={hasQrCreatePermission(row.id)}
                    onChange={(e) => {
                      setUserPermissionOverride(row.id, "qrCreate", e.target.checked);
                      setMessage(`${row.name} — QR 생성 권한이 ${e.target.checked ? "부여" : "해제"}되었습니다.`);
                      onRefresh?.();
                    }}
                  />
                  QR 생성 권한
                </label>
              </div>
            )}
            emptyMessage="등록된 사용자가 없습니다."
            ariaLabel="사용자 목록"
          />
        )}
      </div>
      <ActionMessage message={message} />
    </SettingsPanel>
  );
}

export function PermissionsSection({ refreshKey, onRefresh }) {
  const roles = useMemo(() => getAuthRoles(), [refreshKey]);
  const [activeRoleId, setActiveRoleId] = useState(roles[0]?.id ?? "");
  const [draftName, setDraftName] = useState("");
  const [message, setMessage] = useState("");

  const activeRole = roles.find((role) => role.id === activeRoleId) ?? roles[0];

  const toggleMenu = (key) => {
    if (!activeRole) return;
    updateAuthRole(activeRole.id, {
      menuPermissions: {
        ...activeRole.menuPermissions,
        [key]: !activeRole.menuPermissions?.[key],
      },
    });
    onRefresh?.();
  };

  const toggleFeature = (key) => {
    if (!activeRole) return;
    updateAuthRole(activeRole.id, {
      featurePermissions: {
        ...activeRole.featurePermissions,
        [key]: !activeRole.featurePermissions?.[key],
      },
    });
    onRefresh?.();
  };

  const handleCreateRole = () => {
    const result = createAuthRole({ name: draftName });
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setDraftName("");
    setActiveRoleId(result.role.id);
    setMessage("권한이 추가되었습니다.");
    onRefresh?.();
  };

  const handleDeleteRole = () => {
    if (!activeRole) return;
    const result = deleteAuthRole(activeRole.id);
    setMessage(result.ok ? "권한이 삭제되었습니다." : result.message);
    onRefresh?.();
  };

  const handleSave = () => {
    setMessage("권한 설정이 저장되었습니다.");
    onRefresh?.();
  };

  const handleSeedRole = () => {
    setDraftName("관리자");
    const result = createAuthRole({ name: "관리자" });
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setDraftName("");
    setActiveRoleId(result.role.id);
    setMessage("권한이 추가되었습니다.");
    onRefresh?.();
  };

  return (
    <SettingsPanel title="권한관리" desc="권한을 자유롭게 추가·수정·삭제하고, 메뉴·기능 접근을 설정합니다. 모듈 OFF 시 해당 메뉴는 모든 사용자에게 숨겨집니다.">
      {roles.length === 0 ? (
        <TitanEmptyState
          title="등록된 권한이 없습니다."
          description="새 권한을 추가하면 메뉴 · 기능 접근을 설정할 수 있습니다."
          action={
            <PrimaryButton type="button" onClick={handleSeedRole}>
              권한 추가
            </PrimaryButton>
          }
        />
      ) : (
        <>
      <div className="environment-permission-toolbar">
        <label>
          <span>권한 선택</span>
          <select value={activeRole?.id ?? ""} onChange={(e) => setActiveRoleId(e.target.value)}>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>새 권한명</span>
          <input value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder="예: 품질관리" />
        </label>
        <PrimaryButton type="button" onClick={handleCreateRole}>
          권한 추가
        </PrimaryButton>
        <SecondaryButton type="button" onClick={handleDeleteRole} disabled={activeRole?.isSystem}>
          권한 삭제
        </SecondaryButton>
      </div>

      {activeRole ? (
        <div className="environment-permission-grid">
          <div className="environment-permission-card">
            <h4>메뉴 권한</h4>
            <ul>
              {TITAN_MENU_PERMISSIONS.map((menu) => (
                <li key={menu.key}>
                  <label>
                    <input
                      type="checkbox"
                      checked={Boolean(activeRole.menuPermissions?.[menu.key])}
                      onChange={() => toggleMenu(menu.key)}
                    />
                    {menu.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="environment-permission-card">
            <h4>기능 권한</h4>
            <ul>
              {TITAN_FEATURE_PERMISSIONS.map((feature) => (
                <li key={feature.key}>
                  <label>
                    <input
                      type="checkbox"
                      checked={Boolean(activeRole.featurePermissions?.[feature.key])}
                      onChange={() => toggleFeature(feature.key)}
                    />
                    {feature.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="environment-actions">
        <PrimaryButton type="button" onClick={handleSave}>
          저장
        </PrimaryButton>
      </div>

      <div className="environment-login-history">
        <h4>로그인 이력</h4>
        <div className="environment-table-wrap">
          <TitanDataTable
            columns={[
              { key: "loginAt", label: "로그인" },
              { key: "logoutAt", label: "로그아웃", render: (row) => row.logoutAt || "—" },
              { key: "loginId", label: "사용자" },
              { key: "userName", label: "이름" },
              { key: "success", label: "결과", render: (row) => (row.success ? "성공" : "실패") },
              { key: "failReason", label: "비고", render: (row) => row.failReason || "—" },
            ]}
            rows={getLoginHistory().slice(0, 20)}
            getRowId={(row) => row.id}
            emptyMessage="로그인 이력이 없습니다."
            ariaLabel="로그인 이력"
          />
        </div>
      </div>
        </>
      )}
      <ActionMessage message={message} />
    </SettingsPanel>
  );
}

const NOTIFICATION_ITEMS = [
  { key: "shipmentDue", label: "출고 예정 알림" },
  { key: "inspectionPending", label: "검사 대기 알림" },
  { key: "productionDelay", label: "생산 지연 알림" },
  { key: "certificatePending", label: "성적서 미등록 알림" },
  { key: "backup", label: "백업 알림" },
];

export function NotificationsSection({ refreshKey, onRefresh }) {
  const notifications = useMemo(() => getEnvironmentSettings().notifications, [refreshKey]);
  const [draft, setDraft] = useState(notifications);
  const [message, setMessage] = useState("");

  const handleSave = () => {
    saveNotifications(draft);
    setMessage("알림 설정이 저장되었습니다.");
    onRefresh?.();
  };

  return (
    <SettingsPanel title="알림설정" desc="프로그램 업무 알림을 설정합니다.">
      <ul className="environment-toggle-list">
        {NOTIFICATION_ITEMS.map((item) => (
          <li key={item.key}>
            <label>
              <input
                type="checkbox"
                checked={Boolean(draft[item.key])}
                onChange={() => setDraft((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
              />
              {item.label}
            </label>
          </li>
        ))}
      </ul>
      <ActionMessage message={message} />
      <div className="environment-actions">
        <PrimaryButton type="button" onClick={handleSave}>
          저장
        </PrimaryButton>
      </div>
    </SettingsPanel>
  );
}

export function BackupSection({ refreshKey, onRefresh }) {
  const history = useMemo(() => getEnvironmentSettings().backupHistory, [refreshKey]);
  const [message, setMessage] = useState("");
  const restoreInputRef = useRef(null);

  const handleBackup = () => {
    const result = runFullBackup();
    setMessage(`전체 백업이 완료되었습니다. (${result.sizeLabel})`);
    onRefresh?.();
  };

  const handleRestore = async (file) => {
    try {
      const result = await restoreFromBackupFile(file);
      setMessage(result.message);
      if (result.ok) setTimeout(() => window.location.reload(), 800);
      onRefresh?.();
    } catch (error) {
      setMessage(error.message || "복원에 실패했습니다.");
    }
  };

  const handleOpenFolder = () => {
    const result = openBackupFolderHint();
    setMessage(result.message);
  };

  return (
    <SettingsPanel title="백업 / 복원" desc="SQLite DB · 도면 · PDF · 관련 문서 · 프로그램 설정을 원클릭 백업합니다.">
      <div className="environment-backup-actions">
        <PrimaryButton type="button" onClick={handleBackup}>
          <Download size={14} />
          전체 백업
        </PrimaryButton>
        <SecondaryButton type="button" onClick={() => restoreInputRef.current?.click()}>
          <Upload size={14} />
          복원
        </SecondaryButton>
        <SecondaryButton type="button" onClick={handleOpenFolder}>
          <FolderOpen size={14} />
          백업 폴더 열기
        </SecondaryButton>
        <input
          ref={restoreInputRef}
          type="file"
          accept="application/json,.json"
          className="environment-hidden-input"
          onChange={(e) => handleRestore(e.target.files?.[0])}
        />
      </div>

      <p className="environment-form-note">
        백업 대상: SQLite DB · 도면 · PDF · 관련 문서 · 프로그램 설정
      </p>
      <ActionMessage message={message} />

      <h4 className="environment-subtitle">백업 이력</h4>
      {history.length === 0 ? (
        <TitanEmptyState
          title="등록된 백업 이력이 없습니다."
          description="전체 백업을 실행하면 이력이 여기에 표시됩니다."
        />
      ) : (
        <ul className="environment-backup-history">
          {history.map((row) => (
            <li key={row.id}>
              <strong>{row.label}</strong>
              <span>{row.createdAt.replace("T", " ").slice(0, 16)}</span>
              <span>{row.sizeLabel}</span>
              <span className="status-badge 완료">{row.status}</span>
            </li>
          ))}
        </ul>
      )}
    </SettingsPanel>
  );
}

export function LogsSection({ refreshKey }) {
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [expandedRowId, setExpandedRowId] = useState(null);
  const logs = useMemo(() => getCombinedLogs(keyword, typeFilter), [refreshKey, keyword, typeFilter]);

  const logRows = useMemo(
    () =>
      logs.map((row) => ({
        ...row,
        dateLabel: String(row.date ?? row.createdAt ?? "—").replace("T", " ").slice(0, 19),
        typeLabel: row.type === "error" ? "오류" : row.action || row.type,
        contentLabel: row.label || row.action || "—",
        targetLabel: row.target || row.screen || "—",
        userLabel: row.user || "—",
      })),
    [logs]
  );

  const columns = useMemo(
    () => [
      { key: "dateLabel", label: "일시" },
      { key: "typeLabel", label: "유형" },
      { key: "contentLabel", label: "내용" },
      { key: "targetLabel", label: "대상" },
      { key: "userLabel", label: "사용자" },
    ],
    []
  );

  return (
    <SettingsPanel title="로그관리" desc="로그인 · 등록 · 수정 · 삭제 · 오류 로그를 조회합니다.">
      <div className="environment-log-search">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="검색어"
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">전체</option>
          <option value="login">로그인</option>
          <option value="create">등록</option>
          <option value="update">수정</option>
          <option value="delete">삭제</option>
          <option value="error">오류</option>
        </select>
      </div>

      {logRows.length === 0 ? (
        <p className="environment-empty-note">조회된 로그가 없습니다.</p>
      ) : (
        <div className="environment-table-wrap">
          <TitanDataTable
            columns={columns}
            rows={logRows}
            getRowId={(row) => row.id}
            expandedRowId={expandedRowId}
            onExpandedRowChange={setExpandedRowId}
            renderExpandedRow={(row) => (
              <div className="titan-list-expand">
                <dl className="inbound-detail titan-list-expand__detail">
                  <div>
                    <dt>일시</dt>
                    <dd>{row.dateLabel}</dd>
                  </div>
                  <div>
                    <dt>유형</dt>
                    <dd>{row.typeLabel}</dd>
                  </div>
                  <div>
                    <dt>내용</dt>
                    <dd>{row.contentLabel}</dd>
                  </div>
                  <div>
                    <dt>대상</dt>
                    <dd>{row.targetLabel}</dd>
                  </div>
                  <div>
                    <dt>사용자</dt>
                    <dd>{row.userLabel}</dd>
                  </div>
                  {row.detail ? (
                    <div className="span-2">
                      <dt>상세</dt>
                      <dd>{row.detail}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            )}
            emptyMessage="조회된 로그가 없습니다."
            ariaLabel="로그 목록"
          />
        </div>
      )}
    </SettingsPanel>
  );
}

export function ProgramSection({ refreshKey, onRefresh }) {
  const programSettings = useMemo(() => getEnvironmentSettings().programSettings, [refreshKey]);
  const editionState = useMemo(() => getTitanEditionState(), [refreshKey]);
  const [draft, setDraft] = useState(programSettings);
  const [editionDraft, setEditionDraft] = useState(editionState);
  const [message, setMessage] = useState("");

  const handleSave = () => {
    saveProgramSettings(draft);
    setMessage("프로그램 설정이 저장되었습니다.");
    onRefresh?.();
  };

  const handleEditionSave = () => {
    const result = setTitanEdition(editionDraft.editionId, {
      mesAdapter: editionDraft.mesAdapter,
    });
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage(`실행 Edition이 ${getTitanEditionDisplayLabel()} 로 변경되었습니다.`);
    onRefresh?.();
  };

  return (
    <SettingsPanel title="프로그램 설정" desc="Edition · 자동 저장 · 자동 백업 · 저장 경로">
      <h4 className="environment-subtitle">실행 Edition (Platform REV.6)</h4>
      <p className="environment-form-note">{TITAN_PLATFORM_VISION.motto}</p>
      <fieldset className="environment-edition-fieldset">
        {getSelectableEditions().map((edition) => (
          <label key={edition.id} className="environment-edition-option">
            <input
              type="radio"
              name="program-edition"
              checked={editionDraft.editionId === edition.id}
              onChange={() => setEditionDraft((p) => ({ ...p, editionId: edition.id }))}
            />
            <span>
              <strong>{edition.labelKo}</strong>
              <small>{edition.subtitle ?? edition.label}</small>
              — {edition.description}
            </span>
          </label>
        ))}
      </fieldset>
      {editionDraft.editionId === TITAN_EDITION.MES_CONNECTED ? (
        <label className="environment-edition-adapter">
          <span>MES Repository</span>
          <select
            value={editionDraft.mesAdapter}
            onChange={(e) => setEditionDraft((p) => ({ ...p, mesAdapter: e.target.value }))}
          >
            <option value={MES_REPOSITORY_ADAPTER.ORACLE}>Oracle (Read Only)</option>
            <option value={MES_REPOSITORY_ADAPTER.API}>API (V1.1)</option>
            <option value={MES_REPOSITORY_ADAPTER.CSV}>CSV (V1.1)</option>
          </select>
        </label>
      ) : null}
      <div className="environment-actions">
        <PrimaryButton type="button" onClick={handleEditionSave}>
          Edition 적용
        </PrimaryButton>
      </div>
      <p className="environment-form-note environment-edition-future">
        Enterprise Edition (확장형) — Smart Factory · MES·ERP·PLC·IoT·AI·SPC · Future
      </p>
      <p className="environment-form-note">
        현재: <strong>{getTitanEditionDisplayLabel()}</strong> · Backend: {getRepositoryBackendLabel()} · Policy{" "}
        {PLATFORM_ARCHITECTURE_VERSION}
      </p>

      <h4 className="environment-subtitle">프로그램 옵션</h4>
      <ul className="environment-toggle-list">
        <li>
          <label className="environment-toggle-disabled">
            <input type="checkbox" disabled checked={false} />
            다크모드 (V2.0)
          </label>
        </li>
        <li>
          <label>
            <input
              type="checkbox"
              checked={Boolean(draft.autoSave)}
              onChange={() => setDraft((p) => ({ ...p, autoSave: !p.autoSave }))}
            />
            자동 저장
          </label>
        </li>
        <li>
          <label>
            <input
              type="checkbox"
              checked={Boolean(draft.autoBackup)}
              onChange={() => setDraft((p) => ({ ...p, autoBackup: !p.autoBackup }))}
            />
            자동 백업
          </label>
        </li>
      </ul>

      <div className="environment-form-grid">
        <label className="span-2">
          <span>자동 백업 주기</span>
          <select
            value={draft.autoBackupSchedule}
            onChange={(e) => setDraft((p) => ({ ...p, autoBackupSchedule: e.target.value }))}
          >
            <option value="on_exit">종료 시</option>
            <option value="daily">매일</option>
          </select>
        </label>
        <label className="span-2">
          <span>기본 저장 경로</span>
          <input
            value={draft.defaultPath}
            onChange={(e) => setDraft((p) => ({ ...p, defaultPath: e.target.value }))}
          />
        </label>
        <label className="span-2">
          <span>PDF 저장 경로</span>
          <input value={draft.pdfPath} onChange={(e) => setDraft((p) => ({ ...p, pdfPath: e.target.value }))} />
        </label>
        <label className="span-2">
          <span>도면 저장 경로</span>
          <input
            value={draft.drawingPath}
            onChange={(e) => setDraft((p) => ({ ...p, drawingPath: e.target.value }))}
          />
        </label>
      </div>

      <ActionMessage message={message} />
      <div className="environment-actions">
        <PrimaryButton type="button" onClick={handleSave}>
          저장
        </PrimaryButton>
      </div>
    </SettingsPanel>
  );
}

export function DataSection({ onRefresh }) {
  const summary = useMemo(() => getRepositories().dataReset.getSummary(), [onRefresh]);
  const [message, setMessage] = useState("");
  const [running, setRunning] = useState(false);

  if (!isTitanAdminUser()) {
    return (
      <SettingsPanel title={DATA_RESET_UI.title} desc={DATA_RESET_UI.desc}>
        <div className="environment-poc-access-denied">
          <strong>접근 권한 없음</strong>
          <p>{DATA_RESET_UI.accessDenied}</p>
        </div>
      </SettingsPanel>
    );
  }

  const confirmReset = (label, targetLabels) => {
    const targetList = targetLabels.map((item) => `- ${item}`).join("\n");
    const first = window.confirm(
      `[1/2] ${label}\n\n삭제 대상:\n${targetList}\n\n계속하시겠습니까?`
    );
    if (!first) return false;
    return window.confirm(
      `[2/2] 최종 확인\n\n${label}을(를) 실행하면 복구할 수 없습니다.\n정말 삭제하시겠습니까?`
    );
  };

  const handleReset = (scope, label, targetLabels) => {
    if (running) return;
    if (!confirmReset(label, targetLabels)) return;

    setRunning(true);
    try {
      const result = getRepositories().dataReset.reset(scope);
      if (!result.ok) {
        setMessage(result.message);
        setRunning(false);
        return;
      }
      resetRepositoriesForDemo();
      window.location.reload();
    } catch (error) {
      setMessage(error?.message ?? "데이터 초기화 중 오류가 발생했습니다.");
      setRunning(false);
    }
  };

  const handleLoadDemo = () => {
    if (running) return;
    if (
      !window.confirm(
        "Demo 데이터를 불러올까요?\n\nDemo Master · Demo 업무 · 시연용 Workflow가 로드됩니다."
      )
    ) {
      return;
    }

    setRunning(true);
    try {
      const result = getRepositories().dataReset.loadDemo();
      resetRepositoriesForDemo();
      setMessage(result.message ?? `Demo 데이터 로드 완료 · ${result.recordCount ?? 0}건`);
      window.location.reload();
    } catch (error) {
      setMessage(error?.message ?? "Demo 데이터 로드 중 오류가 발생했습니다.");
      setRunning(false);
    }
  };

  const masterLabels = DATA_RESET_MASTER_CATEGORIES.map((item) => item.label);
  const operationsLabels = DATA_RESET_OPERATIONS_TARGETS.map((item) => item.label);
  const allLabels = [...masterLabels, ...operationsLabels, "Demo 데이터"];

  return (
    <SettingsPanel title={DATA_RESET_UI.title} desc={DATA_RESET_UI.desc}>
      <section className="environment-data-section">
        <h4 className="environment-subtitle">① Demo 데이터 불러오기</h4>
        <p className="environment-form-note">{DATA_RESET_UI.demoDesc}</p>
        <div className="environment-backup-actions">
          <PrimaryButton type="button" disabled={running} onClick={handleLoadDemo}>
            {DATA_RESET_UI.demoButton}
          </PrimaryButton>
        </div>
      </section>

      <section className="environment-data-section">
        <h4 className="environment-subtitle">② Master 데이터 초기화</h4>
        <dl className="environment-info-list">
          {DATA_RESET_MASTER_CATEGORIES.map((item) => (
            <div key={item.key}>
              <dt>{item.label}</dt>
              <dd>{summary.master[item.key] ?? 0}건</dd>
            </div>
          ))}
        </dl>
        <div className="environment-backup-actions">
          <SecondaryButton
            type="button"
            disabled={running}
            onClick={() =>
              handleReset(DATA_RESET_SCOPES.MASTER, DATA_RESET_UI.masterButton, masterLabels)
            }
          >
            {DATA_RESET_UI.masterButton}
          </SecondaryButton>
        </div>
      </section>

      <section className="environment-data-section">
        <h4 className="environment-subtitle">③ 업무 데이터 초기화</h4>
        <dl className="environment-info-list">
          <div>
            <dt>운영 레코드</dt>
            <dd>{summary.operations.productionRecords ?? 0}건</dd>
          </div>
          <div>
            <dt>검사</dt>
            <dd>{summary.operations.inspections ?? 0}건</dd>
          </div>
          <div>
            <dt>성적서</dt>
            <dd>{summary.operations.certificates ?? 0}건</dd>
          </div>
        </dl>
        <div className="environment-backup-actions">
          <SecondaryButton
            type="button"
            disabled={running}
            onClick={() =>
              handleReset(DATA_RESET_SCOPES.OPERATIONS, DATA_RESET_UI.operationsButton, operationsLabels)
            }
          >
            {DATA_RESET_UI.operationsButton}
          </SecondaryButton>
        </div>
      </section>

      <section className="environment-data-section">
        <h4 className="environment-subtitle">④ 전체 초기화</h4>
        <p className="environment-form-note">
          Master · 업무 · Demo 데이터를 모두 삭제합니다. 자동 재생성 없음 · 빈 상태로 시작합니다.
        </p>
        <div className="environment-backup-actions">
          <PrimaryButton
            type="button"
            disabled={running}
            onClick={() => handleReset(DATA_RESET_SCOPES.ALL, DATA_RESET_UI.allButton, allLabels)}
          >
            {DATA_RESET_UI.allButton}
          </PrimaryButton>
        </div>
      </section>

      <p className="environment-muted-note">
        Repository Interface 경유 · RC1(sessionStorage) · V1.1(SQLite) 동일 UI 유지
      </p>
      <ActionMessage message={message} tone="danger" />
    </SettingsPanel>
  );
}

export function StatusSection({ refreshKey }) {
  const status = useMemo(() => getSystemStatusSummary(), [refreshKey]);
  const storage = status.storage;

  return (
    <SettingsPanel title="시스템 상태" desc="프로그램 · DB · 백업 · 저장공간 · 오류 로그 상태를 확인합니다.">
      <dl className="environment-info-list">
        <div>
          <dt>프로그램 버전</dt>
          <dd>{status.version}</dd>
        </div>
        <div>
          <dt>DB 상태</dt>
          <dd>{status.dbStatus}</dd>
        </div>
        <div>
          <dt>SQLite</dt>
          <dd>{status.sqliteStatus}</dd>
        </div>
        <div>
          <dt>최근 백업</dt>
          <dd>{status.latestBackupLabel}</dd>
        </div>
        <div>
          <dt>저장공간</dt>
          <dd>{status.storagePercent}%</dd>
        </div>
        <div>
          <dt>오류 로그</dt>
          <dd>{status.errorCount}건</dd>
        </div>
        <div>
          <dt>DB 용량</dt>
          <dd>{storage.db}</dd>
        </div>
        <div>
          <dt>도면 용량</dt>
          <dd>{storage.drawings}</dd>
        </div>
        <div>
          <dt>PDF 용량</dt>
          <dd>{storage.pdf}</dd>
        </div>
        <div>
          <dt>백업 보관</dt>
          <dd>{storage.backupCount}개</dd>
        </div>
      </dl>
    </SettingsPanel>
  );
}

export function MesPocSection({ refreshKey, onRefresh }) {
  return (
    <AdminOnlySection
      title="MES PoC"
      desc="MES Oracle 연동 사전 검증 · REV.4 FINAL · Repository 마이그레이션 ON HOLD"
    >
      <MesIntegrationPocPanel refreshKey={refreshKey} onRefresh={onRefresh} />
    </AdminOnlySection>
  );
}

export function ArchitectureSection() {
  const architecture = useMemo(() => getTitanArchitectureDisplayInfo(), []);

  return (
    <AdminOnlySection title="Architecture" desc="Project TITAN 공식 정책 · 아키텍처 (관리자)">
      <dl className="environment-info-list environment-info-list--architecture">
        <div>
          <dt>Platform Architecture</dt>
          <dd>{PLATFORM_ARCHITECTURE_VERSION}</dd>
        </div>
        <div>
          <dt>Platform Vision</dt>
          <dd>{TITAN_PLATFORM_VISION.tagline}</dd>
        </div>
        <div>
          <dt>Edition Architecture</dt>
          <dd>{PLATFORM_ARCHITECTURE_VERSION}</dd>
        </div>
        <div>
          <dt>실행 Edition</dt>
          <dd>{getTitanEditionDisplayLabel()}</dd>
        </div>
        <div>
          <dt>Official Policy</dt>
          <dd>{OFFICIAL_POLICY_DISPLAY.revision}</dd>
        </div>
        <div>
          <dt>Project TITAN</dt>
          <dd>{architecture.program}</dd>
        </div>
        <div>
          <dt>Version</dt>
          <dd>{architecture.version}</dd>
        </div>
        <div>
          <dt>Architecture</dt>
          <dd>{architecture.architecture}</dd>
        </div>
        <div>
          <dt>Platform</dt>
          <dd>{architecture.platform}</dd>
        </div>
        <div>
          <dt>Data Source</dt>
          <dd>{architecture.dataSource}</dd>
        </div>
        <div>
          <dt>Future</dt>
          <dd>{architecture.future}</dd>
        </div>
        <div>
          <dt>Revision</dt>
          <dd>{architecture.revision}</dd>
        </div>
      </dl>
      <pre className="environment-debug-stack">{PLATFORM_LAYERS.map((layer) => `${layer.label}\n  ${(layer.modules ?? layer.items ?? []).join(" · ")}`).join("\n\n")}</pre>
      <h4 className="environment-subtitle">Edition 비교 (REV.6)</h4>
      <div className="environment-edition-compare-wrap">
        <table className="environment-edition-compare">
          <thead>
            <tr>
              <th scope="col">기능</th>
              <th scope="col">Quality</th>
              <th scope="col">Standalone</th>
              <th scope="col">MES Connected</th>
            </tr>
          </thead>
          <tbody>
            {EDITION_FEATURE_COMPARISON.map((row) => (
              <tr key={row.feature}>
                <th scope="row">{row.feature}</th>
                <td>{row.quality}</td>
                <td>{row.standalone}</td>
                <td>{row.mesConnected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="environment-form-note">
        MES 연동 검증은 <strong>관리자 → MES PoC</strong> 탭에서 수행합니다.
      </p>
      <h4 className="environment-subtitle">Architecture Roadmap (Version 1 · 2 · 3)</h4>
      <p className="environment-form-note">
        Version 1 / 2 / 3은 프로그램 선택 기능이 아닌 향후 발전 방향입니다. 현재 구현은{" "}
        <strong>Version 3 — NDK PQMS (Presentation Version)</strong> 기준입니다.
      </p>
      <dl className="environment-info-list environment-info-list--architecture">
        {Object.values(DEVELOPMENT_STRATEGY).map((item) => (
          <div key={item.id}>
            <dt>
              {item.label}
              {item.id === CURRENT_DEVELOPMENT_VERSION ? " ★ 현재" : ""}
            </dt>
            <dd>
              {item.title} — {item.note}
            </dd>
          </div>
        ))}
      </dl>
    </AdminOnlySection>
  );
}

export function RepositoryStatusSection() {
  const backend = getRepositoryBackendLabel();

  return (
    <AdminOnlySection title="Repository Status" desc="UI → getRepositories() → Backend (관리자)">
      <dl className="environment-info-list environment-info-list--architecture">
        <div>
          <dt>Architecture Version</dt>
          <dd>{REPOSITORY_ARCHITECTURE_VERSION}</dd>
        </div>
        <div>
          <dt>Current Backend</dt>
          <dd>{backend}</dd>
        </div>
        <div>
          <dt>V1.1 Target (MES)</dt>
          <dd>{REPOSITORY_BACKEND.MES_ORACLE}</dd>
        </div>
        <div>
          <dt>Primary Key</dt>
          <dd>{QUALITY_PRIMARY_KEY}</dd>
        </div>
        <div>
          <dt>Swap Policy</dt>
          <dd>{REPOSITORY_SWAP_POLICY.swapTarget}</dd>
        </div>
      </dl>
      <h4 className="environment-subtitle">Registered Repositories</h4>
      <ul className="environment-poc-analysis-list">
        {REPOSITORY_REGISTRY.map((name) => (
          <li key={name} className="environment-poc-analysis-item environment-poc-analysis-item--pass">
            <span className="environment-poc-analysis-item__mark" aria-hidden>✓</span>
            <div>
              <strong>{name}</strong>
            </div>
          </li>
        ))}
      </ul>
      <pre className="environment-debug-stack">{`UI\n ↓\ngetRepositories()\n ↓\nSession Repository (V1.0)\n ↓\nOracle Repository (V1.1)`}</pre>
    </AdminOnlySection>
  );
}

export function DebugSection() {
  const sessionKeyCount = useMemo(() => {
    try {
      return globalThis.sessionStorage?.length ?? 0;
    } catch {
      return 0;
    }
  }, []);

  const [opsMessage, setOpsMessage] = useState("");
  const [opsMode, setOpsMode] = useState(() => getOperationsDataMode());
  const [opsRecordCount, setOpsRecordCount] = useState(() => getOperationsRecordCount());

  const refreshOpsStatus = () => {
    setOpsMode(getOperationsDataMode());
    setOpsRecordCount(getOperationsRecordCount());
  };

  const handleResetOperational = () => {
    const result = resetOperationsToEmpty();
    refreshOpsStatus();
    setOpsMessage(
      `\uC6B4\uC601 \uCD08\uAE30\uD654 \uC644\uB8CC \u00B7 \uC785\uCD9C\uACE0 ${result.recordCount}\uAC74 \u00B7 Master(\uAC70\uB798\uCC98\u00B7\uC81C\uD488 0\uAC74 \uC2DC\uC791)`
    );
  };

  const handleLoadQaDemo = () => {
    const result = loadQaDemoSeed();
    refreshOpsStatus();
    setOpsMessage(
      `QA Demo Seed \uB85C\uB4DC \u00B7 ${result.version} \u00B7 ${result.recordCount}\uAC74`
    );
  };

  const handleRestoreOperational = () => {
    const result = restoreOperationalFromQaDemo();
    refreshOpsStatus();
    setOpsMessage(
      `QA Demo \uC81C\uAC70 \u00B7 \uC6B4\uC601 \uBCF5\uAD6C \u00B7 \uC785\uCD9C\uACE0 ${result.recordCount}\uAC74`
    );
  };

  return (
    <AdminOnlySection title="Debug" desc="Demo · 개발 디버그 정보 (관리자 · UI 전용)">
      <dl className="environment-info-list">
        <div>
          <dt>Demo Admin Policy</dt>
          <dd>{DEMO_ADMIN_POLICY_VERSION}</dd>
        </div>
        <div>
          <dt>Demo Admin Mode</dt>
          <dd>{isDemoAdminModeActive() ? "활성" : "비활성"}</dd>
        </div>
        <div>
          <dt>Current Role (V1.1 prep)</dt>
          <dd>{getTitanUserRole()}</dd>
        </div>
        <div>
          <dt>Build Mode</dt>
          <dd>{import.meta.env.MODE}</dd>
        </div>
        <div>
          <dt>SessionStorage Keys</dt>
          <dd>{sessionKeyCount}개</dd>
        </div>
        <div>
          <dt>App Version</dt>
          <dd>{APP_VERSION}</dd>
        </div>
        <div>
          <dt>Operations Data Mode</dt>
          <dd>
            {opsMode === OPERATIONS_DATA_MODES.QA_DEMO
              ? `QA Demo (${TITAN_QA_DEMO_SEED_VERSION})`
              : "Operational"}
          </dd>
        </div>
        <div>
          <dt>Operations Records</dt>
          <dd>{opsRecordCount}건</dd>
        </div>
      </dl>

      <p className="environment-form-note">{TITAN_QA_DEMO_SEED_LABEL}</p>
      <div className="environment-backup-actions">
        <PrimaryButton type="button" onClick={handleResetOperational}>
          운영 초기화
        </PrimaryButton>
        <SecondaryButton type="button" onClick={handleLoadQaDemo}>
          QA Demo Seed 로드
        </SecondaryButton>
        <SecondaryButton type="button" onClick={handleRestoreOperational}>
          QA Demo 제거 · 운영 복원
        </SecondaryButton>
      </div>
      <ActionMessage message={opsMessage} />

      <p className="environment-form-note">
        Demo Admin은 UI 접근만 제어합니다. Business Logic은 권한과 독립적으로 동작합니다.
      </p>
    </AdminOnlySection>
  );
}

export function AboutSection({ refreshKey, onRefresh }) {
  const update = useMemo(() => checkForUpdates(), [refreshKey]);
  const [message, setMessage] = useState("");

  return (
    <AdminOnlySection title="About" desc="Project TITAN 프로그램 정보 (관리자)">
      <dl className="environment-info-list">
        <div>
          <dt>Program</dt>
          <dd>{APP_NAME}</dd>
        </div>
        <div>
          <dt>Developed for</dt>
          <dd>NDK</dd>
        </div>
        <div>
          <dt>Version</dt>
          <dd>{APP_VERSION}</dd>
        </div>
        <div>
          <dt>Stack</dt>
          <dd>React · Electron · SQLite</dd>
        </div>
        <div>
          <dt>Architecture Roadmap</dt>
          <dd>Version 3 — NDK PQMS (Presentation Version · 현재 구현) · Version 1/2 — 향후 Roadmap</dd>
        </div>
      </dl>

      <p className="environment-about-copy">Copyright © NDK. All rights reserved.</p>

      <div className="environment-backup-actions">
        <SecondaryButton
          type="button"
          onClick={() =>
            setMessage(
              update.available
                ? `새 버전이 있습니다. ${update.latestVersion}`
                : "현재 최신 버전을 사용 중입니다."
            )
          }
        >
          <RefreshCw size={14} />
          업데이트 확인
        </SecondaryButton>
        {update.available ? (
          <PrimaryButton type="button" onClick={() => setMessage("업데이트는 V1.1 Electron 연동 후 제공됩니다.")}>
            업데이트
          </PrimaryButton>
        ) : null}
      </div>
      <ActionMessage message={message} />
    </AdminOnlySection>
  );
}

const NUMBERING_RULE_ROWS = [
  {
    id: "lot",
    category: "LOT 번호",
    format: "YYMMDD-설비코드+순번(A-Z)",
    example: "260626-3S3A",
    source: "생산일보 · 설비 장입",
    status: "운영",
  },
  {
    id: "management",
    category: "관리번호",
    format: "MES 자동생성 → TITAN 조회",
    example: "DL260702-016",
    source: "MES / Session Demo",
    status: "운영",
  },
  {
    id: "htl",
    category: `열처리 작업 요청 (${TITAN_LIST_DOCUMENT_CODES.HTL})`,
    format: "HTL-YYYYMMDD-NNN",
    example: "HTL-20260710-001",
    source: "입고 리스트 출력",
    status: "운영",
  },
  {
    id: "dpr",
    category: `생산일보 (${TITAN_LIST_DOCUMENT_CODES.DPR})`,
    format: "DPR-YYYYMMDD-NNN",
    example: "DPR-20260710-001",
    source: "생산일보 출력",
    status: "운영",
  },
  {
    id: "out",
    category: `출고 리스트 (${TITAN_LIST_DOCUMENT_CODES.OUT})`,
    format: "OUT-YYYYMMDD-NNN",
    example: "OUT-20260710-001",
    source: "출고 리스트 출력",
    status: "운영",
  },
  {
    id: "coa",
    category: `검사성적서 (${TITAN_LIST_DOCUMENT_CODES.COA})`,
    format: "COA-YYYYMMDD-NNN",
    example: "COA-20260710-001",
    source: "성적서 발행",
    status: "향후",
  },
  {
    id: "inv",
    category: "거래명세서 (DOC-04)",
    format: "INV-YYYYMMDD-NNN",
    example: "INV-20260710-001",
    source: "출고 · 거래명세서",
    status: "향후",
  },
];

function buildTemplateDraft(template = null) {
  if (!template) {
    return {
      id: "",
      label: "",
      steps: [{ order: 1, processCategory: "cleaning", processDetail: "세척", requiresDetailPick: false }],
    };
  }
  return {
    id: template.id,
    label: template.label,
    steps: template.steps.map((step, index) => ({
      order: index + 1,
      processCategory: step.processCategory,
      processDetail: step.processDetail ?? "",
      requiresDetailPick: step.requiresDetailPick === true,
    })),
  };
}

export function ProcessWorkflowTemplatesSection() {
  const [templates, setTemplates] = useState(() => getProcessWorkflowTemplates());
  const [message, setMessage] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState("add");
  const [draft, setDraft] = useState(() => buildTemplateDraft());
  const [error, setError] = useState("");

  const refresh = (next = getProcessWorkflowTemplates()) => setTemplates(next);

  const columns = useMemo(
    () => [
      { key: "label", label: "공정유형" },
      { key: "id", label: "ID" },
      {
        key: "summary",
        label: "단계",
        render: (row) => summarizeProcessWorkflowTemplate(row),
      },
      {
        key: "actions",
        label: "작업",
        render: (row) => (
          <div className="environment-table-actions">
            <SecondaryButton
              type="button"
              onClick={() => {
                setEditorMode("edit");
                setDraft(buildTemplateDraft(row));
                setError("");
                setEditorOpen(true);
              }}
            >
              수정
            </SecondaryButton>
            <SecondaryButton
              type="button"
              onClick={() => {
                const result = deleteProcessWorkflowTemplate(row.id);
                if (!result.ok) {
                  setMessage(result.message);
                  return;
                }
                refresh(result.templates);
                setMessage("템플릿을 삭제했습니다.");
              }}
            >
              <Trash2 size={14} aria-hidden />
              삭제
            </SecondaryButton>
          </div>
        ),
      },
    ],
    []
  );

  const handleSave = () => {
    const label = String(draft.label ?? "").trim();
    if (!label) {
      setError("공정유형 이름을 입력하세요.");
      return;
    }
    const payload = {
      id: editorMode === "add" ? createProcessWorkflowTemplateId(label) : draft.id,
      label,
      builtIn: editorMode === "edit" ? templates.find((row) => row.id === draft.id)?.builtIn : false,
      steps: draft.steps.map((step, index) => ({
        order: index + 1,
        processCategory: step.processCategory,
        processDetail: step.requiresDetailPick ? null : step.processDetail || null,
        requiresDetailPick: step.requiresDetailPick === true,
        detailOptions: step.requiresDetailPick
          ? getProductProcessDetailOptions(step.processCategory)
          : undefined,
      })),
    };
    const result =
      editorMode === "add"
        ? addProcessWorkflowTemplate(payload)
        : updateProcessWorkflowTemplate(draft.id, payload);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    refresh(result.templates);
    setEditorOpen(false);
    setMessage(editorMode === "add" ? "공정유형을 등록했습니다." : "공정유형을 수정했습니다.");
  };

  return (
    <SettingsPanel
      title="공정유형 관리"
      desc="제품 마스터 · 입고 · 생산 Workflow 템플릿 — SessionStorage 저장"
    >
      <p className="environment-form-note">
        세척 · 열처리 · 쇼트 등 공정 순서를 템플릿으로 관리합니다. 코드 배포 없이 유형을 추가할 수 있습니다.
      </p>
      <div className="environment-backup-actions">
        <PrimaryButton
          type="button"
          onClick={() => {
            setEditorMode("add");
            setDraft(buildTemplateDraft());
            setError("");
            setEditorOpen(true);
          }}
        >
          <Plus size={14} aria-hidden />
          공정유형 추가
        </PrimaryButton>
        <SecondaryButton
          type="button"
          onClick={() => {
            refresh(resetProcessWorkflowTemplates());
            setMessage("기본 공정유형으로 초기화했습니다.");
          }}
        >
          <RotateCcw size={14} aria-hidden />
          기본값 복원
        </SecondaryButton>
      </div>
      {message ? <p className="environment-form-note">{message}</p> : null}
      <div className="environment-table-wrap">
        <TitanDataTable columns={columns} rows={templates} getRowId={(row) => row.id} ariaLabel="공정유형" />
      </div>
      <TitanRegisterModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleSave}
        kicker="공정유형"
        title={editorMode === "add" ? "공정유형 등록" : "공정유형 수정"}
        submitLabel={editorMode === "add" ? "등록" : "저장"}
        size="wide"
      >
        {error ? <p className="master-register-modal__error" role="alert">{error}</p> : null}
        <label className="master-register-modal__field span-2">
          <span>공정유형 이름 *</span>
          <input
            type="text"
            value={draft.label}
            onChange={(event) => setDraft((prev) => ({ ...prev, label: event.target.value }))}
          />
        </label>
        {draft.steps.map((step, index) => (
          <div key={`tpl-step-${index}`} className="environment-form-grid">
            <label className="environment-form-field">
              <span>{`${index + 1}단계 공정`}</span>
              <select
                value={step.processCategory}
                onChange={(event) => {
                  const processCategory = event.target.value;
                  const options = getProductProcessDetailOptions(processCategory);
                  setDraft((prev) => ({
                    ...prev,
                    steps: prev.steps.map((row, rowIndex) =>
                      rowIndex === index
                        ? {
                            ...row,
                            processCategory,
                            processDetail: options[0] ?? "",
                            requiresDetailPick: processCategory === "heatTreatment",
                          }
                        : row
                    ),
                  }));
                }}
              >
                {PRODUCT_PROCESS_CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="environment-form-field">
              <span>세부공정</span>
              {step.requiresDetailPick ? (
                <em className="environment-form-note">제품 등록 시 선택</em>
              ) : (
                <select
                  value={step.processDetail}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      steps: prev.steps.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, processDetail: event.target.value } : row
                      ),
                    }))
                  }
                >
                  {getProductProcessDetailOptions(step.processCategory).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              )}
            </label>
          </div>
        ))}
        <SecondaryButton
          type="button"
          onClick={() =>
            setDraft((prev) => ({
              ...prev,
              steps: [
                ...prev.steps,
                {
                  order: prev.steps.length + 1,
                  processCategory: "cleaning",
                  processDetail: "세척",
                  requiresDetailPick: false,
                },
              ],
            }))
          }
        >
          단계 추가
        </SecondaryButton>
      </TitanRegisterModal>
    </SettingsPanel>
  );
}

export function NumberingSection() {
  const [prefixes, setPrefixes] = useState(() => getNumberingPrefixes());
  const [message, setMessage] = useState("");

  const ruleRows = useMemo(() => getNumberingRuleRows("DS"), [prefixes]);
  const prefixRows = useMemo(
    () => Object.values(TITAN_DOCUMENT_NUMBER_TYPES).map((item) => ({ id: item.id, label: item.label, example: item.example })),
    []
  );

  const columns = useMemo(
    () => [
      { key: "category", label: "구분" },
      { key: "prefix", label: "접두어" },
      { key: "format", label: "번호 규칙" },
      { key: "example", label: "예시 (DS)" },
      { key: "source", label: "적용 화면" },
      {
        key: "status",
        label: "상태",
        render: (row) => (
          <span className={`status-badge ${row.status === "운영" ? "사용" : "미사용"}`}>{row.status}</span>
        ),
      },
    ],
    []
  );

  const handlePrefixChange = (type, value) => {
    setPrefixes((prev) => ({ ...prev, [type]: String(value ?? "").trim().toUpperCase() }));
  };

  const handleSave = () => {
    const validation = validateNumberingPrefixes(prefixes);
    if (!validation.ok) {
      setMessage(validation.message);
      return;
    }
    const result = saveNumberingPrefixes(prefixes);
    if (!result.ok) {
      setMessage(result.message ?? "번호체계 저장에 실패했습니다.");
      return;
    }
    setMessage("번호체계 접두어를 저장했습니다.");
  };

  const handleReset = () => {
    const next = resetNumberingPrefixes();
    setPrefixes(next.prefixes);
    setMessage("기본 접두어로 초기화했습니다.");
  };

  return (
    <SettingsPanel
      title="번호체계"
      desc={`문서·관리번호 자동채번 규칙 — 패턴 ${TITAN_NUMBERING_PATTERN}`}
    >
      <p className="environment-form-note">
        거래처 약칭 + 접두어 + 4자리 순번 · 제품 등록 시 <strong>DS-P-0001</strong> 형식 자동 생성
      </p>
      <p className="environment-form-note">
        LOT 형식 검증 패턴: <code>{NDK_PRODUCTION_LOT_PATTERN.source}</code>
      </p>

      <h4 className="environment-subtitle">접두어 설정</h4>
      <div className="environment-form-grid">
        {prefixRows.map((row) => (
          <label key={row.id} className="environment-form-field">
            <span>{row.label}</span>
            <input
              type="text"
              value={prefixes[row.id] ?? ""}
              onChange={(event) => handlePrefixChange(row.id, event.target.value)}
              placeholder={row.example.split("-")[1] ?? "P"}
            />
            <small>{row.example}</small>
          </label>
        ))}
      </div>

      <div className="environment-backup-actions">
        <PrimaryButton type="button" onClick={handleSave}>저장</PrimaryButton>
        <SecondaryButton type="button" onClick={handleReset}>기본값 복원</SecondaryButton>
      </div>
      {message ? <p className="environment-form-note">{message}</p> : null}

      <h4 className="environment-subtitle">운영 번호 규칙 미리보기</h4>
      <div className="environment-table-wrap">
        <TitanDataTable columns={columns} rows={ruleRows} getRowId={(row) => row.id} ariaLabel="번호체계 규칙" />
      </div>
    </SettingsPanel>
  );
}

function resolveMenuGroup(menuId) {
  const group = MENU_FREEZE_SIDEBAR_GROUPS.find((entry) => entry.menuIds.includes(menuId));
  if (!group) return "—";
  return [group.emoji, group.label].filter(Boolean).join(" ") || "—";
}

export function MenuStructureSection() {
  const rows = useMemo(
    () =>
      MENU_FREEZE_SIDEBAR.map((item) => ({
        ...item,
        group: resolveMenuGroup(item.id),
        path: TITAN_MENU_CATALOG[item.id]?.path ?? "—",
        state: MENU_FREEZE_LOCKED ? "고정" : "편집 가능",
      })),
    []
  );

  const columns = useMemo(
    () => [
      { key: "order", label: "순서" },
      { key: "group", label: "그룹" },
      { key: "label", label: "메뉴" },
      { key: "path", label: "경로" },
      {
        key: "state",
        label: "상태",
        render: (row) => (
          <span className={`status-badge ${row.state === "고정" ? "사용" : "미사용"}`}>{row.state}</span>
        ),
      },
    ],
    []
  );

  return (
    <SettingsPanel
      title="메뉴 관리"
      desc={`Sidebar · Launcher 구조 조회 — ${MENU_FREEZE_VERSION} (${MENU_FREEZE_DATE})`}
    >
      <p className="environment-form-note">{MENU_FREEZE_CHANGE_POLICY}</p>
      <p className="environment-form-note">{PQMS_DEVELOPMENT_PHILOSOPHY}</p>

      <div className="environment-table-wrap">
        <TitanDataTable columns={columns} rows={rows} getRowId={(row) => row.id} ariaLabel="메뉴 구조" />
      </div>

      <p className="environment-form-note">
        메뉴 ON/OFF(모듈)는 <strong>메뉴 ON/OFF</strong> Workspace에서 설정합니다. Sidebar 구조 변경은 PM 승인 후에만
        가능합니다.
      </p>
    </SettingsPanel>
  );
}

export function QrSettingsSection() {
  const [baseUrlDraft, setBaseUrlDraft] = useState(() => getQrBrowserBaseUrl());
  const [message, setMessage] = useState("");

  const registryRows = useMemo(
    () =>
      Object.values(SMART_ACCESS_ID_REGISTRY).map((entry) => ({
        id: entry.id,
        label: entry.labelKo ?? entry.label,
        canonicalId: entry.canonicalId ?? entry.canonicalPattern ?? "—",
        legacyAlias: entry.legacyPayload ?? entry.legacyPattern ?? "—",
      })),
    []
  );

  const equipmentColumns = useMemo(
    () => [
      { key: "code", label: "설비 코드" },
      { key: "process", label: "공정" },
      { key: "label", label: "설비명" },
      {
        key: "smartAccess",
        label: "Smart Access ID",
        render: (row) => `${SMART_ACCESS_ID_SCHEME.canonicalPrefix}EQ/${row.code}`,
      },
    ],
    []
  );

  const registryColumns = useMemo(
    () => [
      { key: "label", label: "대상" },
      { key: "canonicalId", label: "Registry ID" },
      { key: "legacyAlias", label: "Legacy Alias" },
    ],
    []
  );

  const handleSaveBaseUrl = () => {
    const saved = setQrBrowserBaseUrl(baseUrlDraft);
    setBaseUrlDraft(saved);
    setMessage(`QR Base URL이 저장되었습니다: ${saved}`);
  };

  const handleResetBaseUrl = () => {
    setQrBrowserBaseUrl("");
    const resolved = getQrBrowserBaseUrl();
    setBaseUrlDraft(resolved);
    setMessage(`기본값으로 복원되었습니다: ${resolved}`);
  };

  return (
    <>
      <SettingsPanel title="QR 설정" desc="Smart Access · QR Prefix · Base URL · 출력 정책 — RC1 운영 기준">
        <h4 className="environment-subtitle">QR Prefix · Smart Access ID</h4>
        <dl className="environment-info-list">
          <div>
            <dt>Canonical Prefix</dt>
            <dd>
              <code>{SMART_ACCESS_ID_SCHEME.canonicalPrefix}</code>
            </dd>
          </div>
          <div>
            <dt>설비 패턴</dt>
            <dd>
              <code>{SMART_ACCESS_ID_SCHEME.canonicalEquipmentPattern}</code>
            </dd>
          </div>
          <div>
            <dt>Legacy Prefix</dt>
            <dd>
              <code>{SMART_ACCESS_ID_SCHEME.legacyEquipmentPrefix}</code>
            </dd>
          </div>
          <div>
            <dt>정책</dt>
            <dd>{SMART_ACCESS_ID_SCHEME.note}</dd>
          </div>
        </dl>

        <h4 className="environment-subtitle">QR Base URL</h4>
        <div className="environment-form-grid">
          <label className="span-2">
            <span>Base URL (모바일 · 브라우저 QR 스캔)</span>
            <input
              value={baseUrlDraft}
              onChange={(e) => setBaseUrlDraft(e.target.value)}
              placeholder={QR_BROWSER_BASE_URL_DEFAULT_DEV}
            />
          </label>
          <label className="span-2">
            <span>미리보기 URL (설비 ION-01)</span>
            <input readOnly value={buildQrBrowserUrl("/qr/equipment/ION-01")} />
          </label>
        </div>
        <div className="environment-actions">
          <PrimaryButton type="button" onClick={handleSaveBaseUrl}>
            저장
          </PrimaryButton>
          <SecondaryButton type="button" onClick={handleResetBaseUrl}>
            기본값 복원
          </SecondaryButton>
        </div>
        <ActionMessage message={message} />
        <p className="environment-form-note" role="note">
          <strong>운영 주의:</strong> {RC1_QR_BASE_URL_REPRINT_NOTICE} 운영 도메인·Host 주소 변경 이전에 인쇄한 QR에는
          이전 URL이 포함되어 있어 스캔이 실패할 수 있습니다.
        </p>

        <h4 className="environment-subtitle">QR 출력 · Label 정책</h4>
        <ul className="environment-toggle-list environment-toggle-list--readonly">
          <li>내부 출력물: QR 자동 포함 (DOC-01 · DOC-02 · DOC-03)</li>
          <li>거래명세서: 공급처 QR만 (내부 Workflow QR 제외)</li>
          <li>설비 QR: 설비당 1개 · 다매 출력 허용 — {EQUIPMENT_QR_RULES.multiCopyNote}</li>
          <li>Traceability: {TITAN_QR_PHILOSOPHY.oneLotOneTraceabilityQr}</li>
        </ul>
        <p className="environment-form-note">
          QR 출력센터 카테고리: {QR_PRINT_CENTER_OFFICIAL.categories.map((item) => item.label).join(" · ")}
        </p>

        <h4 className="environment-subtitle">공식 설비 QR 코드</h4>
        <div className="environment-table-wrap">
          <TitanDataTable
            columns={equipmentColumns}
            rows={OFFICIAL_EQUIPMENT_QR_CODES}
            getRowId={(row) => row.code}
            ariaLabel="공식 설비 QR"
          />
        </div>

        <h4 className="environment-subtitle">Smart Access Registry</h4>
        <div className="environment-table-wrap">
          <TitanDataTable
            columns={registryColumns}
            rows={registryRows}
            getRowId={(row) => row.id}
            ariaLabel="Smart Access Registry"
          />
        </div>
      </SettingsPanel>

      <QrPrintCenterSection />
    </>
  );
}

export function renderEnvironmentSection(tabId, props) {
  switch (tabId) {
    case "company":
      return <CompanySection {...props} />;
    case "users":
      return <UsersSection {...props} />;
    case "permissions":
      return <PermissionsSection {...props} />;
    case "notifications":
      return <NotificationsSection {...props} />;
    case "backup":
      return <BackupSection {...props} />;
    case "logs":
      return <LogsSection {...props} />;
    case "program":
      return <ProgramSection {...props} />;
    case "data":
      return <DataSection {...props} />;
    case "status":
      return <StatusSection {...props} />;
    case "modules":
      return <ModuleManagementSection {...props} />;
    case "numbering":
      return <NumberingSection {...props} />;
    case "processTemplates":
      return <ProcessWorkflowTemplatesSection {...props} />;
    case "inspectionTemplates":
      return <InspectionTemplatesSection {...props} />;
    case "certificatePolicies":
      return <CertificatePoliciesSection {...props} />;
    case "qrSettings":
      return <QrSettingsSection {...props} />;
    case "menus":
      return <MenuStructureSection {...props} />;
    case "storage":
      return <StorageManagementSection {...props} />;
    case "mes-poc":
      return <MesPocSection {...props} />;
    case "architecture":
      return <ArchitectureSection {...props} />;
    case "repository-status":
      return <RepositoryStatusSection {...props} />;
    case "debug":
      return <DebugSection {...props} />;
    case "about":
      return <AboutSection {...props} />;
    default: {
      const tab = getEnvironmentTabById(tabId);
      return (
        <TitanComingSoonPlaceholder
          title={tab?.label ?? "환경설정"}
          subtitle="관리자"
        />
      );
    }
  }
}
