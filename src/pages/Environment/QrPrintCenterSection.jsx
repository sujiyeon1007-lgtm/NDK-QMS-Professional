import { useMemo, useState } from "react";
import { Eye, FileDown, Printer, QrCode, RotateCcw } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "../../foundation/components/Button";
import { QR_PRINT_CENTER, buildSmartAccessPath } from "../../config/smartAccessArchitecture";
import { isTitanAdminUser } from "../../utils/titanAdminAccess";

/** PM 확정 QR 출력센터 카테고리 (생산등록 QR 포함) */
const QR_PRINT_ITEMS = [
  ...QR_PRINT_CENTER.features,
  {
    id: "productionQr",
    label: "생산등록 QR",
    registryId: "production",
    targetId: "production",
  },
];

function SettingsPanel({ title, desc, children }) {
  return (
    <section className="environment-content-panel titan-card">
      <div className="environment-content-head">
        <div>
          <h3>{title}</h3>
          {desc ? <p>{desc}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function QrPrintCenterSection() {
  const [selectedId, setSelectedId] = useState(QR_PRINT_ITEMS[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const isAdmin = isTitanAdminUser();

  const selected = useMemo(
    () => QR_PRINT_ITEMS.find((item) => item.id === selectedId) ?? QR_PRINT_ITEMS[0],
    [selectedId]
  );

  const previewPath = selected?.targetId
    ? buildSmartAccessPath(selected.targetId, { code: "PREVIEW" })
    : "/home";

  const handlePlaceholder = (action) => {
    setMessage(`${action} — QR 생성 로직은 추후 개발 예정입니다. (UI V1.0)`);
  };

  if (!isAdmin) {
    return (
      <SettingsPanel title="QR 출력센터" desc="Smart Access QR 라벨 출력 · PDF · 미리보기 · 재출력">
        <div className="environment-poc-access-denied">
          <strong>접근 권한 없음</strong>
          <p>관리자 전용 메뉴입니다.</p>
        </div>
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel
      title="QR 출력센터"
      desc="설비 · 입고 · 생산 · 검사 · 성적서 · 출고 · 관리자 QR — PDF 출력 · 미리보기 · 재출력 (생성 로직 추후)"
    >
      <div className="titan-qr-print-center">
        <div className="titan-qr-print-center__list" role="listbox" aria-label="QR 종류">
          {QR_PRINT_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={selectedId === item.id}
              className={`titan-qr-print-center__item${selectedId === item.id ? " is-active" : ""}`}
              onClick={() => setSelectedId(item.id)}
            >
              <QrCode size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="titan-qr-print-center__preview titan-card">
          <h4>{selected?.label ?? "QR"}</h4>
          <p className="titan-qr-print-center__path">
            Smart Access 경로: <code>{previewPath}</code>
          </p>
          <div className="titan-qr-print-center__qr-box" aria-hidden="true">
            <QrCode size={96} strokeWidth={1.2} />
            <span>미리보기 Placeholder</span>
          </div>
          <div className="titan-qr-print-center__actions">
            <SecondaryButton type="button" onClick={() => handlePlaceholder("미리보기")}>
              <Eye size={14} aria-hidden="true" />
              미리보기
            </SecondaryButton>
            <SecondaryButton type="button" onClick={() => handlePlaceholder("PDF 출력")}>
              <FileDown size={14} aria-hidden="true" />
              PDF 출력
            </SecondaryButton>
            <SecondaryButton type="button" onClick={() => handlePlaceholder("재출력")}>
              <RotateCcw size={14} aria-hidden="true" />
              재출력
            </SecondaryButton>
            <PrimaryButton type="button" onClick={() => handlePlaceholder("인쇄")}>
              <Printer size={14} aria-hidden="true" />
              인쇄
            </PrimaryButton>
          </div>
        </div>
      </div>

      {message ? <p className="environment-form-note">{message}</p> : null}
      <p className="environment-form-note">{QR_PRINT_CENTER.multiCopy}</p>
    </SettingsPanel>
  );
}
