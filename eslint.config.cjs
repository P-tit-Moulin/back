const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');
const jestPlugin = require('eslint-plugin-jest');
const globals = require('globals');

module.exports = [
  // Configuration de base recommandée
  js.configs.recommended,

  // Configuration pour tous les fichiers JavaScript/TypeScript
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // Règles ESLint personnalisées
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: 'error',
      curly: 'error',

      // Intégration Prettier
      'prettier/prettier': 'error',
    },
  },

  // Configuration spécifique pour Jest et les fichiers de test
  {
    files: [
      '**/*.test.{js,ts}',
      '**/*.spec.{js,ts}',
      '**/tests/**/*.{js,ts}',
      '**/__tests__/**/*.{js,ts}',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
      },
    },
    plugins: {
      jest: jestPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Règles Jest recommandées
      ...jestPlugin.configs.recommended.rules,

      // Règles spécifiques pour les tests
      'jest/expect-expect': 'error',
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',

      // Autorise console.log dans les tests
      'no-console': 'off',

      // Règles Prettier
      'prettier/prettier': 'error',
    },
  },

  // Configuration spécifique pour les fichiers CommonJS
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
  },

  // Configuration pour les fichiers de configuration
  {
    files: ['*.config.js', '*.config.cjs', 'jest.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
  },

  // Configuration spécifique pour TypeScript (si vous l'utilisez)
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // TypeScript gère déjà les variables non utilisées
      'no-unused-vars': 'off',
    },
  },

  // Ignorer certains fichiers
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.next/**',
      'coverage/**',
      '*.min.js',
      '.eslintrc.js',
    ],
  },

  // Désactive les règles qui entrent en conflit avec Prettier
  prettier,
];
