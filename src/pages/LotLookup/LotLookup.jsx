import { Navigate, useSearchParams } from "react-router-dom";

/** Legacy LOT 조회 → Sprint 9 Phase 5 LOT Lifecycle */
export default function LotLookup() {
  const [searchParams] = useSearchParams();
  const lot = searchParams.get("lot");
  const target = lot ? `/quality/lot-lifecycle?lot=${encodeURIComponent(lot)}` : "/quality/lot-lifecycle";
  return <Navigate to={target} replace />;
}
