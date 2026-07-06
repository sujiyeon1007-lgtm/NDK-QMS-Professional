/**
 * Project TITAN V1.3 — 검사등록 화면 라우팅 (검사리포트 작성)
 */

/**
 * @param {{ managementId?: string, category?: string, devId?: string, otherId?: string }} [options]
 */
export function buildInspectionRegisterPath(options = {}) {
  const params = new URLSearchParams();
  const managementId = String(options.managementId ?? "").trim();
  const category = String(options.category ?? "").trim();
  const devId = String(options.devId ?? "").trim();
  const otherId = String(options.otherId ?? "").trim();

  if (managementId && managementId !== "—") params.set("managementId", managementId);
  if (category) params.set("category", category);
  if (devId) params.set("devId", devId);
  if (otherId) params.set("otherId", otherId);

  const query = params.toString();
  return `/quality/inspection/register${query ? `?${query}` : ""}`;
}

/**
 * @param {import("react-router-dom").NavigateFunction} navigate
 * @param {{ managementId?: string, category?: string, devId?: string, otherId?: string }} [options]
 * @returns {boolean}
 */
export function navigateToInspectionRegister(navigate, options = {}) {
  if (typeof navigate !== "function") return false;
  navigate(buildInspectionRegisterPath(options));
  return true;
}

/** @param {object | null | undefined} row */
export function isMassInspectionRegisterEligible(row) {
  const managementId = String(row?.managementId ?? row?.record?.id ?? "").trim();
  if (!managementId || managementId === "—") return false;
  return !row?.logId;
}
