# Step 1: Bootstrapping

> If you got directly into here, please read the whole [intro section](https://angular-meteor.com/tutorials/whatsapp2-tutorial) explaining the goals for this tutorial and project.

Both [Meteor](https://meteor.com) and [Ionic](https://ionicframework.com) took their platform to the next level in tooling. They both provide CLI interfaces and build tools which will help you build a mobile-application.

In this tutorial we will focus on the `Ionic` CLI; We will use it to serve the client and build our project using [Cordova](https://cordova.apache.org/), and we will use `Meteor` as a platform for our server, so we will be able to use [Mongo collections](https://docs.meteor.com/api/collections.html) and [subscriptions](https://docs.meteor.com/api/pubsub.html).

> If you are interested in the [Meteor CLI](https://angular-meteor.com/tutorials/whatsapp2/meteor/setup), the steps needed to use it with Meteor are almost identical to the steps required by the Ionic CLI

The only pre-requirements for this tutorial is for you to have `Node.JS` version 5 or above installed. If you haven't already installed it, you can download it from its official website over [here](https://nodejs.org/en/).

We will start by installing Ionic and `Cordova` globally:

    $ npm install -g ionic cordova

We will create our `Whatsapp`-clone using the following command:

    $ ionic start whatsapp blank --cordova --skip-link

Then we will add an empty declarations file, to later allow third party libraries to be used in our app even if they don't provide their own type declarations:

[{]: <helper> (diffStep "1.1")

#### [Step 1.1: Add declarations file](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/6ca82c8e)

##### Added src&#x2F;declarations.d.ts
```diff
@@ -0,0 +1,10 @@
+┊  ┊ 1┊/*
+┊  ┊ 2┊  Declaration files are how the Typescript compiler knows about the type information(or shape) of an object.
+┊  ┊ 3┊  They're what make intellisense work and make Typescript know all about your code.
+┊  ┊ 4┊  A wildcard module is declared below to allow third party libraries to be used in an app even if they don't
+┊  ┊ 5┊  provide their own type declarations.
+┊  ┊ 6┊  To learn more about using third party libraries in an Ionic app, check out the docs here:
+┊  ┊ 7┊  http://ionicframework.com/docs/v2/resources/third-party-libs/
+┊  ┊ 8┊  For more info on type definition files, check out the Typescript docs here:
+┊  ┊ 9┊  https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
+┊  ┊10┊*/
```

[}]: #

To start our app, simply type:

    $ ionic serve

To prevent [ionic-app-scripts bug #1052](https://github.com/ionic-team/ionic-app-scripts/issues/1052) let's upgrade Typescript to 2.4:

    $ npm install --save typescript@~2.4

> For more information on how to run an Ionic-app on a mobile device, see the following link: https://ionicframework.com/docs/v2/getting-started/installation/.

`Ionic 2` apps are written using [Angular 2](https://angular.io). Although `Angular 2` apps can be created using plain JavaScript, it is recommended to write them using [Typescript](https://typescriptlang.org), for 2 reasons:

- It prevents runtime errors.
- Dependency injection is done automatically based on the provided data-types.

In order to apply `TypeScript`, `Ionic`'s build system is built on top of a module bundler called [Webpack](https://webpack.github.io).

In this tutorial we will use a custom build-config for Webpack.

## Ionic 2 + Webpack

The first thing we gonna do would be telling Ionic that we're using `Webpack` as our module-bundler. To specify it, add the following field in the `package.json` file:

[{]: <helper> (diffStep "1.3")

#### [Step 1.3: Add webpack config declaration in package.json](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/a70f9a91)

##### Changed package.json
```diff
@@ -38,5 +38,8 @@
 ┊38┊38┊    "@ionic/app-scripts": "3.0.0",
 ┊39┊39┊    "typescript": "^2.4.2"
 ┊40┊40┊  },
-┊41┊  ┊  "description": "whatsapp: An Ionic project"
+┊  ┊41┊  "description": "whatsapp: An Ionic project",
+┊  ┊42┊  "config": {
+┊  ┊43┊    "ionic_webpack": "./webpack.config.js"
+┊  ┊44┊  }
 ┊42┊45┊}
```

[}]: #

Ionic provides us with a sample `Webpack` config file that we can extend later on, and it's located under the path `node_modules/@ionic/app-scripts/config/webpack.config.js`. We will copy it to a newly created `config` dir using the following command:

    $ cp node_modules/@ionic/app-scripts/config/webpack.config.js .

The configuration file should look like so:

[{]: <helper> (diffStep "1.4")

#### [Step 1.4: Add Ionic&#x27;s base webpack file to the project](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/01e15518)

##### Added webpack.config.js
```diff
@@ -0,0 +1,147 @@
+┊   ┊  1┊/*
+┊   ┊  2┊ * The webpack config exports an object that has a valid webpack configuration
+┊   ┊  3┊ * For each environment name. By default, there are two Ionic environments:
+┊   ┊  4┊ * "dev" and "prod". As such, the webpack.config.js exports a dictionary object
+┊   ┊  5┊ * with "keys" for "dev" and "prod", where the value is a valid webpack configuration
+┊   ┊  6┊ * For details on configuring webpack, see their documentation here
+┊   ┊  7┊ * https://webpack.js.org/configuration/
+┊   ┊  8┊ */
+┊   ┊  9┊
+┊   ┊ 10┊var path = require('path');
+┊   ┊ 11┊var webpack = require('webpack');
+┊   ┊ 12┊var ionicWebpackFactory = require(process.env.IONIC_WEBPACK_FACTORY);
+┊   ┊ 13┊
+┊   ┊ 14┊var ModuleConcatPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');
+┊   ┊ 15┊var PurifyPlugin = require('@angular-devkit/build-optimizer').PurifyPlugin;
+┊   ┊ 16┊
+┊   ┊ 17┊var optimizedProdLoaders = [
+┊   ┊ 18┊  {
+┊   ┊ 19┊    test: /\.json$/,
+┊   ┊ 20┊    loader: 'json-loader'
+┊   ┊ 21┊  },
+┊   ┊ 22┊  {
+┊   ┊ 23┊    test: /\.js$/,
+┊   ┊ 24┊    loader: [
+┊   ┊ 25┊      {
+┊   ┊ 26┊        loader: process.env.IONIC_CACHE_LOADER
+┊   ┊ 27┊      },
+┊   ┊ 28┊
+┊   ┊ 29┊      {
+┊   ┊ 30┊        loader: '@angular-devkit/build-optimizer/webpack-loader',
+┊   ┊ 31┊        options: {
+┊   ┊ 32┊          sourceMap: true
+┊   ┊ 33┊        }
+┊   ┊ 34┊      },
+┊   ┊ 35┊    ]
+┊   ┊ 36┊  },
+┊   ┊ 37┊  {
+┊   ┊ 38┊    test: /\.ts$/,
+┊   ┊ 39┊    loader: [
+┊   ┊ 40┊      {
+┊   ┊ 41┊        loader: process.env.IONIC_CACHE_LOADER
+┊   ┊ 42┊      },
+┊   ┊ 43┊
+┊   ┊ 44┊      {
+┊   ┊ 45┊        loader: '@angular-devkit/build-optimizer/webpack-loader',
+┊   ┊ 46┊        options: {
+┊   ┊ 47┊          sourceMap: true
+┊   ┊ 48┊        }
+┊   ┊ 49┊      },
+┊   ┊ 50┊
+┊   ┊ 51┊      {
+┊   ┊ 52┊        loader: process.env.IONIC_WEBPACK_LOADER
+┊   ┊ 53┊      }
+┊   ┊ 54┊    ]
+┊   ┊ 55┊  }
+┊   ┊ 56┊];
+┊   ┊ 57┊
+┊   ┊ 58┊function getProdLoaders() {
+┊   ┊ 59┊  if (process.env.IONIC_OPTIMIZE_JS === 'true') {
+┊   ┊ 60┊    return optimizedProdLoaders;
+┊   ┊ 61┊  }
+┊   ┊ 62┊  return devConfig.module.loaders;
+┊   ┊ 63┊}
+┊   ┊ 64┊
+┊   ┊ 65┊var devConfig = {
+┊   ┊ 66┊  entry: process.env.IONIC_APP_ENTRY_POINT,
+┊   ┊ 67┊  output: {
+┊   ┊ 68┊    path: '{{BUILD}}',
+┊   ┊ 69┊    publicPath: 'build/',
+┊   ┊ 70┊    filename: '[name].js',
+┊   ┊ 71┊    devtoolModuleFilenameTemplate: ionicWebpackFactory.getSourceMapperFunction(),
+┊   ┊ 72┊  },
+┊   ┊ 73┊  devtool: process.env.IONIC_SOURCE_MAP_TYPE,
+┊   ┊ 74┊
+┊   ┊ 75┊  resolve: {
+┊   ┊ 76┊    extensions: ['.ts', '.js', '.json'],
+┊   ┊ 77┊    modules: [path.resolve('node_modules')]
+┊   ┊ 78┊  },
+┊   ┊ 79┊
+┊   ┊ 80┊  module: {
+┊   ┊ 81┊    loaders: [
+┊   ┊ 82┊      {
+┊   ┊ 83┊        test: /\.json$/,
+┊   ┊ 84┊        loader: 'json-loader'
+┊   ┊ 85┊      },
+┊   ┊ 86┊      {
+┊   ┊ 87┊        test: /\.ts$/,
+┊   ┊ 88┊        loader: process.env.IONIC_WEBPACK_LOADER
+┊   ┊ 89┊      }
+┊   ┊ 90┊    ]
+┊   ┊ 91┊  },
+┊   ┊ 92┊
+┊   ┊ 93┊  plugins: [
+┊   ┊ 94┊    ionicWebpackFactory.getIonicEnvironmentPlugin(),
+┊   ┊ 95┊    ionicWebpackFactory.getCommonChunksPlugin()
+┊   ┊ 96┊  ],
+┊   ┊ 97┊
+┊   ┊ 98┊  // Some libraries import Node modules but don't use them in the browser.
+┊   ┊ 99┊  // Tell Webpack to provide empty mocks for them so importing them works.
+┊   ┊100┊  node: {
+┊   ┊101┊    fs: 'empty',
+┊   ┊102┊    net: 'empty',
+┊   ┊103┊    tls: 'empty'
+┊   ┊104┊  }
+┊   ┊105┊};
+┊   ┊106┊
+┊   ┊107┊var prodConfig = {
+┊   ┊108┊  entry: process.env.IONIC_APP_ENTRY_POINT,
+┊   ┊109┊  output: {
+┊   ┊110┊    path: '{{BUILD}}',
+┊   ┊111┊    publicPath: 'build/',
+┊   ┊112┊    filename: '[name].js',
+┊   ┊113┊    devtoolModuleFilenameTemplate: ionicWebpackFactory.getSourceMapperFunction(),
+┊   ┊114┊  },
+┊   ┊115┊  devtool: process.env.IONIC_SOURCE_MAP_TYPE,
+┊   ┊116┊
+┊   ┊117┊  resolve: {
+┊   ┊118┊    extensions: ['.ts', '.js', '.json'],
+┊   ┊119┊    modules: [path.resolve('node_modules')]
+┊   ┊120┊  },
+┊   ┊121┊
+┊   ┊122┊  module: {
+┊   ┊123┊    loaders: getProdLoaders()
+┊   ┊124┊  },
+┊   ┊125┊
+┊   ┊126┊  plugins: [
+┊   ┊127┊    ionicWebpackFactory.getIonicEnvironmentPlugin(),
+┊   ┊128┊    ionicWebpackFactory.getCommonChunksPlugin(),
+┊   ┊129┊    new ModuleConcatPlugin(),
+┊   ┊130┊    new PurifyPlugin()
+┊   ┊131┊  ],
+┊   ┊132┊
+┊   ┊133┊  // Some libraries import Node modules but don't use them in the browser.
+┊   ┊134┊  // Tell Webpack to provide empty mocks for them so importing them works.
+┊   ┊135┊  node: {
+┊   ┊136┊    fs: 'empty',
+┊   ┊137┊    net: 'empty',
+┊   ┊138┊    tls: 'empty'
+┊   ┊139┊  }
+┊   ┊140┊};
+┊   ┊141┊
+┊   ┊142┊
+┊   ┊143┊module.exports = {
+┊   ┊144┊  dev: devConfig,
+┊   ┊145┊  prod: prodConfig
+┊   ┊146┊}
+┊   ┊147┊
```

[}]: #

As we said earlier, this is only a base for our config. We would also like to add the following abilities while bundling our project:

- The ability to load external `TypeScript` modules without any issues.
- Have an alias for our `Meteor` server under the `api` dir (Which will be created later in).
- Be able to import `Meteor` packages and `Cordova` plugins.

To achieve these abilities, this is how our extension should look like:

[{]: <helper> (diffStep "1.5")

#### [Step 1.5: Updated webpack config file](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/e50053b3)

##### Changed webpack.config.js
```diff
@@ -74,9 +74,16 @@
 ┊74┊74┊
 ┊75┊75┊  resolve: {
 ┊76┊76┊    extensions: ['.ts', '.js', '.json'],
-┊77┊  ┊    modules: [path.resolve('node_modules')]
+┊  ┊77┊    modules: [path.resolve('node_modules')],
+┊  ┊78┊    alias: {
+┊  ┊79┊      'api': path.resolve(__dirname, 'api/server')
+┊  ┊80┊    }
 ┊78┊81┊  },
 ┊79┊82┊
+┊  ┊83┊  externals: [
+┊  ┊84┊    resolveExternals
+┊  ┊85┊  ],
+┊  ┊86┊
 ┊80┊87┊  module: {
 ┊81┊88┊    loaders: [
 ┊82┊89┊      {
```
```diff
@@ -92,7 +99,10 @@
 ┊ 92┊ 99┊
 ┊ 93┊100┊  plugins: [
 ┊ 94┊101┊    ionicWebpackFactory.getIonicEnvironmentPlugin(),
-┊ 95┊   ┊    ionicWebpackFactory.getCommonChunksPlugin()
+┊   ┊102┊    ionicWebpackFactory.getCommonChunksPlugin(),
+┊   ┊103┊    new webpack.ProvidePlugin({
+┊   ┊104┊      __extends: 'typescript-extends'
+┊   ┊105┊    })
 ┊ 96┊106┊  ],
 ┊ 97┊107┊
 ┊ 98┊108┊  // Some libraries import Node modules but don't use them in the browser.
```
```diff
@@ -100,7 +110,8 @@
 ┊100┊110┊  node: {
 ┊101┊111┊    fs: 'empty',
 ┊102┊112┊    net: 'empty',
-┊103┊   ┊    tls: 'empty'
+┊   ┊113┊    tls: 'empty',
+┊   ┊114┊    __dirname: true
 ┊104┊115┊  }
 ┊105┊116┊};
 ┊106┊117┊
```
```diff
@@ -116,9 +127,16 @@
 ┊116┊127┊
 ┊117┊128┊  resolve: {
 ┊118┊129┊    extensions: ['.ts', '.js', '.json'],
-┊119┊   ┊    modules: [path.resolve('node_modules')]
+┊   ┊130┊    modules: [path.resolve('node_modules')],
+┊   ┊131┊    alias: {
+┊   ┊132┊      'api': path.resolve(__dirname, 'api/server')
+┊   ┊133┊    }
 ┊120┊134┊  },
 ┊121┊135┊
+┊   ┊136┊  externals: [
+┊   ┊137┊    resolveExternals
+┊   ┊138┊  ],
+┊   ┊139┊
 ┊122┊140┊  module: {
 ┊123┊141┊    loaders: getProdLoaders()
 ┊124┊142┊  },
```
```diff
@@ -127,7 +145,10 @@
 ┊127┊145┊    ionicWebpackFactory.getIonicEnvironmentPlugin(),
 ┊128┊146┊    ionicWebpackFactory.getCommonChunksPlugin(),
 ┊129┊147┊    new ModuleConcatPlugin(),
-┊130┊   ┊    new PurifyPlugin()
+┊   ┊148┊    new PurifyPlugin(),
+┊   ┊149┊    new webpack.ProvidePlugin({
+┊   ┊150┊      __extends: 'typescript-extends'
+┊   ┊151┊    })
 ┊131┊152┊  ],
 ┊132┊153┊
 ┊133┊154┊  // Some libraries import Node modules but don't use them in the browser.
```
```diff
@@ -135,13 +156,27 @@
 ┊135┊156┊  node: {
 ┊136┊157┊    fs: 'empty',
 ┊137┊158┊    net: 'empty',
-┊138┊   ┊    tls: 'empty'
+┊   ┊159┊    tls: 'empty',
+┊   ┊160┊    __dirname: true
 ┊139┊161┊  }
 ┊140┊162┊};
 ┊141┊163┊
+┊   ┊164┊function resolveExternals(context, request, callback) {
+┊   ┊165┊  return resolveMeteor(request, callback) ||
+┊   ┊166┊    callback();
+┊   ┊167┊}
+┊   ┊168┊
+┊   ┊169┊function resolveMeteor(request, callback) {
+┊   ┊170┊  var match = request.match(/^meteor\/(.+)$/);
+┊   ┊171┊  var pack = match && match[1];
+┊   ┊172┊
+┊   ┊173┊  if (pack) {
+┊   ┊174┊    callback(null, 'Package["' + pack + '"]');
+┊   ┊175┊    return true;
+┊   ┊176┊  }
+┊   ┊177┊}
 ┊142┊178┊
 ┊143┊179┊module.exports = {
 ┊144┊180┊  dev: devConfig,
 ┊145┊181┊  prod: prodConfig
 ┊146┊182┊}
-┊147┊   ┊
```

[}]: #

In addition to the alias we've just created, we also need to tell the `TypesScript` compiler to include the `api` dir during the compilation process:

[{]: <helper> (diffStep "1.6")

#### [Step 1.6: Updated TypeScript config file](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/109170c4)

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

[{]: <helper> (diffStep "1.8")

#### [Step 1.8: Updated typscript compiler config](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/2b936fed)

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
@@ -8,10 +9,19 @@
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
+┊  ┊23┊      "@types/meteor"
+┊  ┊24┊    ]
 ┊15┊25┊  },
 ┊16┊26┊  "include": [
 ┊17┊27┊    "src/**/*.ts",
```
```diff
@@ -19,7 +29,8 @@
 ┊19┊29┊  ],
 ┊20┊30┊  "exclude": [
 ┊21┊31┊    "node_modules",
-┊22┊  ┊    "api/node_modules"
+┊  ┊32┊    "api/node_modules",
+┊  ┊33┊    "api"
 ┊23┊34┊  ],
 ┊24┊35┊  "compileOnSave": false,
 ┊25┊36┊  "atom": {
```

[}]: #

This configuration requires us to install the declaration files specified under the `types` field:

    $ npm install --save-dev @types/meteor

## Trying It Out

By this point, you can run `ionic serve` and test how our application works with the new module bundler we've just configured. You might encounter the following warnings when launching the app in the browser:

    Native: tried calling StatusBar.styleDefault, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator
    Native: tried calling Splashscreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator

This is caused due to the expectation to be run in a mobile environment. To fix this warning, simply check if the current platform supports `Cordova` before calling any methods related to it:

[{]: <helper> (diffStep "1.10")

#### [Step 1.10: Check if cordova exists](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/e6b1359a)

##### Changed src&#x2F;app&#x2F;app.component.ts
```diff
@@ -14,8 +14,10 @@
 ┊14┊14┊    platform.ready().then(() => {
 ┊15┊15┊      // Okay, so the platform is ready and our plugins are available.
 ┊16┊16┊      // Here you can do any higher level native things you might need.
-┊17┊  ┊      statusBar.styleDefault();
-┊18┊  ┊      splashScreen.hide();
+┊  ┊17┊      if (platform.is('cordova')) {
+┊  ┊18┊        statusBar.styleDefault();
+┊  ┊19┊        splashScreen.hide();
+┊  ┊20┊      }
 ┊19┊21┊    });
 ┊20┊22┊  }
 ┊21┊23┊}
```

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/chats-page" prevRef="https://angular-meteor.com/tutorials/whatsapp2-tutorial")

| [< Intro](https://angular-meteor.com/tutorials/whatsapp2-tutorial) | [Next Step >](https://angular-meteor.com/tutorials/whatsapp2/ionic/chats-page) |
|:--------------------------------|--------------------------------:|

[}]: #

