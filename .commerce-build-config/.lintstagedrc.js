module.exports = {
    'cartridges/**/cartridge/client/**/*.{js,json}': [
        'eslint --fix'
    ],
    'cartridges/**/cartridge/client/**/*.scss': [
        'stylelint --fix'
    ],
    'cartridges/**/cartridge/client/**/*.isml': [
        'isml-lint --autofix'
    ]
};
