var camelCase = require('lodash.camelcase');
var upperFirst = require('lodash.upperfirst');
var webpack = require('webpack');

var isRelease = process.argv.indexOf('--release') > -1;

var config = module.exports = {
  entry: './app/app.ts',
  output: {
    path: __dirname + '/www/build/js',
    filename: 'app.bundle.js'
  },
  externals: [
    'cordova',
    resolveExternals
  ],
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js'],
    alias: {
      api: __dirname + '/api/server'
    }
  },
  module: {
    loaders: [
      {test: /\.ts$/, loader: 'ts-loader'}
    ]
  },
  devtool: 'source-map'
};

if (isRelease) {
  config.plugins = [
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    })
  ];
}

function resolveExternals(context, request, callback) {
  return meteorPack(request, callback) ||
         cordovaPlugin(request, callback) ||
         callback();
}

function meteorPack(request, callback) {
  var match = request.match(/^meteor\/(.+)$/);
  var pack = match && match[1];

  if (pack) {
    callback(null, 'window.Package && Package["' + pack + '"]');
    return true;
  }
}

function cordovaPlugin(request, callback) {
  var match = request.match(/^cordova\/(.+)$/);
  var plugin = match && match[1];

  if (plugin) {
    plugin = camelCase(plugin);
    plugin = upperFirst(plugin);
    callback(null, 'window.cordova && cordova.plugins && cordova.plugins.' + plugin);
    return true;
  }
}
