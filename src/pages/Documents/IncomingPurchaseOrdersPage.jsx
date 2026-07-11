import IncomingDocumentArchivePage from "./IncomingDocumentArchivePage";

export default function IncomingPurchaseOrdersPage() {
  return (
    <IncomingDocumentArchivePage
      pageTitle="발주서"
      pageDescription="거래처에서 수신한 발주서를 보관·검색합니다."
      fixedDocumentType="purchaseOrder"
      hideTypeFilter
    />
  );
}
