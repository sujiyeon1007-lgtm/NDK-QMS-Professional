import { useMemo, useState } from "react";

import { buildTransactionStatementPrintProps } from "../../utils/titanPrintPreviewHelpers";
import { exportTitanPdf, printTitanDocument } from "../../utils/titanPrintExport";
import {
  recordTransactionStatementPrint,
  updateTransactionStatementOutputStatus,
} from "../../utils/outboundRegistration";

function normalizeTransactionStatementSource(source = {}, options = {}) {
  const record = source.record ?? source;
  if (!record?.id) return null;

  return {
    record,
    shipQty: options.shipQty ?? source.shipQty,
    issueDate:
      options.issueDate ??
      (source.printedAt && source.printedAt !== "-" ? source.printedAt : undefined),
  };
}

export function useTransactionStatementDocumentOutput({ onAfterOutput } = {}) {
  const [previewSource, setPreviewSource] = useState(null);
  const [busy, setBusy] = useState(false);
  const [issueResult, setIssueResult] = useState(null);

  const printProps = useMemo(() => {
    if (!previewSource?.record) return null;
    return buildTransactionStatementPrintProps(previewSource.record, {
      shipQty: previewSource.shipQty,
      issueDate: previewSource.issueDate,
    });
  }, [previewSource]);

  const openPreview = (source, options = {}) => {
    const normalized = normalizeTransactionStatementSource(source, options);
    if (!normalized) return false;
    setPreviewSource(normalized);
    return true;
  };

  const closePreview = () => setPreviewSource(null);

  const recordOutput = (outputType) => {
    if (!printProps?.record) return null;
    const statement = recordTransactionStatementPrint(printProps.record, {
      shipQty: printProps.shipQtyNumeric,
      unitPrice: printProps.unitPrice,
      amounts: printProps.amounts,
      outputType,
    });
    if (statement) {
      setIssueResult({
        statement,
        outputStatus: statement.outputStatus,
      });
    }
    onAfterOutput?.(printProps);
    return statement;
  };

  const print = async (documentEl) => {
    setBusy(true);
    try {
      await printTitanDocument(documentEl);
      recordOutput("print");
    } finally {
      setBusy(false);
    }
  };

  const pdf = async (documentEl) => {
    setBusy(true);
    try {
      const id = printProps?.record?.id ?? "statement";
      await exportTitanPdf(documentEl, `transaction-statement-${id}.pdf`);
      recordOutput("pdf");
    } finally {
      setBusy(false);
    }
  };

  const confirmIssueResult = (outputStatus) => {
    if (!issueResult?.statement) {
      setIssueResult(null);
      return;
    }
    updateTransactionStatementOutputStatus(
      issueResult.statement.managementId,
      issueResult.statement.id,
      outputStatus
    );
    setIssueResult(null);
    onAfterOutput?.(printProps);
  };

  return {
    busy,
    closePreview,
    confirmIssueResult,
    closeIssueResult: () => setIssueResult(null),
    isOpen: Boolean(printProps),
    issueResult,
    openPreview,
    pdf,
    previewSource,
    print,
    printProps,
  };
}