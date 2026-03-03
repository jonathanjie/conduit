import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        conduit: {
          50: '#EEF3FA',
          100: '#D5E2F3',
          200: '#AAC5E6',
          300: '#7FA8D9',
          400: '#558BCC',
          500: '#3570BF',
          600: '#2C5BA0',
          700: '#24487F',
          800: '#1B365F',
          900: '#12233F',
        },
        amber: {
          accent: '#E07A00',
          light: '#FFF3E0',
        },
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
    },
  },
  plugins: [],
};

export default config;
