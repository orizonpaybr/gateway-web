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
          DEFAULT: '#007BC7',
          hover: '#006BA8',
          light: '#009EE0',
        },
        secondary: {
          DEFAULT: '#009EE0',
          light: '#00BFFF',
        },
        accent: {
          DEFAULT: '#FF8A00',
          hover: '#E67A00',
        },
        dark: {
          DEFAULT: '#0C243B',
          alt: '#000000',
        },
        background: '#FFFFFF',
        card: '#FFFFFF',
        gray: {
          light: '#F3F3F3',
          lighter: '#EBEBEB',
        },
      },
    },
  },
  plugins: [],
}
export default config
