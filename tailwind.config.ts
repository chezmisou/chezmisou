import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Charte Chez Misou
        "marron-profond": "#3B2314",
        "marron-doux": "#A0886C",
        orange: "#D4A017",
        "orange-vif": "#C4900A",
        "blanc-creme": "#FFF8F0",
        "blanc-chaud": "#FFF3E4",
        blanc: "#FFFDF7",
        "jaune-clair": "#FCD116",
        "text-body": "#5C4B3A",
        // Legacy brand colors (for existing admin/shop pages)
        brand: {
          blue: "#6B5731",
          red: "#D21034",
          gold: "#FCD116",
          cream: "#FFF8F0",
          brown: "#5C3D2E",
          green: "#2D6A4F",
        },
        blue: {
          50: "#FAF7F2",
          100: "#F0EBDF",
          200: "#E0D5BC",
          300: "#CABB94",
          400: "#B09A6A",
          500: "#6B5731",
          600: "#5C4B2A",
          700: "#4D3E23",
          800: "#3E321C",
          900: "#2F2615",
          950: "#1F190E",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["DM Sans", "sans-serif"],
        display: ["Fraunces", "serif"],
        body: ["DM Sans", "sans-serif"],
        accent: ["Caveat", "cursive"],
      },
    },
  },
  plugins: [],
};
export default config;
