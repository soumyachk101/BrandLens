/** @type {import('tailwindcss').Config} */
module.exports = {
 darkMode: ["class"],
 content: [
 './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
 './src/components/**/*.{js,ts,jsx,tsx,mdx}',
 './src/app/**/*.{js,ts,jsx,tsx,mdx}',
 ],
 theme: {
 extend: {
 colors: {
 primary: {
 50: '#EEF2FF',
 100: '#E0E7FF',
 200: '#C7D2FE',
 300: '#A5B4FC',
 400: '#818CF8',
 500: '#6366F1',
 600: '#4F46E5',
 700: '#4338CA',
 800: '#3730A3',
 900: '#312E81',
 },
 slate: {
 50: '#F8FAFC',
 100: '#F1F5F9',
 200: '#E2E8F0',
 300: '#CBD5E1',
 400: '#94A3B8',
 500: '#64748B',
 600: '#475569',
 700: '#334155',
 800: '#1E293B',
 900: '#0F172A',
 950: '#020617',
 },
 success: '#10B981',
 'success-bg': '#D1FAE5',
 warning: '#F59E0B',
 'warning-bg': '#FEF3C7',
 danger: '#EF4444',
 'danger-bg': '#FEE2E2',
 info: '#3B82F6',
 'info-bg': '#DBEAFE',
 },
 fontFamily: {
 sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
 mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
 },
 borderRadius: {
 sm: '4px',
 DEFAULT: '6px',
 md: '8px',
 lg: '12px',
 xl: '16px',
 '2xl': '24px',
 full: '9999px',
 },
 keyframes: {
 'fade-in': {
 '0%': { opacity: '0', transform: 'translateY(8px)' },
 '100%': { opacity: '1', transform: 'translateY(0)' },
 },
 'slide-in': {
 '0%': { transform: 'translateX(-100%)' },
 '100%': { transform: 'translateX(0)' },
 },
 'pulse-slow': {
 '0%, 100%': { opacity: '1' },
 '50%': { opacity: '0.5' },
 },
 },
 animation: {
 'fade-in': 'fade-in 0.3s ease-out',
 'slide-in': 'slide-in 0.3s ease-out',
 'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
 },
 },
 },
 plugins: [],
};
