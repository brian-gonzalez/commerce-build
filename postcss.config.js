const { helpers } = require('./src');
// const { helpers } = require('commerce-build'); // normal require

const envType = helpers.getConfigValue('type', 'development');
const isProduction = envType === 'production';

module.exports = {
    plugins: {
        autoprefixer: {},
        cssnano: isProduction
            ? {
                mergeRules: true,
                zindex: false,
            }
            : false,
    },
};
