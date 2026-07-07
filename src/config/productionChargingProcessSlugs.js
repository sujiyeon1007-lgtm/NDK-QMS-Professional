/**
 * Project TITAN V1.5 — 설비 장입관리 공정 라우트 Slug
 * 생산관리 Launcher → 설비 장입 Hub → 공정별 설비 목록
 */

/** @type {Record<string, string>} slug → 공정명 */
export const PRODUCTION_CHARGING_PROCESS_SLUGS = {
  "ion-nitriding": "이온질화",
  "gas-nitriding": "가스질화",
  "gas-softening": "가스연질화",
};

/** Hub 카드용 공정 목록 (PM 승인 3공정) */
export const PRODUCTION_CHARGING_HUB_PROCESSES = [
  { slug: "ion-nitriding", label: "이온질화" },
  { slug: "gas-nitriding", label: "가스질화" },
  { slug: "gas-softening", label: "가스연질화" },
];

export function resolveProductionChargingProcessSlug(slug) {
  return PRODUCTION_CHARGING_PROCESS_SLUGS[String(slug ?? "").trim()] ?? null;
}

export function getProductionChargingProcessSlug(processName) {
  const target = String(processName ?? "").trim();
  return (
    Object.entries(PRODUCTION_CHARGING_PROCESS_SLUGS).find(([, name]) => name === target)?.[0] ??
    null
  );
}
