module.exports = {
    'ignorePatterns': [
        '.eslintrc.js'
    ],

    env: {
        browser: true,
        es2020: true,
        node: true
    },
    extends: ['airbnb-base'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        indent: ['error', 4],
        'comma-dangle': ['error', 'never'],
        'no-plusplus': 0,
        'no-unused-vars': [
            'error',
            {
                vars: 'all',
                args: 'none',
                ignoreRestSiblings: true
            }
        ]
    }
};
