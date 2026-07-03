/**
 * Project TITAN — 거래처 약칭 자동 생성
 * @see src/config/companyMasterArchitecture.js
 */

import { COMPANY_ABBREVIATION_EXAMPLES } from "../config/companyMasterArchitecture";

const COMPANY_NAME_SUFFIXES = [
  "주식회사",
  "(주)",
  "㈜",
  "열처리",
  "기계공업",
  "기계",
  "공업",
  "정밀",
  "산업",
];

const CHO_INITIALS = {
  0: "G",
  1: "K",
  2: "N",
  3: "D",
  4: "T",
  5: "R",
  6: "M",
  7: "B",
  8: "P",
  9: "S",
  10: "S",
  11: "",
  12: "J",
  13: "J",
  14: "C",
  15: "K",
  16: "T",
  17: "P",
  18: "H",
};

const JUNG_VOWEL_INITIALS = ["", "A", "A", "Y", "A", "AE", "E", "Y", "O", "O", "O", "YO", "U", "U", "U", "EU", "UI", "I"];

const KNOWN_ABBREVIATIONS = Object.fromEntries(
  COMPANY_ABBREVIATION_EXAMPLES.map((item) => [normalizeCompanyNameKey(item.name), item.abbreviation])
);

function normalizeCompanyNameKey(name) {
  return String(name ?? "")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();
}

function stripCompanySuffixes(name) {
  let result = String(name ?? "").trim();
  let changed = true;
  while (changed) {
    changed = false;
    for (const suffix of COMPANY_NAME_SUFFIXES) {
      if (result.endsWith(suffix) && result.length > suffix.length) {
        result = result.slice(0, -suffix.length).trim();
        changed = true;
      }
    }
  }
  return result || String(name ?? "").trim();
}

function isLatinCompanyName(name) {
  return /^[A-Za-z0-9\s.&-]+$/.test(String(name ?? "").trim());
}

function latinAbbreviation(name) {
  const compact = String(name ?? "")
    .trim()
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
  if (!compact) return "XX";
  if (compact.length <= 3) return compact;
  return compact.slice(0, 2);
}

function koreanSyllables(text) {
  return [...String(text ?? "")].filter((ch) => /[\uAC00-\uD7A3]/.test(ch));
}

function syllableToInitial(syllable) {
  const code = syllable.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return "";
  const cho = Math.floor(code / 588);
  const jung = Math.floor((code % 588) / 28);
  const choInitial = CHO_INITIALS[cho] ?? "";
  if (choInitial) return choInitial;
  return JUNG_VOWEL_INITIALS[jung] ?? "X";
}

function koreanAbbreviation(name) {
  const core = stripCompanySuffixes(name);
  const syllables = koreanSyllables(core);
  if (syllables.length === 0) return latinAbbreviation(name);
  if (syllables.length === 1) {
    const one = syllableToInitial(syllables[0]);
    return (one + one).slice(0, 2).toUpperCase() || "XX";
  }
  const first = syllableToInitial(syllables[0]);
  const second = syllableToInitial(syllables[1]);
  return `${first}${second}`.toUpperCase() || "XX";
}

/**
 * 업체명 → 거래처 약칭 (2~4자)
 */
export function generateCompanyAbbreviation(companyName) {
  const trimmed = String(companyName ?? "").trim();
  if (!trimmed) return "XX";

  const known = KNOWN_ABBREVIATIONS[normalizeCompanyNameKey(trimmed)];
  if (known) return known;

  if (isLatinCompanyName(trimmed)) {
    return latinAbbreviation(trimmed);
  }

  return koreanAbbreviation(trimmed);
}

/**
 * 충돌 시 숫자 suffix (DS → DS2)
 */
export function resolveUniqueAbbreviation(baseAbbrev, existingAbbreviations = []) {
  const normalized = String(baseAbbrev ?? "")
    .trim()
    .toUpperCase()
    .slice(0, 6);
  const safeBase = normalized || "XX";
  const taken = new Set(
    existingAbbreviations
      .map((item) => String(item ?? "").trim().toUpperCase())
      .filter(Boolean)
  );
  if (!taken.has(safeBase)) return safeBase;
  for (let i = 2; i <= 99; i += 1) {
    const candidate = `${safeBase.slice(0, 4)}${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${safeBase.slice(0, 3)}${Date.now().toString().slice(-2)}`;
}

export function buildCompanyAbbreviation(companyName, existingRows = [], { manualAbbreviation = "" } = {}) {
  const manual = String(manualAbbreviation ?? "").trim().toUpperCase();
  if (manual) return manual.slice(0, 6);

  const existing = existingRows
    .map((row) => row.abbreviation ?? row.code)
    .filter(Boolean);

  const generated = generateCompanyAbbreviation(companyName);
  return resolveUniqueAbbreviation(generated, existing);
}

export function getCompanyAbbreviation(row) {
  if (!row) return "XX";
  return String(row.abbreviation ?? row.code ?? "XX")
    .trim()
    .toUpperCase();
}

export function shouldAutoUpdateAbbreviation(row, payload) {
  if (!row) return true;
  if (row.abbreviationLocked) return false;
  if (payload?.abbreviationLocked) return false;
  if (String(payload?.abbreviation ?? "").trim() && payload?.abbreviationManual) return false;
  return normalizeCompanyNameKey(row.name) !== normalizeCompanyNameKey(payload?.name);
}
