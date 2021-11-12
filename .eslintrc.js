module.exports = {
    root: true,
    env: {
        node: true,
    },
    parserOptions: {
        ecmaVersion: 2020,
    },
    extends: ['airbnb-base'],
    rules: {
        'func-names': 'off',
        'consistent-return': 'off',
        'global-require': 'off',
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        'import/no-unresolved': 'off',
        'indent': ['error', 4],
        'max-len': ['error', {
            'code': 130,
            'ignoreTemplateLiterals': true,
            'ignoreRegExpLiterals': true,
        }],
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        'no-underscore-dangle': 'off',
        'quote-props': ['error', 'consistent'],
        'radix': 'off',
    },
};
