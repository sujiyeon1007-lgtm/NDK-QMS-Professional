import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { QR_ENGINE_ROUTES } from "../../config/qrEngineArchitecture";
import {
  SecondaryButton,
  TitanDataTable,
  TitanDashboardCard,
  TitanEmptyState,
  TitanStatusBadge,
} from "../../foundation/uiKit";
import { listQrEngineRegistryRows } from "../../utils/qrEngineRegistryService";

const QR_TYPE_FILTERS = [
  { value: "all", label: "전체" },
  { value: "equipment", label: "Equipment" },
  { value: "lot", label: "LOT" },
];

function normalizeSearch(value) {
  return String(value ?? "").trim().toLowerCase();
}

function exportRegistryCsv(rows) {
  const headers = ["QR ID", "QR Type", "Target", "Created Date", "Status", "Reissue", "Print", "Scan Value"];
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const body = rows.map((row) =>
    [
      row.displayQrId,
      row.qrTypeLabel,
      row.target,
      row.createdAtLabel,
      row.status,
      row.reissueCount,
      row.printCount,
      row.scanValue,
    ].map(escape).join(",")
  );
  const blob = new Blob([[headers.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `qr-registry-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function QrEngineRegistryPage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const rows = useMemo(() => listQrEngineRegistryRows(), [refreshKey]);
  const filteredRows = useMemo(() => {
    const keyword = normalizeSearch(search);
    return rows.filter((row) => {
      const matchesType = typeFilter === "all" || row.qrType === typeFilter;
      const matchesKeyword =
        !keyword ||
        [row.displayQrId, row.qrTypeLabel, row.target, row.scanValue, row.status]
          .some((value) => normalizeSearch(value).includes(keyword));
      return matchesType && matchesKeyword;
    });
  }, [rows, search, typeFilter]);

  const columns = [
    { key: "displayQrId", label: "QR ID", widthPercent: 10 },
    { key: "qrTypeLabel", label: "QR Type", widthPercent: 12 },
    { key: "target", label: "Target", widthPercent: 18 },
    { key: "createdAtLabel", label: "Created Date", widthPercent: 12 },
    {
      key: "status",
      label: "Status",
      widthPercent: 10,
      render: (row) => (
        <TitanStatusBadge
          status={row.statusKey === "regenerated" ? "processing" : "success"}
          text={row.status}
        />
      ),
    },
    { key: "reissueCount", label: "Reissue", widthPercent: 8 },
    { key: "printCount", label: "Print", widthPercent: 8 },
    { key: "scanValue", label: "Scan Value", widthPercent: 22 },
  ];

  return (
    <div className="qr-engine-page">
      <TitanDashboardCard title="QR Registry">
        <div className="qr-engine-registry-toolbar" aria-label="QR Registry 검색 및 필터">
          <label className="qr-engine-registry-field">
            <span>검색</span>
            <input
              className="titan-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="QR ID · Target · Scan Value"
            />
          </label>
          <label className="qr-engine-registry-field">
            <span>QR Type</span>
            <select
              className="titan-input"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              {QR_TYPE_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </label>
          <div className="qr-engine-registry-actions">
            <SecondaryButton
              type="button"
              onClick={() => {
                setSearch("");
                setTypeFilter("all");
              }}
            >
              초기화
            </SecondaryButton>
            <SecondaryButton type="button" onClick={() => setRefreshKey((v) => v + 1)}>
              새로고침
            </SecondaryButton>
            <SecondaryButton type="button" disabled={!filteredRows.length} onClick={() => exportRegistryCsv(filteredRows)}>
              CSV Export
            </SecondaryButton>
          </div>
        </div>

        {filteredRows.length ? (
          <TitanDataTable
            layout="compact"
            columns={columns}
            rows={filteredRows}
            onRowDoubleClick={(row) => {
              if (row.qrType === "lot") {
                navigate(QR_ENGINE_ROUTES.lotLifecycle(row.target));
                return;
              }
              navigate(QR_ENGINE_ROUTES.equipmentWork(row.target));
            }}
            emptyMessage="Registry QR가 없습니다. Generator에서 QR을 생성하세요."
          />
        ) : (
          <TitanEmptyState
            title="표시할 QR Registry가 없습니다."
            description="검색 조건을 초기화하거나 Generator에서 QR을 생성하세요."
          />
        )}
      </TitanDashboardCard>

      <p className="qr-engine-hint" role="note">
        행 더블클릭: Equipment → 현재 작업 · LOT → LOT Lifecycle
      </p>
    </div>
  );
}