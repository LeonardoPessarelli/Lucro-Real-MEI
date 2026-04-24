import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0d0d0d',
        card: '#111111',
        card2: '#1a1a1a',
        verde: '#4ade80',
        'verde-dark': '#16a34a',
        ambar: '#f59e0b',
        roxo: '#818cf8',
        vermelho: '#f87171',
      },
    },
  },
  plugins: [],
}
export default config
