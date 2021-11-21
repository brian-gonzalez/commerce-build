const { mergeWithRules } = require('webpack-merge');

/**
 * Updates the build using a provided `customConfigList`.
 * This object is merged into the default build, `currentConfig`.
 * Matching properties are replaced.
 */
function updateConfig(configList, customConfigList, mergeStrategy) {
    const updatedConfig = [];

    configList.forEach((currentConfig, index) => {
        customConfigList.forEach((currentCustomConfig) => {
            if (currentConfig.name.indexOf(`${currentCustomConfig.name}`) !== -1) {
                // See https://github.com/survivejs/webpack-merge#merging-with-strategies
                updatedConfig[index] = mergeWithRules(mergeStrategy)(
                    currentConfig,
                    currentCustomConfig,
                );
            }
        });
    });

    return updatedConfig;
}

exports.updateConfig = updateConfig;
