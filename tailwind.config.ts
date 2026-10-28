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
        cream: "#ece5dd",
        "cream-dark": "#e0d8cf",
        "cream-light": "#f5f0ea",
      },
      fontFamily: {
        display: ["Baskerville", "Libre Baskerville", "Georgia", "serif"],
        body: ["Open Sans", "sans-serif"],
      },
      letterSpacing: {
        "wide-custom": "0.15em",
        "wider-custom": "0.25em",
        "widest-custom": "0.35em",
      },
    },
  },
  plugins: [],
};
export default config;
