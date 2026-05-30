/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // BMW design tokens
        "bmw-blue":          "#1c69d4",
        "bmw-blue-active":   "#0653b6",
        "bmw-blue-disabled": "#d6d6d6",
        "bmw-dark":          "#1a2129",
        "bmw-dark-elevated": "#262e38",
        "bmw-canvas":        "#ffffff",
        "bmw-soft":          "#f7f7f7",
        "bmw-card":          "#fafafa",
        "bmw-strong":        "#ebebeb",
        "bmw-ink":           "#262626",
        "bmw-body":          "#3c3c3c",
        "bmw-muted":         "#6b6b6b",
        "bmw-muted-soft":    "#9a9a9a",
        "bmw-hairline":      "#e6e6e6",
        "bmw-hairline-strong":"#cccccc",
        "on-dark":           "#ffffff",
        "on-dark-soft":      "#bbbbbb",
      },
      fontFamily: {
        bmw: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      // BMW: 0px radius is the rule. rounded-lg (12px) for modals only. rounded-full for icon buttons.
      borderRadius: {
        "bmw-sm":  "4px",
        "bmw-md":  "8px",
        "bmw-lg":  "12px",
      },
      keyframes: {
        "pop-in": {
          "0%":   { transform: "scale(0.92)", opacity: "0" },
          "60%":  { transform: "scale(1.03)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        "slide-up": {
          "0%":   { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        "check-pop": {
          "0%":   { transform: "scale(1)" },
          "40%":  { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "pop-in":    "pop-in 0.28s ease-out",
        "slide-up":  "slide-up 0.25s ease-out",
        "check-pop": "check-pop 0.35s ease-out",
      },
    },
  },
  plugins: [],
}
