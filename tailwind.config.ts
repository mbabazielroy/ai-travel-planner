import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"],
      },
      colors: {
        midnight: "#0b1224",
        "midnight-2": "#0f172a",
        aqua: "#22d3ee",
        iris: "#7c3aed",
        border: "#1f2937",
        card: "#0f172a",
        accent: "#14b8a6",
      },
      boxShadow: {
        glow: "0 20px 60px rgba(34, 211, 238, 0.12)",
        card: "0 14px 40px rgba(0,0,0,0.35)",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at 20% 20%, rgba(34,211,238,0.12), transparent 25%), radial-gradient(circle at 80% 0%, rgba(124,58,237,0.12), transparent 25%), radial-gradient(circle at 60% 90%, rgba(20,184,166,0.1), transparent 25%)",
      },
    },
  },
  plugins: [typography],
};

export default config;
