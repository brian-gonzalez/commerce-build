const buildHelpers = require('./src').helpers;

const envType = buildHelpers.getConfigValue('type', 'development');
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
