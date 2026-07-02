/**
 * 통계 Dashboard Mock (UI · Sprint 9)
 * 실제 집계는 SQLite 연동 후 · 현재는 Chart UI만
 */

export const PERIOD_OPTIONS = [
  { key: "day", label: "일" },
  { key: "week", label: "주" },
  { key: "month", label: "월" },
  { key: "year", label: "연" },
];

const base = {
  kpis: {
    totalIncoming: 128,
    totalShipment: 96,
    lotCreated: 42,
    certificateIssued: 88,
    shipmentDone: 82,
    inProgress: 26,
    certPending: 14,
    shipWaiting: 6,
  },
  periodTrend: [
    { label: "1", value: 12 },
    { label: "2", value: 18 },
    { label: "3", value: 15 },
    { label: "4", value: 22 },
    { label: "5", value: 19 },
    { label: "6", value: 24 },
    { label: "7", value: 18 },
  ],
  byCompany: [
    { label: "서암기계공업", value: 44 },
    { label: "현대위아", value: 0 },
    { label: "두산에너빌리티", value: 0 },
    { label: "SNT다이내믹스", value: 0 },
    { label: "한화에어로스페이스", value: 0 },
    { label: "GE", value: 0 },
  ],
  byHeatTreatment: [
    { label: "가스질화", value: 45 },
    { label: "침탄", value: 38 },
    { label: "이온질화", value: 22 },
    { label: "고주파", value: 15 },
    { label: "염욕질화", value: 8 },
  ],
  byMaterial: [
    { label: "SCM440", value: 42 },
    { label: "S45C", value: 35 },
    { label: "SNCM220", value: 28 },
    { label: "SUJ2", value: 23 },
  ],
  lotStatus: [
    { label: "LOT 등록", value: 42 },
    { label: "작업관리표", value: 38 },
    { label: "QR 생성", value: 38 },
    { label: "진행중 LOT", value: 12 },
  ],
  certificateStatus: [
    { label: "발행완료", value: 88 },
    { label: "미발행", value: 14 },
  ],
  shipmentStatus: [
    { label: "출고완료", value: 82 },
    { label: "출고대기", value: 6 },
    { label: "성적서 대기", value: 8 },
  ],
};

export const STATISTICS_MOCK_BY_PERIOD = {
  day: {
    ...base,
    periodLabel: "금일",
    kpis: { ...base.kpis, totalIncoming: 8, totalShipment: 6, lotCreated: 3, certificateIssued: 5, shipmentDone: 4 },
    periodTrend: [
      { label: "08", value: 1 },
      { label: "10", value: 2 },
      { label: "12", value: 1 },
      { label: "14", value: 3 },
      { label: "16", value: 2 },
    ],
  },
  week: {
    ...base,
    periodLabel: "이번 주",
    kpis: { ...base.kpis, totalIncoming: 42, totalShipment: 35, lotCreated: 14, certificateIssued: 32, shipmentDone: 28 },
  },
  month: {
    ...base,
    periodLabel: "이번 달",
  },
  year: {
    ...base,
    periodLabel: "올해",
    kpis: {
      totalIncoming: 1520,
      totalShipment: 1180,
      lotCreated: 486,
      certificateIssued: 1024,
      shipmentDone: 980,
      inProgress: 210,
      certPending: 96,
      shipWaiting: 44,
    },
    periodTrend: [
      { label: "1월", value: 98 },
      { label: "2월", value: 112 },
      { label: "3월", value: 105 },
      { label: "4월", value: 128 },
      { label: "5월", value: 118 },
      { label: "6월", value: 132 },
    ],
  },
};

export function getStatisticsMock(periodKey) {
  return STATISTICS_MOCK_BY_PERIOD[periodKey] ?? STATISTICS_MOCK_BY_PERIOD.month;
}
