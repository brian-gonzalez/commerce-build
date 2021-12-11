const { commerceBuild } = require('./src');

module.exports = (env, argv) => commerceBuild(argv);

/*
// Use Babel for compiling over esbuild for better support es5
// `$ npm i "@babel/core" "@babel/eslint-parser" "@babel/preset-env" "babel-loader"`
const customConfig = [
    {
        name: 'js',
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: [
                        /[\\/]node_modules[\\/]/,
                    ],
                    use: {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                            presets: [
                                '@babel/preset-env',
                            ],
                        },
                    },
                },
            ],
        },
        optimization: {
            minimizer: [],
        },
    },
];

// https://github.com/survivejs/webpack-merge#merging-with-strategies
const mergeStrategy = {
    module: {
        rules: 'replace',
    },
    optimization: {
        minimizer: 'replace',
    },
};

module.exports = (env, argv) => commerceBuild(argv, customConfig, mergeStrategy);
*/
