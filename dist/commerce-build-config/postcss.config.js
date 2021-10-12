const { helpers } = require('commerce-build');

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
