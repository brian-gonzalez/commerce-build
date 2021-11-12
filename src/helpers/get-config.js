/**
 * Retrieves a configuration value from a given config object based on hierarchy
 * @param  {Object} config Configuration object
 * @param  {String} key Configuration property to retrieve
 * @return {String | Boolean} Returns Boolean value for 'true'/'false' or key value
 */
function getConfig(config, key, scope) {
    const { site } = config;

    // Retrieve hierarchial config value
    const value = config?.sites?.[site]?.[scope]?.[key]
        || config?.sites?.[site]?.[key]
        || config?.[scope]?.[key]
        || config[key];

    if (value === 'true') {
        return true;
    }

    if (value === 'false') {
        return false;
    }

    return value;
}

exports.getConfig = getConfig;
