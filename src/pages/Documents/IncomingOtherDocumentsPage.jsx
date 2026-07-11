import IncomingDocumentArchivePage from "./IncomingDocumentArchivePage";

export default function IncomingOtherDocumentsPage() {
  return (
    <IncomingDocumentArchivePage
      pageTitle="기타 수신문서"
      pageDescription="발주서·반출증 외 수신 문서를 보관·검색합니다."
      excludeDocumentTypes={["purchaseOrder", "releaseSlip"]}
      hideTypeFilter
    />
  );
}
