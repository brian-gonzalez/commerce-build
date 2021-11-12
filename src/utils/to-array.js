/**
 * Converts a string an Array of strings
 *
 * @param {Array} arr
 * @return {Array}
 */
function toArray(value) {
    if (typeof value === 'string') {
        return value.split(/(?:,| )+/);
    }

    return value;
}

exports.toArray = toArray;
