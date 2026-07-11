import { useMemo, useState } from "react";

import { PrimaryButton, SecondaryButton, TitanDataTable } from "../../foundation/uiKit";
import {
  addProcessWorkflowTemplate,
  createProcessWorkflowTemplateId,
  deleteProcessWorkflowTemplate,
  getProcessWorkflowTemplates,
  resetProcessWorkflowTemplates,
  saveProcessWorkflowTemplates,
  updateProcessWorkflowTemplate,
} from "../../utils/processWorkflowTemplateSession";
import { summarizeProcessWorkflowTemplate } from "../../config/processWorkflowTemplates";
import {
  addInspectionTemplate,
  createInspectionTemplateId,
  deleteInspectionTemplate,
  getInspectionTemplates,
  resetInspectionTemplates,
  saveInspectionTemplates,
  updateInspectionTemplate,
} from "../../utils/inspectionTemplateSession";
import {
  CERTIFICATE_ISSUE_POLICY_OPTIONS,
} from "../../utils/certificateIssuePolicy";
import {
  addCertificatePolicy,
  createCertificatePolicyId,
  deleteCertificatePolicy,
  getCertificatePolicies,
  resetCertificatePolicies,
  saveCertificatePolicies,
  updateCertificatePolicy,
} from "../../utils/certificatePolicySession";

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

export function ProcessTemplatesSection() {
  const [templates, setTemplates] = useState(() => getProcessWorkflowTemplates());
  const [label, setLabel] = useState("");
  const [message, setMessage] = useState("");

  const columns = useMemo(
    () => [
      { key: "label", label: "\uACF5\uC815\uC720\uD615" },
      { key: "id", label: "ID" },
      {
        key: "summary",
        label: "Workflow",
        render: (row) => summarizeProcessWorkflowTemplate(row),
      },
      {
        key: "builtIn",
        label: "\uAD6C\ubd84",
        render: (row) => (row.builtIn ? "\uAE30\ubcf8" : "\uC0AC\uc6a9\uc790"),
      },
      {
        key: "actions",
        label: "",
        render: (row) => (
          <SecondaryButton
            type="button"
            disabled={row.builtIn}
            onClick={() => {
              const result = deleteProcessWorkflowTemplate(row.id);
              if (result.ok) {
                setTemplates(result.templates);
                setMessage("\uC0AD\uc81c\ud588\uc2b5\ub2c8\ub2e4.");
              }
            }}
          >
            {"\uC0AD\uc81c"}
          </SecondaryButton>
        ),
      },
    ],
    []
  );

  const handleAdd = () => {
    const nextLabel = label.trim();
    if (!nextLabel) return;
    const result = addProcessWorkflowTemplate({
      id: createProcessWorkflowTemplateId(nextLabel),
      label: nextLabel,
      steps: [{ order: 1, processCategory: "cleaning", processDetail: "\uC138\uCCAD" }],
    });
    if (result.ok) {
      setTemplates(result.templates);
      setLabel("");
      setMessage("\uACF5\uC815\uC720\uD615\uC744 \uCD94\uAC00\ud588\uc2b5\ub2c8\ub2e4.");
    }
  };

  return (
    <SettingsPanel
      title={"\uACF5\uC815\uC720\uD615"}
      desc={"\uC81C\uD488 \u00B7 \uC785\uACE0 Workflow \uD15C\uD50C\uB9BF \uAD00\uB9AC (SessionStorage)"}
    >
      <div className="environment-form-grid">
        <label className="environment-form-field span-2">
          <span>{"\uC2E0\uADDC \uACF5\uC815\uC720\uD615"}</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={"\uC608: \uC138\uCCAD+\uC5F4\uCC98\uB9AC+\uC1FC\uD2B8"} />
        </label>
      </div>
      <div className="environment-form-actions">
        <PrimaryButton type="button" onClick={handleAdd}>{"\uCD94\uAC00"}</PrimaryButton>
        <SecondaryButton type="button" onClick={() => { setTemplates(resetProcessWorkflowTemplates()); setMessage("\uAE30\ubcf8\uac12\uc73c\ub85c \ucd08\uae30\ud654"); }}>{"\uAE30\ubcf8\uac12 \ubcf5\uc6d0"}</SecondaryButton>
      </div>
      {message ? <p className="environment-form-note">{message}</p> : null}
      <TitanDataTable columns={columns} rows={templates} getRowId={(row) => row.id} ariaLabel={"\uACF5\uC815\uC720\uD615"} />
    </SettingsPanel>
  );
}

export function InspectionTemplatesSection() {
  const [templates, setTemplates] = useState(() => getInspectionTemplates());
  const [label, setLabel] = useState("");
  const [message, setMessage] = useState("");

  const columns = useMemo(
    () => [
      { key: "label", label: "Template" },
      { key: "description", label: "\uC124\uBA85" },
      {
        key: "builtIn",
        label: "\uAD6C\ubd84",
        render: (row) => (row.builtIn ? "\uAE30\ubcf8" : "\uC0AC\uc6a9\uc790"),
      },
      {
        key: "actions",
        label: "",
        render: (row) => (
          <SecondaryButton
            type="button"
            disabled={row.builtIn}
            onClick={() => {
              const result = deleteInspectionTemplate(row.id);
              if (result.ok) {
                setTemplates(result.templates);
                setMessage("\uC0AD\uc81c\ud588\uc2b5\ub2c8\ub2e4.");
              }
            }}
          >
            {"\uC0AD\uc81c"}
          </SecondaryButton>
        ),
      },
    ],
    []
  );

  const handleAdd = () => {
    const nextLabel = label.trim();
    if (!nextLabel) return;
    const result = addInspectionTemplate({
      id: createInspectionTemplateId(nextLabel),
      label: nextLabel,
      description: "",
    });
    if (result.ok) {
      setTemplates(result.templates);
      setLabel("");
      setMessage("\uAC80\uC0AC Template\uC744 \uCD94\uAC00\ud588\uc2b5\ub2c8\ub2e4.");
    }
  };

  return (
    <SettingsPanel
      title={"\uAC80\uC0AC Template"}
      desc={"\uAC80\uC0AC \uAE30\uC900 \uD15C\uD50C\uB9BF \uAD00\uB9AC \u00B7 \uC81C\uD488\uC740 Template \uCC38\uC870"}
    >
      <div className="environment-form-grid">
        <label className="environment-form-field span-2">
          <span>{"\uC2E0\uADDC Template"}</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={"\uC608: \uC9C8\uD654 Template"} />
        </label>
      </div>
      <div className="environment-form-actions">
        <PrimaryButton type="button" onClick={handleAdd}>{"\uCD94\uAC00"}</PrimaryButton>
        <SecondaryButton type="button" onClick={() => { setTemplates(resetInspectionTemplates()); setMessage("\uAE30\ubcf8\uac12 \ubcf5\uc6d0"); }}>{"\uAE30\ubcf8\uac12 \ubcf5\uc6d0"}</SecondaryButton>
      </div>
      {message ? <p className="environment-form-note">{message}</p> : null}
      <TitanDataTable columns={columns} rows={templates} getRowId={(row) => row.id} ariaLabel={"\uAC80\uC0AC Template"} />
    </SettingsPanel>
  );
}

export function CertificatePoliciesSection() {
  const [policies, setPolicies] = useState(() => getCertificatePolicies());
  const [label, setLabel] = useState("");
  const [issuePolicy, setIssuePolicy] = useState(CERTIFICATE_ISSUE_POLICY_OPTIONS[0]?.value ?? "");
  const [message, setMessage] = useState("");

  const columns = useMemo(
    () => [
      { key: "label", label: "\uC815\uCC45\uBA85" },
      {
        key: "issuePolicy",
        label: "\uBC1C\uD589 \uC815\uCC45",
        render: (row) => row.displayLabel ?? row.label,
      },
      {
        key: "builtIn",
        label: "\uAD6C\ubd84",
        render: (row) => (row.builtIn ? "\uAE30\ubcf8" : "\uC0AC\uc6a9\uc790"),
      },
      {
        key: "actions",
        label: "",
        render: (row) => (
          <SecondaryButton
            type="button"
            disabled={row.builtIn}
            onClick={() => {
              const result = deleteCertificatePolicy(row.id);
              if (result.ok) {
                setPolicies(result.policies);
                setMessage("\uC0AD\uc81c\ud588\uc2b5\ub2c8\ub2e4.");
              }
            }}
          >
            {"\uC0AD\uc81c"}
          </SecondaryButton>
        ),
      },
    ],
    []
  );

  const handleAdd = () => {
    const nextLabel = label.trim();
    if (!nextLabel) return;
    const result = addCertificatePolicy({
      id: createCertificatePolicyId(nextLabel),
      label: nextLabel,
      issuePolicy,
    });
    if (result.ok) {
      setPolicies(result.policies);
      setLabel("");
      setMessage("\uC131\uC801\uC11C \uC815\uCC45\uC744 \uCD94\uAC00\ud588\uc2b5\ub2c8\ub2e4.");
    }
  };

  return (
    <SettingsPanel
      title={"\uC131\uC801\uC11C \uC815\uCC45"}
      desc={"\uC131\uC801\uC11C \uBC1C\uD589 \uC815\uCC45 Master \u00B7 \uC785\uACE0 \uB4F1\uB85D \uC608\uC678 Override \uC9C0\uc6d0"}
    >
      <div className="environment-form-grid">
        <label className="environment-form-field">
          <span>{"\uC815\uCC45\uBA85"}</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} />
        </label>
        <label className="environment-form-field">
          <span>{"\uBC1C\uD589 \uC815\uCC45"}</span>
          <select value={issuePolicy} onChange={(e) => setIssuePolicy(e.target.value)}>
            {CERTIFICATE_ISSUE_POLICY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="environment-form-actions">
        <PrimaryButton type="button" onClick={handleAdd}>{"\uCD94\uAC00"}</PrimaryButton>
        <SecondaryButton type="button" onClick={() => { setPolicies(resetCertificatePolicies()); setMessage("\uAE30\ubcf8\uac12 \ubcf5\uc6d0"); }}>{"\uAE30\ubcf8\uac12 \ubcf5\uc6d0"}</SecondaryButton>
      </div>
      {message ? <p className="environment-form-note">{message}</p> : null}
      <TitanDataTable columns={columns} rows={policies} getRowId={(row) => row.id} ariaLabel={"\uC131\uC801\uC11C \uC815\uCC45"} />
    </SettingsPanel>
  );
}
