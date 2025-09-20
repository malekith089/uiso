import type { Config } from "tailwindcss"
const { fontFamily } = require("tailwindcss/defaultTheme")

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", ...fontFamily.sans],
        logo: ["var(--font-adelia)", "cursive"],
        heading: ["var(--font-soopafresh)", "sans-serif"],
      },
      letterSpacing: {
        heading: "0.1em", // Menambahkan spasi antar karakter untuk judul
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#758E4F", // Olive Green as primary
          foreground: "#FFFFFF",
          light: "#8FA663", // Lighter olive green
          dark: "#5A6B3C", // Darker olive green
        },
        secondary: {
          DEFAULT: "#33658A", // Dark Blue as secondary accent
          foreground: "#FFFFFF",
          light: "#4A7BA7", // Lighter blue
        },
        accent: {
          DEFAULT: "#F6AE2D", // Yellow as accent
          foreground: "#1a1a1a",
          light: "#F8C555", // Lighter yellow
          dark: "#E09A1A", // Darker yellow
        },
        tertiary: {
          DEFAULT: "#86BBD8", // Light Blue as tertiary
          foreground: "#1a1a1a",
        },
        warning: {
          DEFAULT: "#F26419", // Bright Orange for warnings
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "scroll-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "scroll-left": "scroll-left 30s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

