module.exports = {
    'plugins': ['stylelint-scss'],
    'extends': 'stylelint-config-standard',
    'rules': {
        'at-rule-no-unknown': null,
        'font-family-no-missing-generic-family-keyword': null,
        'indentation': 4,
        'no-descending-specificity': null,
        'scss/at-import-no-partial-leading-underscore': true,
        'scss/at-import-partial-extension-blacklist': ['scss'],
        'scss/at-rule-no-unknown': true,
        'scss/dollar-variable-no-missing-interpolation': true,
        'scss/media-feature-value-dollar-variable': 'always',
        'scss/selector-no-redundant-nesting-selector': true,
        'selector-pseudo-class-no-unknown': [true, {
            'ignorePseudoClasses': ['focus-visible'],
        }],
    },
};
