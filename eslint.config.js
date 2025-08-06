export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { project: './tsconfig.json' },
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
    },
  },
];
