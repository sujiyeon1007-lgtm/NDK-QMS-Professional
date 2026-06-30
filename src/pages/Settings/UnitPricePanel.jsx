import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  addUnitPriceHistory,
  getAllUnitPriceEntries,
  getUnitPriceHistory,
} from "../../utils/unitPriceSession";
import { getJournalReferenceDate } from "../../utils/workJournalData";
import "./UnitPricePanel.css";

function UnitPricePanel() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedKey, setSelectedKey] = useState(null);
  const [form, setForm] = useState({
    company: "",
    partNo: "",
    partName: "",
    effectiveDate: getJournalReferenceDate(),
    price: "",
    note: "",
  });

  const entries = useMemo(() => {
    void refreshKey;
    return getAllUnitPriceEntries();
  }, [refreshKey]);

  const selectedEntry = useMemo(() => {
    if (!selectedKey) return entries[0] ?? null;
    return entries.find((e) => `${e.company}|${e.partNo}` === selectedKey) ?? entries[0] ?? null;
  }, [entries, selectedKey]);

  const history = useMemo(() => {
    if (!selectedEntry) return [];
    return getUnitPriceHistory(selectedEntry.company, selectedEntry.partNo);
  }, [selectedEntry]);

  const handleAddPrice = () => {
    const company = form.company || selectedEntry?.company;
    const partNo = form.partNo || selectedEntry?.partNo;
    const partName = form.partName || selectedEntry?.partName;

    if (!company || !partNo || !form.effectiveDate || !form.price) return;

    addUnitPriceHistory({
      company,
      partNo,
      partName,
      effectiveDate: form.effectiveDate,
      price: form.price,
      note: form.note,
    });

    setSelectedKey(`${company}|${partNo}`);
    setForm((prev) => ({ ...prev, price: "", note: "" }));
    setRefreshKey((k) => k + 1);
  };

  return (
    <section className="unit-price-panel panel">
      <div className="panel-header">
        <div>
          <h3>단가 관리</h3>
          <p>적용일 기준 단가 이력 · 거래명세서는 출력 시점 단가 저장</p>
        </div>
      </div>

      <div className="unit-price-layout">
        <div className="unit-price-list">
          <p className="unit-price-list-title">품목별 단가</p>
          <ul>
            {entries.map((entry) => {
              const key = `${entry.company}|${entry.partNo}`;
              return (
                <li key={key}>
                  <button
                    type="button"
                    className={`unit-price-item${selectedEntry && key === `${selectedEntry.company}|${selectedEntry.partNo}` ? " active" : ""}`}
                    onClick={() => setSelectedKey(key)}
                  >
                    <strong>{entry.partName || entry.partNo}</strong>
                    <span>
                      {entry.company} · {entry.partNo}
                    </span>
                    <em>{entry.currentPrice.toLocaleString()}원</em>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="unit-price-detail">
          {selectedEntry ? (
            <>
              <h4>
                {selectedEntry.partName} ({selectedEntry.partNo})
              </h4>
              <p className="unit-price-sub">{selectedEntry.company}</p>

              <table className="unit-price-history-table">
                <thead>
                  <tr>
                    <th>적용일</th>
                    <th>단가</th>
                    <th>비고</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.id}>
                      <td>{row.effectiveDate}</td>
                      <td>{row.price.toLocaleString()}원</td>
                      <td>{row.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="unit-price-form">
                <p>단가 변경 (이력 추가 · 기존 덮어쓰기 없음)</p>
                <div className="unit-price-form-grid">
                  <label>
                    <span>적용일</span>
                    <input
                      type="date"
                      value={form.effectiveDate}
                      onChange={(e) => setForm((p) => ({ ...p, effectiveDate: e.target.value }))}
                    />
                  </label>
                  <label>
                    <span>단가 (원)</span>
                    <input
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    />
                  </label>
                  <label className="span-2">
                    <span>비고</span>
                    <input
                      type="text"
                      value={form.note}
                      onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                    />
                  </label>
                </div>
                <button type="button" className="unit-price-add-btn" onClick={handleAddPrice}>
                  <Plus size={16} />
                  단가 이력 추가
                </button>
              </div>
            </>
          ) : (
            <p className="unit-price-empty">단가 등록 품목이 없습니다.</p>
          )}

          <div className="unit-price-new">
            <p>신규 품목 단가 등록</p>
            <div className="unit-price-form-grid">
              <label>
                <span>업체명</span>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                />
              </label>
              <label>
                <span>품번</span>
                <input
                  type="text"
                  value={form.partNo}
                  onChange={(e) => setForm((p) => ({ ...p, partNo: e.target.value }))}
                />
              </label>
              <label className="span-2">
                <span>품명</span>
                <input
                  type="text"
                  value={form.partName}
                  onChange={(e) => setForm((p) => ({ ...p, partName: e.target.value }))}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UnitPricePanel;
