const build = require('@borngroup/born-build').build;

let customConfigList = [
        // {
        //     name: 'js',
        //     module: {
        //         rules: [{
        //             test: /\.js$/,
        //             exclude: [/node_modules\/(?!@borngroup)/],
        //             use: ['babel-loader']
        //         }]
        //     }
        // }
    ],
    //https://github.com/survivejs/webpack-merge#merging-with-strategies
    mergeStrategy = {
        module: 'replace'
    };

module.exports = build.initConfig(customConfigList, mergeStrategy);
