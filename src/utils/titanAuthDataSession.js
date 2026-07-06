/**
 * Project TITAN V1.0 — Auth data (SessionStorage · SQLite schema mirror)
 *
 * Tables: users · roles · permissions · role_permissions · user_roles · login_history
 */

import {
  TITAN_DEFAULT_ADMIN,
  TITAN_FEATURE_PERMISSIONS,
  TITAN_LOGIN_LOCK_POLICY,
  TITAN_LOGIN_STORAGE,
  TITAN_MENU_PERMISSIONS,
  createDefaultFeaturePermissionMap,
  createDefaultMenuPermissionMap,
  createFullFeaturePermissionMap,
  createFullMenuPermissionMap,
} from "../config/titanLoginSystem";

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** V1 Session hash — SQLite 연동 시 bcrypt 등으로 교체 */
export function hashPassword(password, loginId = "") {
  const raw = `${String(loginId).trim()}::${String(password)}::titan-auth-v1`;
  try {
    return btoa(unescape(encodeURIComponent(raw)));
  } catch {
    return raw;
  }
}

function verifyPassword(password, loginId, passwordHash) {
  if (!passwordHash) return false;
  return hashPassword(password, loginId) === passwordHash;
}

function buildSeedRoles() {
  const fullMenu = createFullMenuPermissionMap();
  const fullFeature = createFullFeaturePermissionMap();
  const viewOnlyMenu = createDefaultMenuPermissionMap(false);
  viewOnlyMenu.home = true;
  viewOnlyMenu.qrManagement = true;
  const viewOnlyFeature = createDefaultFeaturePermissionMap(false);
  viewOnlyFeature.view = true;
  viewOnlyFeature.print = true;

  return [
    {
      id: TITAN_DEFAULT_ADMIN.roleId,
      name: "Program Administrator",
      label: "Program Administrator",
      isSystem: true,
      menuPermissions: { ...fullMenu },
      featurePermissions: { ...fullFeature },
    },
    {
      id: "ROLE_CEO",
      name: "대표이사",
      label: "대표이사",
      isSystem: false,
      menuPermissions: { ...fullMenu },
      featurePermissions: { ...fullFeature },
    },
    {
      id: "ROLE_QUALITY",
      name: "품질관리",
      label: "품질관리",
      isSystem: false,
      menuPermissions: {
        ...createDefaultMenuPermissionMap(false),
        home: true,
        masterData: true,
        inbound: true,
        production: true,
        inspection: true,
        certificate: true,
        documents: true,
        statistics: true,
        qrManagement: true,
      },
      featurePermissions: {
        ...createDefaultFeaturePermissionMap(false),
        view: true,
        register: true,
        edit: true,
        pdf: true,
        print: true,
        approve: true,
        qrCreate: true,
      },
    },
    {
      id: "ROLE_PRODUCTION",
      name: "열처리관리",
      label: "열처리관리",
      isSystem: false,
      menuPermissions: {
        ...createDefaultMenuPermissionMap(false),
        home: true,
        inbound: true,
        production: true,
        outbound: true,
        qrManagement: true,
      },
      featurePermissions: {
        ...createDefaultFeaturePermissionMap(false),
        view: true,
        register: true,
        edit: true,
        print: true,
        qrCreate: true,
      },
    },
    {
      id: "ROLE_ACCOUNTING_CLERK",
      name: "경리",
      label: "경리",
      isSystem: false,
      menuPermissions: {
        ...createDefaultMenuPermissionMap(false),
        home: true,
        outbound: true,
        accountingClerk: true,
        statistics: true,
      },
      featurePermissions: {
        ...createDefaultFeaturePermissionMap(false),
        view: true,
        register: true,
        print: true,
      },
    },
    {
      id: "ROLE_SALES",
      name: "영업",
      label: "영업",
      isSystem: false,
      menuPermissions: {
        ...createDefaultMenuPermissionMap(false),
        home: true,
        inbound: true,
        outbound: true,
        statistics: true,
      },
      featurePermissions: {
        ...createDefaultFeaturePermissionMap(false),
        view: true,
        print: true,
      },
    },
    {
      id: "ROLE_VIEWER",
      name: "조회전용",
      label: "조회전용",
      isSystem: false,
      menuPermissions: viewOnlyMenu,
      featurePermissions: viewOnlyFeature,
    },
  ];
}

function buildSeedUsers() {
  const adminId = "USR-ADMIN-001";
  return {
    users: [
      {
        id: adminId,
        loginId: TITAN_DEFAULT_ADMIN.loginId,
        name: TITAN_DEFAULT_ADMIN.name,
        department: TITAN_DEFAULT_ADMIN.department,
        rank: TITAN_DEFAULT_ADMIN.rank,
        active: true,
        mustChangePassword: true,
        passwordHash: hashPassword(TITAN_DEFAULT_ADMIN.defaultPassword, TITAN_DEFAULT_ADMIN.loginId),
        createdAt: new Date().toISOString(),
      },
    ],
    roles: buildSeedRoles(),
    userRoles: [{ userId: adminId, roleId: TITAN_DEFAULT_ADMIN.roleId }],
    loginHistory: [],
    lockouts: {},
  };
}

function migrateRoles(roles = []) {
  const seedById = Object.fromEntries(buildSeedRoles().map((role) => [role.id, role]));

  return roles.map((role) => {
    const seed = seedById[role.id];
    /** @type {Record<string, boolean>} */
    const menuPermissions = {
      ...createDefaultMenuPermissionMap(false),
      ...(seed?.menuPermissions ?? {}),
      ...(role.menuPermissions ?? {}),
    };
    /** @type {Record<string, boolean>} */
    const featurePermissions = {
      ...createDefaultFeaturePermissionMap(false),
      ...(seed?.featurePermissions ?? {}),
      ...(role.featurePermissions ?? {}),
    };

    TITAN_MENU_PERMISSIONS.forEach((item) => {
      if (menuPermissions[item.key] === undefined) {
        menuPermissions[item.key] = Boolean(seed?.menuPermissions?.[item.key]);
      }
    });
    TITAN_FEATURE_PERMISSIONS.forEach((item) => {
      if (featurePermissions[item.key] === undefined) {
        featurePermissions[item.key] = Boolean(seed?.featurePermissions?.[item.key]);
      }
    });

    if (role.id === TITAN_DEFAULT_ADMIN.roleId) {
      TITAN_MENU_PERMISSIONS.forEach((item) => {
        menuPermissions[item.key] = true;
      });
      TITAN_FEATURE_PERMISSIONS.forEach((item) => {
        featurePermissions[item.key] = true;
      });
    }

    return { ...role, menuPermissions, featurePermissions };
  });
}

function normalizeAuthData(raw = {}) {
  const seed = buildSeedUsers();
  const users = Array.isArray(raw.users) && raw.users.length > 0 ? raw.users : seed.users;
  const roles = migrateRoles(Array.isArray(raw.roles) && raw.roles.length > 0 ? raw.roles : seed.roles);
  return {
    users,
    roles,
    userRoles: Array.isArray(raw.userRoles) ? raw.userRoles : seed.userRoles,
    loginHistory: Array.isArray(raw.loginHistory) ? raw.loginHistory : [],
    lockouts: raw.lockouts && typeof raw.lockouts === "object" ? raw.lockouts : {},
  };
}

function loadAuthData() {
  try {
    const stored = localStorage.getItem(TITAN_LOGIN_STORAGE.authData);
    const normalized = normalizeAuthData(stored ? JSON.parse(stored) : {});
    localStorage.setItem(TITAN_LOGIN_STORAGE.authData, JSON.stringify(normalized));
    return normalized;
  } catch {
    const normalized = normalizeAuthData();
    localStorage.setItem(TITAN_LOGIN_STORAGE.authData, JSON.stringify(normalized));
    return normalized;
  }
}

let authData = loadAuthData();

function persistAuthData() {
  try {
    localStorage.setItem(TITAN_LOGIN_STORAGE.authData, JSON.stringify(authData));
    window.dispatchEvent(new CustomEvent(TITAN_LOGIN_STORAGE.authChanged, { detail: authData }));
  } catch {
    /* quota */
  }
}

export function getAuthData() {
  authData = normalizeAuthData(authData);
  return authData;
}

export function getAuthUsers() {
  return getAuthData().users;
}

export function getAuthRoles() {
  return getAuthData().roles;
}

export function getUserByLoginId(loginId) {
  const id = String(loginId ?? "").trim().toLowerCase();
  return getAuthUsers().find((user) => String(user.loginId).trim().toLowerCase() === id) ?? null;
}

export function getUserById(userId) {
  return getAuthUsers().find((user) => user.id === userId) ?? null;
}

export function getUserRoleIds(userId) {
  return getAuthData()
    .userRoles.filter((row) => row.userId === userId)
    .map((row) => row.roleId);
}

export function getUserRoles(userId) {
  const roleIds = new Set(getUserRoleIds(userId));
  return getAuthRoles().filter((role) => roleIds.has(role.id));
}

export function isProgramAdministrator(userId) {
  return getUserRoleIds(userId).includes(TITAN_DEFAULT_ADMIN.roleId);
}

function appendLoginHistory(entry) {
  const log = {
    id: createId("LH"),
    loginAt: new Date().toISOString(),
    logoutAt: null,
    ip: entry.ip ?? "—",
    success: Boolean(entry.success),
    failReason: entry.failReason ?? "",
    userId: entry.userId ?? null,
    loginId: entry.loginId ?? "",
    userName: entry.userName ?? "",
  };
  authData = {
    ...getAuthData(),
    loginHistory: [log, ...getAuthData().loginHistory].slice(0, 500),
  };
  persistAuthData();
  return log;
}

function getLockout(loginId) {
  const key = String(loginId ?? "").trim().toLowerCase();
  return getAuthData().lockouts[key] ?? { failures: 0, lockedUntil: null };
}

function setLockout(loginId, patch) {
  const key = String(loginId ?? "").trim().toLowerCase();
  authData = {
    ...getAuthData(),
    lockouts: {
      ...getAuthData().lockouts,
      [key]: { ...getLockout(loginId), ...patch },
    },
  };
  persistAuthData();
}

export function getLoginLockStatus(loginId) {
  const lock = getLockout(loginId);
  if (!lock.lockedUntil) return { locked: false, remainingMs: 0, failures: lock.failures ?? 0 };
  const until = new Date(lock.lockedUntil).getTime();
  const now = Date.now();
  if (now >= until) {
    setLockout(loginId, { failures: 0, lockedUntil: null });
    return { locked: false, remainingMs: 0, failures: 0 };
  }
  return { locked: true, remainingMs: until - now, failures: lock.failures ?? TITAN_LOGIN_LOCK_POLICY.maxFailures };
}

export function authenticateUser(loginId, password) {
  const normalizedId = String(loginId ?? "").trim();
  const lockStatus = getLoginLockStatus(normalizedId);
  if (lockStatus.locked) {
    const minutes = Math.ceil(lockStatus.remainingMs / 60000);
    appendLoginHistory({
      loginId: normalizedId,
      success: false,
      failReason: `계정 잠금 (${minutes}분)`,
    });
    return { ok: false, code: "LOCKED", message: `로그인 5회 실패로 ${minutes}분간 잠금되었습니다.` };
  }

  const user = getUserByLoginId(normalizedId);
  if (!user || user.active === false) {
    const failures = (getLockout(normalizedId).failures ?? 0) + 1;
    const next = { failures };
    if (failures >= TITAN_LOGIN_LOCK_POLICY.maxFailures) {
      next.lockedUntil = new Date(
        Date.now() + TITAN_LOGIN_LOCK_POLICY.lockMinutes * 60 * 1000
      ).toISOString();
      appendLoginHistory({
        loginId: normalizedId,
        success: false,
        failReason: "5회 실패 잠금",
      });
      setLockout(normalizedId, next);
      return {
        ok: false,
        code: "LOCKED",
        message: `로그인 5회 실패로 ${TITAN_LOGIN_LOCK_POLICY.lockMinutes}분간 잠금되었습니다.`,
      };
    }
    setLockout(normalizedId, next);
    appendLoginHistory({
      loginId: normalizedId,
      success: false,
      failReason: "아이디 또는 비밀번호 불일치",
    });
    return { ok: false, code: "INVALID", message: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  if (!verifyPassword(password, user.loginId, user.passwordHash)) {
    const failures = (getLockout(normalizedId).failures ?? 0) + 1;
    const next = { failures };
    if (failures >= TITAN_LOGIN_LOCK_POLICY.maxFailures) {
      next.lockedUntil = new Date(
        Date.now() + TITAN_LOGIN_LOCK_POLICY.lockMinutes * 60 * 1000
      ).toISOString();
      appendLoginHistory({
        loginId: normalizedId,
        userId: user.id,
        userName: user.name,
        success: false,
        failReason: "5회 실패 잠금",
      });
      setLockout(normalizedId, next);
      return {
        ok: false,
        code: "LOCKED",
        message: `로그인 5회 실패로 ${TITAN_LOGIN_LOCK_POLICY.lockMinutes}분간 잠금되었습니다.`,
      };
    }
    setLockout(normalizedId, next);
    appendLoginHistory({
      loginId: normalizedId,
      userId: user.id,
      userName: user.name,
      success: false,
      failReason: "비밀번호 불일치",
    });
    return { ok: false, code: "INVALID", message: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  setLockout(normalizedId, { failures: 0, lockedUntil: null });
  const historyEntry = appendLoginHistory({
    loginId: normalizedId,
    userId: user.id,
    userName: user.name,
    success: true,
  });

  const roles = getUserRoles(user.id);
  return {
    ok: true,
    user,
    roles,
    historyId: historyEntry.id,
    mustChangePassword: Boolean(user.mustChangePassword),
  };
}

export function changeUserPassword(userId, nextPassword) {
  const user = getUserById(userId);
  if (!user) return { ok: false, message: "사용자를 찾을 수 없습니다." };
  authData = {
    ...getAuthData(),
    users: getAuthUsers().map((row) =>
      row.id === userId
        ? {
            ...row,
            passwordHash: hashPassword(nextPassword, row.loginId),
            mustChangePassword: false,
          }
        : row
    ),
  };
  persistAuthData();
  return { ok: true };
}

export function resetUserPasswordToDefault(userId) {
  const user = getUserById(userId);
  if (!user) return { ok: false, message: "사용자를 찾을 수 없습니다." };
  authData = {
    ...getAuthData(),
    users: getAuthUsers().map((row) =>
      row.id === userId
        ? {
            ...row,
            passwordHash: hashPassword(TITAN_DEFAULT_ADMIN.defaultPassword, row.loginId),
            mustChangePassword: true,
          }
        : row
    ),
  };
  persistAuthData();
  return { ok: true, message: `비밀번호가 ${TITAN_DEFAULT_ADMIN.defaultPassword}(으)로 초기화되었습니다.` };
}

export function createAuthUser(payload) {
  const loginId = String(payload.loginId ?? "").trim();
  if (!loginId) return { ok: false, message: "아이디를 입력하세요." };
  if (getUserByLoginId(loginId)) return { ok: false, message: "이미 사용 중인 아이디입니다." };

  const user = {
    id: createId("USR"),
    loginId,
    name: String(payload.name ?? "").trim() || loginId,
    department: String(payload.department ?? "").trim(),
    rank: String(payload.rank ?? "사원").trim() || "사원",
    active: payload.active !== false,
    mustChangePassword: true,
    passwordHash: hashPassword(payload.password || TITAN_DEFAULT_ADMIN.defaultPassword, loginId),
    createdAt: new Date().toISOString(),
  };

  const roleIds = Array.isArray(payload.roleIds) ? payload.roleIds : [];
  authData = {
    ...getAuthData(),
    users: [user, ...getAuthUsers()],
    userRoles: [
      ...roleIds.map((roleId) => ({ userId: user.id, roleId })),
      ...getAuthData().userRoles,
    ],
  };
  persistAuthData();
  return { ok: true, user };
}

export function updateAuthUser(userId, patch) {
  authData = {
    ...getAuthData(),
    users: getAuthUsers().map((row) => (row.id === userId ? { ...row, ...patch, id: row.id } : row)),
  };
  persistAuthData();
  return getUserById(userId);
}

export function deleteAuthUser(userId) {
  if (userId === getAuthUsers().find((u) => u.loginId === TITAN_DEFAULT_ADMIN.loginId)?.id) {
    return { ok: false, message: "기본 관리자 계정은 삭제할 수 없습니다." };
  }
  authData = {
    ...getAuthData(),
    users: getAuthUsers().filter((row) => row.id !== userId),
    userRoles: getAuthData().userRoles.filter((row) => row.userId !== userId),
  };
  persistAuthData();
  return { ok: true };
}

export function setUserRoles(userId, roleIds = []) {
  authData = {
    ...getAuthData(),
    userRoles: [
      ...getAuthData().userRoles.filter((row) => row.userId !== userId),
      ...roleIds.map((roleId) => ({ userId, roleId })),
    ],
  };
  persistAuthData();
}

export function createAuthRole(payload) {
  const name = String(payload.name ?? "").trim();
  if (!name) return { ok: false, message: "권한명을 입력하세요." };
  const role = {
    id: createId("ROLE"),
    name,
    label: name,
    isSystem: false,
    menuPermissions: payload.menuPermissions ?? createDefaultMenuPermissionMap(false),
    featurePermissions: payload.featurePermissions ?? createDefaultFeaturePermissionMap(false),
  };
  authData = { ...getAuthData(), roles: [...getAuthRoles(), role] };
  persistAuthData();
  return { ok: true, role };
}

export function updateAuthRole(roleId, patch) {
  authData = {
    ...getAuthData(),
    roles: getAuthRoles().map((row) => {
      if (row.id !== roleId) return row;
      return {
        ...row,
        ...patch,
        id: row.id,
        isSystem: row.isSystem,
        menuPermissions: patch.menuPermissions ?? row.menuPermissions,
        featurePermissions: patch.featurePermissions ?? row.featurePermissions,
      };
    }),
  };
  persistAuthData();
  return getAuthRoles().find((row) => row.id === roleId) ?? null;
}

export function deleteAuthRole(roleId) {
  const role = getAuthRoles().find((row) => row.id === roleId);
  if (!role) return { ok: false, message: "권한을 찾을 수 없습니다." };
  if (role.isSystem) return { ok: false, message: "시스템 권한은 삭제할 수 없습니다." };
  authData = {
    ...getAuthData(),
    roles: getAuthRoles().filter((row) => row.id !== roleId),
    userRoles: getAuthData().userRoles.filter((row) => row.roleId !== roleId),
  };
  persistAuthData();
  return { ok: true };
}

export function getLoginHistory() {
  return getAuthData().loginHistory;
}

export function recordLogout(historyId) {
  if (!historyId) return;
  authData = {
    ...getAuthData(),
    loginHistory: getLoginHistory().map((row) =>
      row.id === historyId && !row.logoutAt
        ? { ...row, logoutAt: new Date().toISOString() }
        : row
    ),
  };
  persistAuthData();
}

export function resolveUserMenuPermissions(userId) {
  const roles = getUserRoles(userId);
  /** @type {Record<string, boolean>} */
  const merged = {};
  TITAN_MENU_PERMISSIONS.forEach((item) => {
    merged[item.key] = roles.some((role) => role.menuPermissions?.[item.key]);
  });
  return merged;
}

export function resolveUserFeaturePermissions(userId) {
  const roles = getUserRoles(userId);
  /** @type {Record<string, boolean>} */
  const merged = {};
  TITAN_FEATURE_PERMISSIONS.forEach((item) => {
    merged[item.key] = roles.some((role) => role.featurePermissions?.[item.key]);
  });
  return merged;
}

export function hasMenuPermission(userId, permissionKey) {
  if (isProgramAdministrator(userId)) return true;
  return Boolean(resolveUserMenuPermissions(userId)[permissionKey]);
}

export function hasFeaturePermission(userId, permissionKey) {
  if (isProgramAdministrator(userId)) return true;
  return Boolean(resolveUserFeaturePermissions(userId)[permissionKey]);
}

export function getUserPermissionOverride(userId, permissionKey) {
  const user = getUserById(userId);
  if (!user?.permissionOverrides || !(permissionKey in user.permissionOverrides)) return null;
  return Boolean(user.permissionOverrides[permissionKey]);
}

export function setUserPermissionOverride(userId, permissionKey, allowed) {
  const user = getUserById(userId);
  if (!user) return { ok: false, message: "사용자를 찾을 수 없습니다." };
  updateAuthUser(userId, {
    permissionOverrides: {
      ...(user.permissionOverrides ?? {}),
      [permissionKey]: Boolean(allowed),
    },
  });
  return { ok: true };
}

/** QR 생성 — 사용자 개별 override 우선 · 없으면 역할 qrCreate */
export function hasQrCreatePermission(userId) {
  if (!userId) return false;
  if (isProgramAdministrator(userId)) return true;
  const override = getUserPermissionOverride(userId, "qrCreate");
  if (override !== null) return override;
  return hasFeaturePermission(userId, "qrCreate");
}

export { TITAN_MENU_PERMISSIONS, TITAN_FEATURE_PERMISSIONS };
