import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // Ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.d.ts',
      '_bmad/**',
      '_bmad-output/**',
      'libraries/**',
    ],
  },

  // Base rules
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // TypeScript files in skills
  {
    files: ['.claude/skills/**/scripts/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        Bun: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'no-console': 'off',
      'eqeqeq': ['error', 'always'],
      'prefer-const': 'error',
    },
  },

  // Prettier compatibility
  eslintConfigPrettier,
);
