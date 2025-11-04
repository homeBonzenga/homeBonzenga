import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
      colors: {
        border: "#8B4513", // saddle brown border
        input: "#F5F5DC", // beige input background
        ring: "#8B0000", // dark red ring
        background: "#FDF5E6", // old lace background
        foreground: "#2F1B14", // dark brown text

        primary: {
          DEFAULT: "#D4A574", // warm cream/beige primary
          foreground: "#FFFFFF",
          50: "#FDF9F3",
          100: "#F7F0E6",
          200: "#F0E1CC",
          300: "#E8D2B3",
          400: "#D4A574",
          500: "#C19A5F",
          600: "#A8864D",
          700: "#8F723C",
          800: "#765E2A",
          900: "#5D4A19",
        },
        secondary: {
          DEFAULT: "#8B0000", // dark red secondary
          foreground: "#FFFFFF",
          50: "#FFE6E6",
          100: "#FFCCCC",
          200: "#FF9999",
          300: "#FF6666",
          400: "#FF3333",
          500: "#8B0000",
          600: "#7A0000",
          700: "#690000",
          800: "#580000",
          900: "#470000",
        },
        destructive: {
          DEFAULT: "#DC143C", // crimson destructive
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#DEB887", // burlywood muted
          foreground: "#8B4513",
        },
        accent: {
          DEFAULT: "#CD853F", // peru accent
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#FFFFFF", 
          foreground: "#2F1B14",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#2F1B14",
        },
        sidebar: {
          DEFAULT: "#8B4513",
          foreground: "#FFFFFF",
          primary: "#8B4513", 
          "primary-foreground": "#FFFFFF",
          accent: "#8B0000",
          "accent-foreground": "#FFFFFF",
          border: "#654321",
          ring: "#8B0000",
        },
        success: {
          DEFAULT: "#228B22", // forest green
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#FF8C00", // dark orange
          foreground: "#FFFFFF",
        },
        info: {
          DEFAULT: "#4169E1", // royal blue
          foreground: "#FFFFFF",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config; 