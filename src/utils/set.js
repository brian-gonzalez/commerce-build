/**
 * Set deep keys for Objects
 *
 * @param {Object} obj
 * @param {String} keyStr
 * @param {[String]|Boolean} value
 * @return {Object}
 */
function set(obj, keyStr, value) {
    const keys = keyStr.split(/._/);
    const len = keys.length;
    let schema = obj; // a moving reference to internal objects within obj

    // change first key to lower case if all caps
    // presumable it is from BUILD_ENV vars
    keys[0] = keys[0] === keys[0].toUpperCase() ? keys[0].toLowerCase() : keys[0];

    for (let i = 0; i < len - 1; i++) {
        const elem = keys[i];
        if (!schema[elem]) schema[elem] = {};
        schema = schema[elem];
    }

    schema[keys[len - 1]] = value;
    return obj;
}

exports.set = set;
