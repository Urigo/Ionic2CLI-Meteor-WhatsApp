[{]: <region> (header)
# Step 1: Initial setup
[}]: #
[{]: <region> (body)
Both [Meteor](meteor.com) and [Ionic](ionicframework.com) took their platform to the next level in tooling.
Both provide CLI interface instead of bringing a bunch of dependencies and configure build tools.
There are also differences between those tools. 

In this post we will focus on the Ionic CLI - we will use it to serve the client side and build the Cordova project, and we will use 
Meteor as a server side only, and load the Meteor collections in the client side externally. 

First, start by making sure your Node & NPM are up to date, and Node's version it above 5 (you can check it using `node --version`).

To begin with, we need to install Ionic using NPM:

    $ npm install -g ionic cordova

We will create our WhatsApp app using the following command:

    $ ionic start whatsapp --v2

To start our app, simply type:

    $ ionic serve

> **NOTE:** Ionic framework is built on top of [Cordova](cordova.apache.org) which let's you build your app for mobile devices. For more information on how to run our app on a mobile device see the following [link](ionicframework.com/docs/v2/getting-started/installation/).

Ionic2 apps are written using [Angular2](angular.io). Although Angular2 apps can be created using Javascript, it is recommended to write them using [Typescript](typescriptlang.org), for 2 reasons:

- It prevents runtime errors.
- Dependency injection is done automatically based on the provided data-types.

In order to apply TypeScript, Ionic's build system is built on top of a module bundler and modules loader called [Rollup](http://rollupjs.org/). 

In this tutorial we will use a custom build-config using [Webpack](webpack.github.io), hence we're gonna re-define our build system. Both module-bundlers are great solutions for building our app, but Webpack provides us with some extra features like aliases, which are missing in Rollup.

Also, in order to load Meteor as external dependency without it's CLI, we need to use CommonJS modules loader (using Webpack) instead of ES2016 modules (using Rollup).
 
## Ionic 2 + Webpack 
 
At moment, Ionic 2 supports Webpack build only in it's beta version, so we need to use the beta version of `@ionic/app-scripts`, to let's change it:
 
    $ npm install --save-dev @ionic/app-scripts@beta
 
Now let's continue by configuring our Webpack build, first we need to tell Ionic that we are using Webpack and use are using custom build file - this is done by adding `config` to our `package.json` file:

[{]: <helper> (diff_step 1.1)
#### Step 1.1: Added build configuration for Ionic app scripts

##### Changed package.json
```diff
@@ -50,5 +50,8 @@
 ┊50┊50┊      "locator": "ios"
 ┊51┊51┊    }
 ┊52┊52┊  ],
-┊53┊  ┊  "description": "ionic2-meteor-messenger: An Ionic project"
+┊  ┊53┊  "description": "ionic2-meteor-messenger: An Ionic project",
+┊  ┊54┊  "config": {
+┊  ┊55┊    "ionic_webpack": "./config/webpack.config.js"
+┊  ┊56┊  }
 ┊54┊57┊}
```
[}]: #

Let's create our initial Webpack config - Ionic provides us a simple Webpack file that we can extend, it's located under `node_modules/@ionic/app-scripts/config/webpack.config.js`, so let's copy it and put in under `./config/webpack.config.js`:

[{]: <helper> (diff_step 1.2)
#### Step 1.2: Added webpack base file

##### Added config/webpack.config.js
```diff
@@ -0,0 +1,58 @@
+┊  ┊ 1┊var path = require('path');
+┊  ┊ 2┊var webpack = require('webpack');
+┊  ┊ 3┊
+┊  ┊ 4┊// for prod builds, we have already done AoT and AoT writes to disk
+┊  ┊ 5┊// so read the JS file from disk
+┊  ┊ 6┊// for dev buids, we actually want to pass in .ts files since we
+┊  ┊ 7┊// don't have .js files on disk, they're exclusively in memory
+┊  ┊ 8┊
+┊  ┊ 9┊function getEntryPoint() {
+┊  ┊10┊  if (process.env.IONIC_ENV === 'prod') {
+┊  ┊11┊    return '{{TMP}}/app/main.prod.js';
+┊  ┊12┊  }
+┊  ┊13┊  return '{{TMP}}/app/main.dev.js';
+┊  ┊14┊}
+┊  ┊15┊
+┊  ┊16┊function getPlugins() {
+┊  ┊17┊  if (process.env.IONIC_ENV === 'prod') {
+┊  ┊18┊    return [
+┊  ┊19┊      // This helps ensure the builds are consistent if source hasn't changed:
+┊  ┊20┊      new webpack.optimize.OccurrenceOrderPlugin(),
+┊  ┊21┊      // Try to dedupe duplicated modules, if any:
+┊  ┊22┊      // Add this back in when Angular fixes the issue: https://github.com/angular/angular-cli/issues/1587
+┊  ┊23┊      //new DedupePlugin()
+┊  ┊24┊    ];
+┊  ┊25┊  }
+┊  ┊26┊  return [];
+┊  ┊27┊}
+┊  ┊28┊
+┊  ┊29┊module.exports = {
+┊  ┊30┊  entry: getEntryPoint(),
+┊  ┊31┊  output: {
+┊  ┊32┊    path: '{{BUILD}}',
+┊  ┊33┊    filename: 'main.js'
+┊  ┊34┊  },
+┊  ┊35┊
+┊  ┊36┊  resolve: {
+┊  ┊37┊    extensions: ['.js', '.json']
+┊  ┊38┊  },
+┊  ┊39┊
+┊  ┊40┊  module: {
+┊  ┊41┊    loaders: [
+┊  ┊42┊      {
+┊  ┊43┊        test: /\.json$/,
+┊  ┊44┊        loader: 'json'
+┊  ┊45┊      }
+┊  ┊46┊    ]
+┊  ┊47┊  },
+┊  ┊48┊
+┊  ┊49┊  plugins: getPlugins(),
+┊  ┊50┊
+┊  ┊51┊  // Some libraries import Node modules but don't use them in the browser.
+┊  ┊52┊  // Tell Webpack to provide empty mocks for them so importing them works.
+┊  ┊53┊  node: {
+┊  ┊54┊    fs: 'empty',
+┊  ┊55┊    net: 'empty',
+┊  ┊56┊    tls: 'empty'
+┊  ┊57┊  }
+┊  ┊58┊};
```
[}]: #

Now we have the basic Webpack file, and if you will run `ionic serve` again, you will notice that it uses Webpack for bundling.

Our next step is to add some custom config to our Webpack file, so let's do it:

[{]: <helper> (diff_step 1.3)
#### Step 1.3: Updated webpack file

##### Changed config/webpack.config.js
```diff
@@ -14,16 +14,21 @@
 ┊14┊14┊}
 ┊15┊15┊
 ┊16┊16┊function getPlugins() {
+┊  ┊17┊  var plugins = [
+┊  ┊18┊    // Try to dedupe duplicated modules, if any:
+┊  ┊19┊    // Add this back in when Angular fixes the issue: https://github.com/angular/angular-cli/issues/1587
+┊  ┊20┊    //new DedupePlugin()
+┊  ┊21┊    new webpack.ProvidePlugin({
+┊  ┊22┊      __extends: 'typescript-extends'
+┊  ┊23┊    })
+┊  ┊24┊  ];
+┊  ┊25┊
 ┊17┊26┊  if (process.env.IONIC_ENV === 'prod') {
-┊18┊  ┊    return [
-┊19┊  ┊      // This helps ensure the builds are consistent if source hasn't changed:
-┊20┊  ┊      new webpack.optimize.OccurrenceOrderPlugin(),
-┊21┊  ┊      // Try to dedupe duplicated modules, if any:
-┊22┊  ┊      // Add this back in when Angular fixes the issue: https://github.com/angular/angular-cli/issues/1587
-┊23┊  ┊      //new DedupePlugin()
-┊24┊  ┊    ];
+┊  ┊27┊    // This helps ensure the builds are consistent if source hasn't changed:
+┊  ┊28┊    plugins.push(new webpack.optimize.OccurrenceOrderPlugin())
 ┊25┊29┊  }
-┊26┊  ┊  return [];
+┊  ┊30┊
+┊  ┊31┊  return plugins;
 ┊27┊32┊}
 ┊28┊33┊
 ┊29┊34┊module.exports = {
```
```diff
@@ -34,7 +39,10 @@
 ┊34┊39┊  },
 ┊35┊40┊
 ┊36┊41┊  resolve: {
-┊37┊  ┊    extensions: ['.js', '.json']
+┊  ┊42┊    extensions: ['.js', '.json', '.ts'],
+┊  ┊43┊    alias: {
+┊  ┊44┊      'api': path.resolve(__dirname, '../api')
+┊  ┊45┊    }
 ┊38┊46┊  },
 ┊39┊47┊
 ┊40┊48┊  module: {
```
```diff
@@ -42,6 +50,11 @@
 ┊42┊50┊      {
 ┊43┊51┊        test: /\.json$/,
 ┊44┊52┊        loader: 'json'
+┊  ┊53┊      },
+┊  ┊54┊      {
+┊  ┊55┊        test: /\.ts$/,
+┊  ┊56┊        exclude: /(node_modules)/,
+┊  ┊57┊        loaders: ['awesome-typescript-loader']
 ┊45┊58┊      }
 ┊46┊59┊    ]
 ┊47┊60┊  },
```
```diff
@@ -53,6 +66,7 @@
 ┊53┊66┊  node: {
 ┊54┊67┊    fs: 'empty',
 ┊55┊68┊    net: 'empty',
-┊56┊  ┊    tls: 'empty'
+┊  ┊69┊    tls: 'empty',
+┊  ┊70┊    __dirname: true
 ┊57┊71┊  }
 ┊58┊72┊};
```
[}]: #

So let's understand what have we done here:

- We first added a Webpack plugin called `ProvidePlugin` which provides globals for our app, and we use `typescript-extends` package as our `__extend` - this will give us the ability to load external TypeScript modules with any issues.
- We created an alias for `api` - which means that any import that starts with "api" will be resolved into the directory we specified (`../api/` in our case - which we will later create there our server side using Meteor).

We just need to add `typescript-extends` and `awesome-typescript-loader` by installing it:

    $ npm install --save-dev typescript-extends awesome-typescript-loader meteor-typings

## TypeScript Configuration

Now, we need to make some modifications for the TypeScript compiler in order to use CommonJS (we have to use CommonJS, otherwise we won't be able to load Meteor as external dependency), we will also need to change some flags in the config for that.

So let's change `tsconfig.json` file:

[{]: <helper> (diff_step 1.5)
#### Step 1.5: Updated typscript compiler config

##### Changed tsconfig.json
```diff
@@ -1,17 +1,19 @@
 ┊ 1┊ 1┊{
 ┊ 2┊ 2┊  "compilerOptions": {
-┊ 3┊  ┊    "allowSyntheticDefaultImports": true,
-┊ 4┊  ┊    "declaration": false,
-┊ 5┊  ┊    "emitDecoratorMetadata": true,
-┊ 6┊  ┊    "experimentalDecorators": true,
+┊  ┊ 3┊    "target": "es5",
 ┊ 7┊ 4┊    "lib": [
-┊ 8┊  ┊      "dom",
-┊ 9┊  ┊      "es2015"
+┊  ┊ 5┊      "es6",
+┊  ┊ 6┊      "dom"
 ┊10┊ 7┊    ],
-┊11┊  ┊    "module": "es2015",
+┊  ┊ 8┊    "module": "commonjs",
 ┊12┊ 9┊    "moduleResolution": "node",
+┊  ┊10┊    "experimentalDecorators": true,
+┊  ┊11┊    "emitDecoratorMetadata": true,
 ┊13┊12┊    "sourceMap": true,
-┊14┊  ┊    "target": "es5"
+┊  ┊13┊    "noImplicitAny": false,
+┊  ┊14┊    "declaration": false,
+┊  ┊15┊    "skipLibCheck": true,
+┊  ┊16┊    "stripInternal": true
 ┊15┊17┊  },
 ┊16┊18┊  "include": [
 ┊17┊19┊    "src/**/*.ts"
```
```diff
@@ -23,4 +25,4 @@
 ┊23┊25┊  "atom": {
 ┊24┊26┊    "rewriteTsconfig": false
 ┊25┊27┊  }
-┊26┊  ┊}🚫↵
+┊  ┊28┊}
```
[}]: #

## Summary

So in this step we installed Ionic and created a new project, and we changed the default bundler & modules loader - we use Webpack and CommonJS so we can load Meteor's dependencies.

In this point, you should be able to run your app by running: 

    $ ionic serve    

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Intro](../../README.md) | [Next Step >](step2.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #