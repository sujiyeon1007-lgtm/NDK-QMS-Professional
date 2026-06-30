/**
 * Project TITAN V1.0 — 재고 자동 계산
 * 재고 = 입고수량 − 누적 출고수량
 */

export function getIncomingQty(record) {
  return Number(record?.qty) || 0;
}

export function getShippedQty(record) {
  return Number(record?.shippedQty) || 0;
}

export function getStockQty(record) {
  return Math.max(0, getIncomingQty(record) - getShippedQty(record));
}

export function syncShipmentStatus(record) {
  const stock = getStockQty(record);
  const shipped = getShippedQty(record);

  if (shipped <= 0) {
    return { stockQty: stock, shipmentStatus: record?.shipmentStatus ?? "출고대기" };
  }

  return {
    stockQty: stock,
    shipmentStatus: stock <= 0 ? "출고완료" : "출고대기",
  };
}

export function getTotalStockQty(records) {
  return records.reduce((sum, record) => {
    if (!record?.incomingRegistered) return sum;
    return sum + getStockQty(record);
  }, 0);
}

export function getInStockRecordCount(records) {
  return records.filter((record) => record?.incomingRegistered && getStockQty(record) > 0).length;
}
