/** @type {import('tailwindcss').Config} */
import PrimeUI from 'tailwindcss-primeui';

export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    PrimeUI
  ],
}

