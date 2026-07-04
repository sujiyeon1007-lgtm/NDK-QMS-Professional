import { useMemo } from "react";

import {
  MODULE_UI_SECTIONS,
  TITAN_MODULE_REGISTRY,
} from "../../config/titanV12ModuleExpansion";
import { useTitanModuleFlags } from "../../hooks/useTitanModuleFlags";

function TitanModuleSwitch({ checked, disabled, onChange, label }) {
  return (
    <label className={`titan-module-switch${disabled ? " is-disabled" : ""}`}>
      <span className="titan-module-switch__label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={`titan-module-switch__track${checked ? " is-on" : ""}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span className="titan-module-switch__knob" />
      </button>
      <span className="titan-module-switch__state">{checked ? "ON" : "OFF"}</span>
    </label>
  );
}

export default function ModuleManagementSection() {
  const { flags, updateModuleFlag } = useTitanModuleFlags();

  const sections = useMemo(
    () =>
      MODULE_UI_SECTIONS.map((section) => ({
        ...section,
        modules: section.moduleIds
          .map((id) => TITAN_MODULE_REGISTRY[id])
          .filter(Boolean),
      })),
    []
  );

  return (
    <section className="environment-content-panel titan-card titan-module-management">
      <div className="environment-content-head">
        <div>
          <h3>모듈 관리</h3>
          <p>
            모듈 OFF 시 Sidebar · HOME · 라우트 접근이 숨겨집니다. 데이터는 삭제하지 않으며, 다시
            ON하면 기존 데이터를 그대로 사용할 수 있습니다.
          </p>
        </div>
      </div>

      {sections.map((section) => (
        <div
          key={section.id}
          className={`titan-module-management__section${section.dividerBefore ? " titan-module-management__section--divider" : ""}`}
        >
          {section.label ? (
            <h4 className="titan-module-management__section-title">{section.label}</h4>
          ) : null}
          <ul className="titan-module-management__list">
            {section.modules.map((mod) => {
              const enabled = flags[mod.id] ?? mod.defaultEnabled;
              return (
                <li key={mod.id}>
                  <TitanModuleSwitch
                    label={mod.label}
                    checked={enabled}
                    disabled={!mod.toggleable}
                    onChange={(next) => updateModuleFlag(mod.id, next)}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
