/**
 * Updates the build using a provided `customConfigList`.
 * This object is merged into the default build, `currentConfig`.
 * Matching properties are replaced.
 */
function updateConfig(configList, customConfigList, mergeStrategy) {
    configList.forEach((currentConfig, index) => {
        customConfigList.forEach((currentCustomConfig) => {
            if (
                currentConfig.name.indexOf(`${currentCustomConfig.name}`) !== -1
            ) {
                // See https://github.com/survivejs/webpack-merge#merging-with-strategies
                configList[index] = webpackMerge.smartStrategy(mergeStrategy)(
                    currentConfig,
                    currentCustomConfig,
                );
            }
        });
    });
}

exports.updateConfig = updateConfig;
