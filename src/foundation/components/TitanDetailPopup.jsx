import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Box from "@mui/material/Box";
import { SecondaryButton } from "./Button";
import { mergeTitanDialogSlotProps, titanDialogTransitionSlots } from "./titanPopupTransition";
import {
  TITAN_STANDARD_DETAIL_POPUP_HEIGHT,
  TITAN_STANDARD_DETAIL_POPUP_WIDTH,
} from "./detailPopup/standardDetailPopupLayout";
import "./detailPopup/detailPopup.css";

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return (
    <div
      role="tabpanel"
      id={`titan-detail-popup-tabpanel-${index}`}
      aria-labelledby={`titan-detail-popup-tab-${index}`}
      className="titan-detail-popup__tab-panel"
    >
      {children}
    </div>
  );
}

/**
 * Project TITAN V1.4 — Management Detail Popup (MUI Dialog · Tabs)
 * size="standard" → 880×660 (운영 화면 Standard Popup 통일)
 */
export default function TitanDetailPopup({
  open,
  onClose,
  title,
  tabs = [],
  renderTabContent,
  initialTabId,
  size = "standard",
}) {
  const [activeTab, setActiveTab] = useState(0);
  const isStandard = size === "standard";

  useEffect(() => {
    if (!open) return;
    if (!initialTabId) {
      setActiveTab(0);
      return;
    }
    const index = tabs.findIndex((tab) => tab.id === initialTabId);
    setActiveTab(index >= 0 ? index : 0);
  }, [open, initialTabId, tabs]);

  const handleClose = () => {
    onClose?.();
  };

  const paperSx = isStandard
    ? {
        width: `${TITAN_STANDARD_DETAIL_POPUP_WIDTH}px`,
        minWidth: `${TITAN_STANDARD_DETAIL_POPUP_WIDTH}px`,
        maxWidth: `${TITAN_STANDARD_DETAIL_POPUP_WIDTH}px`,
        height: `${TITAN_STANDARD_DETAIL_POPUP_HEIGHT}px`,
        minHeight: `${TITAN_STANDARD_DETAIL_POPUP_HEIGHT}px`,
        maxHeight: `${TITAN_STANDARD_DETAIL_POPUP_HEIGHT}px`,
        overflow: "hidden",
        boxSizing: "border-box",
        margin: 0,
        borderRadius: "12px",
      }
    : {
        width: "80%",
        maxWidth: "1800px",
        height: "85%",
        maxHeight: "95vh",
      };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={isStandard ? false : "xl"}
      fullWidth={!isStandard}
      className={`titan-detail-popup${isStandard ? " titan-detail-popup--standard" : ""}`}
      aria-labelledby="titan-detail-popup-title"
      slots={titanDialogTransitionSlots}
      slotProps={mergeTitanDialogSlotProps({
        ...(isStandard
          ? {
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
            }
          : {}),
        paper: {
          className: "titan-detail-popup__paper",
          sx: paperSx,
        },
      })}
    >
      <DialogTitle id="titan-detail-popup-title" className="titan-detail-popup__title">
        {title}
      </DialogTitle>

      {tabs.length > 0 ? (
        <Box className="titan-detail-popup__tabs-wrap">
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label={`${title} 탭`}
            className="titan-detail-popup__tabs"
          >
            {tabs.map((tab, index) => (
              <Tab
                key={tab.id}
                id={`titan-detail-popup-tab-${index}`}
                aria-controls={`titan-detail-popup-tabpanel-${index}`}
                label={tab.label}
              />
            ))}
          </Tabs>
        </Box>
      ) : null}

      <DialogContent className="titan-detail-popup__content" dividers>
        {tabs.length > 0
          ? tabs.map((tab, index) => (
              <TabPanel key={tab.id} value={activeTab} index={index}>
                {renderTabContent?.(tab.id, tab) ?? null}
              </TabPanel>
            ))
          : renderTabContent?.("default", null)}
      </DialogContent>

      <div className="titan-detail-popup__footer">
        <SecondaryButton type="button" onClick={handleClose}>
          닫기
        </SecondaryButton>
      </div>
    </Dialog>
  );
}
