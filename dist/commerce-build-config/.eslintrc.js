module.exports = {
    root: true,
    env: {
        amd: true,
        browser: true,
        commonjs: true,
        es6: true,
        jquery: true,
    },
    extends: ['airbnb-base'],
    rules: {
        'func-names': 'off',
        'consistent-return': ['error', {
            'treatUndefinedAsUnspecified': true,
        }],
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
