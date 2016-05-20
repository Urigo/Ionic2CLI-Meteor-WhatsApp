var camelCase = require('lodash.camelcase');
var upperFirst = require('lodash.upperfirst');

module.exports = {
  entry: [
    './app/app.js'
  ],
  output: {
    path: __dirname + '/www/build/js',
    filename: 'app.bundle.js'
  },
  externals: [
    'cordova',
    resolveExternals
  ],
  target: 'web',
  devtool: 'source-map',
  babel: {
    presets: ['es2015', 'stage-0'],
    plugins: ['transform-decorators-legacy', 'add-module-exports']
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /(node_modules|www)/,
      loader: 'babel'
    }]
  },
  resolve: {
    extensions: ['', '.js'],
    alias: {
      api: __dirname + '/api/server'
    }
  }
};

function resolveExternals(context, request, callback) {
  return meteorPack(request, callback) ||
         cordovaPlugin(request, callback) ||
         callback();
}

function meteorPack(request, callback) {
  var match = request.match(/^meteor\/(.+)$/);
  var pack = match && match[1];

  if (pack) {
    callback(null, 'Package["' + pack + '"]' );
    return true;
  }
}

function cordovaPlugin(request, callback) {
  var match = request.match(/^cordova\/(.+)$/);
  var plugin = match && match[1];

  if (plugin) {
    plugin = camelCase(plugin);
    plugin = upperFirst(plugin);
    callback(null, 'this.cordova && cordova.plugins && cordova.plugins.' + plugin);
    return true;
  }
}