[{]: <region> (header)
# Step 1: Bootstrapping
[}]: #
[{]: <region> (body)
Both [Meteor](https://meteor.com) and [Ionic](https://ionicframework.com) took their platform to the next level in tooling. They both provide CLI interfaces and build tools which will help you build a mobile-application.

In this post we will focus on the `Ionic` CLI; We will use it to serve the client and build the our project using [Cordova](https://cordova.apache.org/), and we will use `Meteor` as a platform for our server, so we will be able to use [Mongo collections](https://docs.meteor.com/api/collections.html) and [subscriptions](https://docs.meteor.com/api/pubsub.html).

The only pre-requirements for this tutorial is for you to have `Node.JS` version 5 or above installed. If you haven't already installed it, you can download it from its official website over [here](https://nodejs.org/en/).

We will start by installing Ionic and `Cordova` globally:

    $ npm install -g ionic cordova

We will create our `Whatsapp`-clone using the following command:

    $ ionic start whatsapp --v2

To start our app, simply type:

    $ ionic serve

> For more information on how to run an Ionic-app on a mobile device, see the following link: https://ionicframework.com/docs/v2/getting-started/installation/.

`Ionic 2` apps are written using [Angular 2](https://angular.io). Although `Angular 2` apps can be created using plain JavaScript, it is recommended to write them using [Typescript](https://typescriptlang.org), for 2 reasons:

- It prevents runtime errors.
- Dependency injection is done automatically based on the provided data-types.

In order to apply `TypeScript`, `Ionic`'s build system is built on top of a module bundler called [Rollup](http://rollupjs.org/).

In this tutorial we will use a custom build-config, and replace `Rollup` with [Webpack](https://webpack.github.io). Both module-bundlers are great solutions for building our app, but `Webpack` provides us with some extra features like aliases and custom module-loaders which are crucial ingredients for our app to work properly.

## Ionic 2 + Webpack

The first thing we gonna do would be telling Ionic that we're using `Webpack` as our module-bundler. To specify it, add the following field in the `package.json` file:

[{]: <helper> (diff_step 1.1)
#### Step 1.1: Add webpack config declration in package.json

##### Changed package.json
```diff
@@ -47,5 +47,8 @@
 ┊47┊47┊      "locator": "ios"
 ┊48┊48┊    }
 ┊49┊49┊  ],
-┊50┊  ┊  "description": "whatsapp: An Ionic project"
+┊  ┊50┊  "description": "whatsapp: An Ionic project",
+┊  ┊51┊  "config": {
+┊  ┊52┊    "ionic_webpack": "./webpack.config.js"
+┊  ┊53┊  }
 ┊51┊54┊}
```
[}]: #

Ionic provides us with a sample `Webpack` config file that we can extend later on, and it's located under the path `node_modules/@ionic/app-scripts/config/webpack.config.js`. We will copy it to a newly created `config` dir using the following command:

    $ cp node_modules/@ionic/app-scripts/config/webpack.config.js .

The configuration file should look like so:

[{]: <helper> (diff_step 1.2)
#### Step 1.2: Add Ionic's base webpack file to the project

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

- The ability to load external `TypeScript` modules without any issues.
- Have an alias for our `Meteor` server under the `api` dir (Which will be created later in).
- Be able to import `Meteor` packages and `Cordova` plugins.

To achieve these abilities, this is how our extension should look like:

[{]: <helper> (diff_step 1.3)
#### Step 1.3: Updated webpack config file

##### Changed webpack.config.js
```diff
@@ -13,9 +13,16 @@
 ┊13┊13┊
 ┊14┊14┊  resolve: {
 ┊15┊15┊    extensions: ['.ts', '.js', '.json'],
-┊16┊  ┊    modules: [path.resolve('node_modules')]
+┊  ┊16┊    modules: [path.resolve('node_modules')],
+┊  ┊17┊    alias: {
+┊  ┊18┊      'api': path.resolve(__dirname, 'api/server')
+┊  ┊19┊    }
 ┊17┊20┊  },
 ┊18┊21┊
+┊  ┊22┊  externals: [
+┊  ┊23┊    resolveExternals
+┊  ┊24┊  ],
+┊  ┊25┊
 ┊19┊26┊  module: {
 ┊20┊27┊    loaders: [
 ┊21┊28┊      {
```
```diff
@@ -31,7 +38,10 @@
 ┊31┊38┊  },
 ┊32┊39┊
 ┊33┊40┊  plugins: [
-┊34┊  ┊    ionicWebpackFactory.getIonicEnvironmentPlugin()
+┊  ┊41┊    ionicWebpackFactory.getIonicEnvironmentPlugin(),
+┊  ┊42┊    new webpack.ProvidePlugin({
+┊  ┊43┊      __extends: 'typescript-extends'
+┊  ┊44┊    })
 ┊35┊45┊  ],
 ┊36┊46┊
 ┊37┊47┊  // Some libraries import Node modules but don't use them in the browser.
```
```diff
@@ -39,6 +49,22 @@
 ┊39┊49┊  node: {
 ┊40┊50┊    fs: 'empty',
 ┊41┊51┊    net: 'empty',
-┊42┊  ┊    tls: 'empty'
+┊  ┊52┊    tls: 'empty',
+┊  ┊53┊    __dirname: true
 ┊43┊54┊  }
 ┊44┊55┊};
+┊  ┊56┊
+┊  ┊57┊function resolveExternals(context, request, callback) {
+┊  ┊58┊  return resolveMeteor(request, callback) ||
+┊  ┊59┊    callback();
+┊  ┊60┊}
+┊  ┊61┊
+┊  ┊62┊function resolveMeteor(request, callback) {
+┊  ┊63┊  var match = request.match(/^meteor\/(.+)$/);
+┊  ┊64┊  var pack = match && match[1];
+┊  ┊65┊
+┊  ┊66┊  if (pack) {
+┊  ┊67┊    callback(null, 'Package["' + pack + '"]');
+┊  ┊68┊    return true;
+┊  ┊69┊  }
+┊  ┊70┊}
```
[}]: #

In addition to the alias we've just created, we also need to tell the `TypesScript` compiler to include the `api` dir during the compilation process:

[{]: <helper> (diff_step 1.4)
#### Step 1.4: Updated TypeScript config file

##### Changed tsconfig.json
```diff
@@ -14,13 +14,15 @@
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
 ┊24┊26┊    "rewriteTsconfig": false
 ┊25┊27┊  }
-┊26┊  ┊}🚫↵
+┊  ┊28┊}
```
[}]: #

And we will need to install the following dependencies so the `Webpack` config can be registered properly:

    $ npm install --save-dev typescript-extends

## TypeScript Configuration

Now, we need to make some modifications for the `TypeScript` config so we can load `Meteor` as an external dependency; One of the changes include the specification for `CommonJS`:

[{]: <helper> (diff_step 1.6)
#### Step 1.6: Updated typscript compiler config

##### Changed tsconfig.json
```diff
@@ -1,6 +1,7 @@
 ┊1┊1┊{
 ┊2┊2┊  "compilerOptions": {
 ┊3┊3┊    "allowSyntheticDefaultImports": true,
+┊ ┊4┊    "baseUrl": ".",
 ┊4┊5┊    "declaration": false,
 ┊5┊6┊    "emitDecoratorMetadata": true,
 ┊6┊7┊    "experimentalDecorators": true,
```
```diff
@@ -8,10 +9,20 @@
 ┊ 8┊ 9┊      "dom",
 ┊ 9┊10┊      "es2015"
 ┊10┊11┊    ],
-┊11┊  ┊    "module": "es2015",
+┊  ┊12┊    "module": "commonjs",
 ┊12┊13┊    "moduleResolution": "node",
+┊  ┊14┊    "paths": {
+┊  ┊15┊      "api/*": ["./api/server/*"]
+┊  ┊16┊    },
 ┊13┊17┊    "sourceMap": true,
-┊14┊  ┊    "target": "es5"
+┊  ┊18┊    "target": "es5",
+┊  ┊19┊    "skipLibCheck": true,
+┊  ┊20┊    "stripInternal": true,
+┊  ┊21┊    "noImplicitAny": false,
+┊  ┊22┊    "types": [
+┊  ┊23┊      "meteor-typings",
+┊  ┊24┊      "@types/underscore"
+┊  ┊25┊    ]
 ┊15┊26┊  },
 ┊16┊27┊  "include": [
 ┊17┊28┊    "src/**/*.ts",
```
```diff
@@ -19,7 +30,8 @@
 ┊19┊30┊  ],
 ┊20┊31┊  "exclude": [
 ┊21┊32┊    "node_modules",
-┊22┊  ┊    "api/node_modules"
+┊  ┊33┊    "api/node_modules",
+┊  ┊34┊    "api"
 ┊23┊35┊  ],
 ┊24┊36┊  "compileOnSave": false,
 ┊25┊37┊  "atom": {
```
[}]: #

This configuration requires us to install the declaration files specified under the `types` field:

    $ npm install --save-dev @types/underscore
    $ npm install --save-dev meteor-typings

## Trying It Out

By this point, you can run `ionic serve` and test how our application works with the new module bundler we've just configured. You might encounter the following warnings when launching the app in the browser:

    Native: tried calling StatusBar.styleDefault, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator
    Native: tried calling Splashscreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator

This is caused due to expectation to be run in a mobile environment. To fix this warning, simply check if the current platform supports `Cordova` before calling any methods related to it:

[{]: <helper> (diff_step 1.8)
#### Step 1.8: Check if cordova exists

##### Changed src/app/app.component.ts
```diff
@@ -15,8 +15,10 @@
 ┊15┊15┊    platform.ready().then(() => {
 ┊16┊16┊      // Okay, so the platform is ready and our plugins are available.
 ┊17┊17┊      // Here you can do any higher level native things you might need.
-┊18┊  ┊      StatusBar.styleDefault();
-┊19┊  ┊      Splashscreen.hide();
+┊  ┊18┊      if (platform.is('cordova')) {
+┊  ┊19┊        StatusBar.styleDefault();
+┊  ┊20┊        Splashscreen.hide();
+┊  ┊21┊      }
 ┊20┊22┊    });
 ┊21┊23┊  }
 ┊22┊24┊}
```
[}]: #

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Intro](../../README.md) | [Next Step >](step2.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #