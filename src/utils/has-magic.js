/**
 * Checks if a path has glob special tokens
 * Cheap implementation of glob.hasMagic
 *
 * @param {String} globPath Path to validate glob magic pattern
 * @return {Boolean}
 */
function hasMagic(globPath) {
    const globRegex = /[?*{[]/g;
    return globRegex.test(globPath);
}

exports.hasMagic = hasMagic;
