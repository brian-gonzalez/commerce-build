const setNestedKey = (obj, keyStr, value) => {
    let schema = obj; // a moving reference to internal objects within obj
    const keys = keyStr.toLowerCase().split('_');
    const len = keys.length;
    for (let i = 0; i < len - 1; i++) {
        const elem = keys[i];
        if (!schema[elem]) schema[elem] = {};
        schema = schema[elem];
    }

    schema[keys[len - 1]] = value;
    return obj;
};

const envXmog = (config, keyName) => {
    const mogENV = {};
    const varRegex = new RegExp(`^${keyName}`);

    for (let i = 0, keys = Object.keys(config); i < keys.length; i++) {
        const key = keys[i];

        if (varRegex.test(key)) {
            setNestedKey(mogENV, key, config[key]);
        }
    }

    return mogENV;
};

module.exports = {
    envXmog,
};
