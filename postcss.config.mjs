const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

// Log Tailwind version for debugging
console.log('Tailwind CSS version:', require('tailwindcss/package.json').version);

export default config;
