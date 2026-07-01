/**
 * Project TITAN V1.0 — Status Chip MUI Icon Registry
 * 이모지 사용 금지 · Material UI Icons 통일
 */

import CancelOutlined from "@mui/icons-material/CancelOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import HourglassTopOutlined from "@mui/icons-material/HourglassTopOutlined";
import InventoryOutlined from "@mui/icons-material/InventoryOutlined";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import PrecisionManufacturingOutlined from "@mui/icons-material/PrecisionManufacturingOutlined";
import ReplayOutlined from "@mui/icons-material/ReplayOutlined";
import TaskAltOutlined from "@mui/icons-material/TaskAltOutlined";
import TodayOutlined from "@mui/icons-material/TodayOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";

/** @type {Record<string, import("react").ComponentType<{ className?: string }>>} */
export const STATUS_CHIP_ICONS = {
  inventory: InventoryOutlined,
  precisionManufacturing: PrecisionManufacturingOutlined,
  factCheck: FactCheckOutlined,
  description: DescriptionOutlined,
  localShipping: LocalShippingOutlined,
  today: TodayOutlined,
  hourglass: HourglassTopOutlined,
  taskAlt: TaskAltOutlined,
  cancel: CancelOutlined,
  replay: ReplayOutlined,
  warning: WarningAmberOutlined,
};

/**
 * @param {string} iconKey
 * @returns {import("react").ComponentType<{ className?: string }> | null}
 */
export function resolveStatusChipIcon(iconKey) {
  if (!iconKey) return null;
  return STATUS_CHIP_ICONS[iconKey] ?? null;
}
