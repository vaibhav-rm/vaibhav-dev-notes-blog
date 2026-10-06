module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  overrides: [
    {
      // Build scripts and Appwrite Cloud Functions run on Node, not the browser.
      files: ['scripts/**/*.js', 'functions/**/*.js', '*.config.js', '.eslintrc.cjs'],
      env: { node: true, browser: false },
    },
    {
      files: ['**/*.jsx'],
      rules: {
        // This project does not use PropTypes, so the rule is pure noise.
        'react/prop-types': 'off',
      },
    },
    {
      // These files legitimately co-locate a component with the constants or
      // lazy factories it needs, which breaks HMR fast-refresh only.
      files: ['src/main.jsx', 'src/App.jsx', 'src/Components/SEO.jsx', 'src/Components/Select.jsx'],
      rules: {
        'react-refresh/only-export-components': 'off',
      },
    },
  ],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
