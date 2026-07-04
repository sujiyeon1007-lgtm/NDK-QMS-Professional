import { useLayoutEffect, useState } from "react";

/**
 * Viewport-fixed collapse toggle — tracks panel right edge (list ↔ detail boundary).
 * @param {React.RefObject<HTMLElement>} panelRef
 * @param {boolean} [active]
 */
export function useFloatingPanelTogglePosition(panelRef, active = true) {
  const [position, setPosition] = useState({ left: null, visible: false });

  useLayoutEffect(() => {
    const panel = panelRef?.current;
    if (!panel || !active) {
      setPosition({ left: null, visible: false });
      return undefined;
    }

    const update = () => {
      const style = window.getComputedStyle(panel);
      if (style.display === "none" || style.visibility === "hidden") {
        setPosition({ left: null, visible: false });
        return;
      }

      const rect = panel.getBoundingClientRect();
      if (rect.width <= 0) {
        setPosition({ left: null, visible: false });
        return;
      }

      setPosition({ left: Math.round(rect.right), visible: true });
    };

    update();

    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);

    const ro = new ResizeObserver(update);
    ro.observe(panel);

    const workspace = panel.closest(
      ".titan-list-workspace, .inbound-page__workspace, .home-board__left, .production-page__workspace"
    );
    if (workspace) ro.observe(workspace);

    panel.addEventListener("transitionend", update);

    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      ro.disconnect();
      panel.removeEventListener("transitionend", update);
    };
  }, [panelRef, active]);

  return position;
}
