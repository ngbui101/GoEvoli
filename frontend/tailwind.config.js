/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        evoli: {
          bg: '#F7E6B2',
          primary: '#925D3B',
          secondary: '#EBD8B1',
          text: '#4D3122',
          accent: '#A67C52',
          card: {
            surface: '#FFF6DD',
            inner: '#F3DFB8',
            border: '#7A4A2D',
          },
          shadow: 'rgba(77, 49, 34, 0.25)',
        }
      },
      aspectRatio: {
        'card': '63 / 88',
      },
      borderRadius: {
        'evoli': '1.25rem',
        'evoli-sm': '0.75rem',
        'evoli-card': '1rem',
      },
      boxShadow: {
        'evoli': '0 10px 25px -5px rgba(77, 49, 34, 0.1), 0 8px 10px -6px rgba(77, 49, 34, 0.05)',
        'evoli-hover': '0 20px 25px -5px rgba(77, 49, 34, 0.15), 0 8px 10px -6px rgba(77, 49, 34, 0.1)',
        'card-game': '0 15px 35px -5px rgba(77, 49, 34, 0.35), 0 5px 15px rgba(0,0,0,0.1)',
        'card-hover': '0 30px 60px -12px rgba(77, 49, 34, 0.5), 0 10px 20px rgba(0,0,0,0.2)',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'shine': 'shine 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shine: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
