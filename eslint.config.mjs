import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Ignore build output and dependencies
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**', 'build/**', '*.min.js']
  },
  ...compat.config({
    extends: ['next/core-web-vitals'],
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'react-hooks/exhaustive-deps': 'error'
    }
  }),
];

export default eslintConfig;