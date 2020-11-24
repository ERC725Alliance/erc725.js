module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'import/extensions': ['warn', 'always', { js: 'ignorePackages' }],
    'no-multiple-empty-lines': ['error', { max: 2 }],
    semi: ['error', 'never'],
    'no-underscore-dangle': ['error', { allowAfterThis: true }],
    indent: ['error', 4],
  },
}
