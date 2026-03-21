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
          blue: "#1E90FF",
          red: "#D21034",
          gold: "#FCD116",
          cream: "#FFF8F0",
          brown: "#5C3D2E",
          green: "#2D6A4F",
        },
        blue: {
          50: "#EFF8FF",
          100: "#DBEFFF",
          200: "#BFE2FF",
          300: "#93D0FF",
          400: "#59B5FF",
          500: "#1E90FF",
          600: "#1A7AE0",
          700: "#1562B8",
          800: "#114F94",
          900: "#0E3F77",
          950: "#092850",
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
