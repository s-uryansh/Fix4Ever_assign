/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx}', // added broader src glob from the snippet
  ],
  theme: {
    extend: {
      animation: {
        'wave-in': 'waveIn 0.6s ease-out',
        'wave-out': 'waveOut 0.6s ease-in',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'wave': 'wave 8s ease-in-out infinite', // added animations from snippet
        'wave-slow': 'wave 12s ease-in-out infinite',
      },
      keyframes: {
        waveIn: {
          '0%': { transform: 'scale(0) rotate(12deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0)', opacity: '1' },
        },
        waveOut: {
          '0%': { transform: 'scale(1) rotate(0)', opacity: '1' },
          '100%': { transform: 'scale(0) rotate(-12deg)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        wave: { // added keyframes from snippet
          '0%': { transform: 'translateX(0) translateY(0)' },
          '50%': { transform: 'translateX(-25%) translateY(-10px)' },
          '100%': { transform: 'translateX(-50%) translateY(0)' },
        }
      },
    },
  },
  plugins: [],
}