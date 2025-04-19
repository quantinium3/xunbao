/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        glow: {
          '0%, 100%': { textShadow: '0 0 10px rgba(255, 255, 255, 0.8)' },
          '50%': { textShadow: '0 0 20px rgba(255, 255, 255, 1)' },
        },
        'spin-very-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        bounce: {
          '0%, 100%': {
            transform: 'translateY(-10%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'none',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'spin-fast': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(-360deg)' },
        },
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'spin-very-slow': 'spin-very-slow 30s linear infinite',
        'bounce': 'bounce 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 10s linear infinite',
        'spin-fast': 'spin-fast 8s linear infinite',
      },
    },
  },
  plugins: [],
}
