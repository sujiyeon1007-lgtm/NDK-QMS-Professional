/** Project TITAN 공통 결재란 */
function TitanApprovalBox() {
  return (
    <table className="titan-print-approval" aria-label="결재">
      <thead>
        <tr>
          <th scope="col">작성</th>
          <th scope="col">검토</th>
          <th scope="col">승인</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td aria-label="작성 서명" />
          <td aria-label="검토 서명" />
          <td aria-label="승인 서명" />
        </tr>
      </tbody>
    </table>
  );
}

export default TitanApprovalBox;
