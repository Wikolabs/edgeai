import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Share Tech Mono'", "sans-serif"],
        body: ["'Rajdhani'", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
