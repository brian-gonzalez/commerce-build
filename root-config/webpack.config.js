const build = require('@bgss/CommerceBuild').build;

let customConfigList = [
        // {
        //     name: 'js',
        //     module: {
        //         rules: [{
        //             test: /\.js$/,
        //             exclude: [/node_modules\/(?!@bgss)/],
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
