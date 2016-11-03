var path = require('path');
var webpack = require('webpack');

// for prod builds, we have already done AoT and AoT writes to disk
// so read the JS file from disk
// for dev buids, we actually want to pass in .ts files since we
// don't have .js files on disk, they're exclusively in memory

function getEntryPoint() {
  if (process.env.IONIC_ENV === 'prod') {
    return '{{TMP}}/app/main.prod.js';
  }
  return '{{TMP}}/app/main.dev.js';
}

function getPlugins() {
  var plugins = [
    // Try to dedupe duplicated modules, if any:
    // Add this back in when Angular fixes the issue: https://github.com/angular/angular-cli/issues/1587
    //new DedupePlugin()
    new webpack.ProvidePlugin({
      __extends: 'typescript-extends'
    })
  ];

  if (process.env.IONIC_ENV === 'prod') {
    // This helps ensure the builds are consistent if source hasn't changed:
    plugins.push(new webpack.optimize.OccurrenceOrderPlugin())
  }

  return plugins;
}

module.exports = {
  entry: getEntryPoint(),
  output: {
    path: '{{BUILD}}',
    filename: 'main.js'
  },

  resolve: {
    extensions: ['.js', '.json', '.ts'],
    alias: {
      'api': path.resolve(__dirname, '../api')
    }
  },

  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.ts$/,
        exclude: /(node_modules)/,
        loaders: ['awesome-typescript-loader']
      }
    ]
  },

  plugins: getPlugins(),

  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    __dirname: true
  }
};
