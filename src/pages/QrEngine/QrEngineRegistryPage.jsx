import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  QR_ENGINE_GENERATOR_TYPES,
  QR_ENGINE_ROUTES,
} from "../../config/qrEngineArchitecture";
import {
  getTitanQuickDateRange,
  getTitanStandardDefaultDateRange,
  TITAN_DATE_RANGE_QUICK_FILTERS,
} from "../../config/listSearchStandard";
import {
  SecondaryButton,
  TitanDataTable,
  TitanDashboardCard,
  TitanEmptyState,
  TitanStatusBadge,
  TitanTableFooter,
} from "../../foundation/uiKit";
import { useListPagination } from "../../foundation/hooks/useListPagination";
import {
  listQrEngineRegistryRows,
  scheduleQrEngineAutoRegistrySync,
} from "../../utils/qrEngineRegistryService";

const QR_TYPE_FILTERS = [
  { value: "all", label: "전체" },
  ...Object.values(QR_ENGINE_GENERATOR_TYPES).map((type) => ({
    value: type.registryType,
    label: type.labelKo,
  })),
];
const EMPTY_FILTERS = {
  keyword: "",
  lotNo: "",
  equipment: "",
  company: "",
  partName: "",
};

function normalizeSearch(value) {
  return String(value ?? "").trim().toLowerCase();
}

function exportRegistryCsv(rows) {
  const headers = ["QR ID", "QR 종류", "대상", "생성일", "상태", "재발행", "출력", "스캔 값"];
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
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState(() => getTitanStandardDefaultDateRange());
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const timer = setTimeout(() => {
      if (cancelled) return;
      setRows(listQrEngineRegistryRows({ autoSync: false }));
      setLoading(false);

      scheduleQrEngineAutoRegistrySync({ force: refreshKey > 0 }).then(() => {
        if (!cancelled) {
          setRows(listQrEngineRegistryRows({ autoSync: false }));
        }
      });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [refreshKey]);

  const filteredRows = useMemo(() => {
    if (!rows) return [];
    const keyword = normalizeSearch(filters.keyword);
    const lotNo = normalizeSearch(filters.lotNo);
    const equipment = normalizeSearch(filters.equipment);
    const company = normalizeSearch(filters.company);
    const partName = normalizeSearch(filters.partName);

    return rows.filter((row) => {
      const matchesType = typeFilter === "all" || row.qrType === typeFilter;
      const createdDate = String(row.createdAtLabel ?? row.createdAt ?? "").slice(0, 10);
      const matchesDate =
        (!dateRange.from || !createdDate || createdDate >= dateRange.from) &&
        (!dateRange.to || !createdDate || createdDate <= dateRange.to);
      const matchesKeyword =
        !keyword ||
        [
          row.displayQrId,
          row.qrTypeLabel,
          row.target,
          row.scanValue,
          row.status,
          row.connectionLabel,
        ].some((value) => normalizeSearch(value).includes(keyword));
      const matchesLot =
        !lotNo ||
        normalizeSearch(row.lotNo || (row.qrType === "lot" ? row.target : "")).includes(lotNo);
      const matchesEquipment =
        !equipment ||
        normalizeSearch(row.equipmentName || (row.qrType === "equipment" ? row.target : "")).includes(
          equipment
        );
      const matchesCompany = !company || normalizeSearch(row.companyName).includes(company);
      const matchesPart = !partName || normalizeSearch(row.partName).includes(partName);
      return (
        matchesType &&
        matchesDate &&
        matchesKeyword &&
        matchesLot &&
        matchesEquipment &&
        matchesCompany &&
        matchesPart
      );
    });
  }, [rows, filters, typeFilter, dateRange]);

  const {
    page,
    pageSize,
    totalCount,
    totalPages,
    pagedItems: pagedRows,
    setPage,
    setPageSize,
  } = useListPagination(filteredRows);

  useEffect(() => {
    setPage(1);
  }, [filters, typeFilter, dateRange, setPage]);

  const columns = [
    { key: "displayQrId", label: "QR 번호", widthPercent: 10 },
    { key: "qrTypeLabel", label: "QR 유형", widthPercent: 10 },
    { key: "connectionLabel", label: "연결 대상", widthPercent: 18 },
    { key: "createdAtLabel", label: "생성일", widthPercent: 10 },
    {
      key: "status",
      label: "상태",
      widthPercent: 10,
      render: (row) => (
        <TitanStatusBadge
          status={row.statusKey === "regenerated" ? "processing" : "success"}
          text={row.status}
        />
      ),
    },
    { key: "reissueCount", label: "재발행", widthPercent: 8 },
    { key: "printCount", label: "출력", widthPercent: 8 },
  ];

  const navigateByQrRow = (row) => {
    if (row.qrType === "lot") {
      navigate(QR_ENGINE_ROUTES.lotLifecycle(row.target));
      return;
    }
    if (row.qrType === "equipment") {
      navigate(QR_ENGINE_ROUTES.equipmentWork(row.target));
      return;
    }
    if (row.qrType === "inbound") {
      navigate(QR_ENGINE_ROUTES.inboundEntry);
      return;
    }
    if (row.qrType === "outbound") {
      navigate(QR_ENGINE_ROUTES.outboundEntry);
      return;
    }
    if (row.qrType === "product") {
      navigate(QR_ENGINE_ROUTES.productEntry(row.target));
      return;
    }
    if (row.qrType === "material") {
      navigate(QR_ENGINE_ROUTES.materialEntry(row.target));
      return;
    }
    if (row.qrType === "document") {
      navigate(QR_ENGINE_ROUTES.documentEntry);
      return;
    }
    if (row.qrType === "worker") {
      navigate(QR_ENGINE_ROUTES.workerEntry(row.target));
    }
  };

  return (
    <div className="qr-engine-page">
      <TitanDashboardCard title="QR 목록">
        <div className="qr-engine-registry-toolbar" aria-label="QR 목록 검색 및 필터">
          <label className="qr-engine-registry-field">
            <span>QR 번호</span>
            <input
              className="titan-input"
              value={filters.keyword}
              onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
              placeholder="QR 번호 · 스캔 값"
            />
          </label>
          <label className="qr-engine-registry-field">
            <span>LOT 번호</span>
            <input
              className="titan-input"
              value={filters.lotNo}
              onChange={(event) => setFilters((prev) => ({ ...prev, lotNo: event.target.value }))}
              placeholder="LOT.NO"
            />
          </label>
          <label className="qr-engine-registry-field">
            <span>설비</span>
            <input
              className="titan-input"
              value={filters.equipment}
              onChange={(event) => setFilters((prev) => ({ ...prev, equipment: event.target.value }))}
              placeholder="설비명 · 코드"
            />
          </label>
          <label className="qr-engine-registry-field">
            <span>업체</span>
            <input
              className="titan-input"
              value={filters.company}
              onChange={(event) => setFilters((prev) => ({ ...prev, company: event.target.value }))}
              placeholder="업체명"
            />
          </label>
          <label className="qr-engine-registry-field">
            <span>품명</span>
            <input
              className="titan-input"
              value={filters.partName}
              onChange={(event) => setFilters((prev) => ({ ...prev, partName: event.target.value }))}
              placeholder="품명"
            />
          </label>
          <label className="qr-engine-registry-field">
            <span>QR 종류</span>
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
          <div className="qr-engine-registry-field qr-engine-registry-field--date">
            <span>생성일</span>
            <div className="qr-engine-registry-date-range">
              <input
                className="titan-input"
                type="date"
                value={dateRange.from}
                onChange={(event) => setDateRange((prev) => ({ ...prev, from: event.target.value }))}
                aria-label="생성일 시작"
              />
              <span aria-hidden="true">~</span>
              <input
                className="titan-input"
                type="date"
                value={dateRange.to}
                onChange={(event) => setDateRange((prev) => ({ ...prev, to: event.target.value }))}
                aria-label="생성일 종료"
              />
            </div>
            <div className="titan-advanced-search__date-quick" aria-label="생성일 빠른 기간">
              {TITAN_DATE_RANGE_QUICK_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className="titan-advanced-search__date-quick-btn"
                  onClick={() => setDateRange(getTitanQuickDateRange(filter.id))}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <div className="qr-engine-registry-actions">
            <SecondaryButton
              type="button"
              onClick={() => {
                setFilters(EMPTY_FILTERS);
                setTypeFilter("all");
                setDateRange(getTitanStandardDefaultDateRange());
              }}
            >
              초기화
            </SecondaryButton>
            <SecondaryButton type="button" onClick={() => setRefreshKey((v) => v + 1)} disabled={loading}>
              {loading ? "불러오는 중" : "새로고침"}
            </SecondaryButton>
            <SecondaryButton type="button" disabled={loading || !filteredRows.length} onClick={() => exportRegistryCsv(filteredRows)}>
              CSV 내보내기
            </SecondaryButton>
          </div>
        </div>

        {loading ? (
          <TitanEmptyState
            title="QR 목록을 불러오는 중입니다."
            description="화면은 먼저 표시하고 Registry 목록은 비동기로 불러옵니다."
          />
        ) : filteredRows.length ? (
          <>
            <p className="qr-engine-registry-count" role="status">
              총 {totalCount.toLocaleString("ko-KR")}건
            </p>
            <TitanDataTable
              layout="compact"
              columns={columns}
              rows={pagedRows}
              onRowDoubleClick={navigateByQrRow}
              emptyMessage="등록된 QR이 없습니다. QR 생성 화면에서 QR을 생성하세요."
            />
            <TitanTableFooter
              totalCount={totalCount}
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        ) : (
          <TitanEmptyState
            title="표시할 QR 목록이 없습니다."
            description="검색 조건을 초기화하거나 QR 생성 화면에서 QR을 생성하세요."
          />
        )}
      </TitanDashboardCard>

      <p className="qr-engine-hint" role="note">
        행 더블클릭: LOT QR은 LOT Lifecycle로, 설비 QR은 설비 작업 화면으로 이동합니다.
      </p>
    </div>
  );
}