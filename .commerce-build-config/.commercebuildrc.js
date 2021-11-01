module.exports = {
    'rootFiles': true,
    'cartridgePath': 'app_custom_theme~theme, app_storefront_base~base',
    'js': {
        'inputPath': 'cartridges/{cartridge}/cartridge/client/default/js',
    },
    'scss': {
        'keepOriginalLocation': true,
        'inputPath': 'cartridges/{cartridge}/cartridge/client/**/*.scss',
        'includePaths': 'node_modules/flag-icon-css/sass',
    },
};
