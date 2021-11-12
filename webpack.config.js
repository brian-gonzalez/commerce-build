const { init } = require('./src');

const customConfig = false;
// [
//     {
//         name: 'js',
//         module: {
//             rules: [{
//                 test: /\.js$/,
//                 exclude: [/node_modules/],
//                 use: ['babel-loader']
//             }]
//         }
//     }
// ];

// https://github.com/survivejs/webpack-merge#merging-with-strategies
const mergeStrategy = {
    module: 'replace',
};

module.exports = init(customConfig, mergeStrategy);
