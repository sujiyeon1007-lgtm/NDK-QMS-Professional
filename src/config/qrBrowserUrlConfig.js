import { QR_ENGINE_ROUTES } from "./qrEngineArchitecture";

export const QR_BROWSER_BASE_URL_STORAGE_KEY = "titan-qr-browser-base-url-v1";
export const QR_BROWSER_BASE_URL_DEFAULT_DEV = "http://192.168.0.12:5173";

function trimSlash(value) {
  return String(value ?? "").trim().replace(/\/+$/, "");
}

function getRuntimeOrigin() {
  if (typeof window === "undefined") return "";
  return window.location?.origin ?? "";
}

function isLocalhostOrigin(origin) {
  try {
    const url = new URL(origin);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

export function getQrBrowserBaseUrl() {
  const configured =
    typeof window !== "undefined"
      ? window.localStorage?.getItem(QR_BROWSER_BASE_URL_STORAGE_KEY)
      : "";
  const envConfigured = import.meta.env?.VITE_TITAN_QR_BASE_URL ?? "";
  const runtimeOrigin = getRuntimeOrigin();

  return (
    trimSlash(configured) ||
    trimSlash(envConfigured) ||
    (isLocalhostOrigin(runtimeOrigin) ? QR_BROWSER_BASE_URL_DEFAULT_DEV : trimSlash(runtimeOrigin))
  );
}

export function buildQrBrowserUrl(path) {
  const baseUrl = getQrBrowserBaseUrl();
  const normalizedPath = String(path ?? "").startsWith("/") ? String(path) : `/${path ?? ""}`;
  try {
    return new URL(normalizedPath, `${baseUrl}/`).href;
  } catch {
    return `${baseUrl}${normalizedPath}`;
  }
}

export function buildEquipmentQrBrowserUrl(equipmentId) {
  return buildQrBrowserUrl(QR_ENGINE_ROUTES.equipmentWork(equipmentId));
}

export function buildLotQrBrowserUrl(lotNo) {
  return buildQrBrowserUrl(QR_ENGINE_ROUTES.lotLifecycle(lotNo));
}

function isBrowserUrl(value) {
  return /^https?:\/\//i.test(String(value ?? "").trim());
}

function normalizeQrType(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getFirstText(...values) {
  return values.map((value) => String(value ?? "").trim()).find(Boolean) ?? "";
}

function parseEquipmentSmartAccessId(value) {
  const text = String(value ?? "").trim();
  const canonical = text.match(/^NDK:\/\/EQ\/(.+)$/i);
  if (canonical) return canonical[1].trim();
  const legacy = text.match(/^NDK\|EQ\|(.+)$/i);
  if (legacy) return legacy[1].trim();
  return "";
}

function parseLotSmartAccessId(value) {
  const text = String(value ?? "").trim();
  const legacy = text.match(/^NDK\|LOT\|(.+)$/i);
  if (legacy) return legacy[1].trim();
  return "";
}

export function resolveQrBrowserPayload(rowOrValue) {
  if (typeof rowOrValue === "string") {
    const value = rowOrValue.trim();
    if (isBrowserUrl(value)) return value;
    const equipmentId = parseEquipmentSmartAccessId(value);
    if (equipmentId) return buildEquipmentQrBrowserUrl(equipmentId);
    const lotNo = parseLotSmartAccessId(value);
    if (lotNo) return buildLotQrBrowserUrl(lotNo);
    return value;
  }

  const row = rowOrValue ?? {};
  const explicitUrl = getFirstText(
    row.browserUrl,
    row.qrBrowserUrl,
    row.printPayload,
    row.printQrValue,
    row.qrRecord?.browserUrl
  );
  if (isBrowserUrl(explicitUrl)) return explicitUrl;

  const scanCandidate = getFirstText(
    row.scanValue,
    row.smartAccessId,
    row.qrRecord?.scanValue,
    row.qrRecord?.scan_value
  );
  if (isBrowserUrl(scanCandidate)) return scanCandidate;

  const qrType = normalizeQrType(row.qrType ?? row.generatorTypeId ?? row.type);
  const equipmentId = getFirstText(
    row.equipmentCode,
    row.equipmentId,
    qrType === "equipment" ? row.entityKey : "",
    qrType === "equipment" ? row.target : "",
    parseEquipmentSmartAccessId(scanCandidate)
  );
  if ((qrType === "equipment" || row.equipmentCode || row.equipmentId) && equipmentId) {
    return buildEquipmentQrBrowserUrl(equipmentId);
  }

  const lotNo = getFirstText(
    row.lotNo,
    qrType === "lot" ? row.entityKey : "",
    qrType === "lot" ? row.target : "",
    parseLotSmartAccessId(scanCandidate)
  );
  if ((qrType === "lot" || row.lotNo) && lotNo) return buildLotQrBrowserUrl(lotNo);

  const equipmentFromSmartAccess = parseEquipmentSmartAccessId(scanCandidate || row.qrPayload);
  if (equipmentFromSmartAccess) return buildEquipmentQrBrowserUrl(equipmentFromSmartAccess);

  const lotFromSmartAccess = parseLotSmartAccessId(scanCandidate || row.qrPayload);
  if (lotFromSmartAccess) return buildLotQrBrowserUrl(lotFromSmartAccess);

  const fallback = getFirstText(row.qrPayload, row.payload, scanCandidate);
  return isBrowserUrl(fallback) ? fallback : fallback;
}

export function resolveQrBrowserUrlPayload(payload) {
  const text = String(payload ?? "").trim();
  if (!/^https?:\/\//i.test(text)) return null;

  try {
    const url = new URL(text);
    const path = `${url.pathname}${url.search}`;
    const equipmentMatch = url.pathname.match(/^\/qr\/equipment\/([^/?#]+)/);
    if (equipmentMatch) {
      return {
        type: "equipment",
        equipmentId: decodeURIComponent(equipmentMatch[1]),
        path,
      };
    }
    if (url.pathname === "/quality/lot-lifecycle") {
      const lotNo = url.searchParams.get("lot");
      if (lotNo) {
        return {
          type: "lot",
          lotNo,
          path,
        };
      }
    }
    return { type: "unknown", path };
  } catch {
    return null;
  }
}