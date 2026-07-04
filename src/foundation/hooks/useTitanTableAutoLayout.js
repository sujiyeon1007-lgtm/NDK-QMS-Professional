import { useCallback, useLayoutEffect, useRef } from "react";

function measureCellWidth(cell) {
  if (!cell) {
    return 0;
  }
  return Math.ceil(Math.max(cell.scrollWidth, cell.getBoundingClientRect().width));
}

/**
 * Project TITAN — Grid Auto Layout
 * 컬럼 최소폭 = max(Header, Data) · 테이블은 Card 100% · 부족 시 가로 스크롤
 */
export function useTitanTableAutoLayout({ enabled, columnCount, rowCount }) {
  const wrapRef = useRef(null);
  const tableRef = useRef(null);
  const frameRef = useRef(null);

  const applyLayout = useCallback(() => {
    const table = tableRef.current;
    const wrap = wrapRef.current;
    if (!enabled || !table || !wrap) {
      return;
    }

    const cols = table.querySelectorAll("colgroup col:not(.titan-col--fill)");
    const headerCells = table.querySelectorAll(
      "thead tr:first-child th:not(.titan-table__cell--fill)"
    );
    if (!cols.length || headerCells.length !== cols.length) {
      return;
    }

    cols.forEach((col) => {
      col.style.minWidth = "";
      col.style.width = "";
    });
    table.style.width = "";
    table.style.minWidth = "";
    table.classList.remove("titan-table--auto-sized", "titan-table--scroll-x");

    const previousLayout = table.style.tableLayout;
    table.style.tableLayout = "auto";

    const headerWidths = [];
    const contentWidths = [];

    headerCells.forEach((th, index) => {
      headerWidths[index] = measureCellWidth(th);
    });

    headerCells.forEach((_, index) => {
      let maxContent = 0;
      table
        .querySelectorAll(`tbody tr:not(.titan-table__row--empty) td:not(.titan-table__cell--fill)`)
        .forEach((td) => {
          if (td.cellIndex !== index) {
            return;
          }
          maxContent = Math.max(maxContent, measureCellWidth(td));
        });
      contentWidths[index] = maxContent;
    });

    table.style.tableLayout = previousLayout;

    const naturalWidths = headerWidths.map((headerWidth, index) =>
      Math.max(headerWidth, contentWidths[index] || 0, 32)
    );

    const available = wrap.clientWidth;
    const totalNatural = naturalWidths.reduce((sum, width) => sum + width, 0);
    let finalWidths = naturalWidths;

    if (totalNatural > available && available > 0) {
      let deficit = totalNatural - available;
      const shrinkable = naturalWidths
        .map((width, index) => ({
          index,
          amount: Math.max(0, width - headerWidths[index]),
        }))
        .filter((item) => item.amount > 0)
        .sort((a, b) => b.amount - a.amount);

      const nextWidths = [...naturalWidths];
      shrinkable.forEach(({ index, amount }) => {
        if (deficit <= 0) {
          return;
        }
        const shrinkBy = Math.min(amount, deficit);
        nextWidths[index] -= shrinkBy;
        deficit -= shrinkBy;
      });

      finalWidths = deficit > 0 ? naturalWidths : nextWidths;
    }

    finalWidths.forEach((width, index) => {
      const px = `${width}px`;
      cols[index].style.minWidth = px;
      cols[index].style.width = px;
    });

    const finalTotal = finalWidths.reduce((sum, width) => sum + width, 0);
    const needsScroll = finalTotal > available && available > 0;

    table.classList.add("titan-table--auto-sized");

    if (needsScroll) {
      table.classList.add("titan-table--scroll-x");
      table.style.width = `${finalTotal}px`;
      table.style.minWidth = `${finalTotal}px`;
      return;
    }

    table.style.width = "100%";
    table.style.minWidth = "";
  }, [enabled, columnCount, rowCount]);

  const scheduleLayout = useCallback(() => {
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      applyLayout();
    });
  }, [applyLayout]);

  useLayoutEffect(() => {
    if (!enabled) {
      return undefined;
    }

    scheduleLayout();

    const wrap = wrapRef.current;
    if (!wrap) {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      scheduleLayout();
    });
    observer.observe(wrap);

    window.addEventListener("resize", scheduleLayout);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", scheduleLayout);
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [enabled, scheduleLayout, columnCount, rowCount]);

  return { wrapRef, tableRef, remeasure: scheduleLayout };
}
