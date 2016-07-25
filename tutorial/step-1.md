{{#template name="tutorials.whatsapp2.ionic.step_01.md"}}

Both [Meteor](meteor.com) and [Ionic](ionicframework.com) took their platform to the next level in tooling.
Both provide CLI interface instead of bringing bunch of dependencies and configure build tools.
There are also differences between those tools. in this post we will focus on the Ionic CLI.

To begin with, we need to install Ionic using NPM:

    $ npm install -g ionic@beta

We will create our Whatsapp app using the following command:

    $ ionic start whatsapp --v2

To start our app, simply type:

    $ ionic serve

> **NOTE:** Ionic framework is built on top of [Cordova](cordova.apache.org) which let's you build your app for mobile devices. For more information on how to run our app on a mobile device see the following [link](ionicframework.com/docs/v2/getting-started/installation/).

Ionic2 apps are written using [Angular2](angular.io). Although Angular2 apps can be created using Javascript, it is recommended to write them using [Typescript](typescriptlang.org), for 2 reasons:

- It prevents runtime errors.
- Dependency injection are done automatically based on the provided data-types.

Inorder to apply Typescript, Ionic's build system is built on top of a module bundler called [Browserify](browserify.org). In this tutorial we gonna use a custom build-config using [Webpack](webpack.github.io), hence we gonna re-define our build system. Both module-bundlers are great solutions for building our app, but Webpack provides us with some extra features like aliases, which are missing in Browserify.

Let's create our initial Webpack config:

{{> DiffBox tutorialName="ionic-tutorial" step="1.2"}}

Now we gonna make some adjustments in our Typescript config so the 2 configs can co-operate and won't have any conflicts:

{{> DiffBox tutorialName="ionic-tutorial" step="1.3"}}

Ionic apps are created with tasks like linting and building which can be run whenever we want. These tasks are defined in a file called `gulpfile.js` and are performed by a toolkit called [Gulp](gulpjs.com).

The 2 tasks which are responsible for building are app are:

- `build` - Builds our app once. Mostly used for production.
- `watch` - Builds our app whenever a change has been detected. Mostly used for development.

As we said, by default our app is built using Browserify. Let's re-write the build tasks and replace Browserify with Webpack:

{{> DiffBox tutorialName="ionic-tutorial" step="1.4"}}

Our configurations are ready. Let's install the necessary NPM packages so they can function properly:

    $ npm uninstall ionic-gulp-browserify-typescript --save-dev
    $ npm install webpack --save-dev
    $ npm install ts-loader --save-dev
    $ npm install ionic-gulp-webpack --save-dev
    $ npm install lodash.camelcase --save-dev
    $ npm install lodash.upperfirst --save-dev

{{/template}}