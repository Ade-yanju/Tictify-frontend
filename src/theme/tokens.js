// Design Tokens - Single source of truth for design
// These tokens should be synchronized with Figma

export const tokens = {
  // Color Palette
  colors: {
    // Primary (Tictify Brand)
    primary: {
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7", // Main brand color
      600: "#9333ea",
      700: "#7e22ce",
      800: "#6b21a8",
      900: "#581c87",
    },

    // Secondary (Accent)
    secondary: {
      50: "#fdf2f8",
      100: "#fce7f3",
      200: "#fbcfe8",
      300: "#f8b4d9",
      400: "#f472b6",
      500: "#ec4899", // Secondary accent
      600: "#db2777",
      700: "#be185d",
      800: "#9d174d",
      900: "#831843",
    },

    // Success
    success: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#145231",
    },

    // Warning
    warning: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },

    // Danger/Error
    danger: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },

    // Info
    info: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },

    // Neutral
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#eeeeee",
      300: "#e0e0e0",
      400: "#bdbdbd",
      500: "#9e9e9e",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },

    // Semantic
    background: "#ffffff",
    surface: "#f9fafb",
    text: "#1f2937",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
    hover: "#f3f4f6",
  },

  // Typography
  typography: {
    // Font Families
    fontFamily: {
      display: "'Syne', system-ui, sans-serif",
      body: "'DM Sans', system-ui, sans-serif",
      mono: "'Fira Code', 'Courier New', monospace",
    },

    // Font Sizes
    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
    },

    // Font Weights
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    // Line Heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },

    // Letter Spacing
    letterSpacing: {
      tight: "-0.02em",
      normal: "0em",
      wide: "0.02em",
      wider: "0.05em",
      widest: "0.1em",
    },
  },

  // Spacing (8px base unit)
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "2.5rem", // 40px
    "3xl": "3rem", // 48px
    "4xl": "4rem", // 64px
  },

  // Border Radius
  borderRadius: {
    none: "0",
    sm: "0.25rem", // 4px
    base: "0.375rem", // 6px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
    full: "9999px",
  },

  // Shadows
  shadow: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  },

  // Transitions
  transition: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    base: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "350ms cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // Z-index scale
  zIndex: {
    hide: "-1",
    auto: "auto",
    base: "0",
    dropdown: "1000",
    sticky: "1020",
    fixed: "1030",
    backdrop: "1040",
    modal: "1050",
    tooltip: "1070",
  },

  // Breakpoints
  breakpoints: {
    xs: "320px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

// Component-specific tokens
export const componentTokens = {
  // Button
  button: {
    height: {
      sm: "2rem", // 32px
      md: "2.5rem", // 40px
      lg: "3rem", // 48px
    },
    padding: {
      sm: "0.5rem 1rem",
      md: "0.75rem 1.5rem",
      lg: "1rem 2rem",
    },
    fontSize: {
      sm: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
    },
  },

  // Input
  input: {
    height: "2.5rem", // 40px
    padding: "0.75rem 1rem",
    borderRadius: "0.5rem",
  },

  // Card
  card: {
    padding: "1.5rem",
    borderRadius: "0.75rem",
    shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
  },

  // Modal
  modal: {
    padding: "2rem",
    maxWidth: "32rem", // 512px
    borderRadius: "0.75rem",
  },
};

export default tokens;
