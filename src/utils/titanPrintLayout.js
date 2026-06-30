/** Project TITAN — 출력물 레이아웃 (화면 UI와 분리) */

export const PRINT_ORIENTATION = {
  PORTRAIT: "portrait",
  LANDSCAPE: "landscape",
};

/** A4 본문 가용 너비(mm) — padding 제외 */
export const PRINT_CONTENT_WIDTH = {
  [PRINT_ORIENTATION.PORTRAIT]: 182,
  [PRINT_ORIENTATION.LANDSCAPE]: 269,
};

/** 페이지당 행 줄(line) 예산 — Header/Footer/Meta 제외 */
export const PAGE_LINE_BUDGET = {
  [PRINT_ORIENTATION.PORTRAIT]: 15,
  [PRINT_ORIENTATION.LANDSCAPE]: 11,
};

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
  const unitsPerLine = Math.max(8, colMm * 0.42);
  return Math.min(maxLines, Math.max(1, Math.ceil(units / unitsPerLine)));
}

/** 행 높이(줄 수) — 품명만 최대 2줄, 그 외 1줄 */
export function estimateRowLines(row, columns, columnWidths, orientation) {
  let lines = 1;

  columns.forEach((column, index) => {
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

/** 가변 행 높이를 반영한 페이지 분할 */
export function paginateRowsByLayout(rows, columns, columnWidths, orientation, options = {}) {
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

  return pages;
}
