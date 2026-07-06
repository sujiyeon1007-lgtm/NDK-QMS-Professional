import Grow from "@mui/material/Grow";

/** ERP-style popup — subtle fade + scale (과한 애니메이션 금지) */
export const TITAN_POPUP_TRANSITION_DURATION = 180;

export const TitanPopupGrowTransition = Grow;

export const titanDialogTransitionProps = {
  TransitionComponent: TitanPopupGrowTransition,
  transitionDuration: TITAN_POPUP_TRANSITION_DURATION,
};
