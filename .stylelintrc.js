module.exports = {
    plugins: [
        'stylelint-scss',
        'stylelint-order',
    ],
    extends: 'stylelint-config-standard',
    rules: {
        'at-rule-empty-line-before': [
            'always',
            {
                ignoreAtRules: ['else'],
                except: ['blockless-after-same-name-blockless', 'first-nested'],
                ignore: ['after-comment'],
            },
        ],
        'at-rule-no-unknown': null,
        'block-closing-brace-newline-after': [
            'always',
            {
                ignoreAtRules: ['if', 'else'],
            },
        ],
        'font-family-no-missing-generic-family-keyword': null,
        indentation: 4,
        'no-descending-specificity': null,
        'order/order': [
            'custom-properties',
            'dollar-variables',
            'declarations',
            'rules',
            'at-rules',
        ],
        'order/properties-alphabetical-order': true,
        'scss/at-import-no-partial-leading-underscore': true,
        'scss/at-import-partial-extension-blacklist': ['scss'],
        'scss/at-rule-no-unknown': true,
        'scss/dollar-variable-no-missing-interpolation': true,
        'scss/media-feature-value-dollar-variable': 'always',
        'scss/selector-no-redundant-nesting-selector': true,
        'scss/at-else-closing-brace-newline-after': 'always-last-in-chain',
        'scss/at-else-closing-brace-space-after': 'always-intermediate',
        'scss/at-else-empty-line-before': 'never',
        'scss/at-if-closing-brace-newline-after': 'always-last-in-chain',
        'scss/at-if-closing-brace-space-after': 'always-intermediate',
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['focus-visible'],
            },
        ],
    },
    overrides: [
        {
            files: ['**/*.scss'],
            customSyntax: 'postcss-scss',
        },
    ],
};
