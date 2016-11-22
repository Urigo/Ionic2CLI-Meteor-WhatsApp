# Step 1: Initial setup

Both [Meteor](https://meteor.com) and [Ionic](https://ionicframework.com) took their platform to the next level in tooling. They both provide CLI interfaces and build tools which will help you build a mobile-application.

In this post we will focus on the Ionic CLI; We will use it to serve the client and build the our project using [Cordova](https://cordova.apache.org/), and we will use Meteor as a platform for our server, so we will be able to use [Mongo collections](https://docs.meteor.com/api/collections.html) and [subscriptions](https://docs.meteor.com/api/pubsub.html).

The only pre-requirements for this tutorial is for you to have Node.JS version 5 or above installed. If you haven't already installed it, you can download it from its official website over [here](https://nodejs.org/en/).

We will start by installing Ionic and Cordova globally:

    $ npm install -g ionic cordova

We will create our Whatsapp-clone using the following command:

    $ ionic start whatsapp --v2

To start our app, simply type:

    $ ionic serve

> For more information on how to run an Ionic-app on a mobile device, see the following link: https://ionicframework.com/docs/v2/getting-started/installation/.

Ionic 2 apps are written using [Angular 2](https://angular.io). Although Angular 2 apps can be created using plain JavaScript, it is recommended to write them using [Typescript](https://typescriptlang.org), for 2 reasons:

- It prevents runtime errors.
- Dependency injection is done automatically based on the provided data-types.

In order to apply TypeScript, Ionic's build system is built on top of a module bundler called [Rollup](http://rollupjs.org/).

In this tutorial we will use a custom build-config, and replace Rollup with [Webpack](https://webpack.github.io). Both module-bundlers are great solutions for building our app, but Webpack provides us with some extra features like aliases and custom module-loaders which are crucial ingredients for our app to work properly.

## Ionic 2 + Webpack

The first thing we gonna do would be telling Ionic that we're using Webpack as our module-bundler. To specify it, add the following field in the `package.json` file:

[{]: <helper> (diff_step 1.1)
#### Step 1.1: Added build configuration for Ionic app scripts

##### Changed package.json
```diff
@@ -37,5 +37,8 @@
 ┊37┊37┊    "ionic-plugin-keyboard"
 ┊38┊38┊  ],
 ┊39┊39┊  "cordovaPlatforms": [],
-┊40┊  ┊  "description": "Ionic2CLI-Meteor-Whatsapp: An Ionic project"
+┊  ┊40┊  "description": "Ionic2CLI-Meteor-Whatsapp: An Ionic project",
+┊  ┊41┊  "config": {
+┊  ┊42┊    "ionic_webpack": "./webpack.config.js"
+┊  ┊43┊  }
 ┊41┊44┊}
```
[}]: #

Ionic provides us with a sample Webpack config file that we can extend later on, and it's located under the path `node_modules/@ionic/app-scripts/config/webpack.config.js`. We will copy it to a newly created `config` dir using the following command:

    $ cp node_modules/@ionic/app-scripts/config/webpack.config.js .

The configuration file should look like so:

[{]: <helper> (diff_step 1.2)
#### Step 1.2: Added webpack base file

##### Added webpack.config.js
```diff
@@ -0,0 +1,44 @@
+┊  ┊ 1┊var path = require('path');
+┊  ┊ 2┊var webpack = require('webpack');
+┊  ┊ 3┊var ionicWebpackFactory = require(process.env.IONIC_WEBPACK_FACTORY);
+┊  ┊ 4┊
+┊  ┊ 5┊module.exports = {
+┊  ┊ 6┊  entry: process.env.IONIC_APP_ENTRY_POINT,
+┊  ┊ 7┊  output: {
+┊  ┊ 8┊    path: '{{BUILD}}',
+┊  ┊ 9┊    filename: process.env.IONIC_OUTPUT_JS_FILE_NAME,
+┊  ┊10┊    devtoolModuleFilenameTemplate: ionicWebpackFactory.getSourceMapperFunction(),
+┊  ┊11┊  },
+┊  ┊12┊  devtool: process.env.IONIC_GENERATE_SOURCE_MAP ? process.env.IONIC_SOURCE_MAP_TYPE : '',
+┊  ┊13┊
+┊  ┊14┊  resolve: {
+┊  ┊15┊    extensions: ['.ts', '.js', '.json'],
+┊  ┊16┊    modules: [path.resolve('node_modules')]
+┊  ┊17┊  },
+┊  ┊18┊
+┊  ┊19┊  module: {
+┊  ┊20┊    loaders: [
+┊  ┊21┊      {
+┊  ┊22┊        test: /\.json$/,
+┊  ┊23┊        loader: 'json-loader'
+┊  ┊24┊      },
+┊  ┊25┊      {
+┊  ┊26┊        //test: /\.(ts|ngfactory.js)$/,
+┊  ┊27┊        test: /\.ts$/,
+┊  ┊28┊        loader: process.env.IONIC_WEBPACK_LOADER
+┊  ┊29┊      }
+┊  ┊30┊    ]
+┊  ┊31┊  },
+┊  ┊32┊
+┊  ┊33┊  plugins: [
+┊  ┊34┊    ionicWebpackFactory.getIonicEnvironmentPlugin()
+┊  ┊35┊  ],
+┊  ┊36┊
+┊  ┊37┊  // Some libraries import Node modules but don't use them in the browser.
+┊  ┊38┊  // Tell Webpack to provide empty mocks for them so importing them works.
+┊  ┊39┊  node: {
+┊  ┊40┊    fs: 'empty',
+┊  ┊41┊    net: 'empty',
+┊  ┊42┊    tls: 'empty'
+┊  ┊43┊  }
+┊  ┊44┊};
```
[}]: #

As we said earlier, this is only a base for our config. We would also like to add the following abilities while bundling our project:

- The ability to load external TypeScript modules without any issues.
- Have an alias for our Meteor server under the `api` dir (Which will be created later in).
- Be able to import Meteor packages and Cordova plugins.

To achieve these abilities, this is how our extension should look like:

[{]: <helper> (diff_step 1.3)
#### Step 1.3: Updated webpack file

##### Changed webpack.config.js
```diff
@@ -11,9 +11,17 @@
 ┊11┊11┊  },
 ┊12┊12┊  devtool: process.env.IONIC_GENERATE_SOURCE_MAP ? process.env.IONIC_SOURCE_MAP_TYPE : '',
 ┊13┊13┊
+┊  ┊14┊  externals: [
+┊  ┊15┊    'cordova',
+┊  ┊16┊    resolveExternals
+┊  ┊17┊  ],
+┊  ┊18┊
 ┊14┊19┊  resolve: {
 ┊15┊20┊    extensions: ['.ts', '.js', '.json'],
-┊16┊  ┊    modules: [path.resolve('node_modules')]
+┊  ┊21┊    modules: [path.resolve('node_modules')],
+┊  ┊22┊    alias: {
+┊  ┊23┊      'api': path.resolve(__dirname, 'api')
+┊  ┊24┊    }
 ┊17┊25┊  },
 ┊18┊26┊
 ┊19┊27┊  module: {
```
```diff
@@ -31,7 +39,10 @@
 ┊31┊39┊  },
 ┊32┊40┊
 ┊33┊41┊  plugins: [
-┊34┊  ┊    ionicWebpackFactory.getIonicEnvironmentPlugin()
+┊  ┊42┊    ionicWebpackFactory.getIonicEnvironmentPlugin(),
+┊  ┊43┊    new webpack.ProvidePlugin({
+┊  ┊44┊      __extends: 'typescript-extends'
+┊  ┊45┊    })
 ┊35┊46┊  ],
 ┊36┊47┊
 ┊37┊48┊  // Some libraries import Node modules but don't use them in the browser.
```
```diff
@@ -39,6 +50,35 @@
 ┊39┊50┊  node: {
 ┊40┊51┊    fs: 'empty',
 ┊41┊52┊    net: 'empty',
-┊42┊  ┊    tls: 'empty'
+┊  ┊53┊    tls: 'empty',
+┊  ┊54┊    __dirname: true
 ┊43┊55┊  }
 ┊44┊56┊};
+┊  ┊57┊
+┊  ┊58┊function resolveExternals(context, request, callback) {
+┊  ┊59┊  return meteorPackage(request, callback) ||
+┊  ┊60┊         cordovaPlugin(request, callback) ||
+┊  ┊61┊         callback();
+┊  ┊62┊}
+┊  ┊63┊
+┊  ┊64┊function meteorPackage(request, callback) {
+┊  ┊65┊  var match = request.match(/^meteor\/(.+)$/);
+┊  ┊66┊  var pack = match && match[1];
+┊  ┊67┊
+┊  ┊68┊  if (pack) {
+┊  ┊69┊    callback(null, 'window.Package && Package["' + pack + '"]');
+┊  ┊70┊    return true;
+┊  ┊71┊  }
+┊  ┊72┊}
+┊  ┊73┊
+┊  ┊74┊function cordovaPlugin(request, callback) {
+┊  ┊75┊  var match = request.match(/^cordova\/(.+)$/);
+┊  ┊76┊  var plugin = match && match[1];
+┊  ┊77┊
+┊  ┊78┊  if (plugin) {
+┊  ┊79┊    plugin = camelCase(plugin);
+┊  ┊80┊    plugin = upperFirst(plugin);
+┊  ┊81┊    callback(null, 'window.cordova && cordova.plugins && cordova.plugins.' + plugin);
+┊  ┊82┊    return true;
+┊  ┊83┊  }
+┊  ┊84┊}
```
[}]: #

In addition to the alias we've just created, we also need to tell the TypesScript compiler to include the `api` dir during the compilation process:

[{]: <helper> (diff_step 1.4)
#### Step 1.4: Include API files in typescript config

##### Changed tsconfig.json
```diff
@@ -14,10 +14,12 @@
 ┊14┊14┊    "target": "es5"
 ┊15┊15┊  },
 ┊16┊16┊  "include": [
-┊17┊  ┊    "src/**/*.ts"
+┊  ┊17┊    "src/**/*.ts",
+┊  ┊18┊    "api/**/*.ts"
 ┊18┊19┊  ],
 ┊19┊20┊  "exclude": [
-┊20┊  ┊    "node_modules"
+┊  ┊21┊    "node_modules",
+┊  ┊22┊    "api/node_modules"
 ┊21┊23┊  ],
 ┊22┊24┊  "compileOnSave": false,
 ┊23┊25┊  "atom": {
```
[}]: #

And we will need to install the following dependencies so the Webpack config can be registered properly:

    $ npm install --save-dev typescript-extends
    $ npm install --save-dev lodash.camelcase
    $ npm install --save-dev lodash.upperfirst

## TypeScript Configuration

Now, we need to make some modifications for the TypeScript config so we can load Meteor as an external dependency; One of the changes include the specification for CommonJS:

[{]: <helper> (diff_step 1.6)
#### Step 1.6: Updated typscript compiler config

##### Changed tsconfig.json
```diff
@@ -8,10 +8,13 @@
 ┊ 8┊ 8┊      "dom",
 ┊ 9┊ 9┊      "es2015"
 ┊10┊10┊    ],
-┊11┊  ┊    "module": "es2015",
+┊  ┊11┊    "module": "commonjs",
 ┊12┊12┊    "moduleResolution": "node",
 ┊13┊13┊    "sourceMap": true,
-┊14┊  ┊    "target": "es5"
+┊  ┊14┊    "target": "es5",
+┊  ┊15┊    "skipLibCheck": true,
+┊  ┊16┊    "stripInternal": true,
+┊  ┊17┊    "noImplicitAny": false
 ┊15┊18┊  },
 ┊16┊19┊  "include": [
 ┊17┊20┊    "src/**/*.ts",
```
[}]: #

## Trying It Out

By this point, you can run `ionic serve` and test how our application works with the new module bundler we've just configured. You might encounter the following warnings when launching the app in the browser:

    Native: tried calling StatusBar.styleDefault, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator
    Native: tried calling Splashscreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator

This is caused due to expectation to be run in a mobile environment. To fix this warning, simply check if Cordova is defined on the global scope before calling any methods related to it:

[{]: <helper> (diff_step 1.7)
#### Step 1.7: Check if cordova exists

##### Changed src/app/app.component.ts
```diff
@@ -15,8 +15,10 @@
 ┊15┊15┊    platform.ready().then(() => {
 ┊16┊16┊      // Okay, so the platform is ready and our plugins are available.
 ┊17┊17┊      // Here you can do any higher level native things you might need.
-┊18┊  ┊      StatusBar.styleDefault();
-┊19┊  ┊      Splashscreen.hide();
+┊  ┊18┊      if (window.hasOwnProperty('cordova')) {
+┊  ┊19┊        StatusBar.styleDefault();
+┊  ┊20┊        Splashscreen.hide();
+┊  ┊21┊      }
 ┊20┊22┊    });
 ┊21┊23┊  }
 ┊22┊24┊}
```
[}]: #

[{]: <helper> (nav_step next_ref="https://angular-meteor.com/tutorials/whatsapp2/ionic/1.0.0/chats-page" prev_ref="https://angular-meteor.com/tutorials/whatsapp2-tutorial")
| [< Intro](https://angular-meteor.com/tutorials/whatsapp2-tutorial) | [Next Step >](https://angular-meteor.com/tutorials/whatsapp2/ionic/1.0.0/chats-page) |
|:--------------------------------|--------------------------------:|
[}]: #

