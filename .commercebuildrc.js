module.exports = {
    'rootFiles': true,
    'cartridgePath': 'app_custom_site::site', // will replace revolverPath
    'revolverPath': 'app_custom_site::site',
    'aliases': {},
    'js': {
        'inputPath': 'cartridges/{cartridge}/cartridge/client/default/js',
    },
    'scss': {
        'keepOriginalLocation': true,
        'inputPath': 'cartridges/{cartridge}/cartridge/client/**/*.scss',
        'includePaths': 'node_modules/flag-icon-css/sass',
        'aliasDirName': 'scss'
    },
    'sites': {}
};
