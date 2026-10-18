import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default <Config>{
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(36, 100%, 50%)', // amber
          dark: 'hsl(36, 100%, 45%)',
        },
        background: {
          DEFAULT: '#0B0D12',
          light: '#F9FAFB',
        },
        surface: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          light: 'rgba(0,0,0,0.04)',
        },
        border: 'rgba(255,255,255,0.12)',
        accent: 'hsl(80,70%,60%)', // lime for highlights
      },
      borderRadius: {
        md: '8px',
      },
      spacing: {
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
      },
      boxShadow: {
        glass: '0 4px 30px rgba(0,0,0,0.12)',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Fraunces', 'serif'],
      },
    },
  },
  plugins: [],
}
