import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      animation: {
        'slideInUp': 'slideInUp 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
      },
      keyframes: {
        slideInUp: {
          'from': { 
            opacity: '0', 
            transform: 'translateY(30px) scale(0.9)'
          },
          'to': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)'
          }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
