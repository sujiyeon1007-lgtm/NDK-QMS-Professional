import { useEffect, useRef, useState } from "react";

const PAGE_WIDTH_PX = {
  portrait: 794,
  landscape: 1123,
};

/** 실제 출력 문서를 축소하여 보여주는 WYSIWYG Preview */
function TitanPrintPreview({ children, className = "" }) {
  const frameRef = useRef(null);
  const [scale, setScale] = useState(0.42);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;

    const updateScale = () => {
      const width = frame.clientWidth - 24;
      if (width <= 0) return;

      const documentEl = frame.querySelector(".titan-print-document");
      const orientation = documentEl?.dataset.printOrientation ?? "portrait";
      const pageWidth = PAGE_WIDTH_PX[orientation] ?? PAGE_WIDTH_PX.portrait;

      setScale(Math.min(0.78, Math.max(0.32, width / pageWidth)));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);

    const documentEl = frame.querySelector(".titan-print-document");
    if (documentEl) {
      const mutationObserver = new MutationObserver(updateScale);
      mutationObserver.observe(documentEl, {
        attributes: true,
        attributeFilter: ["class", "data-print-orientation"],
      });
      return () => {
        observer.disconnect();
        mutationObserver.disconnect();
      };
    }

    return () => observer.disconnect();
  }, [children]);

  return (
    <div
      ref={frameRef}
      className={`titan-print-preview-frame ${className}`.trim()}
      aria-label="출력 미리보기"
    >
      <div
        className="titan-print-preview-scale"
        style={{ "--titan-preview-scale": scale }}
      >
        {children}
      </div>
    </div>
  );
}

export default TitanPrintPreview;
