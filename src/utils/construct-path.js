/**
 * Construct a path with provided parameters.
 *
 * @param {String} mainPath
 * @param {String} locale
 * @param {String} aliasDir
 * @returns {String}
 */
function constructPath(mainPath, locale, aliasDir) {
    return mainPath + (locale ? `/${locale}` : '') + (aliasDir ? `/${aliasDir}` : '');
}

exports.constructPath = constructPath;
