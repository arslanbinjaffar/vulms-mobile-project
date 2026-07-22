/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        vu: {
          navy: "#1B2A4A",
          purple: "#6B4C9A",
          blue: "#1E88E5",
          success: "#2E7D32",
          danger: "#C62828",
          muted: "#F5F5F5",
        },
      },
      fontFamily: {
        sans: ["SourceSans3_400Regular"],
        medium: ["SourceSans3_500Medium"],
        semibold: ["SourceSans3_600SemiBold"],
        bold: ["SourceSans3_700Bold"],
      },
    },
  },
  plugins: [],
};
