import NdkLogo from "../../components/common/NdkLogo";

import "./Login.css";

export default function LoginLoadingScreen() {
  return (
    <div className="titan-login-loading" role="status" aria-live="polite" aria-label="로그인 중">
      <div className="titan-login-loading__panel">
        <NdkLogo className="ndk-logo--login-loading" alt="" aria-hidden="true" />
        <p className="titan-login-loading__title">Project TITAN</p>
        <div className="titan-login-loading__spinner" aria-hidden="true" />
        <p className="titan-login-loading__message">시스템에 접속하는 중입니다…</p>
      </div>
    </div>
  );
}
