import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import { ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Database, FileText, Folder, Globe, Settings, Shield } from "lucide-react";

import NdkLogo from "../../components/common/NdkLogo";
import {
  TITAN_LOGIN_BRAND_BOTTOM_TAGLINE,
  TITAN_LOGIN_BRAND_MODULES,
  TITAN_LOGIN_BRAND_SLOGAN_LINES,
  TITAN_LOGIN_BRAND_SUBTITLE,
  TITAN_LOGIN_COPYRIGHT,
  TITAN_LOGIN_FOOTER_BUILD,
  TITAN_LOGIN_FOOTER_PRODUCT,
  TITAN_LOGIN_FOOTER_TRUST,
  TITAN_LOGIN_FOOTER_VERSION_LINE,
  TITAN_LOGIN_FORM_PRODUCT,
  TITAN_LOGIN_TRANSITION_MS,
} from "../../config/titanLoginSystem";
import { authenticateUser } from "../../utils/titanAuthDataSession";
import {
  buildAuthSessionFromUser,
  getRememberedLoginId,
  isAuthenticated,
  setRememberLoginId,
} from "../../utils/titanAuthSession";
import FirstLoginPasswordModal from "./FirstLoginPasswordModal";
import LoginLoadingScreen from "./LoginLoadingScreen";
import { titanLoginTheme } from "./loginTheme";

import "./Login.css";

const LOGIN_ICON_MAP = {
  shield: Shield,
  settings: Settings,
  fileText: FileText,
  folder: Folder,
  database: Database,
  globe: Globe,
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? "/home";

  const [loginId, setLoginId] = useState(() => getRememberedLoginId());
  const [password, setPassword] = useState("");
  const [rememberId, setRememberId] = useState(() => Boolean(getRememberedLoginId()));
  const [error, setError] = useState("");
  const [pendingUser, setPendingUser] = useState(null);
  const [pendingHistoryId, setPendingHistoryId] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setPassword("");
  }, []);

  useEffect(() => {
    if (!isTransitioning) return undefined;

    const timer = window.setTimeout(() => {
      navigate(from, { replace: true });
    }, TITAN_LOGIN_TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [isTransitioning, from, navigate]);

  if (isAuthenticated() && !pendingUser && !isTransitioning) {
    return <Navigate to={from} replace />;
  }

  if (isTransitioning) {
    return <LoginLoadingScreen />;
  }

  const finishLogin = (user, historyId) => {
    buildAuthSessionFromUser(user, historyId);
    setRememberLoginId(loginId, rememberId);
    setPassword("");
    setPendingUser(null);
    setPendingHistoryId(null);
    setIsTransitioning(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const result = authenticateUser(loginId, password);
    if (!result.ok) {
      setError(result.message ?? "로그인에 실패했습니다.");
      setPassword("");
      return;
    }

    if (result.mustChangePassword) {
      setPendingUser(result.user);
      setPendingHistoryId(result.historyId);
      setPassword("");
      return;
    }

    finishLogin(result.user, result.historyId);
  };

  return (
    <div className="titan-login-page">
      <div className="titan-login-shell">
        <aside className="titan-login-brand-panel" aria-label="NDK 브랜드">
          <div className="titan-login-brand-panel__wave" aria-hidden="true" />
          <div className="titan-login-brand-panel__content">
            <NdkLogo className="ndk-logo--login" />
            <p className="titan-login-brand-panel__subtitle">{TITAN_LOGIN_BRAND_SUBTITLE}</p>

            <ul className="titan-login-brand-panel__modules" aria-label="통합 모듈">
              {TITAN_LOGIN_BRAND_MODULES.map((item) => {
                const Icon = LOGIN_ICON_MAP[item.icon] ?? Shield;
                return (
                  <li key={item.label}>
                    <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
                    <span>{item.label}</span>
                  </li>
                );
              })}
            </ul>

            <div className="titan-login-brand-panel__slogan" aria-label="슬로건">
              {TITAN_LOGIN_BRAND_SLOGAN_LINES.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          </div>

          <p className="titan-login-brand-panel__tagline">{TITAN_LOGIN_BRAND_BOTTOM_TAGLINE}</p>
        </aside>

        <main className="titan-login-form-panel">
          <ThemeProvider theme={titanLoginTheme}>
            <Box className="titan-login-form-panel__inner">
              <Typography component="h1" className="titan-login-form-panel__title">
                LOGIN
              </Typography>
              <Typography className="titan-login-form-panel__product">{TITAN_LOGIN_FORM_PRODUCT}</Typography>

              <Box component="form" className="titan-login-form" onSubmit={handleSubmit} noValidate>
                <TextField
                  label="ID"
                  name="loginId"
                  value={loginId}
                  autoComplete="username"
                  onChange={(e) => setLoginId(e.target.value)}
                />

                <TextField
                  label="PASSWORD"
                  name="password"
                  type="password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberId}
                      onChange={(e) => setRememberId(e.target.checked)}
                    />
                  }
                  label="아이디 저장"
                />

                {error ? (
                  <Typography className="titan-login-error" role="alert">
                    {error}
                  </Typography>
                ) : null}

                <Button type="submit" variant="contained" color="primary" fullWidth disableRipple={false}>
                  LOGIN
                </Button>
              </Box>
            </Box>
          </ThemeProvider>
        </main>
      </div>

      <footer className="titan-login-footer">
        <div className="titan-login-footer__left">{TITAN_LOGIN_COPYRIGHT}</div>
        <div className="titan-login-footer__center" aria-label="신뢰 메시지">
          {TITAN_LOGIN_FOOTER_TRUST.map((item) => {
            const Icon = LOGIN_ICON_MAP[item.icon] ?? Shield;
            return (
              <span key={item.label} className="titan-login-footer__trust">
                <Icon size={13} strokeWidth={2.2} aria-hidden="true" />
                {item.label}
              </span>
            );
          })}
        </div>
        <div className="titan-login-footer__right">
          <span>{TITAN_LOGIN_FOOTER_PRODUCT}</span>
          <span>{TITAN_LOGIN_FOOTER_VERSION_LINE}</span>
          <span>{TITAN_LOGIN_FOOTER_BUILD}</span>
        </div>
      </footer>

      {pendingUser ? (
        <FirstLoginPasswordModal
          userId={pendingUser.id}
          onComplete={() => finishLogin(pendingUser, pendingHistoryId)}
          onSkip={() => finishLogin(pendingUser, pendingHistoryId)}
        />
      ) : null}
    </div>
  );
}
