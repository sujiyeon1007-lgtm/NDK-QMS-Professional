/**
 * Project TITAN V1.0 — Auth runtime session (로그인 상태 · 아이디 저장)
 * 비밀번호는 세션에 저장하지 않음
 */

import { TITAN_LOGIN_STORAGE } from "../config/titanLoginSystem";
import {
  getUserById,
  getUserRoles,
  isProgramAdministrator,
  recordLogout,
} from "./titanAuthDataSession";

export { TITAN_LOGIN_STORAGE };

export function getRememberedLoginId() {
  try {
    return localStorage.getItem(TITAN_LOGIN_STORAGE.rememberLoginId) ?? "";
  } catch {
    return "";
  }
}

export function setRememberLoginId(loginId, remember) {
  try {
    if (remember && loginId) {
      localStorage.setItem(TITAN_LOGIN_STORAGE.rememberLoginId, String(loginId).trim());
    } else {
      localStorage.removeItem(TITAN_LOGIN_STORAGE.rememberLoginId);
    }
  } catch {
    /* ignore */
  }
}

export function getAuthSession() {
  try {
    const raw = sessionStorage.getItem(TITAN_LOGIN_STORAGE.authSession);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  const session = getAuthSession();
  if (!session?.userId) return false;
  if (getUserById(session.userId)) return true;
  // Operational reset may clear users[] while session remains — keep workspace access for empty-state setup.
  return Boolean(String(session.loginId ?? "").trim());
}

export function saveAuthSession(payload) {
  const session = {
    userId: payload.userId,
    loginId: payload.loginId,
    name: payload.name,
    department: payload.department ?? "",
    rank: payload.rank ?? "",
    roleLabels: payload.roleLabels ?? [],
    isProgramAdministrator: Boolean(payload.isProgramAdministrator),
    historyId: payload.historyId ?? null,
    loginAt: payload.loginAt ?? new Date().toISOString(),
  };
  sessionStorage.setItem(TITAN_LOGIN_STORAGE.authSession, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent(TITAN_LOGIN_STORAGE.authChanged, { detail: session }));
  return session;
}

export function clearAuthSession() {
  const session = getAuthSession();
  if (session?.historyId) {
    recordLogout(session.historyId);
  }
  sessionStorage.removeItem(TITAN_LOGIN_STORAGE.authSession);
  window.dispatchEvent(new CustomEvent(TITAN_LOGIN_STORAGE.authChanged, { detail: null }));
}

export function buildAuthSessionFromUser(user, historyId) {
  const roles = getUserRoles(user.id);
  return saveAuthSession({
    userId: user.id,
    loginId: user.loginId,
    name: user.name,
    department: user.department,
    rank: user.rank,
    roleLabels: roles.map((role) => role.label),
    isProgramAdministrator: isProgramAdministrator(user.id),
    historyId,
  });
}

export function getAuthDisplayUser() {
  const session = getAuthSession();
  if (!session) {
    return {
      name: "사용자",
      department: "—",
      rank: "",
      isProgramAdministrator: false,
      roleLabels: [],
    };
  }
  return {
    name: session.name,
    department: session.department,
    rank: session.rank,
    isProgramAdministrator: session.isProgramAdministrator,
    roleLabels: session.roleLabels ?? [],
  };
}

export function getAuthUserLabelForAudit() {
  const session = getAuthSession();
  if (!session) return "—";
  if (session.isProgramAdministrator) return session.name;
  const rank = session.rank ? ` ${session.rank}` : "";
  return `${session.department} / ${session.name}${rank}`.trim();
}
