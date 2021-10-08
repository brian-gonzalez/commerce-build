const { build } = require('./src');

// const customConfigList = [
//     // {
//     //     name: 'js',
//     //     module: {
//     //         rules: [{
//     //             test: /\.js$/,
//     //             exclude: [/node_modules\/(?!@bgss)/],
//     //             use: ['babel-loader']
//     //         }]
//     //     }
//     // }
// ];
// // https://github.com/survivejs/webpack-merge#merging-with-strategies
// const mergeStrategy = {
//     module: 'replace',
// };

module.exports = build.initConfig();
