import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4845d2',
          hover: '#3835b5',
          light: '#8b88dd',
        },
        secondary: {
          DEFAULT: '#8b88dd',
        },
        background: '#f5f5f5',
        card: '#ffffff',
      },
    },
  },
  plugins: [],
}
export default config
