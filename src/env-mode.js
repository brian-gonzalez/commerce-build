// Set NODE_ENV to development if undefined
// This helps with package that loads config based on NODE_ENV
// i.e. autoprefixer uses production unless development is explicitly set
if (process.env.NODE_ENV === undefined) {
    process.env.NODE_ENV = 'development';
}

const envMode = process.env.NODE_ENV;

exports.envMode = envMode;
