/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // YouTube design tokens
        "yt-red":       "#FF0000",
        "yt-red-hover": "#CC0000",
        "yt-bg":        "#FFFFFF",
        "yt-surface":   "#F2F2F2",
        "yt-surface2":  "#E5E5E5",
        "yt-text":      "#0F0F0F",
        "yt-sub":       "#606060",
        "yt-border":    "rgba(0,0,0,0.10)",
        "yt-dark-bg":   "#0F0F0F",
        "yt-dark-surf": "#212121",
        "yt-dark-card": "#272727",
      },
      fontFamily: {
        yt: ["Roboto", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        yt: "8px",
        "yt-pill": "9999px",
        "yt-card": "12px",
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
