module.exports = {
    parser: 'babel-eslint',
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'airbnb-base',
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        'no-unused-vars': 'warn',
        indent: ['error', 4],
        'linebreak-style': 0,
    },
};
