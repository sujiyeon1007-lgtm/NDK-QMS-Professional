import { Component } from "react";
import { RotateCcw } from "lucide-react";
import { logTitanError } from "../../utils/titanErrorLogSession";
import { getTitanErrorContext } from "../../utils/titanErrorContext";
import "./TitanErrorBoundary.css";

function resolveScreenLabel(pathname = "") {
  if (pathname.includes("/settings/products")) return "제품관리";
  if (pathname.includes("/documents/inspection")) return "검사기준서";
  if (pathname.includes("/settings/")) return "기준정보관리";
  if (pathname.includes("/documents")) return "문서관리";
  if (pathname.includes("/inout/incoming")) return "입고현황";
  if (pathname.includes("/inout/shipment")) return "출고현황";
  if (pathname.includes("/production/daily-report")) return "작업일보";
  if (pathname.includes("/production/")) return "생산관리";
  if (pathname.includes("/quality/")) return "품질관리";
  if (pathname === "/" || pathname === "") return "HOME";
  return pathname;
}

export default class TitanErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, resetKey: props.resetKey ?? null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  static getDerivedStateFromProps(props, state) {
    if (state.hasError && props.resetKey && props.resetKey !== state.resetKey) {
      return { hasError: false, error: null, resetKey: props.resetKey };
    }
    if (props.resetKey && props.resetKey !== state.resetKey) {
      return { resetKey: props.resetKey };
    }
    return null;
  }

  componentDidCatch(error, info) {
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    const ctx = getTitanErrorContext();
    logTitanError(error, {
      screen: ctx.screen || resolveScreenLabel(path),
      component: ctx.component || info?.componentStack?.split("\n")?.[1]?.trim() || "Unknown",
      path,
    });
    if (import.meta.env.DEV) {
      console.error("[TitanErrorBoundary]", error, info);
    }
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="titan-error-boundary">
          <div className="titan-error-boundary__card">
            <h1>일시적인 오류가 발생했습니다.</h1>
            <p>새로고침하거나 관리자에게 문의하세요.</p>
            <button type="button" className="titan-error-boundary__btn" onClick={this.handleRefresh}>
              <RotateCcw size={16} aria-hidden="true" />
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
