/**
 * HOME — 주의/알림 메모 · 품질관리 이슈사항 세션 (Mock)
 * 사용자 직접 입력 · 자동 등록 없음 (품질 탭)
 */

let alertMemos = [];
let qualityMemos = [];

function createMemo(title, time = "") {
  return {
    id: `memo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: title.trim(),
    time: time.trim() || "메모",
    type: "normal",
    source: "user",
  };
}

export function getAlertMemos() {
  return [...alertMemos];
}

export function addAlertMemo({ title, time }) {
  const memo = createMemo(title, time);
  alertMemos = [memo, ...alertMemos];
  return memo;
}

export function updateAlertMemo(id, patch) {
  alertMemos = alertMemos.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export function deleteAlertMemo(id) {
  alertMemos = alertMemos.filter((item) => item.id !== id);
}

export function getAlertMemoForEdit(id) {
  return alertMemos.find((item) => item.id === id) ?? null;
}

export function getQualityMemos() {
  return [...qualityMemos];
}

export function addQualityMemo({ title, time }) {
  const memo = createMemo(title, time);
  qualityMemos = [memo, ...qualityMemos];
  return memo;
}

export function updateQualityMemo(id, patch) {
  qualityMemos = qualityMemos.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export function deleteQualityMemo(id) {
  qualityMemos = qualityMemos.filter((item) => item.id !== id);
}

export function getQualityMemoForEdit(id) {
  return qualityMemos.find((item) => item.id === id) ?? null;
}
