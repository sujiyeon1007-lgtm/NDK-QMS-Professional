import { formatQtyWithUnit } from "../../utils/productUnits";
import { getPrintDateTime, getPrintUser } from "../../utils/titanPrintContext";
import { getProductionProcessName } from "../../config/productionProcessCodes";
import { resolveCriterionItemUnit } from "../../utils/inspectionCriteriaModel";
import {
  getCompanyBrandingSignatureUrl,
  getCompanyBrandingStampUrl,
} from "../../utils/companyWorkspaceService";
import TitanPrintPage from "./TitanPrintPage";
import TitanPrintPageHeader from "./TitanPrintPageHeader";
import TitanPrintOfficialFooter from "./TitanPrintOfficialFooter";
import "./titan-print.css";

/** 성적서 전용 양식 — 개발 예정 (Preview·출력 연동용 스텁) */
function CertificatePrint({ record, printDateTime = "", printUser = "" }) {
  const resolvedPrintDateTime = printDateTime || getPrintDateTime();
  const resolvedPrintUser = printUser || getPrintUser();
  const stampUrl = getCompanyBrandingStampUrl();
  const signatureUrl = getCompanyBrandingSignatureUrl();

  return (
    <div className="titan-print-document certificate-print" aria-label="성적서">
      <TitanPrintPage
        pageNumber={1}
        totalPages={1}
        isLast
        printDateTime={resolvedPrintDateTime}
        printUser={resolvedPrintUser}
        orientation="portrait"
      >
        <TitanPrintPageHeader title="성적서 (Certificate of Analysis)" />

        {record ? (
          <>
            <div className="titan-print-meta">
              <span>
                관리번호 <strong>{record.id}</strong>
              </span>
              <span>
                LOT No. <strong>{record.lotNo || "—"}</strong>
              </span>
            </div>

            <section className="titan-print-section">
              <h2>제품 정보</h2>
              <table className="titan-print-info-table">
                <tbody>
                  <tr>
                    <th>업체명</th>
                    <td colSpan={3}>{record.company || "—"}</td>
                  </tr>
                  <tr>
                    <th>품명</th>
                    <td>{record.partName || "—"}</td>
                    <th>품번</th>
                    <td>{record.partNo || "—"}</td>
                  </tr>
                  <tr>
                    <th>재질</th>
                    <td>{record.material || "—"}</td>
                    <th>수량</th>
                    <td>{formatQtyWithUnit(record.qty, record.unit)}</td>
                  </tr>
                  <tr>
                    <th>공정</th>
                    <td colSpan={3}>{getProductionProcessName(record) || "—"}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="titan-print-section">
              <h2>검사 결과</h2>
              {Array.isArray(record.hardnessRows) && record.hardnessRows.length > 0 ? (
                <table className="titan-print-info-table">
                  <thead>
                    <tr>
                      <th>항목</th>
                      <th>스펙</th>
                      <th>측정값</th>
                      <th>단위</th>
                      <th>판정</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.hardnessRows.map((row) => (
                      <tr key={row.key || row.item}>
                        <td>{row.item || "—"}</td>
                        <td>{row.spec || "—"}</td>
                        <td>{row.measuredRaw ?? row.measured ?? "—"}</td>
                        <td>
                          {resolveCriterionItemUnit(
                            row.key,
                            { unit: row.unit },
                            record.hardnessUnit || "HV"
                          )}
                        </td>
                        <td>{row.judgment || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="titan-print-placeholder">
                  성적서 양식은 품질 문서 전용 Form 개발 후 이 영역에 연동됩니다.
                </p>
              )}
            </section>

            {(stampUrl || signatureUrl) ? (
              <div className="titan-print-branding-block" aria-label="Company Branding">
                {stampUrl ? (
                  <img className="titan-print-branding-seal" src={stampUrl} alt="회사 직인" />
                ) : null}
                {signatureUrl ? (
                  <img
                    className="titan-print-branding-signature"
                    src={signatureUrl}
                    alt="대표이사 서명"
                  />
                ) : null}
              </div>
            ) : null}
            <TitanPrintOfficialFooter documentCode="DOC-03" notes={[]} useCompanyFooter />
          </>
        ) : (
          <p className="titan-print-placeholder">출력할 성적서 대상을 선택하세요.</p>
        )}
      </TitanPrintPage>
    </div>
  );
}

export default CertificatePrint;
