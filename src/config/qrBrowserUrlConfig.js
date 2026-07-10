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

function parseOriginParts(originOrUrl) {
  try {
    const url = new URL(originOrUrl);
    return {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? "443" : "80"),
      origin: url.origin,
    };
  } catch {
    return null;
  }
}

/**
 * Use saved Base URL only when it still matches the active runtime session.
 * - Same origin → use saved value
 * - localhost + LAN IP with same port → intentional mobile override
 * - Port/host drift (e.g. stale 5173 while runtime is 5174) → ignore saved value
 */
function shouldUseConfiguredBaseUrl(configured, runtimeOrigin) {
  const configuredParts = parseOriginParts(configured);
  const runtimeParts = parseOriginParts(runtimeOrigin);
  if (!configuredParts) return false;
  if (!runtimeParts) return true;

  if (configuredParts.origin === runtimeParts.origin) return true;

  if (
    isLocalhostOrigin(runtimeOrigin) &&
    !isLocalhostOrigin(configured) &&
    configuredParts.port === runtimeParts.port
  ) {
    return true;
  }

  return false;
}

export function getQrBrowserBaseUrl() {
  const configured =
    typeof window !== "undefined"
      ? window.localStorage?.getItem(QR_BROWSER_BASE_URL_STORAGE_KEY)
      : "";
  const envConfigured = import.meta.env?.VITE_TITAN_QR_BASE_URL ?? "";
  const runtimeOrigin = getRuntimeOrigin();
  const trimmedConfigured = trimSlash(configured);
  const trimmedEnv = trimSlash(envConfigured);
  const trimmedRuntime = trimSlash(runtimeOrigin);

  if (trimmedConfigured && shouldUseConfiguredBaseUrl(trimmedConfigured, trimmedRuntime)) {
    return trimmedConfigured;
  }

  return (
    trimmedRuntime ||
    trimmedEnv ||
    trimmedConfigured ||
    QR_BROWSER_BASE_URL_DEFAULT_DEV
  );
}

export function setQrBrowserBaseUrl(url) {
  const normalized = trimSlash(url);
  if (typeof window !== "undefined") {
    if (normalized) {
      window.localStorage.setItem(QR_BROWSER_BASE_URL_STORAGE_KEY, normalized);
    } else {
      window.localStorage.removeItem(QR_BROWSER_BASE_URL_STORAGE_KEY);
    }
  }
  return normalized || getQrBrowserBaseUrl();
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

export function buildQrEntryBrowserUrl(qrType, target) {
  const type = normalizeQrType(qrType);
  if (type === "equipment") return buildEquipmentQrBrowserUrl(target);
  if (type === "lot") return buildLotQrBrowserUrl(target);
  if (type === "inbound") return buildQrBrowserUrl(QR_ENGINE_ROUTES.inboundEntry);
  if (type === "outbound") return buildQrBrowserUrl(QR_ENGINE_ROUTES.outboundEntry);
  if (type === "product") return buildQrBrowserUrl(QR_ENGINE_ROUTES.productEntry(target));
  if (type === "material") return buildQrBrowserUrl(QR_ENGINE_ROUTES.materialEntry(target));
  if (type === "document") return buildQrBrowserUrl(QR_ENGINE_ROUTES.documentEntry);
  if (type === "worker") return buildQrBrowserUrl(QR_ENGINE_ROUTES.workerEntry(target));
  return buildQrBrowserUrl(QR_ENGINE_ROUTES.dashboard);
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

  if (["inbound", "outbound", "product", "material", "document", "worker"].includes(qrType)) {
    return buildQrEntryBrowserUrl(qrType, row.entityKey ?? row.target);
  }

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
    if (url.pathname === QR_ENGINE_ROUTES.inboundEntry) {
      return { type: "inbound", target: "inbound-entry", path };
    }
    if (url.pathname === QR_ENGINE_ROUTES.outboundEntry) {
      return { type: "outbound", target: "outbound-entry", path };
    }
    if (url.pathname === "/settings/products") {
      return {
        type: "product",
        target: url.searchParams.get("qrTarget") ?? "products",
        path,
      };
    }
    if (url.pathname === "/settings/materials") {
      return {
        type: "material",
        target: url.searchParams.get("qrTarget") ?? "materials",
        path,
      };
    }
    if (url.pathname === QR_ENGINE_ROUTES.documentEntry) {
      return { type: "document", target: "quality-documents", path };
    }
    if (url.pathname === "/production/work-journal") {
      return {
        type: "worker",
        target: url.searchParams.get("worker") ?? "worker",
        path,
      };
    }
    return { type: "unknown", path };
  } catch {
    return null;
  }
}