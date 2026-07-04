import { createTheme } from "@mui/material/styles";

/** Login UI V1.1 — HOME · Foundation tokens 와 동일 톤 */
export const titanLoginTheme = createTheme({
  palette: {
    primary: {
      main: "#2563eb",
      dark: "#1d4ed8",
    },
    text: {
      primary: "#1f2937",
      secondary: "#6b7280",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    divider: "#d8e2f1",
    error: {
      main: "#dc2626",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily:
      '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 800,
          fontSize: "14px",
          borderRadius: 10,
          minHeight: 44,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        containedPrimary: {
          backgroundColor: "#2563eb",
          transition: "background-color 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            backgroundColor: "#1d4ed8",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.32)",
          },
          "&:active": {
            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.24)",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        size: "small",
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            backgroundColor: "#ffffff",
            fontWeight: 700,
            fontSize: "14px",
            transition: "box-shadow 0.2s ease",
            "& fieldset": {
              borderColor: "#d8e2f1",
            },
            "&:hover fieldset": {
              borderColor: "#93c5fd",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2563eb",
              borderWidth: 2,
            },
            "&.Mui-focused": {
              boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.12)",
            },
          },
          "& .MuiInputLabel-root": {
            fontWeight: 800,
            fontSize: "11px",
            letterSpacing: "0.04em",
            color: "#6b7280",
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#94a3b8",
          "&.Mui-checked": {
            color: "#2563eb",
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontSize: "13px",
          fontWeight: 700,
          color: "#1f2937",
        },
      },
    },
  },
});
