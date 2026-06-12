import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // Cor de marca Trajetto (lime das logos), tratada como cor unica.
        // Use trajetto-DEFAULT para o verde principal.
        trajetto: {
          DEFAULT: "#9eff00",
          50: "#f4ffe0",
          100: "#e6ffb8",
          200: "#d4ff80",
          300: "#bdff3d",
          400: "#9eff00",
          500: "#7ee600",
          600: "#5fb800",
          700: "#478a00",
          800: "#386b08",
          900: "#2f590e",
        },
        // Cor secundaria: ambar de sinalizacao rodoviaria (BR-163), usada com parcimonia.
        rodovia: {
          DEFAULT: "#f5a623",
          300: "#ffd27a",
          400: "#f5a623",
          500: "#e2920f",
        },
        // Fundo escuro institucional (corredor noturno / asfalto)
        carbon: {
          DEFAULT: "#0a0c0a",
          50: "#f6f7f6",
          100: "#e3e6e3",
          200: "#c7ccc7",
          300: "#9aa39a",
          400: "#6b766b",
          500: "#4c554c",
          600: "#3a423a",
          700: "#2b322b",
          800: "#1a1f1a",
          900: "#11140f",
          950: "#0a0c0a",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
