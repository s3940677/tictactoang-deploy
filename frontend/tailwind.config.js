/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'win-pulse': 'winPulse 0.8s ease-in-out infinite alternate',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.36,0.07,0.19,0.97)',
        'confetti': 'confetti 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        winPulse: { from: { backgroundColor: '#f59e0b', transform: 'scale(1)' }, to: { backgroundColor: '#fbbf24', transform: 'scale(1.05)' } },
        bounceIn: { '0%': { transform: 'scale(0.3)', opacity: '0' }, '50%': { transform: 'scale(1.1)' }, '80%': { transform: 'scale(0.9)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        confetti: { '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' }, '100%': { transform: 'scale(1.5) rotate(360deg)', opacity: '0' } },
      },
    },
  },
  plugins: [],
}
