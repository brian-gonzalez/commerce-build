const { getJSConfig } = require('./get-js-config');
const { getSCSSConfig } = require('./get-scss-config');

function setConfig(config, cartridgeList, scope, options) {
    const configList = [];

    cartridgeList.forEach((cartridge) => {
        // Push back the new config into the configList.
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
