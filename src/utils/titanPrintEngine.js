/** Project TITAN — 공통 출력 엔진 (화면 UI와 분리 · iframe 전용 인쇄/PDF) */

export const TITAN_PRINT_MARGIN_MM = 10;

export const TITAN_PAGE_MM = {
  portrait: { width: 210, height: 297 },
  landscape: { width: 297, height: 210 },
};

export function findPrintDocument(root) {
  if (!root) return null;
  if (root.classList?.contains("titan-print-document")) return root;
  return root.querySelector(".titan-print-document");
}

export function getDocumentOrientation(documentEl) {
  if (documentEl?.classList.contains("titan-print-landscape")) return "landscape";
  return documentEl?.dataset?.printOrientation === "landscape" ? "landscape" : "portrait";
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function copyStylesInto(targetDoc) {
  [...document.querySelectorAll('link[rel="stylesheet"], style')].forEach((node) => {
    targetDoc.head.appendChild(node.cloneNode(true));
  });

  const cssText = [...document.styleSheets]
    .flatMap((sheet) => {
      try {
        return [...sheet.cssRules].map((rule) => rule.cssText);
      } catch {
        return [];
      }
    })
    .join("\n");

  if (cssText) {
    const style = targetDoc.createElement("style");
    style.setAttribute("data-titan-print-engine", "inlined");
    style.textContent = cssText;
    targetDoc.head.appendChild(style);
  }
}

/** iframe 인쇄 — A4 고정 높이 flex (Footer orphan 방지) */
const PRINT_ENGINE_CRITICAL_CSS = `
@page { size: A4 portrait; margin: 10mm; }
@page titan-landscape { size: A4 landscape; margin: 10mm; }
body.titan-print-engine-host { margin: 0; padding: 0; background: #fff; }
body.titan-print-engine-host .titan-print-document { gap: 0; margin: 0; padding: 0; }
body.titan-print-engine-host .titan-print-page {
  width: 190mm;
  height: 277mm;
  max-height: 277mm;
  min-height: 0;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: none;
}
body.titan-print-engine-host .titan-print-document.titan-print-landscape .titan-print-page {
  width: 277mm;
  height: 190mm;
  max-height: 190mm;
}
body.titan-print-engine-host .titan-print-page-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}
body.titan-print-engine-host .titan-print-page-footer {
  flex: 0 0 auto;
  margin-top: 0;
}
@media print {
  body.titan-print-engine-host .titan-print-page {
    width: 190mm;
    height: 277mm;
    max-height: 277mm;
    overflow: hidden;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  body.titan-print-engine-host .titan-print-page.is-last {
    break-after: auto;
    page-break-after: auto;
  }
  body.titan-print-engine-host .titan-print-page:not(.is-last) {
    break-after: page;
    page-break-after: always;
  }
  body.titan-print-engine-host .titan-print-document.titan-print-landscape .titan-print-page {
    width: 277mm;
    height: 190mm;
    max-height: 190mm;
  }
  body.titan-print-engine-host .titan-print-page-body { overflow: hidden; }
  body.titan-print-engine-host .titan-print-page-footer { margin-top: 0; }
}
`;

function injectPrintEngineCriticalCss(targetDoc) {
  const style = targetDoc.createElement("style");
  style.setAttribute("data-titan-print-engine", "critical");
  style.textContent = PRINT_ENGINE_CRITICAL_CSS;
  targetDoc.head.appendChild(style);
}

/** iframe 인쇄/PDF — CSS 유실 시에도 A4 flex 레이아웃 유지 */
function applyPrintEngineInlineStyles(clone) {
  clone.querySelectorAll(".ndk-logo--print").forEach((logo) => {
    logo.style.height = "68px";
    logo.style.width = "auto";
    logo.style.maxWidth = "42mm";
    logo.style.objectFit = "contain";
    logo.style.display = "block";
  });

  clone.querySelectorAll(".titan-print-page").forEach((page) => {
    const isLandscape = page.closest(".titan-print-landscape") != null;

    page.style.display = "flex";
    page.style.flexDirection = "column";
    page.style.boxSizing = "border-box";
    page.style.overflow = "hidden";
    page.style.margin = "0";
    page.style.padding = "0";
    page.style.width = isLandscape ? "277mm" : "190mm";
    page.style.height = isLandscape ? "190mm" : "277mm";
    page.style.maxHeight = isLandscape ? "190mm" : "277mm";
    page.style.minHeight = "0";

    const body = page.querySelector(".titan-print-page-body");
    const footer = page.querySelector(".titan-print-page-footer");

    if (body) {
      body.style.flex = "1 1 auto";
      body.style.minHeight = "0";
      body.style.overflow = "hidden";
    }

    if (footer) {
      footer.style.flex = "0 0 auto";
      footer.style.marginTop = "0";
    }
  });
}

function waitForImages(doc) {
  const images = [...doc.querySelectorAll("img")];
  if (!images.length) return Promise.resolve();

  return Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        })
    )
  );
}

/**
 * 출력 문서를 숨김 iframe에 마운트 (화면 레이아웃·Modal transform과 분리)
 */
export async function mountPrintEngine(documentEl) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "Project TITAN Print Engine");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;pointer-events:none;";

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;

  doc.open();
  doc.write('<!DOCTYPE html><html lang="ko"><head></head><body class="titan-print-engine-host"></body></html>');
  doc.close();

  copyStylesInto(doc);
  injectPrintEngineCriticalCss(doc);

  const clone = documentEl.cloneNode(true);
  clone.querySelectorAll("[style]").forEach((node) => {
    if (node.style.transform) {
      node.style.transform = "";
    }
  });
  applyPrintEngineInlineStyles(clone);

  doc.body.innerHTML = "";
  doc.body.className = "titan-print-engine-host";
  doc.body.appendChild(clone);

  await wait(80);
  await waitForImages(doc);
  await wait(80);

  return {
    iframe,
    window: win,
    document: clone,
  };
}

export function unmountPrintEngine(iframe) {
  iframe?.remove();
}

export function getPrintPages(documentEl) {
  if (!documentEl) return [];
  return [...documentEl.querySelectorAll(".titan-print-page")];
}

/**
 * iframe 전용 window.print — UI 없이 출력 문서만 A4로 인쇄
 */
export async function printViaEngine(documentEl) {
  if (!documentEl) return;

  const { iframe, window: printWindow } = await mountPrintEngine(documentEl);

  try {
    await new Promise((resolve) => {
      const done = () => resolve();
      printWindow.addEventListener("afterprint", done, { once: true });
      printWindow.focus();
      printWindow.print();
      window.setTimeout(done, 2000);
    });
  } finally {
    window.setTimeout(() => unmountPrintEngine(iframe), 800);
  }
}
