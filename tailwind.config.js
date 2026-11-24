/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--sc-canvas)',
        surface: 'var(--sc-surface)',
        'surface-strong': 'var(--sc-surface-strong)',
        ink: 'var(--sc-ink)',
        'ink-soft': 'var(--sc-ink-soft)',
        accent: 'var(--sc-accent)',
        'accent-ink': 'var(--sc-accent-ink)',
        line: 'var(--line)',
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
