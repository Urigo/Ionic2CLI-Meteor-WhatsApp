var Path = require('path');
var Webpack = require('webpack');
var IonicWebpackFactory = require(process.env.IONIC_WEBPACK_FACTORY);

module.exports = {
  entry: process.env.IONIC_APP_ENTRY_POINT,
  output: {
    path: '{{BUILD}}',
    filename: process.env.IONIC_OUTPUT_JS_FILE_NAME,
    devtoolModuleFilenameTemplate: IonicWebpackFactory.getSourceMapperFunction(),
  },
  devtool: process.env.IONIC_GENERATE_SOURCE_MAP ? process.env.IONIC_SOURCE_MAP_TYPE : '',

  externals: [
    {
      cordova: 'cordova',
      gm: '{}'
    },
    resolveExternals
  ],

  resolve: {
    extensions: ['.ts', '.js', '.json'],
    modules: [Path.resolve('node_modules')],
    alias: {
      'api': Path.resolve(__dirname, 'api/server'),
      'meteor-client': Path.resolve(__dirname, 'meteor-client/meteor.bundle')
    }
  },

  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        //test: /\.(ts|ngfactory.js)$/,
        test: /\.ts$/,
        loader: process.env.IONIC_WEBPACK_LOADER
      }
    ]
  },

  plugins: [
    IonicWebpackFactory.getIonicEnvironmentPlugin(),
    new Webpack.ProvidePlugin({
      __extends: 'typescript-extends'
    })
  ],

  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    __dirname: true
  }
};

function resolveExternals(context, request, callback) {
  return resolveMeteor(request, callback) ||
         callback();
}

function resolveMeteor(request, callback) {
  var match = request.match(/^meteor\/(.+)$/);
  var pack = match && match[1];

  if (pack) {
    callback(null, 'Package["' + pack + '"]');
    return true;
  }
}
