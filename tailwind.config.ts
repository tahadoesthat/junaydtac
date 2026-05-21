import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'ta-offwhite': '#F8F8F6',
        'ta-black': '#0A0A0A',
        'ta-grey-light': '#E5E5E5',
        'ta-grey-mid': '#A3A3A3',
        'ta-grey-dark': '#525252',
      },
      fontFamily: {
        montserrat: ['var(--font-montserrat)'],
        quicksand: ['var(--font-quicksand)'],
      },
    },
  },
  plugins: [],
};
export default config;
