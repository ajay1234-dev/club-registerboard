import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Space Event Theme
        bg: {
          base: "#07070f",
          surface: "#0f0f1e",
          elevated: "#14142a",
          border: "#1e1e3f",
        },
        accent: {
          violet: "#7c3aed",
          "violet-light": "#a855f7",
          cyan: "#22d3ee",
          "cyan-light": "#67e8f9",
        },
        text: {
          primary: "#f0f0ff",
          secondary: "#a1a1c7",
          muted: "#6b7280",
        },
        success: "#10b981",
        error: "#ef4444",
        warning: "#f59e0b",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)",
        "accent-gradient-hover":
          "linear-gradient(135deg, #a855f7 0%, #67e8f9 100%)",
        "hero-gradient":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.3) 0%, transparent 60%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(34,211,238,0.05) 100%)",
      },
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-dot": "pulse-dot 1.5s ease-in-out infinite",
        "count-up": "count-up 0.4s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "float-up": "float-up 0.5s ease-out",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.85)" },
        },
        "count-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      boxShadow: {
        "accent-glow": "0 0 20px rgba(124,58,237,0.4)",
        "accent-glow-lg": "0 0 40px rgba(124,58,237,0.3)",
        "cyan-glow": "0 0 20px rgba(34,211,238,0.3)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.6)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
