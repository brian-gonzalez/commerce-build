const bornHelpers = require('@borngroup/born-build').helpers;

let envType = bornHelpers.getOption('type', 'development'),
	isProduction = envType === 'production';

module.exports = {
	plugins: {
		autoprefixer: {},
		cssnano: isProduction ? {
			// sourcemap: true,
			mergeRules: true,
			zindex: false
		} : false
	},
};
