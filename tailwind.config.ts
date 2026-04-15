import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  safelist: [
    { pattern: /(bg|text|ring|border|from|to)-(rose|blue|emerald|violet|amber|slate)-(50|100|200|300|400|500|600|700|800)/ },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "system-ui", "Segoe UI", "Roboto", "Helvetica Neue", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(15, 23, 42, 0.08)",
        card: "0 8px 32px -12px rgba(15, 23, 42, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
