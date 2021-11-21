const { set } = require('./set');

function envXmog(config, keyName) {
    const mogENV = {};
    const varRegex = new RegExp(`^${keyName}`);

    for (let i = 0, keys = Object.keys(config); i < keys.length; i++) {
        const key = keys[i];

        if (varRegex.test(key)) {
            set(mogENV, key, config[key]);
        }
    }

    return mogENV;
}

module.exports = {
    envXmog,
};
