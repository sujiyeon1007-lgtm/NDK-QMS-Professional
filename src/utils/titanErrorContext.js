/**
 * Project TITAN V1.0 — Error Boundary 로그용 화면 컨텍스트
 */

let context = {
  screen: "",
  component: "",
  productPartNo: "",
  productName: "",
  path: "",
};

export function setTitanErrorContext(patch = {}) {
  context = { ...context, ...patch };
}

export function clearTitanErrorContext(keys) {
  if (!keys) {
    context = { screen: "", component: "", productPartNo: "", productName: "", path: "" };
    return;
  }
  const next = { ...context };
  keys.forEach((key) => {
    next[key] = "";
  });
  context = next;
}

export function getTitanErrorContext() {
  return { ...context };
}
