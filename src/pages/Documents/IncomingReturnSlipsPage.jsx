import IncomingDocumentArchivePage from "./IncomingDocumentArchivePage";

export default function IncomingReturnSlipsPage() {
  return (
    <IncomingDocumentArchivePage
      pageTitle="반출증"
      pageDescription="거래처에서 수신한 반출증을 보관·검색합니다."
      fixedDocumentType="releaseSlip"
      hideTypeFilter
    />
  );
}
