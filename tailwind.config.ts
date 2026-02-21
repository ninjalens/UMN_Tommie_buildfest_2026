import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        patron: { DEFAULT: "#0ea5e9", dark: "#0284c7" },
        provider: { DEFAULT: "#22c55e", dark: "#16a34a" },
        supplier: { DEFAULT: "#f59e0b", dark: "#d97706" },
      },
    },
  },
  plugins: [],
} satisfies Config;
