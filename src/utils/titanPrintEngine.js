/** Project TITAN — 공통 출력 엔진 (화면 UI와 분리 · iframe 전용 인쇄/PDF) */

/** Portrait forms — 거래명세서 · 성적서 · 검사표 */
export const TITAN_PRINT_MARGIN_MM = 10;

/** Landscape list prints — DOC-01 Layout Master */
export const TITAN_LIST_PRINT_MARGIN_MM = 8;

export const TITAN_PAGE_MM = {
  portrait: { width: 210, height: 297 },
  landscape: { width: 297, height: 210 },
};

/** 96dpi — iframe/html2canvas layout width */
export function mmToPx(mm, dpi = 96) {
  return Math.round((mm / 25.4) * dpi);
}

export function getPrintIframeSize(orientation = "portrait") {
  const marginMm = orientation === "landscape" ? TITAN_LIST_PRINT_MARGIN_MM : TITAN_PRINT_MARGIN_MM;
  const contentMm = getPrintContentMm(orientation, marginMm);
  const pageMm = TITAN_PAGE_MM[orientation] ?? TITAN_PAGE_MM.portrait;
  return {
    width: mmToPx(pageMm.width) + 80,
    height: mmToPx(pageMm.height) + 80,
    contentWidthPx: mmToPx(contentMm.width),
    contentHeightPx: mmToPx(contentMm.height),
  };
}

export function getPrintMarginMm(documentEl, orientation = "portrait") {
  if (
    orientation === "landscape" ||
    documentEl?.classList?.contains("titan-print-list") ||
    documentEl?.classList?.contains("titan-print-landscape")
  ) {
    return TITAN_LIST_PRINT_MARGIN_MM;
  }
  return TITAN_PRINT_MARGIN_MM;
}

export function getPrintContentMm(orientation, marginMm) {
  const pageMm = TITAN_PAGE_MM[orientation] ?? TITAN_PAGE_MM.portrait;
  return {
    width: pageMm.width - marginMm * 2,
    height: pageMm.height - marginMm * 2,
  };
}

export function findPrintDocument(root) {
  if (!root) return null;
  if (root.classList?.contains("titan-print-document")) return root;
  return root.querySelector(".titan-print-document");
}

export function getDocumentOrientation(documentEl) {
  if (!documentEl) return "portrait";
  if (
    documentEl.classList.contains("titan-print-landscape") ||
    documentEl.classList.contains("titan-print--landscape") ||
    documentEl.classList.contains("titan-print-list")
  ) {
    return "landscape";
  }
  return documentEl.dataset?.printOrientation === "landscape" ? "landscape" : "portrait";
}

/** Preview modal 100% zoom — A4 content box px (96dpi · print/PDF와 동일) */
export function getPrintPreviewPageSizePx(orientation = "portrait") {
  const marginMm = orientation === "landscape" ? TITAN_LIST_PRINT_MARGIN_MM : TITAN_PRINT_MARGIN_MM;
  const contentMm = getPrintContentMm(orientation, marginMm);
  return {
    width: mmToPx(contentMm.width),
    height: mmToPx(contentMm.height),
  };
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

/** iframe 인쇄 — A4 content box (@page margin 제외 · 100% scale · shrink 금지) */
const PRINT_ENGINE_CRITICAL_CSS = `
@page { size: A4 portrait; margin: 10mm; }
@page titan-landscape { size: A4 landscape; margin: 8mm; }

html.titan-print-engine-html,
body.titan-print-engine-host {
  margin: 0;
  padding: 0;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

body.titan-print-engine-host {
  width: 190mm;
  min-width: 190mm;
  max-width: 190mm;
}

body.titan-print-engine-host[data-print-orientation="landscape"] {
  width: 281mm;
  min-width: 281mm;
  max-width: 281mm;
}

body.titan-print-engine-host .titan-print-document {
  gap: 0;
  margin: 0;
  padding: 0;
  width: 190mm;
  min-width: 190mm;
  max-width: 190mm;
  box-sizing: border-box;
}

body.titan-print-engine-host[data-print-orientation="landscape"] .titan-print-document {
  width: 281mm;
  min-width: 281mm;
  max-width: 281mm;
}

body.titan-print-engine-host .titan-print-page {
  width: 190mm;
  height: 277mm;
  max-width: 190mm;
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

body.titan-print-engine-host .titan-print-document.titan-print-landscape .titan-print-page,
body.titan-print-engine-host .titan-print-document.titan-print--landscape .titan-print-page,
body.titan-print-engine-host .titan-print-document.titan-print-list .titan-print-page {
  width: 281mm;
  height: 194mm;
  max-width: 281mm;
  max-height: 194mm;
  page: titan-landscape;
}

body.titan-print-engine-host .transaction-statement-print .ts-page {
  width: 190mm;
  min-width: 190mm;
  max-width: 190mm;
  height: 277mm;
  max-height: 277mm;
  min-height: 0;
  margin: 0;
  padding: 0;
  border: none;
  box-shadow: none;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

body.titan-print-engine-host .transaction-statement-print .ts-document-footer {
  flex: 0 0 auto;
  margin-top: 3px;
}

body.titan-print-engine-host .transaction-statement-print .ts-sheet,
body.titan-print-engine-host .transaction-statement-print .ts-form-block,
body.titan-print-engine-host .transaction-statement-print .ts-form-table {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

body.titan-print-engine-host .titan-print-page-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

body.titan-print-engine-host .titan-print-page-footer {
  flex: 0 0 auto;
  margin-top: auto;
  padding-top: 3mm;
}

body.titan-print-engine-host[data-print-orientation="landscape"] .titan-print-page-footer {
  margin-top: 0;
}

@media print {
  html.titan-print-engine-html,
  body.titan-print-engine-host {
    width: 190mm;
    min-width: 190mm;
    max-width: 190mm;
    height: auto;
    margin: 0;
    padding: 0;
    overflow: visible;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body.titan-print-engine-host[data-print-orientation="landscape"] {
    width: 281mm;
    min-width: 281mm;
    max-width: 281mm;
  }

  body.titan-print-engine-host .titan-print-document {
    width: 190mm;
    min-width: 190mm;
    max-width: 190mm;
  }

  body.titan-print-engine-host[data-print-orientation="landscape"] .titan-print-document {
    width: 281mm;
    min-width: 281mm;
    max-width: 281mm;
  }

  body.titan-print-engine-host .titan-print-page {
    width: 190mm;
    height: 277mm;
    max-width: 190mm;
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

  body.titan-print-engine-host .titan-print-document.titan-print-landscape .titan-print-page,
  body.titan-print-engine-host .titan-print-document.titan-print--landscape .titan-print-page,
  body.titan-print-engine-host .titan-print-document.titan-print-list .titan-print-page {
    width: 281mm;
    height: 194mm;
    max-width: 281mm;
    max-height: 194mm;
    page: titan-landscape;
  }

  body.titan-print-engine-host .transaction-statement-print .ts-page {
    width: 190mm;
    min-width: 190mm;
    max-width: 190mm;
    height: 277mm;
    max-height: 277mm;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  body.titan-print-engine-host .transaction-statement-print .ts-document-footer {
    flex: 0 0 auto;
    margin-top: 3px;
  }

  body.titan-print-engine-host .titan-print-page-body { overflow: hidden; }

  body.titan-print-engine-host .titan-print-page-footer {
    margin-top: auto;
    padding-top: 3mm;
  }

  body.titan-print-engine-host[data-print-orientation="landscape"] .titan-print-page-footer {
    margin-top: 0;
  }
}
`;

function injectPrintEngineCriticalCss(targetDoc) {
  const style = targetDoc.createElement("style");
  style.setAttribute("data-titan-print-engine", "critical");
  style.textContent = PRINT_ENGINE_CRITICAL_CSS;
  targetDoc.head.appendChild(style);
}

/** iframe 인쇄/PDF — CSS 유실 시에도 A4 flex 레이아웃 유지 */
function applyPrintEngineInlineStyles(clone, orientation = "portrait") {
  const marginMm = getPrintMarginMm(clone, orientation);
  const contentMm = getPrintContentMm(orientation, marginMm);

  clone.style.width = `${contentMm.width}mm`;
  clone.style.minWidth = `${contentMm.width}mm`;
  clone.style.maxWidth = `${contentMm.width}mm`;
  clone.style.margin = "0";
  clone.style.padding = "0";
  clone.style.boxSizing = "border-box";

  clone.querySelectorAll(".ts-preview-wrap").forEach((wrap) => {
    wrap.style.padding = "0";
    wrap.style.margin = "0";
    wrap.style.background = "#ffffff";
    wrap.style.overflow = "visible";
  });

  clone.querySelectorAll(".ts-page").forEach((page) => {
    page.style.width = `${contentMm.width}mm`;
    page.style.minWidth = `${contentMm.width}mm`;
    page.style.maxWidth = `${contentMm.width}mm`;
    page.style.height = `${contentMm.height}mm`;
    page.style.maxHeight = `${contentMm.height}mm`;
    page.style.minHeight = "0";
    page.style.margin = "0";
    page.style.padding = "0";
    page.style.border = "none";
    page.style.boxSizing = "border-box";
    page.style.display = "flex";
    page.style.flexDirection = "column";
    page.style.overflow = "hidden";
    page.style.boxShadow = "none";

    const footer = page.querySelector(".ts-document-footer");
    if (footer) {
      footer.style.flex = "0 0 auto";
      footer.style.marginTop = "3px";
    }
  });

  clone.querySelectorAll(".ts-sheet, .ts-form-block, .ts-form-table").forEach((node) => {
    node.style.width = "100%";
    node.style.maxWidth = "100%";
    node.style.boxSizing = "border-box";
  });

  clone.querySelectorAll(".ndk-logo--print").forEach((logo) => {
    const isList = logo.closest(".titan-print-list") != null;
    logo.style.height = isList ? "54px" : "68px";
    logo.style.width = "auto";
    logo.style.maxWidth = "42mm";
    logo.style.objectFit = "contain";
    logo.style.display = "block";
  });

  clone.querySelectorAll(".titan-print-page").forEach((page) => {
    const isLandscape =
      page.closest(".titan-print-landscape") != null ||
      page.closest(".titan-print--landscape") != null;
    const pageOrientation = isLandscape ? "landscape" : "portrait";
    const pageMargin = getPrintMarginMm(clone, pageOrientation);
    const pageContentMm = getPrintContentMm(pageOrientation, pageMargin);

    page.style.display = "flex";
    page.style.flexDirection = "column";
    page.style.boxSizing = "border-box";
    page.style.overflow = "hidden";
    page.style.margin = "0";
    page.style.padding = "0";
    page.style.width = `${pageContentMm.width}mm`;
    page.style.minWidth = `${pageContentMm.width}mm`;
    page.style.maxWidth = `${pageContentMm.width}mm`;
    page.style.height = `${pageContentMm.height}mm`;
    page.style.maxHeight = `${pageContentMm.height}mm`;
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
      footer.style.marginTop = isLandscape ? "0" : "auto";
      footer.style.paddingTop = "3mm";
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
 * @param {{ forPdf?: boolean }} options — PDF 캡처 시 0×0 iframe 방지
 */
export async function mountPrintEngine(documentEl, options = {}) {
  const orientation = getDocumentOrientation(documentEl);
  const forPdf = Boolean(options.forPdf);
  const iframeSize = getPrintIframeSize(orientation);
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "Project TITAN Print Engine");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = `position:fixed;left:-10000px;top:0;width:${iframeSize.width}px;height:${iframeSize.height}px;border:0;opacity:0;pointer-events:none;z-index:-1;`;

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;

  doc.open();
  doc.write('<!DOCTYPE html><html lang="ko" class="titan-print-engine-html"><head></head><body class="titan-print-engine-host"></body></html>');
  doc.close();

  copyStylesInto(doc);
  injectPrintEngineCriticalCss(doc);

  const clone = documentEl.cloneNode(true);
  clone.querySelectorAll("[style]").forEach((node) => {
    if (node.style.transform) {
      node.style.transform = "";
    }
    if (node.style.transformOrigin) {
      node.style.transformOrigin = "";
    }
  });
  applyPrintEngineInlineStyles(clone, orientation);

  doc.documentElement.classList.add("titan-print-engine-html");
  doc.body.innerHTML = "";
  doc.body.className = "titan-print-engine-host";
  doc.body.dataset.printOrientation = orientation;
  doc.body.appendChild(clone);

  const settleMs = forPdf ? 200 : 80;
  await wait(settleMs);
  await waitForImages(doc);
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* ignore */
    }
  }
  await wait(settleMs);

  return {
    iframe,
    window: win,
    document: clone,
    orientation,
  };
}

export function unmountPrintEngine(iframe) {
  iframe?.remove();
}

export function getPrintPages(documentEl) {
  if (!documentEl) return [];
  return [...documentEl.querySelectorAll(".titan-print-page")];
}

/** PDF/캡처 대상 — titan-print-page 없는 Portrait 양식(거래명세서 등) fallback */
export function resolvePrintCaptureTargets(documentEl) {
  if (!documentEl) return [];

  const pages = getPrintPages(documentEl);
  if (pages.length) return pages;

  const statementPage = documentEl.querySelector(".ts-page");
  if (statementPage) return [statementPage];

  return [documentEl];
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
