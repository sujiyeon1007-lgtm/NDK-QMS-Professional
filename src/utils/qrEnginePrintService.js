/**
 * Sprint 10 Phase 3 — QR Engine print/export (PNG · PDF · A4 · Label)
 */
import { exportTitanPdf, printTitanDocument } from "./titanPrintExport";
import { markQrEnginePrinted } from "./qrEngineRegistryService";

function sanitizeFilename(value) {
  return String(value ?? "qr")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .slice(0, 80);
}

export async function downloadQrSvgAsPng(svgElement, filename = "qr.png") {
  if (!svgElement) return { ok: false, message: "QR Preview가 없습니다." };

  const serializer = new XMLSerializer();
  const svgText = serializer.serializeToString(svgElement);
  const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

    const size = Math.max(image.width || 320, image.height || 320, 320);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { ok: false, message: "PNG 변환에 실패했습니다." };
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(image, 0, 0, size, size);

    const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!pngBlob) return { ok: false, message: "PNG 생성에 실패했습니다." };

    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(pngBlob);
    anchor.download = sanitizeFilename(filename);
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    return { ok: true };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function printQrEngineSheet(root, registryIds = []) {
  if (!root) return { ok: false, message: "출력 대상이 없습니다." };
  await printTitanDocument(root);
  if (registryIds.length) markQrEnginePrinted(registryIds);
  return { ok: true };
}

export async function exportQrEnginePdf(root, filename = "qr-label.pdf", registryIds = []) {
  if (!root) return { ok: false, message: "PDF 대상이 없습니다." };
  await exportTitanPdf(root, sanitizeFilename(filename));
  if (registryIds.length) markQrEnginePrinted(registryIds);
  return { ok: true };
}

export function notifyLabelPrintPlaceholder() {
  window.alert(
    "라벨 출력은 Phase 3 Placeholder입니다.\n현장 라벨 프린터 연동은 Phase 4에서 제공됩니다.\nA4/PDF/PNG 출력을 사용하세요."
  );
  return { ok: true, placeholder: true };
}