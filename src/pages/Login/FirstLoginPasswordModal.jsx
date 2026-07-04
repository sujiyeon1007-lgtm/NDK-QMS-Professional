import { useState } from "react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import { changeUserPassword } from "../../utils/titanAuthDataSession";

import "./Login.css";

export default function FirstLoginPasswordModal({ userId, onComplete, onSkip }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleChangeNow = () => {
    if (password.length < 4) {
      setError("비밀번호는 4자 이상 입력하세요.");
      return;
    }
    if (password !== confirm) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    const result = changeUserPassword(userId, password);
    if (!result.ok) {
      setError(result.message ?? "비밀번호 변경에 실패했습니다.");
      return;
    }
    onComplete?.();
  };

  return (
    <div className="titan-login-modal" role="dialog" aria-modal="true" aria-labelledby="first-login-title">
      <div className="titan-login-modal__panel titan-card">
        <h2 id="first-login-title">비밀번호를 변경하시겠습니까?</h2>
        <p>첫 로그인입니다. 보안을 위해 비밀번호 변경을 권장합니다.</p>

        <label className="titan-login-field">
          <span>새 비밀번호</span>
          <input
            type="password"
            value={password}
            autoComplete="new-password"
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
        </label>
        <label className="titan-login-field">
          <span>새 비밀번호 확인</span>
          <input
            type="password"
            value={confirm}
            autoComplete="new-password"
            onChange={(e) => {
              setConfirm(e.target.value);
              setError("");
            }}
          />
        </label>

        {error ? <p className="titan-login-error">{error}</p> : null}

        <div className="titan-login-modal__actions">
          <PrimaryButton type="button" onClick={handleChangeNow}>
            지금 변경
          </PrimaryButton>
          <SecondaryButton type="button" onClick={onSkip}>
            나중에
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
