import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brain: {
          bg: "#0a0a0f",
          surface: "#12121a",
          border: "#1e1e2e",
          accent: "#7c6af7",
          "accent-dim": "#4a3fa0",
          text: "#e2e2f0",
          muted: "#6b6b8a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
