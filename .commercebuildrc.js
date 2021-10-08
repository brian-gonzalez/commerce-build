module.exports = {
    'rootFiles': true,
    'revolverPath': 'app_custom_theme::theme, app_storefront_base::base',
    'js': {
        'inputPath': 'cartridges/{cartridge}/cartridge/client/default/js',
    },
    'styles': {
        'keepOriginalLocation': true,
        'inputPath': 'cartridges/{cartridge}/cartridge/client/**/*.scss',
        'includePaths': 'node_modules/flag-icon-css/sass',
        'aliasDirName': 'scss',
    },
};