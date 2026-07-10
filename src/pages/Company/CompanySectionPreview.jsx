import { useRef, useState } from "react";
import { Building2 } from "lucide-react";

import { FoundationActionBar, TitanDataTable } from "../../foundation/uiKit";
import {
  buildCompanyPrintFooterLines,
  resolveBusinessSiteTypeLabel,
  resolveEmployeeStatusLabel,
} from "../../utils/companyWorkspaceService";
import {
  downloadFoundationAttachment,
  readFoundationAttachmentFile,
} from "../../utils/foundationAttachmentEngine";

const BRANDING_IMAGE_ACCEPT = "image/png,image/jpeg";
const BRANDING_ASSET_DEFINITIONS = Object.freeze([
  {
    key: "logo",
    nameKey: "logoName",
    mimeKey: "logoMimeType",
    label: "회사 Logo",
    fallback: "Logo",
  },
  {
    key: "stamp",
    nameKey: "stampName",
    mimeKey: "stampMimeType",
    label: "회사 직인",
    fallback: "Seal",
  },
  {
    key: "signature",
    nameKey: "signatureName",
    mimeKey: "signatureMimeType",
    label: "대표이사 서명",
    fallback: "Sign",
  },
]);

const BRANDING_FONT_OPTIONS = Object.freeze([
  { id: "", label: "시스템 기본" },
  { id: "Noto Sans KR", label: "Noto Sans KR" },
  { id: "Pretendard", label: "Pretendard" },
  { id: "Malgun Gothic", label: "맑은 고딕" },
]);

export default function CompanySectionPreview({
  sectionId,
  previewNote = "",
  organizationTree = "",
  profile,
  draft = {},
  editing = false,
  onDraftChange,
  onEditRow,
  onDeleteRow,
}) {
  if (sectionId === "information") {
    return (
      <CompanyFormPanel
        title="회사 기본정보"
        editing={editing}
        fields={[
          ["companyName", "회사명"],
          ["businessNumber", "사업자등록번호"],
          ["corporateNumber", "법인등록번호"],
          ["representative", "대표자"],
          ["phone", "연락처"],
          ["email", "Email"],
          ["address", "주소", "textarea"],
          ["businessType", "업태"],
          ["businessItem", "종목"],
          ["website", "홈페이지"],
        ]}
        values={draft}
        onChange={onDraftChange}
      />
    );
  }

  if (sectionId === "documentFooter") {
    return (
      <CompanyFormPanel
        title="문서 Footer"
        editing={editing}
        fields={[
          ["companyName", "회사명"],
          ["address", "주소", "textarea"],
          ["phone", "연락처"],
          ["email", "Email"],
          ["copyright", "Copyright", "textarea"],
        ]}
        values={draft}
        onChange={onDraftChange}
      />
    );
  }

  if (sectionId === "branding") {
    return (
      <CompanyBrandingPanel
        profile={profile}
        draft={draft}
        editing={editing}
        onDraftChange={onDraftChange}
      />
    );
  }

  if (sectionId === "sites") {
    const rows = (profile.businessSites ?? []).map((site) => ({
      ...site,
      typeLabel: resolveBusinessSiteTypeLabel(site.type),
      statusLabel: site.status === "active" ? "가동" : "비활성",
    }));
    return (
      <CompanyTablePanel
        title="사업장"
        columns={[
          { key: "name", label: "사업장명", widthHint: "wide" },
          { key: "typeLabel", label: "유형" },
          { key: "address", label: "주소", widthHint: "wide" },
          { key: "phone", label: "연락처" },
          { key: "statusLabel", label: "상태" },
        ]}
        rows={rows}
        emptyMessage="등록된 사업장이 없습니다."
        onEditRow={onEditRow}
        onDeleteRow={onDeleteRow}
      />
    );
  }

  if (sectionId === "organization") {
    return (
      <section className="company-master-panel" aria-label="조직도">
        <h3 className="company-master-panel__title">조직도</h3>
        <pre className="company-master-tree">{organizationTree || previewNote}</pre>
      </section>
    );
  }

  if (sectionId === "departments") {
    const rows = (profile.departments ?? []).map((department) => ({
      ...department,
      statusLabel: department.status === "active" ? "사용" : "비활성",
    }));
    return (
      <CompanyTablePanel
        title="부서"
        columns={[
          { key: "code", label: "부서코드" },
          { key: "name", label: "부서명", widthHint: "wide" },
          { key: "statusLabel", label: "상태" },
        ]}
        rows={rows}
        emptyMessage="등록된 부서가 없습니다."
        onEditRow={onEditRow}
        onDeleteRow={onDeleteRow}
      />
    );
  }

  if (sectionId === "employees") {
    const departments = profile.departments ?? [];
    const positions = profile.positions ?? [];
    const rows = (profile.employees ?? []).map((employee) => ({
      ...employee,
      departmentName:
        departments.find((department) => department.id === employee.departmentId)?.name ??
        employee.departmentName ??
        "-",
      positionName:
        positions.find((position) => position.id === employee.positionId)?.name ??
        employee.positionName ??
        "-",
      statusLabel: resolveEmployeeStatusLabel(employee.status),
    }));
    return (
      <CompanyTablePanel
        title="직원"
        columns={[
          { key: "employeeNo", label: "사번" },
          { key: "name", label: "이름", widthHint: "wide" },
          { key: "departmentName", label: "부서" },
          { key: "positionName", label: "직급" },
          { key: "phone", label: "연락처" },
          { key: "email", label: "Email", widthHint: "wide" },
          { key: "statusLabel", label: "재직상태" },
        ]}
        rows={rows}
        emptyMessage="등록된 직원이 없습니다."
        onEditRow={onEditRow}
        onDeleteRow={onDeleteRow}
      />
    );
  }

  if (sectionId === "positions") {
    const rows = [...(profile.positions ?? [])]
      .sort((a, b) => Number(a.rank ?? 0) - Number(b.rank ?? 0))
      .map((position) => ({
        ...position,
        statusLabel: position.status === "active" ? "사용" : "비활성",
      }));
    return (
      <CompanyTablePanel
        title="직급"
        columns={[
          { key: "rank", label: "순위" },
          { key: "code", label: "직급코드" },
          { key: "name", label: "직급명", widthHint: "wide" },
          { key: "statusLabel", label: "상태" },
        ]}
        rows={rows}
        emptyMessage="등록된 직급이 없습니다."
        onEditRow={onEditRow}
        onDeleteRow={onDeleteRow}
      />
    );
  }

  return null;
}

function CompanyFormPanel({ title, fields, values, editing, onChange }) {
  return (
    <section className="company-master-panel" aria-label={title}>
      <h3 className="company-master-panel__title">{title}</h3>
      <div className="company-master-form">
        {fields.map(([key, label, type]) => (
          <label
            key={key}
            className={`company-master-form__field${type === "textarea" ? " company-master-form__field--wide" : ""}`}
          >
            <span>{label}</span>
            {type === "textarea" ? (
              <textarea
                value={values?.[key] ?? ""}
                onChange={(event) => onChange?.(key, event.target.value)}
                disabled={!editing}
                rows={3}
              />
            ) : (
              <input
                type={key === "email" ? "email" : "text"}
                value={values?.[key] ?? ""}
                onChange={(event) => onChange?.(key, event.target.value)}
                disabled={!editing}
              />
            )}
          </label>
        ))}
      </div>
    </section>
  );
}

function CompanyBrandingPanel({ profile, draft, editing, onDraftChange }) {
  return (
    <section className="company-master-panel" aria-label="Branding">
      <h3 className="company-master-panel__title">Company Branding Center</h3>
      <p className="company-branding-help">
        Company Workspace Branding은 성적서 · 거래명세서 · QR/PDF · TDE가 참조하는 Company Master Source of Truth입니다.
      </p>
      <div className="company-branding-center">
        <div className="company-branding-assets">
          {BRANDING_ASSET_DEFINITIONS.map((asset) => (
            <CompanyBrandingAssetCard
              key={asset.key}
              asset={asset}
              draft={draft}
              editing={editing}
              onDraftChange={onDraftChange}
            />
          ))}
        </div>

        <div className="company-branding-settings">
          <label className="company-master-form__field">
            <span>Primary Color</span>
            <input
              type="color"
              value={draft.brandTheme?.primaryColor || "#1d4ed8"}
              disabled={!editing}
              onChange={(event) =>
                onDraftChange?.("brandTheme", {
                  ...(draft.brandTheme ?? {}),
                  primaryColor: event.target.value,
                })
              }
            />
          </label>
          <label className="company-master-form__field">
            <span>Accent Color</span>
            <input
              type="color"
              value={draft.brandTheme?.accentColor || "#0f766e"}
              disabled={!editing}
              onChange={(event) =>
                onDraftChange?.("brandTheme", {
                  ...(draft.brandTheme ?? {}),
                  accentColor: event.target.value,
                })
              }
            />
          </label>
          <label className="company-master-form__field">
            <span>문서 기본 글꼴</span>
            <select
              value={draft.documentFont || ""}
              disabled={!editing}
              onChange={(event) => onDraftChange?.("documentFont", event.target.value)}
            >
              {BRANDING_FONT_OPTIONS.map((font) => (
                <option key={font.id || "default"} value={font.id}>
                  {font.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <CompanyBrandingOutputPreview draft={draft} profile={profile} />
      </div>
    </section>
  );
}

function CompanyBrandingAssetCard({ asset, draft, editing, onDraftChange }) {
  const inputRef = useRef(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const dataUrl = draft[asset.key] || "";
  const fileName = draft[asset.nameKey] || `${asset.label}.png`;
  const mimeType = draft[asset.mimeKey] || "image/png";
  const pendingLabel = pendingFile?.name || "";

  const attachment = dataUrl
    ? {
        id: `company-${asset.key}`,
        name: fileName,
        dataUrl,
        mimeType,
        attachmentType: "etc",
      }
    : null;

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    setMessage("");

    if (!file) {
      setPendingFile(null);
      return;
    }

    const isSupported =
      ["image/png", "image/jpeg"].includes(file.type) || /\.(png|jpe?g)$/i.test(file.name);
    if (!isSupported) {
      setPendingFile(null);
      setMessage("PNG 또는 JPG/JPEG 파일만 등록할 수 있습니다.");
      return;
    }

    setPendingFile(file);
    setMessage(`${file.name} 선택 완료 — 업로드를 눌러 미리보기에 반영하세요.`);
  };

  const handleUpload = async () => {
    if (!editing) {
      setMessage("수정 버튼을 누르면 Branding Asset을 변경할 수 있습니다.");
      return;
    }
    if (!pendingFile) {
      setMessage("업로드할 PNG 또는 JPG/JPEG 파일을 선택해 주세요.");
      return;
    }

    setBusy(true);
    try {
      const parsed = await readFoundationAttachmentFile(pendingFile, {
        attachmentType: "etc",
        uploadedBy: "company-workspace",
      });
      if (!String(parsed.mimeType ?? "").startsWith("image/") || !parsed.dataUrl) {
        throw new Error("invalid image");
      }

      onDraftChange?.(asset.key, parsed.dataUrl);
      onDraftChange?.(asset.nameKey, parsed.name || pendingFile.name);
      onDraftChange?.(asset.mimeKey, parsed.mimeType || pendingFile.type || "image/png");
      setPendingFile(null);
      setMessage(`${asset.label} 업로드 완료 — 저장을 누르면 Company Master에 반영됩니다.`);
    } catch {
      setMessage("파일을 읽을 수 없습니다. PNG/JPG 파일을 다시 선택해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = () => {
    if (!editing) {
      setMessage("수정 버튼을 누르면 삭제할 수 있습니다.");
      return;
    }
    if (!dataUrl) {
      setMessage("삭제할 Branding Asset이 없습니다.");
      return;
    }
    if (!window.confirm(`${asset.label}를 삭제하시겠습니까?`)) return;
    onDraftChange?.(asset.key, "");
    onDraftChange?.(asset.nameKey, "");
    onDraftChange?.(asset.mimeKey, "");
    setPendingFile(null);
    setMessage(`${asset.label} 삭제 준비 완료 — 저장을 누르면 Company Master에 반영됩니다.`);
  };

  return (
    <article className="company-branding-asset-card">
      <div className="company-branding-preview">
        {dataUrl ? (
          <img src={dataUrl} alt={asset.label} />
        ) : (
          <span aria-hidden="true">
            <Building2 size={38} />
          </span>
        )}
        <strong>{asset.label}</strong>
        <small>{dataUrl ? fileName : "미등록"}</small>
      </div>
      <input
        ref={inputRef}
        className="company-branding-file-input"
        type="file"
        accept={BRANDING_IMAGE_ACCEPT}
        onChange={handleFileChange}
        disabled={!editing || busy}
      />
      <FoundationActionBar
        align="start"
        size="compact"
        ariaLabel={`${asset.label} 작업`}
        actions={[
          {
            id: "select",
            label: "파일 선택",
            onClick: () => inputRef.current?.click(),
            disabled: !editing || busy,
          },
          {
            id: "upload",
            label: "업로드",
            variant: "primary",
            onClick: handleUpload,
            disabled: !editing || busy || !pendingFile,
          },
          {
            id: "download",
            label: "다운로드",
            onClick: () => downloadFoundationAttachment(attachment),
            hidden: !attachment,
            disabled: !attachment,
          },
          {
            id: "delete",
            label: "삭제",
            variant: "danger",
            onClick: handleDelete,
            hidden: !attachment,
            disabled: !editing || busy,
          },
        ]}
      />
      {pendingLabel ? <p className="company-branding-pending">선택 파일: {pendingLabel}</p> : null}
      {message ? <p className="company-branding-message">{message}</p> : null}
    </article>
  );
}

function CompanyBrandingOutputPreview({ draft, profile = {} }) {
  const primaryColor = draft.brandTheme?.primaryColor || "#1d4ed8";
  const accentColor = draft.brandTheme?.accentColor || "#0f766e";
  const fontFamily = draft.documentFont || "system-ui";
  const previewProfile = {
    ...profile,
    branding: { ...(profile.branding ?? {}), ...draft },
  };
  const footerLines = buildCompanyPrintFooterLines(previewProfile);

  return (
    <section className="company-branding-output-preview" aria-label="출력 미리보기">
      <h4>출력 미리보기</h4>
      <div className="company-branding-preview-grid">
        {["성적서 샘플", "거래명세서 샘플", "QR PDF 샘플"].map((title) => (
          <div
            key={title}
            className="company-branding-document-sample"
            style={{ "--brand-primary": primaryColor, "--brand-accent": accentColor, fontFamily }}
          >
            <header>
              {draft.logo ? <img src={draft.logo} alt="" /> : <span>LOGO</span>}
              <strong>{title}</strong>
            </header>
            <div className="company-branding-document-sample__body">
              <span>Company Master</span>
              <span>Document Output</span>
            </div>
            <footer>
              {draft.stamp ? <img src={draft.stamp} alt="" /> : <span>직인</span>}
              {draft.signature ? <img src={draft.signature} alt="" /> : <span>서명</span>}
              {footerLines.length ? (
                <div className="company-branding-document-sample__footer-lines">
                  {footerLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </div>
              ) : (
                <span className="company-branding-document-sample__footer-placeholder">문서 Footer</span>
              )}
            </footer>
          </div>
        ))}
      </div>
    </section>
  );
}

function CompanyTablePanel({ title, columns, rows, emptyMessage, onEditRow, onDeleteRow }) {
  const tableColumns = [
    ...columns,
    {
      key: "actions",
      label: "작업",
      widthHint: "actions",
      render: (row) => (
        <FoundationActionBar
          size="compact"
          align="start"
          ariaLabel={`${title} ${row.name || row.code || row.id} 작업`}
          actions={[
            { id: "edit", label: "수정", onClick: () => onEditRow?.(row) },
            { id: "delete", label: "삭제", variant: "danger", onClick: () => onDeleteRow?.(row) },
          ]}
        />
      ),
    },
  ];

  return (
    <section className="company-master-panel" aria-label={title}>
      <h3 className="company-master-panel__title">{title}</h3>
      <TitanDataTable
        columns={tableColumns}
        rows={rows}
        getRowId={(row) => row.id}
        layout="compact"
        emptyMessage={emptyMessage}
        ariaLabel={`${title} 목록`}
      />
    </section>
  );
}
