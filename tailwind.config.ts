import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F3ED',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      maxWidth: {
        'reading': '680px',
      },
      gridTemplateColumns: {
        '50': 'repeat(50, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
}
export default config
