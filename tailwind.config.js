/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                orbit: {
                    bg: '#0a0a0f',
                    planet: '#3b82f6',
                    satellite: '#60a5fa',
                    accent: '#f43f5e',
                    text: '#e2e8f0',
                    panel: 'rgba(15, 23, 42, 0.8)',
                }
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', 'monospace'],
            }
        },
    },
    plugins: [],
}
