// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/client/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        // Brand namespace (use these everywhere)
        brand: {
          blush: '#FF7A8A',   // sunset blush
          yellow: '#FFD166',  // warm yellow
          navy: '#0B1220',    // deep navy (text)
        },
        // Convenience alias for primary surfaces/elements
        primary: {
          DEFAULT: '#FF7A8A',
          foreground: '#0B1220',
        },
      },
      // Ready-made gradients using the brand colors
      backgroundImage: {
        'brand-to-r': 'linear-gradient(to right, #FF7A8A, #FFD166)',
        'brand-to-br': 'linear-gradient(to bottom right, #FF7A8A, #FFD166)',
      },
    },
  },
  plugins: [],
};

export default config;
