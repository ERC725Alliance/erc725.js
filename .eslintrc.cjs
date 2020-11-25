module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        mocha: true
    },
    extends: [
        'airbnb-base'
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    rules: {
        // Mocha tests need imported file extension for ES modules support
        'import/extensions': ['warn', 'always', { js: 'ignorePackages' }],
        'max-len': ['error', { code: 120, ignoreTrailingComments: true, ignoreStrings: true }],
        quotes: ['error', 'single', { avoidEscape: true }],
        semi: ['error', 'never'],
        'no-underscore-dangle': ['error', { allowAfterThis: true }],
        indent: ['error', 4],
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        'no-multiple-empty-lines': ['error', { max: 2 }],
        'padded-blocks': ['error', 'always', { allowSingleLineBlocks: true }],
        'lines-between-class-members': ['error', 'always'],
        'arrow-parens': ['error', 'as-needed', { requireForBlockBody: false }],
        'padding-line-between-statements': [
            'error',
            { blankLine: 'always', prev: 'var', next: 'return' },
            { blankLine: 'always', prev: 'block-like', next: 'return' }
        ],
        'prefer-template': 0, // Allow simple string concatenation
        'comma-dangle': ['error', {
            arrays: 'never',
            objects: 'never',
            imports: 'never',
            exports: 'never',
            functions: 'never'
        }],
        'no-await-in-loop': 0, // NOTE: This should be removed?
        'import/prefer-default-export': 0
    },
    ignorePatterns: ['node_modules/**/*']
}
