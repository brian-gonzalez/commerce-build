function set(obj, keyStr, value) {
    const keys = keyStr.split(/._/);
    const len = keys.length;
    let schema = obj; // a moving reference to internal objects within obj

    keys[0] = keys[0].toLowerCase();

    for (let i = 0; i < len - 1; i++) {
        const elem = keys[i];
        if (!schema[elem]) schema[elem] = {};
        schema = schema[elem];
    }

    schema[keys[len - 1]] = value;
    return obj;
}

exports.set = set;
