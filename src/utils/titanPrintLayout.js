/** Project TITAN — 출력물 레이아웃 (화면 UI와 분리) */

export const PRINT_ORIENTATION = {
  PORTRAIT: "portrait",
  LANDSCAPE: "landscape",
};

/** A4 본문 가용 너비(mm) — @page margin 제외 content box */
export const PRINT_CONTENT_WIDTH = {
  [PRINT_ORIENTATION.PORTRAIT]: 190,
  [PRINT_ORIENTATION.LANDSCAPE]: 281,
};

/** 페이지당 행 줄(line) 예산 — Header/Footer/Meta 제외 (리스트는 titanListPrintStandard) */
export const PAGE_LINE_BUDGET = {
  [PRINT_ORIENTATION.PORTRAIT]: 15,
  [PRINT_ORIENTATION.LANDSCAPE]: 13,
};

/** 리스트 출력 — 축소 글꼴 기준 줄바꿈 추정 계수 */
export const LIST_PRINT_WRAP_UNITS_FACTOR = 0.48;

const MM_PER_TEXT_UNIT = 1.55;
const BASE_RATIO_BLEND = 0.68;

/** 상대 문자 폭 (한글·전각 1.8, ASCII 1.0) */
export function measureTextUnits(text) {
  if (text == null || text === "") return 0;
  return String(text).split("").reduce((sum, char) => {
    if (/[\u3000-\u9fff\uff00-\uffef]/.test(char)) return sum + 1.8;
    return sum + 1;
  }, 0);
}

/**
 * 권장 비율 + 데이터 길이 혼합 컬럼 폭(%)
 */
export function computePrintColumnWidths(columns, rows) {
  const baseTotal = columns.reduce((sum, column) => sum + (column.baseRatio ?? 10), 0);

  const dataScores = columns.map((column) => {
    const headerUnits = measureTextUnits(column.header);
    const dataUnits = rows.reduce((max, row) => {
      return Math.max(max, measureTextUnits(column.getValue(row)));
    }, 0);

    let units = Math.max(headerUnits, dataUnits, 1);
    if (column.handwriting) {
      units = Math.max(units, 18);
    }
    if (column.wrapMaxLines) {
      units = Math.max(units, 10);
    }
    if (column.wrap) {
      units = Math.max(units, 12);
    }
    return units;
  });

  const dataTotal = dataScores.reduce((sum, score) => sum + score, 0) || 1;

  return columns.map((column, index) => {
    const basePercent = ((column.baseRatio ?? 10) / baseTotal) * 100;
    const dataPercent = (dataScores[index] / dataTotal) * 100;
    const widthPercent = basePercent * BASE_RATIO_BLEND + dataPercent * (1 - BASE_RATIO_BLEND);

    return {
      id: column.id,
      widthPercent,
      narrow: Boolean(column.narrow),
      handwriting: Boolean(column.handwriting),
      singleLine: Boolean(column.singleLine),
      wrap: Boolean(column.wrap),
      wrapMaxLines: column.wrapMaxLines ?? 0,
    };
  });
}

function columnContentUnits(column, rows) {
  return rows.reduce((max, row) => {
    return Math.max(max, measureTextUnits(column.getValue(row)));
  }, measureTextUnits(column.header));
}

function requiredColumnMm(column, colLayout, rows, contentWidthMm) {
  const units = columnContentUnits(column, rows);
  const colMm = (colLayout.widthPercent / 100) * contentWidthMm;

  if (column.handwriting) {
    return Math.max(52, units * MM_PER_TEXT_UNIT);
  }

  if (column.singleLine && !column.wrapMaxLines) {
    return Math.max(units * MM_PER_TEXT_UNIT, colMm * 0.9);
  }

  if (column.wrapMaxLines) {
    const lines = Math.min(
      column.wrapMaxLines,
      Math.max(1, Math.ceil(units / Math.max(8, colMm * 0.4)))
    );
    return Math.max(colMm * 0.85, (units / lines) * MM_PER_TEXT_UNIT);
  }

  return Math.max(units * MM_PER_TEXT_UNIT, colMm * 0.85);
}

/** 한 줄 출력 기준 — 세로 공간 부족 시 가로 출력 */
export function resolvePrintOrientation(columns, rows, columnWidths) {
  if (!rows.length) return PRINT_ORIENTATION.PORTRAIT;

  const portraitWidth = PRINT_CONTENT_WIDTH[PRINT_ORIENTATION.PORTRAIT];

  const requiredMm = columnWidths.reduce((sum, layout, index) => {
    return sum + requiredColumnMm(columns[index], layout, rows, portraitWidth);
  }, 0);

  if (requiredMm > portraitWidth * 0.97) {
    return PRINT_ORIENTATION.LANDSCAPE;
  }

  const overflowInPortrait = columns.some((column, index) => {
    if (column.wrapMaxLines) return false;
    if (!column.singleLine) return false;

    const units = columnContentUnits(column, rows);
    const colMm = (columnWidths[index].widthPercent / 100) * portraitWidth;
    return units * MM_PER_TEXT_UNIT > colMm * 1.02;
  });

  return overflowInPortrait ? PRINT_ORIENTATION.LANDSCAPE : PRINT_ORIENTATION.PORTRAIT;
}

/** 품명 — 공백·단어 기준 최대 2줄 추정 */
export function estimateWrapLines(text, widthPercent, orientation, maxLines = 2) {
  const units = measureTextUnits(text);
  if (units <= 0) return 1;

  const contentMm = PRINT_CONTENT_WIDTH[orientation];
  const colMm = (widthPercent / 100) * contentMm;
  const unitsPerLine = Math.max(8, colMm * LIST_PRINT_WRAP_UNITS_FACTOR);
  return Math.min(maxLines, Math.max(1, Math.ceil(units / unitsPerLine)));
}

/** 행 높이(줄 수) — wrap 컬럼은 자동 줄바꿈(말줄임 없음) */
export function estimateRowLines(row, columns, columnWidths, orientation) {
  let lines = 1;

  columns.forEach((column, index) => {
    if (column.wrap) {
      const value = column.getValue(row);
      const cellLines = estimateWrapLines(
        value,
        columnWidths[index].widthPercent,
        orientation,
        12
      );
      lines = Math.max(lines, cellLines);
      return;
    }

    if (column.wrapMaxLines) {
      const value = column.getValue(row);
      const cellLines = estimateWrapLines(
        value,
        columnWidths[index].widthPercent,
        orientation,
        column.wrapMaxLines
      );
      lines = Math.max(lines, cellLines);
    }
  });

  return lines;
}

/** 관리번호 등 그룹 키 기준 — 입력 순서 유지 */
export function buildRowGroups(rows, getGroupKey = (row) => row.managementId ?? row.id ?? "") {
  const groups = [];
  const indexByKey = new Map();

  rows.forEach((row, rowIndex) => {
    const rawKey = getGroupKey(row);
    const key =
      rawKey != null && String(rawKey).trim() !== ""
        ? String(rawKey).trim()
        : `__ungrouped_${rowIndex}`;

    if (!indexByKey.has(key)) {
      indexByKey.set(key, groups.length);
      groups.push({ key, rows: [] });
    }
    groups[indexByKey.get(key)].rows.push(row);
  });

  return groups;
}

function estimateGroupLines(groupRows, columns, columnWidths, orientation) {
  return groupRows.reduce(
    (sum, row) => sum + estimateRowLines(row, columns, columnWidths, orientation),
    0
  );
}

/** 행 단위 페이지 분할 (개별 행 keep-together) */
export function paginateRowsSimple(rows, columns, columnWidths, orientation, options = {}) {
  if (!rows.length) return [[]];

  const lineBudget = options.lineBudget ?? PAGE_LINE_BUDGET[orientation];
  const lastPageReserve = options.lastPageReserve ?? 0;
  const pages = [];
  let currentPage = [];
  let usedLines = 0;

  const remainingLinesFrom = (startIndex) => {
    let total = 0;
    for (let index = startIndex; index < rows.length; index += 1) {
      total += estimateRowLines(rows[index], columns, columnWidths, orientation);
    }
    return total;
  };

  rows.forEach((row, index) => {
    const rowLines = estimateRowLines(row, columns, columnWidths, orientation);
    const remainingLines = remainingLinesFrom(index);
    const budget =
      remainingLines <= lineBudget ? Math.max(1, lineBudget - lastPageReserve) : lineBudget;

    if (currentPage.length > 0 && usedLines + rowLines > budget) {
      pages.push(currentPage);
      currentPage = [];
      usedLines = 0;
    }
    currentPage.push(row);
    usedLines += rowLines;
  });

  if (currentPage.length) {
    pages.push(currentPage);
  }

  return applyOrphanRowPrevention(pages, options.minOrphanRows ?? 2);
}

function flushCurrentPage(pages, currentPageRef) {
  if (currentPageRef.page.length) {
    pages.push(currentPageRef.page);
    currentPageRef.page = [];
    currentPageRef.usedLines = 0;
  }
}

/**
 * 페이지 하단 orphan row 방지 — 마지막 페이지를 제외하고 행 수가 minOrphanRows 미만이면 다음 페이지와 병합
 * @param {object[][]} pages
 * @param {number} minOrphanRows
 */
export function applyOrphanRowPrevention(pages, minOrphanRows = 2) {
  if (!pages.length || minOrphanRows <= 1) return pages;

  const result = pages.map((page) => [...page]);

  for (let index = 0; index < result.length - 1; index += 1) {
    const page = result[index];
    const nextPage = result[index + 1];
    if (!page.length || page.length >= minOrphanRows) continue;

    if (nextPage.length >= minOrphanRows) {
      const needed = minOrphanRows - page.length;
      const movable = Math.max(0, nextPage.length - minOrphanRows);
      const pullCount = Math.min(needed, movable);
      if (pullCount > 0) {
        page.push(...nextPage.splice(0, pullCount));
      }
    }

    if (page.length > 0 && page.length < minOrphanRows) {
      nextPage.unshift(...page.splice(0, page.length));
    }
  }

  return result.filter((page) => page.length > 0);
}

/**
 * 가변 행 높이 + 관리번호 그룹 keep-together 페이지 분할
 * @param {{ lineBudget?: number, lastPageReserve?: number, getGroupKey?: (row: object) => string }} options
 */
export function paginateRowsByLayout(rows, columns, columnWidths, orientation, options = {}) {
  const getGroupKey = options.getGroupKey;
  if (!getGroupKey) {
    return paginateRowsSimple(rows, columns, columnWidths, orientation, options);
  }

  if (!rows.length) return [[]];

  const lineBudget = options.lineBudget ?? PAGE_LINE_BUDGET[orientation];
  const lastPageReserve = options.lastPageReserve ?? 0;
  const groups = buildRowGroups(rows, getGroupKey);
  const pages = [];
  const currentPageRef = { page: [], usedLines: 0 };

  const remainingLinesFromGroups = (startGroupIndex) => {
    let total = 0;
    for (let index = startGroupIndex; index < groups.length; index += 1) {
      total += estimateGroupLines(groups[index].rows, columns, columnWidths, orientation);
    }
    return total;
  };

  groups.forEach((group, groupIndex) => {
    const groupRows = group.rows;
    const groupLines = estimateGroupLines(groupRows, columns, columnWidths, orientation);
    const remainingLines = remainingLinesFromGroups(groupIndex);
    const budget =
      remainingLines <= lineBudget ? Math.max(1, lineBudget - lastPageReserve) : lineBudget;

    if (groupLines > lineBudget) {
      flushCurrentPage(pages, currentPageRef);
      const subPages = paginateRowsSimple(groupRows, columns, columnWidths, orientation, {
        lineBudget,
        lastPageReserve: 0,
      });
      subPages.forEach((subPage) => pages.push(subPage));
      return;
    }

    if (currentPageRef.page.length > 0 && currentPageRef.usedLines + groupLines > budget) {
      flushCurrentPage(pages, currentPageRef);
    }

    currentPageRef.page.push(...groupRows);
    currentPageRef.usedLines += groupLines;
  });

  flushCurrentPage(pages, currentPageRef);
  const normalized = pages.length ? pages : [[]];
  return applyOrphanRowPrevention(normalized, options.minOrphanRows ?? 2);
}
