# Step 5: Folder Structure

As you have probably noticed, our tutorial app has a strict modular structure at this point; There are no pure JavaScript files that are being bundled together and auto-executed, so Meteor's file loading conventions don't have any effect. Furthermore, every `.ts` file is being compiled into a separate CommonJS module, which we can then import whenever we desire.

## TypeScript

TypeScript is a rather new language that has been growing in [popularity](https://www.google.com/trends/explore#q=%2Fm%2F0n50hxv) since it's creation 3 years ago. TypeScript has one of the fullest implementations of ES2015 features on the market: including some experimental features, pseudo type-checking and a rich toolset developed by Microsoft and the TypeScript community. It has support already in all major IDEs including Visual Studio, WebStorm, Sublime, Atom, etc.

One of the biggest issues in JavaScript is making code less bug-prone and more suitable for big projects. In the OOP world, well-known solutions include modularity and strict type-checking. While OOP is available in JavaScript in some way, it turned out to be very hard to create good type-checking. One always needs to impose a certain number of rules to follow to make a JavaScript compiler more effective. For many years, we’ve seen around a number of solutions including the Closure Compiler and GWT from Google, a bunch of C#-to-JavaScript compilers and others.

This was, for sure, one of the problems the TypeScript team were striving to solve: to create a language that would inherit the flexibility of JavaScript while, at the same time, having effective and optional type-checking with minimum effort required from the user.

### Interfaces

TypeScript's type-checking is based on the "shapes" that types have. That's where interfaces kicks in; Interfaces are TypeScript's means to describe these type "shapes", which is sometimes called "duck typing". More on that you can read [here](http://www.typescriptlang.org/docs/handbook/interfaces.html).

### TypeScript Configuration and IDEs

As you already know from the [bootstrapping step](./step1.md), TypeScript is generally configured by a special JSON file called [_tsconfig.json_](https://github.com/Microsoft/typescript/wiki/tsconfig.json).

As mentioned, the TypeScript language today has development plugins in many [popular IDEs](https://github.com/Microsoft/TypeScript/wiki/TypeScript-Editor-Support), including Visual Studio, WebStorm, Sublime, Atom etc. These plugins work in the same style as it's become de facto today — compile, using TypeScript shell command, `.ts` and `tsconfig.json` files update automatically as you change them.
With that, if you've configured your project right with declaration files in place you'll get a bunch of invaluable features such as better code completion and instantaneous highlighting of compilation errors.

If you use one of the mentioned IDEs, you've likely noticed that a bunch of the code lines
are now marked in red, indicating the TypeScript plugins don't work right quite yet.

That's because most of the plugins recognize _tsconfig.json_ as well if it's placed in the root folder,
but so far our _tsconfig.json_ contains only a "files" property, which is certainly not enough for
a general compilation. At the same time, Angular2-Meteor's TypeScript compiler, defaults most of the
compilation options internally to fit our needs. To fix plugins, let's set up our _tsconfig.json_
properly with the options that will make plugins understand our needs and the structure of our app.

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "isolatedModules": false,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "removeComments": false,
    "noImplicitAny": false,
    "sourceMap": true
  },
  "exclude": [
    "node_modules"
  ],
  "compileOnSave": false
}
```

**CompilerOptions:**

- `target` - Specify ECMAScript target version
- `module` - Specify module code generation
- `isolatedModules` - Unconditionally emit imports for unresolved files
- `moduleResolution` - Determine how modules get resolved
- `experimentalDecorators` - Enables experimental support for ES7 decorators.
- `emitDecoratorMetadata` - Emit design-type metadata for decorated declarations in source
- `removeComments` - Remove all comments except copy-right header comments beginning with
- `noImplicitAny` - Raise error on expressions and declarations with an implied 'any' type
- `sourceMap` - Generates corresponding '.map' file

Now, let's go to any of the `.ts` files and check if all that annoying redness has disappeared.

> Note: you may need to reload you IDE to pick up the latest changes to the config.

Please note, since the Meteor environment is quite specific, some of the `tsconfig.json` options won't make sense in Meteor. You can read about the exceptions [here](https://github.com/barbatus/typescript#compiler-options).
TypeScript compiler of this package supports some additional options that might be useful in the Meteor environment.
They can be included in the "meteorCompilerOptions" section of _tsconfig.json_ and described [here](https://github.com/barbatus/ts-compilers#typescript-config).

## Ionic Folder Structure

A newly created Ionic application contains the following folders:

- **src** - The main directory with all the raw-client scripts, structured as following:
  - **app** - Contains the NgModule declaration, main script file (`main.ts`) and main SCSS file.
  - **assets** - Contains images, fonts, and other static assets.
  - **theme** - Contains definitions for our UI themes, comes with a default Ionic theme definition.
  - **declarations.d.ts** - Contains our own custom TypeScript definitions.
  - **manifest.json** - Contains the metadata of our app. mostly used for Cordova builds.
  - **index.html** - This is obviously where you should update your meta tags and add in any required scripts (cordova, polyfills, vendor build, app build, etc.).
- **www** - Contains the built files and assets.
- **platforms** - Definition and util files of Ionic 2 and Cordova, to support multiple platforms.
- **resources** - Platform specific resources (android/ios)
- **plugins** - Cordova plugins, those are declared in our `package.json`
- **hooks** - These scripts run as part of the Cordova build process. If you need to customize that in any way, then do it here.

## Webpack as a Module Bundler

In this tutorial we wanted to solve the separation that has been created between the client and the server. Code snippets located in the `api` dir, should somehow find their way to the client. Webpack is a module bundler for modern JavaScript applications, which will help us achieve exactly that. Existing module bundlers are not well suited for big projects (big single page applications).

Thanks to Webpack, we can define custom aliases and avoid complex relative paths, we can fabricate importations, and we can project objects defined on the global scope as modules. All these can be done by specifying a bundling configuration file, as documented in [Webpack's official docs](https://webpack.js.org/configuration).

Just so you can get the idea, here's an example of a self-explanatory bundling config:

```js
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const webpack = require('webpack'); //to access built-in plugins
const path = require('path');

const config = {
  entry: './path/to/my/entry/file.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'my-first-webpack.bundle.js'
  },
  module: {
    rules: [
      {test: /\.(js|jsx)$/, use: 'babel-loader'}
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new HtmlWebpackPlugin({template: './src/index.html'})
  ]
};

module.exports = config;
```

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/messages-page" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/meteor-server-side")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/meteor-server-side">PREVIOUS STEP</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/messages-page">NEXT STEP</a> ⟹

[}]: #

