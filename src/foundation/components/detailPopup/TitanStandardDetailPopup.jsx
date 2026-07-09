import { useEffect, useState } from "react";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Box from "@mui/material/Box";

import { SecondaryButton } from "../Button";
import { FoundationDocumentAction } from "../FoundationActionBar";
import { mergeTitanDialogSlotProps, titanDialogTransitionSlots } from "../titanPopupTransition";
import TitanStandardDetailPopupProductHeader from "./TitanStandardDetailPopupProductHeader";
import {
  TITAN_STANDARD_DETAIL_POPUP_HEIGHT,
  TITAN_STANDARD_DETAIL_POPUP_WIDTH,
} from "./standardDetailPopupLayout";
import { TITAN_STANDARD_DETAIL_POPUP_TABS } from "./standardDetailPopupTabs";
import "./detailPopup.css";
import "./standardDetailPopup.css";

function StandardDetailPopupTabPanel({ children, value, index }) {
  const isActive = Number(value) === index;

  return (
    <div
      role="tabpanel"
      id={`titan-standard-detail-popup-tabpanel-${index}`}
      aria-labelledby={`titan-standard-detail-popup-tab-${index}`}
      aria-hidden={!isActive}
      className={["titan-standard-detail-popup__tab-panel", isActive ? "is-active" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="titan-standard-detail-popup__tab-panel-inner">{children}</div>
    </div>
  );
}

/**
 * Project TITAN — Standard Detail Popup (UI Freeze)
 * 입고 · 생산 · 검사 · 성적서 · 출고 · 이력조회 공통 Shell
 */
export default function TitanStandardDetailPopup({
  open,
  onClose,
  tabs = TITAN_STANDARD_DETAIL_POPUP_TABS,
  summary,
  renderTabContent,
  footerActions,
  initialTabId,
  ariaLabel = "상세보기",
}) {
  const [activeTab, setActiveTab] = useState(0);
  const paperSlotProps = {
    className: "titan-detail-popup__paper titan-standard-detail-popup__paper",
    sx: {
      width: `${TITAN_STANDARD_DETAIL_POPUP_WIDTH}px`,
      minWidth: `${TITAN_STANDARD_DETAIL_POPUP_WIDTH}px`,
      maxWidth: `${TITAN_STANDARD_DETAIL_POPUP_WIDTH}px`,
      height: `${TITAN_STANDARD_DETAIL_POPUP_HEIGHT}px`,
      minHeight: `${TITAN_STANDARD_DETAIL_POPUP_HEIGHT}px`,
      maxHeight: `${TITAN_STANDARD_DETAIL_POPUP_HEIGHT}px`,
      overflow: "hidden",
      boxSizing: "border-box",
      flexShrink: 0,
      flexGrow: 0,
      margin: 0,
    },
  };

  useEffect(() => {
    if (!open) return;
    if (!initialTabId) {
      setActiveTab(0);
      return;
    }
    const index = tabs.findIndex((tab) => tab.id === initialTabId);
    setActiveTab(index >= 0 ? index : 0);
  }, [open, initialTabId, tabs]);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={false}
      maxWidth={false}
      scroll="paper"
      className="titan-detail-popup titan-standard-detail-popup"
      aria-labelledby="titan-standard-detail-popup-summary"
      slots={titanDialogTransitionSlots}
      slotProps={mergeTitanDialogSlotProps({
        container: {
          sx: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100vw",
            height: "100dvh",
            margin: 0,
            padding: 0,
          },
        },
        paper: paperSlotProps,
      })}
    >
      <div className="titan-standard-detail-popup__shell">
        <TitanStandardDetailPopupProductHeader summary={summary} />

        <Box className="titan-detail-popup__tabs-wrap titan-standard-detail-popup__tabs-wrap">
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label={`${ariaLabel} 탭`}
            className="titan-detail-popup__tabs"
          >
            {tabs.map((tab, index) => (
              <Tab
                key={tab.id}
                value={index}
                id={`titan-standard-detail-popup-tab-${index}`}
                aria-controls={`titan-standard-detail-popup-tabpanel-${index}`}
                label={tab.label}
              />
            ))}
          </Tabs>
        </Box>

        <DialogContent
          className="titan-detail-popup__content titan-standard-detail-popup__content"
          dividers
        >
          <div className="titan-standard-detail-popup__tab-stage">
            {tabs.map((tab, index) => (
              <StandardDetailPopupTabPanel key={tab.id} value={activeTab} index={index}>
                {renderTabContent?.(tab.id, tab) ?? null}
              </StandardDetailPopupTabPanel>
            ))}
          </div>
        </DialogContent>

        <div className="titan-detail-popup__footer titan-standard-detail-popup__footer">
          {footerActions?.length ? (
            <FoundationDocumentAction actions={footerActions} ariaLabel={`${ariaLabel} 문서 작업`} />
          ) : (
            <SecondaryButton type="button" onClick={onClose}>
              닫기
            </SecondaryButton>
          )}
        </div>
      </div>
    </Dialog>
  );
}
