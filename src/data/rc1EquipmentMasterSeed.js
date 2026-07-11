/**
 * RC1 first-install equipment Master seed - P1-MASTER-001
 * NDK operational equipment (3S / 10S / 61-67) - process linkage ION / SOFT
 */

/** sessionStorage flag - seed applied once; never re-merge after user CRUD */
export const RC1_EQUIPMENT_MASTER_SEED_FLAG = "project-titan-rc1-equipment-master-seed-v1";

export const RC1_ION_EQUIPMENT_CODES = [
  "3S-1",
  "3S-2",
  "3S-3",
  "3S-4",
  ...Array.from({ length: 10 }, (_, index) => `10S-${String(index + 1).padStart(2, "0")}`),
];

export const RC1_SOFT_EQUIPMENT_CODES = ["61", "62", "63", "64", "65", "66", "67"];

export const RC1_EQUIPMENT_MASTER_SEED_CODES = [
  ...RC1_ION_EQUIPMENT_CODES,
  ...RC1_SOFT_EQUIPMENT_CODES,
];

const ION_PROCESS_LABEL = "\uC774\uC628\uC9C8\uD654";
const SOFT_PROCESS_LABEL = "\uC5F0\uC9C8\uD654";

/**
 * @returns {Record<string, unknown>[]}
 */
export function buildRc1EquipmentMasterSeedRows() {
  const rows = [];
  let ionSeq = 1;
  const pushIon = (code) => {
    rows.push({
      id: `eq-ion-${ionSeq}`,
      code,
      name: code,
      equipType: ION_PROCESS_LABEL,
      processCode: "ION",
      location: "1\uACF5\uC7A5",
      inspectionCycle: "\uC6D4 1\uD68C",
      note: "",
      active: true,
    });
    ionSeq += 1;
  };

  RC1_ION_EQUIPMENT_CODES.forEach(pushIon);

  RC1_SOFT_EQUIPMENT_CODES.forEach((code, index) => {
    rows.push({
      id: `eq-soft-${index + 1}`,
      code,
      name: code,
      equipType: SOFT_PROCESS_LABEL,
      processCode: "SOFT",
      location: "2\uACF5\uC7A5",
      inspectionCycle: "\uC6D4 1\uD68C",
      note: "",
      active: true,
    });
  });

  return rows;
}

function readSeedFlag() {
  if (typeof globalThis.sessionStorage === "undefined") return false;
  try {
    return globalThis.sessionStorage.getItem(RC1_EQUIPMENT_MASTER_SEED_FLAG) === "1";
  } catch {
    return false;
  }
}

function writeSeedFlag() {
  if (typeof globalThis.sessionStorage === "undefined") return;
  try {
    globalThis.sessionStorage.setItem(RC1_EQUIPMENT_MASTER_SEED_FLAG, "1");
  } catch {
    /* quota */
  }
}

function equipmentCodeKey(row) {
  return String(row?.code ?? row?.name ?? "").trim().toLowerCase();
}

function resolveSeedRowId(seedRow, _existingRows, usedIds) {
  const preferredId = String(seedRow.id ?? "").trim();
  if (preferredId && !usedIds.has(preferredId)) {
    return preferredId;
  }
  const fallback = `rc1-eq-${String(seedRow.code ?? "").trim().replace(/[^\w-]/g, "-")}`;
  if (!usedIds.has(fallback)) {
    return fallback;
  }
  let suffix = 2;
  while (usedIds.has(`${fallback}-${suffix}`)) {
    suffix += 1;
  }
  return `${fallback}-${suffix}`;
}

/**
 * Idempotent RC1 equipment seed - empty install gets full set; legacy partial merges missing codes only.
 * After flag is set, never re-applies (user CRUD preserved).
 *
 * @param {Record<string, unknown>[]} existingRows
 * @returns {{ rows: Record<string, unknown>[], changed: boolean }}
 */
export function ensureRc1EquipmentMasterSeed(existingRows = []) {
  const current = Array.isArray(existingRows) ? existingRows.map((row) => ({ ...row })) : [];

  if (readSeedFlag()) {
    return { rows: current, changed: false };
  }

  const seedRows = buildRc1EquipmentMasterSeedRows();
  if (current.length === 0) {
    writeSeedFlag();
    return { rows: seedRows.map((row) => ({ ...row })), changed: true };
  }

  const existingCodes = new Set(current.map(equipmentCodeKey).filter(Boolean));
  const usedIds = new Set(current.map((row) => String(row.id ?? "").trim()).filter(Boolean));
  const missing = seedRows.filter((row) => !existingCodes.has(equipmentCodeKey(row)));

  if (missing.length === 0) {
    writeSeedFlag();
    return { rows: current, changed: false };
  }

  const merged = [...current];
  missing.forEach((seedRow) => {
    const id = resolveSeedRowId(seedRow, current, usedIds);
    usedIds.add(id);
    merged.push({ ...seedRow, id });
  });

  writeSeedFlag();
  return { rows: merged, changed: true };
}
