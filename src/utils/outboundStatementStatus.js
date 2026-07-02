/** 거래명세서 출력 상태 (출고 리스트 표시) */

export const STATEMENT_PRINT_STATUS = {
  NOT_PRINTED: "미출력",
  ISSUED: "발행완료",
};

/**
 * @returns {{ label: string, variant: string, reprintCount: number }}
 */
export function getStatementPrintStatus(record) {
  const history = Array.isArray(record?.statementPrintHistory) ? record.statementPrintHistory : [];

  if (history.length === 0) {
    return {
      label: STATEMENT_PRINT_STATUS.NOT_PRINTED,
      variant: "wait",
      reprintCount: 0,
    };
  }

  const reprintCount = history.filter((entry) => entry.reprint).length;
  if (reprintCount === 0) {
    return {
      label: STATEMENT_PRINT_STATUS.ISSUED,
      variant: "complete",
      reprintCount: 0,
    };
  }

  return {
    label: `재출력 ${reprintCount}회`,
    variant: "progress",
    reprintCount,
  };
}
