import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2b468b",
          foreground: "#ffffff",
        },
        brand: {
          green: "#2c7a4b",
        },
        accent: {
          green: "#22c55e",
          red: "#ef4444",
        },
        background: {
          light: "#f8fafc",
          dark: "#0f172a",
        }
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      aspectRatio: {
        'a4': '1 / 1.414',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}

export default config
