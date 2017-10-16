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

Then we will add a declarations file with a wildcard module to allow third party libraries to be used in our app even if they don't provide their own type declarations:

[{]: <helper> (diffStep 1.1)

#### [Step 1.1: Add declarations file](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/db5cbfb6a)

##### Added src&#x2F;declarations.d.ts
```diff
@@ -0,0 +1,14 @@
+┊  ┊ 1┊/*
+┊  ┊ 2┊  Declaration files are how the Typescript compiler knows about the type information(or shape) of an object.
+┊  ┊ 3┊  They're what make intellisense work and make Typescript know all about your code.
+┊  ┊ 4┊
+┊  ┊ 5┊  A wildcard module is declared below to allow third party libraries to be used in an app even if they don't
+┊  ┊ 6┊  provide their own type declarations.
+┊  ┊ 7┊
+┊  ┊ 8┊  To learn more about using third party libraries in an Ionic app, check out the docs here:
+┊  ┊ 9┊  http://ionicframework.com/docs/v2/resources/third-party-libs/
+┊  ┊10┊
+┊  ┊11┊  For more info on type definition files, check out the Typescript docs here:
+┊  ┊12┊  https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
+┊  ┊13┊*/
+┊  ┊14┊declare module '*';
```

[}]: #

To start our app, simply type:

    $ ionic serve

> For more information on how to run an Ionic-app on a mobile device, see the following link: https://ionicframework.com/docs/v2/getting-started/installation/.

`Ionic 2` apps are written using [Angular 2](https://angular.io). Although `Angular 2` apps can be created using plain JavaScript, it is recommended to write them using [Typescript](https://typescriptlang.org), for 2 reasons:

- It prevents runtime errors.
- Dependency injection is done automatically based on the provided data-types.

In order to apply `TypeScript`, `Ionic`'s build system is built on top of a module bundler called [Webpack](https://webpack.github.io).

In this tutorial we will use a custom build-config for Webpack.

## Ionic 2 + Webpack

The first thing we gonna do would be telling Ionic that we're using `Webpack` as our module-bundler. To specify it, add the following field in the `package.json` file:

[{]: <helper> (diffStep 1.2)

#### [Step 1.2: Add webpack config declaration in package.json](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/9773024a4)

##### Changed package.json
```diff
@@ -40,5 +40,8 @@
 ┊40┊40┊    "@ionic/cli-plugin-ionic-angular": "1.3.1",
 ┊41┊41┊    "typescript": "2.3.3"
 ┊42┊42┊  },
-┊43┊  ┊  "description": "whatsapp: An Ionic project"
+┊  ┊43┊  "description": "whatsapp: An Ionic project",
+┊  ┊44┊  "config": {
+┊  ┊45┊    "ionic_webpack": "./webpack.config.js"
+┊  ┊46┊  }
 ┊44┊47┊}
```

[}]: #

Ionic provides us with a sample `Webpack` config file that we can extend later on, and it's located under the path `node_modules/@ionic/app-scripts/config/webpack.config.js`. We will copy it to a newly created `config` dir using the following command:

    $ cp node_modules/@ionic/app-scripts/config/webpack.config.js .

The configuration file should look like so:

[{]: <helper> (diffStep 1.3)

#### [Step 1.3: Add Ionic&#x27;s base webpack file to the project](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/a29329d7f)

##### Added webpack.config.js
```diff
@@ -0,0 +1,48 @@
+┊  ┊ 1┊var path = require('path');
+┊  ┊ 2┊var webpack = require('webpack');
+┊  ┊ 3┊var ionicWebpackFactory = require(process.env.IONIC_WEBPACK_FACTORY);
+┊  ┊ 4┊
+┊  ┊ 5┊module.exports = {
+┊  ┊ 6┊  entry: process.env.IONIC_APP_ENTRY_POINT,
+┊  ┊ 7┊  output: {
+┊  ┊ 8┊    path: '{{BUILD}}',
+┊  ┊ 9┊    publicPath: 'build/',
+┊  ┊10┊    filename: process.env.IONIC_OUTPUT_JS_FILE_NAME,
+┊  ┊11┊    devtoolModuleFilenameTemplate: ionicWebpackFactory.getSourceMapperFunction(),
+┊  ┊12┊  },
+┊  ┊13┊  devtool: process.env.IONIC_SOURCE_MAP_TYPE,
+┊  ┊14┊
+┊  ┊15┊  resolve: {
+┊  ┊16┊    extensions: ['.ts', '.js', '.json'],
+┊  ┊17┊    modules: [path.resolve('node_modules')]
+┊  ┊18┊  },
+┊  ┊19┊
+┊  ┊20┊  module: {
+┊  ┊21┊    loaders: [
+┊  ┊22┊      {
+┊  ┊23┊        test: /\.json$/,
+┊  ┊24┊        loader: 'json-loader'
+┊  ┊25┊      },
+┊  ┊26┊      {
+┊  ┊27┊        test: /\.ts$/,
+┊  ┊28┊        loader: process.env.IONIC_WEBPACK_LOADER
+┊  ┊29┊      },
+┊  ┊30┊      {
+┊  ┊31┊        test: /\.js$/,
+┊  ┊32┊        loader: process.env.IONIC_WEBPACK_TRANSPILE_LOADER
+┊  ┊33┊      }
+┊  ┊34┊    ]
+┊  ┊35┊  },
+┊  ┊36┊
+┊  ┊37┊  plugins: [
+┊  ┊38┊    ionicWebpackFactory.getIonicEnvironmentPlugin(),
+┊  ┊39┊  ],
+┊  ┊40┊
+┊  ┊41┊  // Some libraries import Node modules but don't use them in the browser.
+┊  ┊42┊  // Tell Webpack to provide empty mocks for them so importing them works.
+┊  ┊43┊  node: {
+┊  ┊44┊    fs: 'empty',
+┊  ┊45┊    net: 'empty',
+┊  ┊46┊    tls: 'empty'
+┊  ┊47┊  }
+┊  ┊48┊};
```

[}]: #

As we said earlier, this is only a base for our config. We would also like to add the following abilities while bundling our project:

- The ability to load external `TypeScript` modules without any issues.
- Have an alias for our `Meteor` server under the `api` dir (Which will be created later in).
- Be able to import `Meteor` packages and `Cordova` plugins.

To achieve these abilities, this is how our extension should look like:

[{]: <helper> (diffStep 1.4)

#### [Step 1.4: Updated webpack config file](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/51679eb66)

##### Changed webpack.config.js
```diff
@@ -14,9 +14,16 @@
 ┊14┊14┊
 ┊15┊15┊  resolve: {
 ┊16┊16┊    extensions: ['.ts', '.js', '.json'],
-┊17┊  ┊    modules: [path.resolve('node_modules')]
+┊  ┊17┊    modules: [path.resolve('node_modules')],
+┊  ┊18┊    alias: {
+┊  ┊19┊      'api': path.resolve(__dirname, 'api/server')
+┊  ┊20┊    }
 ┊18┊21┊  },
 ┊19┊22┊
+┊  ┊23┊  externals: [
+┊  ┊24┊    resolveExternals
+┊  ┊25┊  ],
+┊  ┊26┊
 ┊20┊27┊  module: {
 ┊21┊28┊    loaders: [
 ┊22┊29┊      {
```
```diff
@@ -36,6 +43,9 @@
 ┊36┊43┊
 ┊37┊44┊  plugins: [
 ┊38┊45┊    ionicWebpackFactory.getIonicEnvironmentPlugin(),
+┊  ┊46┊    new webpack.ProvidePlugin({
+┊  ┊47┊      __extends: 'typescript-extends'
+┊  ┊48┊    })
 ┊39┊49┊  ],
 ┊40┊50┊
 ┊41┊51┊  // Some libraries import Node modules but don't use them in the browser.
```
```diff
@@ -43,6 +53,22 @@
 ┊43┊53┊  node: {
 ┊44┊54┊    fs: 'empty',
 ┊45┊55┊    net: 'empty',
-┊46┊  ┊    tls: 'empty'
+┊  ┊56┊    tls: 'empty',
+┊  ┊57┊    __dirname: true
 ┊47┊58┊  }
 ┊48┊59┊};
+┊  ┊60┊
+┊  ┊61┊function resolveExternals(context, request, callback) {
+┊  ┊62┊  return resolveMeteor(request, callback) ||
+┊  ┊63┊    callback();
+┊  ┊64┊}
+┊  ┊65┊
+┊  ┊66┊function resolveMeteor(request, callback) {
+┊  ┊67┊  var match = request.match(/^meteor\/(.+)$/);
+┊  ┊68┊  var pack = match && match[1];
+┊  ┊69┊
+┊  ┊70┊  if (pack) {
+┊  ┊71┊    callback(null, 'Package["' + pack + '"]');
+┊  ┊72┊    return true;
+┊  ┊73┊  }
+┊  ┊74┊}
```

[}]: #

In addition to the alias we've just created, we also need to tell the `TypesScript` compiler to include the `api` dir during the compilation process:

[{]: <helper> (diffStep 1.5)

#### [Step 1.5: Updated TypeScript config file](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/5461a2b60)

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

[{]: <helper> (diffStep 1.7)

#### [Step 1.7: Updated typscript compiler config](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/d11f3cacd)

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

This is caused due to the expectation to be run in a mobile environment. To fix this warning, simply check if the current platform supports `Cordova` before calling any methods related to it:

[{]: <helper> (diffStep 1.9)

#### [Step 1.9: Check if cordova exists](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/973da4740)

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

