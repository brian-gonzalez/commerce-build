const { isProduction } = require('commerce-build').helpers;

module.exports = {
    plugins: {
        'postcss-preset-env': {},
        'cssnano': isProduction ? {
            mergeRules: true,
            zindex: false,
        } : false,
    },
};
