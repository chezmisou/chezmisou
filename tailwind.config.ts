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
        display: ["Fraunces", "serif"],
        body: ["DM Sans", "sans-serif"],
        accent: ["Caveat", "cursive"],
      },
    },
  },
  plugins: [],
};
export default config;
