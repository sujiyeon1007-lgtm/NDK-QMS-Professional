export const FOUNDATION_ATTACHMENT_ACCEPT = ".bmp,.jpg,.jpeg,.png,.pdf,.xlsx,.docx";

export const FOUNDATION_ATTACHMENT_TYPES = Object.freeze([
  { id: "certificate", label: "성적서", icon: "\uD83D\uDCC4" },
  { id: "inspectionCertificate", label: "검사성적서", icon: "\uD83D\uDCCB" },
  { id: "microstructurePhoto", label: "조직사진", icon: "\uD83D\uDDBC" },
  { id: "hardnessPhoto", label: "경도사진", icon: "\uD83D\uDCF7" },
  { id: "workStandard", label: "작업표준서", icon: "\uD83D\uDCD8" },
  { id: "drawing", label: "도면", icon: "\uD83D\uDCD0" },
  { id: "mtc", label: "MTC(재질성적서)", icon: "\uD83D\uDCDC" },
  { id: "invoice", label: "거래명세서", icon: "\uD83D\uDCE6" },
  { id: "taxInvoice", label: "세금계산서", icon: "\uD83E\uDDFE" },
  { id: "workOrder", label: "작업지시서", icon: "\uD83D\uDCD1" },
  { id: "etc", label: "기타", icon: "\uD83D\uDCCE" },
]);

export const DEFAULT_FOUNDATION_ATTACHMENT_TYPE_ID = "certificate";

export const FOUNDATION_ATTACHMENT_SUPPORTED_EXTENSIONS = [
  "bmp",
  "jpg",
  "jpeg",
  "png",
  "pdf",
  "xlsx",
  "docx",
];

export const FOUNDATION_ATTACHMENT_FUTURE_EXTENSIONS = ["zip", "csv", "dwg", "dxf"];

const MIME_BY_EXTENSION = {
  bmp: "image/bmp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  zip: "application/zip",
  csv: "text/csv",
  dwg: "application/acad",
  dxf: "application/dxf",
};

export function resolveFoundationAttachmentType(typeId = DEFAULT_FOUNDATION_ATTACHMENT_TYPE_ID) {
  const normalized = String(typeId ?? "").trim();
  return (
    FOUNDATION_ATTACHMENT_TYPES.find((type) => type.id === normalized) ??
    FOUNDATION_ATTACHMENT_TYPES.find((type) => type.id === DEFAULT_FOUNDATION_ATTACHMENT_TYPE_ID) ??
    FOUNDATION_ATTACHMENT_TYPES[0]
  );
}

export function inferFoundationAttachmentTypeId(attachment = {}) {
  const source = [
    attachment.attachmentType,
    attachment.typeId,
    attachment.category,
    attachment.name,
    attachment.fileName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!source) return DEFAULT_FOUNDATION_ATTACHMENT_TYPE_ID;
  if (source.includes("검사성적")) return "inspectionCertificate";
  if (source.includes("조직")) return "microstructurePhoto";
  if (source.includes("경도")) return "hardnessPhoto";
  if (source.includes("작업표준") || source.includes("wi-")) return "workStandard";
  if (source.includes("도면") || source.includes("drawing")) return "drawing";
  if (source.includes("mtc") || source.includes("재질성적")) return "mtc";
  if (source.includes("세금계산")) return "taxInvoice";
  if (source.includes("거래명세") || source.includes("invoice")) return "invoice";
  if (source.includes("작업지시") || source.includes("htl")) return "workOrder";
  if (source.includes("성적서") || source.includes("certificate")) return "certificate";
  return attachment.attachmentType || attachment.typeId || "etc";
}

export function formatFoundationAttachmentTypeLabel(attachment = {}) {
  const type = resolveFoundationAttachmentType(inferFoundationAttachmentTypeId(attachment));
  return `${type.icon} ${type.label}`;
}

export function getFoundationAttachmentExtension(fileName = "") {
  const match = String(fileName).toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

export function getFoundationAttachmentMimeType(fileName = "") {
  return MIME_BY_EXTENSION[getFoundationAttachmentExtension(fileName)] || "";
}

export function isSupportedFoundationAttachment(fileName = "", extensions = FOUNDATION_ATTACHMENT_SUPPORTED_EXTENSIONS) {
  return extensions.includes(getFoundationAttachmentExtension(fileName));
}

export function normalizeFoundationAttachment(attachment = {}, index = 0) {
  const name = String(attachment.name ?? attachment.fileName ?? "").trim();
  if (!name) return null;
  const type = resolveFoundationAttachmentType(inferFoundationAttachmentTypeId(attachment));
  return {
    id: String(attachment.id ?? `ATT-${Date.now()}-${index}`),
    name,
    fileName: name,
    attachmentType: type.id,
    attachmentTypeLabel: type.label,
    attachmentTypeIcon: type.icon,
    mimeType: attachment.mimeType || attachment.type || getFoundationAttachmentMimeType(name),
    size: Number.isFinite(Number(attachment.size)) ? Number(attachment.size) : 0,
    dataUrl: attachment.dataUrl || attachment.url || "",
    storageKey: attachment.storageKey || "",
    version: Number.isFinite(Number(attachment.version)) ? Number(attachment.version) : 1,
    uploadedAt: attachment.uploadedAt || attachment.createdAt || new Date().toISOString(),
    uploadedBy: String(attachment.uploadedBy ?? "").trim(),
    memo: String(attachment.memo ?? attachment.detail ?? "").trim(),
  };
}

export function normalizeFoundationAttachments(attachments = []) {
  return (Array.isArray(attachments) ? attachments : [])
    .map((attachment, index) => normalizeFoundationAttachment(attachment, index))
    .filter(Boolean);
}

export function readFoundationAttachmentSession(bucketKey, ownerKey) {
  try {
    const raw = globalThis.sessionStorage?.getItem(bucketKey);
    const parsed = raw ? JSON.parse(raw) : {};
    return normalizeFoundationAttachments(parsed?.[ownerKey] ?? []);
  } catch {
    return [];
  }
}

export function writeFoundationAttachmentSession(bucketKey, ownerKey, attachments = []) {
  try {
    const raw = globalThis.sessionStorage?.getItem(bucketKey);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[ownerKey] = normalizeFoundationAttachments(attachments);
    globalThis.sessionStorage?.setItem(bucketKey, JSON.stringify(parsed));
  } catch {
    // SessionStorage demo repository.
  }
}

export function resolveFoundationAttachmentKind(attachment = {}) {
  const extension = getFoundationAttachmentExtension(attachment.name ?? attachment.fileName);
  if (["bmp", "jpg", "jpeg", "png"].includes(extension)) return "image";
  if (extension === "pdf") return "pdf";
  if (extension === "xlsx") return "sheet";
  if (extension === "docx") return "doc";
  if (extension === "csv") return "csv";
  if (extension === "zip") return "archive";
  if (["dwg", "dxf"].includes(extension)) return "drawing";
  return "file";
}

export function formatFoundationAttachmentIcon(attachment = {}) {
  if (attachment.attachmentType || attachment.typeId) {
    return resolveFoundationAttachmentType(attachment.attachmentType ?? attachment.typeId).icon;
  }
  const kind = resolveFoundationAttachmentKind(attachment);
  if (kind === "image") return "\uD83D\uDDBC";
  if (kind === "pdf") return "\uD83D\uDCC4";
  if (kind === "sheet" || kind === "csv") return "\uD83D\uDCCA";
  if (kind === "doc") return "\uD83D\uDCDD";
  if (kind === "archive") return "\uD83D\uDCE6";
  if (kind === "drawing") return "\uD83D\uDCD0";
  return "\uD83D\uDCCE";
}

export function readFoundationAttachmentFile(file, options = {}) {
  const extensions = options.extensions ?? FOUNDATION_ATTACHMENT_SUPPORTED_EXTENSIONS;
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("file required"));
      return;
    }
    if (!isSupportedFoundationAttachment(file.name, extensions)) {
      reject(new Error("unsupported file type"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      resolve(
        normalizeFoundationAttachment({
          id: `ATT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          attachmentType: options.attachmentType || DEFAULT_FOUNDATION_ATTACHMENT_TYPE_ID,
          mimeType: file.type || getFoundationAttachmentMimeType(file.name),
          size: file.size,
          dataUrl: reader.result,
          uploadedAt: new Date().toISOString(),
          uploadedBy: options.uploadedBy || "",
        })
      );
    };
    reader.onerror = () => reject(new Error("file read failed"));
    reader.readAsDataURL(file);
  });
}

export function downloadFoundationAttachment(attachment, fallbackName = "attachment") {
  const dataUrl = attachment?.dataUrl || createFoundationAttachmentFallbackDataUrl(attachment);
  if (!dataUrl) return false;
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = attachment.name || attachment.fileName || fallbackName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  return true;
}

export function previewFoundationAttachment(attachment) {
  const dataUrl = attachment?.dataUrl || createFoundationAttachmentFallbackDataUrl(attachment);
  if (!dataUrl) return false;
  window.open(dataUrl, "_blank", "noopener,noreferrer");
  return true;
}

export function createFoundationAttachmentFallbackDataUrl(attachment = {}) {
  const name = attachment.name || attachment.fileName || "attachment";
  const typeLabel = formatFoundationAttachmentTypeLabel(attachment);
  const detail = attachment.memo || attachment.detail || "실제 파일 데이터는 아직 연결되지 않은 첨부 메타데이터입니다.";
  const body = [
    "Project TITAN Attachment Preview",
    "",
    `첨부유형: ${typeLabel}`,
    `파일명: ${name}`,
    `상세: ${detail}`,
  ].join("\n");
  return `data:text/plain;charset=utf-8,${encodeURIComponent(body)}`;
}

export const FOUNDATION_ATTACHMENT_ARCHITECTURE = Object.freeze({
  role: "Project TITAN common attachment engine",
  listUx: "badge-only",
  managementUx: "detail-or-register-popup-only",
  storageMode: "session-data-url-now-storage-key-later",
  extensionPolicy: {
    active: FOUNDATION_ATTACHMENT_SUPPORTED_EXTENSIONS,
    future: FOUNDATION_ATTACHMENT_FUTURE_EXTENSIONS,
  },
  typePolicy: {
    defaultTypeId: DEFAULT_FOUNDATION_ATTACHMENT_TYPE_ID,
    active: FOUNDATION_ATTACHMENT_TYPES,
    futureSource: "environment-settings",
  },
});