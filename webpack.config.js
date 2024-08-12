const path = require('path');
var fs = require('fs');
var nodeModules = {};
fs.readdirSync(path.resolve(__dirname, 'node_modules'))
    .filter(x => ['.bin'].indexOf(x) === -1)
    .forEach(mod => { nodeModules[mod] = `commonjs ${mod}`; });

module.exports = {
    mode: 'production',
    entry: [path.join(__dirname, 'app.js')],
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: 'bundle.js',
    },
    externals: nodeModules,
    target: 'node',
};