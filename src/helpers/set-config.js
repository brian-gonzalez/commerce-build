const { getJSConfig } = require('./get-js-config');
const { getSCSSConfig } = require('./get-scss-config');

function setConfig(config, cartridgeList, scope, options) {
    const configList = [];

    // Create a config object for each cartridge
    // This will allow extending the settings via webpack-merge
    cartridgeList.forEach((cartridge) => {
        if (scope === 'js') {
            const jsConfig = getJSConfig(config, cartridge, scope, options);

            if (jsConfig) {
                configList.push(jsConfig);
            }
        }

        if (scope === 'scss') {
            const scssConfig = getSCSSConfig(config, cartridge, scope, options);

            if (scssConfig) {
                configList.push(scssConfig);
            }
        }
    });

    return configList;
}

exports.setConfig = setConfig;
