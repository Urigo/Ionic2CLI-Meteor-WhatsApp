# Step 1: Bootstrapping

> If you got directly into here, please read the whole [intro section](https://angular-meteor.com/tutorials/whatsapp2-tutorial) explaining the goals for this tutorial and project.

Both [Meteor](https://meteor.com) and [Ionic](https://ionicframework.com) took their platform to the next level in tooling. They both provide CLI interfaces and build tools which will help you build a mobile-application.

In this tutorial we will focus on the `Ionic` CLI; We will use it to serve the client and build the our project using [Cordova](https://cordova.apache.org/), and we will use `Meteor` as a platform for our server, so we will be able to use [Mongo collections](https://docs.meteor.com/api/collections.html) and [subscriptions](https://docs.meteor.com/api/pubsub.html).

> If you are interested in the [Meteor CLI](https://angular-meteor.com/tutorials/whatsapp2/meteor/setup), the steps needed to use it with Meteor are almost identical to the steps required by the Ionic CLI

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

[{]: <helper> (diffStep 1.1)

#### [Step 1.1: Add webpack config declration in package.json](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/df435b0)

##### Changed package.json
<pre>
<i>@@ -51,5 +51,8 @@</i>
 ┊51┊51┊      &quot;locator&quot;: &quot;ios&quot;
 ┊52┊52┊    }
 ┊53┊53┊  ],
<b>+┊  ┊54┊  &quot;description&quot;: &quot;whatsapp: An Ionic project&quot;,</b>
<b>+┊  ┊55┊  &quot;config&quot;: {</b>
<b>+┊  ┊56┊    &quot;ionic_webpack&quot;: &quot;./webpack.config.js&quot;</b>
<b>+┊  ┊57┊  }</b>
 ┊55┊58┊}
</pre>

[}]: #

Ionic provides us with a sample `Webpack` config file that we can extend later on, and it's located under the path `node_modules/@ionic/app-scripts/config/webpack.config.js`. We will copy it to a newly created `config` dir using the following command:

    $ cp node_modules/@ionic/app-scripts/config/webpack.config.js .

The configuration file should look like so:

[{]: <helper> (diffStep 1.2)

#### [Step 1.2: Add Ionic&#x27;s base webpack file to the project](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/4e94502)

##### Added webpack.config.js
<pre>
<i>@@ -0,0 +1,44 @@</i>
<b>+┊  ┊ 1┊var path &#x3D; require(&#x27;path&#x27;);</b>
<b>+┊  ┊ 2┊var webpack &#x3D; require(&#x27;webpack&#x27;);</b>
<b>+┊  ┊ 3┊var ionicWebpackFactory &#x3D; require(process.env.IONIC_WEBPACK_FACTORY);</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊module.exports &#x3D; {</b>
<b>+┊  ┊ 6┊  entry: process.env.IONIC_APP_ENTRY_POINT,</b>
<b>+┊  ┊ 7┊  output: {</b>
<b>+┊  ┊ 8┊    path: &#x27;{{BUILD}}&#x27;,</b>
<b>+┊  ┊ 9┊    filename: process.env.IONIC_OUTPUT_JS_FILE_NAME,</b>
<b>+┊  ┊10┊    devtoolModuleFilenameTemplate: ionicWebpackFactory.getSourceMapperFunction(),</b>
<b>+┊  ┊11┊  },</b>
<b>+┊  ┊12┊  devtool: process.env.IONIC_GENERATE_SOURCE_MAP ? process.env.IONIC_SOURCE_MAP_TYPE : &#x27;&#x27;,</b>
<b>+┊  ┊13┊</b>
<b>+┊  ┊14┊  resolve: {</b>
<b>+┊  ┊15┊    extensions: [&#x27;.ts&#x27;, &#x27;.js&#x27;, &#x27;.json&#x27;],</b>
<b>+┊  ┊16┊    modules: [path.resolve(&#x27;node_modules&#x27;)]</b>
<b>+┊  ┊17┊  },</b>
<b>+┊  ┊18┊</b>
<b>+┊  ┊19┊  module: {</b>
<b>+┊  ┊20┊    loaders: [</b>
<b>+┊  ┊21┊      {</b>
<b>+┊  ┊22┊        test: /\.json$/,</b>
<b>+┊  ┊23┊        loader: &#x27;json-loader&#x27;</b>
<b>+┊  ┊24┊      },</b>
<b>+┊  ┊25┊      {</b>
<b>+┊  ┊26┊        //test: /\.(ts|ngfactory.js)$/,</b>
<b>+┊  ┊27┊        test: /\.ts$/,</b>
<b>+┊  ┊28┊        loader: process.env.IONIC_WEBPACK_LOADER</b>
<b>+┊  ┊29┊      }</b>
<b>+┊  ┊30┊    ]</b>
<b>+┊  ┊31┊  },</b>
<b>+┊  ┊32┊</b>
<b>+┊  ┊33┊  plugins: [</b>
<b>+┊  ┊34┊    ionicWebpackFactory.getIonicEnvironmentPlugin()</b>
<b>+┊  ┊35┊  ],</b>
<b>+┊  ┊36┊</b>
<b>+┊  ┊37┊  // Some libraries import Node modules but don&#x27;t use them in the browser.</b>
<b>+┊  ┊38┊  // Tell Webpack to provide empty mocks for them so importing them works.</b>
<b>+┊  ┊39┊  node: {</b>
<b>+┊  ┊40┊    fs: &#x27;empty&#x27;,</b>
<b>+┊  ┊41┊    net: &#x27;empty&#x27;,</b>
<b>+┊  ┊42┊    tls: &#x27;empty&#x27;</b>
<b>+┊  ┊43┊  }</b>
<b>+┊  ┊44┊};</b>
</pre>

[}]: #

As we said earlier, this is only a base for our config. We would also like to add the following abilities while bundling our project:

- The ability to load external `TypeScript` modules without any issues.
- Have an alias for our `Meteor` server under the `api` dir (Which will be created later in).
- Be able to import `Meteor` packages and `Cordova` plugins.

To achieve these abilities, this is how our extension should look like:

[{]: <helper> (diffStep 1.3)

#### [Step 1.3: Updated webpack config file](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/c5ad4ec)

##### Changed webpack.config.js
<pre>
<i>@@ -13,9 +13,16 @@</i>
 ┊13┊13┊
 ┊14┊14┊  resolve: {
 ┊15┊15┊    extensions: [&#x27;.ts&#x27;, &#x27;.js&#x27;, &#x27;.json&#x27;],
<b>+┊  ┊16┊    modules: [path.resolve(&#x27;node_modules&#x27;)],</b>
<b>+┊  ┊17┊    alias: {</b>
<b>+┊  ┊18┊      &#x27;api&#x27;: path.resolve(__dirname, &#x27;api/server&#x27;)</b>
<b>+┊  ┊19┊    }</b>
 ┊17┊20┊  },
 ┊18┊21┊
<b>+┊  ┊22┊  externals: [</b>
<b>+┊  ┊23┊    resolveExternals</b>
<b>+┊  ┊24┊  ],</b>
<b>+┊  ┊25┊</b>
 ┊19┊26┊  module: {
 ┊20┊27┊    loaders: [
 ┊21┊28┊      {
</pre>
<pre>
<i>@@ -31,7 +38,10 @@</i>
 ┊31┊38┊  },
 ┊32┊39┊
 ┊33┊40┊  plugins: [
<b>+┊  ┊41┊    ionicWebpackFactory.getIonicEnvironmentPlugin(),</b>
<b>+┊  ┊42┊    new webpack.ProvidePlugin({</b>
<b>+┊  ┊43┊      __extends: &#x27;typescript-extends&#x27;</b>
<b>+┊  ┊44┊    })</b>
 ┊35┊45┊  ],
 ┊36┊46┊
 ┊37┊47┊  // Some libraries import Node modules but don&#x27;t use them in the browser.
</pre>
<pre>
<i>@@ -39,6 +49,22 @@</i>
 ┊39┊49┊  node: {
 ┊40┊50┊    fs: &#x27;empty&#x27;,
 ┊41┊51┊    net: &#x27;empty&#x27;,
<b>+┊  ┊52┊    tls: &#x27;empty&#x27;,</b>
<b>+┊  ┊53┊    __dirname: true</b>
 ┊43┊54┊  }
 ┊44┊55┊};
<b>+┊  ┊56┊</b>
<b>+┊  ┊57┊function resolveExternals(context, request, callback) {</b>
<b>+┊  ┊58┊  return resolveMeteor(request, callback) ||</b>
<b>+┊  ┊59┊    callback();</b>
<b>+┊  ┊60┊}</b>
<b>+┊  ┊61┊</b>
<b>+┊  ┊62┊function resolveMeteor(request, callback) {</b>
<b>+┊  ┊63┊  var match &#x3D; request.match(/^meteor\/(.+)$/);</b>
<b>+┊  ┊64┊  var pack &#x3D; match &amp;&amp; match[1];</b>
<b>+┊  ┊65┊</b>
<b>+┊  ┊66┊  if (pack) {</b>
<b>+┊  ┊67┊    callback(null, &#x27;Package[&quot;&#x27; + pack + &#x27;&quot;]&#x27;);</b>
<b>+┊  ┊68┊    return true;</b>
<b>+┊  ┊69┊  }</b>
<b>+┊  ┊70┊}</b>
</pre>

[}]: #

In addition to the alias we've just created, we also need to tell the `TypesScript` compiler to include the `api` dir during the compilation process:

[{]: <helper> (diffStep 1.4)

#### [Step 1.4: Updated TypeScript config file](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/0e98fa9)

##### Changed tsconfig.json
<pre>
<i>@@ -14,13 +14,15 @@</i>
 ┊14┊14┊    &quot;target&quot;: &quot;es5&quot;
 ┊15┊15┊  },
 ┊16┊16┊  &quot;include&quot;: [
<b>+┊  ┊17┊    &quot;src/**/*.ts&quot;,</b>
<b>+┊  ┊18┊    &quot;api/**/*.ts&quot;</b>
 ┊18┊19┊  ],
 ┊19┊20┊  &quot;exclude&quot;: [
<b>+┊  ┊21┊    &quot;node_modules&quot;,</b>
<b>+┊  ┊22┊    &quot;api/node_modules&quot;</b>
 ┊21┊23┊  ],
 ┊22┊24┊  &quot;compileOnSave&quot;: false,
 ┊23┊25┊  &quot;atom&quot;: {
 ┊24┊26┊    &quot;rewriteTsconfig&quot;: false
 ┊25┊27┊  }
<b>+┊  ┊28┊}</b>
</pre>

[}]: #

And we will need to install the following dependencies so the `Webpack` config can be registered properly:

    $ npm install --save-dev typescript-extends

## TypeScript Configuration

Now, we need to make some modifications for the `TypeScript` config so we can load `Meteor` as an external dependency; One of the changes include the specification for `CommonJS`:

[{]: <helper> (diffStep 1.6)

#### [Step 1.6: Updated typscript compiler config](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/c9dba95)

##### Changed tsconfig.json
<pre>
<i>@@ -1,6 +1,7 @@</i>
 ┊1┊1┊{
 ┊2┊2┊  &quot;compilerOptions&quot;: {
 ┊3┊3┊    &quot;allowSyntheticDefaultImports&quot;: true,
<b>+┊ ┊4┊    &quot;baseUrl&quot;: &quot;.&quot;,</b>
 ┊4┊5┊    &quot;declaration&quot;: false,
 ┊5┊6┊    &quot;emitDecoratorMetadata&quot;: true,
 ┊6┊7┊    &quot;experimentalDecorators&quot;: true,
</pre>
<pre>
<i>@@ -8,10 +9,20 @@</i>
 ┊ 8┊ 9┊      &quot;dom&quot;,
 ┊ 9┊10┊      &quot;es2015&quot;
 ┊10┊11┊    ],
<b>+┊  ┊12┊    &quot;module&quot;: &quot;commonjs&quot;,</b>
 ┊12┊13┊    &quot;moduleResolution&quot;: &quot;node&quot;,
<b>+┊  ┊14┊    &quot;paths&quot;: {</b>
<b>+┊  ┊15┊      &quot;api/*&quot;: [&quot;./api/server/*&quot;]</b>
<b>+┊  ┊16┊    },</b>
 ┊13┊17┊    &quot;sourceMap&quot;: true,
<b>+┊  ┊18┊    &quot;target&quot;: &quot;es5&quot;,</b>
<b>+┊  ┊19┊    &quot;skipLibCheck&quot;: true,</b>
<b>+┊  ┊20┊    &quot;stripInternal&quot;: true,</b>
<b>+┊  ┊21┊    &quot;noImplicitAny&quot;: false,</b>
<b>+┊  ┊22┊    &quot;types&quot;: [</b>
<b>+┊  ┊23┊      &quot;meteor-typings&quot;,</b>
<b>+┊  ┊24┊      &quot;@types/underscore&quot;</b>
<b>+┊  ┊25┊    ]</b>
 ┊15┊26┊  },
 ┊16┊27┊  &quot;include&quot;: [
 ┊17┊28┊    &quot;src/**/*.ts&quot;,
</pre>
<pre>
<i>@@ -19,7 +30,8 @@</i>
 ┊19┊30┊  ],
 ┊20┊31┊  &quot;exclude&quot;: [
 ┊21┊32┊    &quot;node_modules&quot;,
<b>+┊  ┊33┊    &quot;api/node_modules&quot;,</b>
<b>+┊  ┊34┊    &quot;api&quot;</b>
 ┊23┊35┊  ],
 ┊24┊36┊  &quot;compileOnSave&quot;: false,
 ┊25┊37┊  &quot;atom&quot;: {
</pre>

[}]: #

This configuration requires us to install the declaration files specified under the `types` field:

    $ npm install --save-dev @types/underscore
    $ npm install --save-dev meteor-typings

## Trying It Out

By this point, you can run `ionic serve` and test how our application works with the new module bundler we've just configured. You might encounter the following warnings when launching the app in the browser:

    Native: tried calling StatusBar.styleDefault, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator
    Native: tried calling Splashscreen.hide, but Cordova is not available. Make sure to include cordova.js or run in a device/simulator

This is caused due to expectation to be run in a mobile environment. To fix this warning, simply check if the current platform supports `Cordova` before calling any methods related to it:

[{]: <helper> (diffStep 1.8)

#### [Step 1.8: Check if cordova exists](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/c8d513b)

##### Changed src&#x2F;app&#x2F;app.component.ts
<pre>
<i>@@ -15,8 +15,10 @@</i>
 ┊15┊15┊    platform.ready().then(() &#x3D;&gt; {
 ┊16┊16┊      // Okay, so the platform is ready and our plugins are available.
 ┊17┊17┊      // Here you can do any higher level native things you might need.
<b>+┊  ┊18┊      if (platform.is(&#x27;cordova&#x27;)) {</b>
<b>+┊  ┊19┊        StatusBar.styleDefault();</b>
<b>+┊  ┊20┊        Splashscreen.hide();</b>
<b>+┊  ┊21┊      }</b>
 ┊20┊22┊    });
 ┊21┊23┊  }
 ┊22┊24┊}
</pre>

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/chats-page" prevRef="https://angular-meteor.com/tutorials/whatsapp2-tutorial")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2-tutorial">INTRO</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/chats-page">NEXT STEP</a> ⟹

[}]: #

