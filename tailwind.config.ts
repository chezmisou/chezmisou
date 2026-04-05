import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "marron-profond": "var(--marron-profond)",
        "marron": "var(--marron)",
        "marron-clair": "var(--marron-clair)",
        "marron-doux": "var(--marron-doux)",
        "orange": "var(--orange)",
        "orange-vif": "var(--orange-vif)",
        "orange-clair": "var(--orange-clair)",
        "jaune": "var(--jaune)",
        "jaune-dore": "var(--jaune-dore)",
        "jaune-clair": "var(--jaune-clair)",
        "blanc": "var(--blanc)",
        "blanc-creme": "var(--blanc-creme)",
        "blanc-chaud": "var(--blanc-chaud)",
        "gris-chaud": "var(--gris-chaud)",
        "text-dark": "var(--text-dark)",
        "text-body": "var(--text-body)",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
