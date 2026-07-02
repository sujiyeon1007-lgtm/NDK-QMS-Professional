import { useEffect, useState } from "react";
import { PrimaryButton } from "./Button";
import {
  MES_REPOSITORY_ADAPTER,
  TITAN_EDITION,
  getOnHoldEditions,
  getSelectableEditions,
} from "../../config/titanEditionArchitecture";
import { TITAN_PLATFORM_VISION } from "../../config/titanPlatformArchitecture";
import { V1_0_EDITION_LOCK } from "../../config/titanV1DevelopmentDirection";
import { setTitanEdition } from "../../utils/titanEditionSession";
import "./TitanEditionBootModal.css";

export default function TitanEditionBootModal({ onComplete }) {
  const [editionId, setEditionId] = useState(V1_0_EDITION_LOCK);
  const [mesAdapter, setMesAdapter] = useState(MES_REPOSITORY_ADAPTER.ORACLE);

  useEffect(() => {
    document.body.classList.add("titan-edition-boot-open");
    return () => document.body.classList.remove("titan-edition-boot-open");
  }, []);

  const handleStart = () => {
    setTitanEdition(editionId, { mesAdapter });
    onComplete?.();
  };

  const selectableEditions = getSelectableEditions();
  const onHoldEditions = getOnHoldEditions();

  return (
    <div className="titan-edition-boot" role="dialog" aria-modal="true" aria-labelledby="titan-edition-boot-title">
      <div className="titan-edition-boot__card">
        <h2 id="titan-edition-boot-title">Project TITAN</h2>
        <p className="titan-edition-boot__desc">
          {TITAN_PLATFORM_VISION.tagline} · V1.0 Quality Edition (QMS Only)
        </p>

        <fieldset className="titan-edition-boot__options">
          <legend className="sr-only">실행 Edition</legend>
          {selectableEditions.map((edition) => (
            <label key={edition.id} className="titan-edition-boot__option">
              <input
                type="radio"
                name="titan-edition"
                value={edition.id}
                checked={editionId === edition.id}
                onChange={() => setEditionId(edition.id)}
              />
              <span>
                <strong>{edition.labelKo}</strong>
                <small>{edition.subtitle ?? edition.label}</small>
                <em>{edition.description}</em>
              </span>
            </label>
          ))}
          {onHoldEditions.map((edition) => (
            <label key={edition.id} className="titan-edition-boot__option titan-edition-boot__option--disabled">
              <input type="radio" name="titan-edition" value={edition.id} disabled />
              <span>
                <strong>{edition.labelKo}</strong>
                <small>{edition.subtitle ?? edition.label}</small>
                <em>{edition.onHoldReason ?? "MES PoC 이후 제공 예정"}</em>
              </span>
            </label>
          ))}
        </fieldset>

        {editionId === TITAN_EDITION.MES_CONNECTED ? (
          <label className="titan-edition-boot__adapter">
            <span>MES Repository</span>
            <select value={mesAdapter} onChange={(e) => setMesAdapter(e.target.value)} disabled>
              <option value={MES_REPOSITORY_ADAPTER.ORACLE}>Oracle (Read Only) — PoC 이후</option>
              <option value={MES_REPOSITORY_ADAPTER.API}>API (V1.1)</option>
              <option value={MES_REPOSITORY_ADAPTER.CSV}>CSV Import (V1.1)</option>
            </select>
          </label>
        ) : null}

        <p className="titan-edition-boot__future">Enterprise Edition (확장형) — Smart Factory · Future</p>

        <PrimaryButton type="button" className="titan-edition-boot__start" onClick={handleStart}>
          시작
        </PrimaryButton>
      </div>
    </div>
  );
}
