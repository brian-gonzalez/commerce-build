// Set NODE_ENV to development if undefined
// This helps with package that loads config based on NODE_ENV
// i.e. autoprefixer uses production unless development is explicitly set

const envMode = process?.env?.NODE_ENV || 'development';
const isProduction = envMode === 'production';

module.exports = {
    envMode,
    isProduction,
};
