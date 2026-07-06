import { buildStandardProductSummary } from "../../../utils/standardDetailPopupModel";

/**
 * Standard Detail Popup Header summary builder
 * @param {object | null | undefined} record
 * @param {object | null | undefined} listRow
 * @param {string} [statusLabel]
 * @param {string} [statusVariant]
 */
export function buildStandardDetailPopupSummary(record, listRow, statusLabel, statusVariant) {
  return buildStandardProductSummary(record, listRow, statusLabel, statusVariant);
}
