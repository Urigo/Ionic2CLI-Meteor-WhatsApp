{{# template name="tutorials.whatsapp2.ionic.step_02.md"}}

Ionic2 apps are written using [Angular2](angular.io). Although Angular2 apps can be created using Javascript, it is recommended to write them using [Typescript](typescriptlang.org), for 2 reasons:

- It prevents runtime errors.
- Dependency injection are done automatically based on the provided data-types.

Inorder to apply Typescript, Ionic's build system is built on top of a module bundler called [Browserify](browserify.org). In this tutorial we gonna use a custom build-config using [Webpack](webpack.github.io), hence we gonna re-define our build system. Both module-bundlers are great solutions for building our app, but Webpack provides us with some extra features like aliases, which are missing in Browserify.

Let's create our initial Webpack config:

{{> DiffBox tutorialName="ionic-tutorial" step="2.1"}}

Now we gonna make some adjustments in our Typescript config so the 2 configs can co-operate and won't have any conflicts:

{{> DiffBox tutorialName="ionic-tutorial" step="2.2"}}

Ionic apps are created with tasks like linting and building which can be run whenever we want. These tasks are defined in a file called `gulpfile.js` and are performed by a toolkit called [Gulp](gulpjs.com).

The 2 tasks which are responsible for building are app are:

- `build` - Builds our app once. Mostly used for production.
- `watch` - Builds our app whenever a change has been detected. Mostly used for development.

As we said, by default our app is built using Browserify. Let's re-write the build tasks and replace Browserify with Webpack:

{{> DiffBox tutorialName="ionic-tutorial" step="2.3"}}

Our configurations are ready. Let's install the necessary npm packages so they can function properly:

    $ npm uninstall ionic-gulp-browserify-typescript --save-dev
    $ npm install webpack --save-dev
    $ npm install ts-loader --save-dev
    $ npm install lodash.camelcase --save-dev
    $ npm install ionic-gulp-webpack --save-dev
    $ npm install lodash.upperfirst --save-dev

{{/template}}