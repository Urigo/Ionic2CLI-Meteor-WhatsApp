{{#template name="tutorials.messenger.ionic2.step_2.md"}}

In this tutorial we will write our app using `ecmascript6` javascript, which is the latest version of javascript updated with the new ecmascript standards (From now on we will refer it as 'es6'). So before we dive into building our app, we need to make an initial setup inorder to achieve that.

> *NOTE*: By default an `Ionic` app is written using [typescript](typescriptlang.org), but since lots of people are not yet familiar with it, I wanted to keep this tutorial simple. A `typescript` version might be implemented in the future.

Iorder to write some es6 code we will need a pre-processor. [babel](https://babeljs.io/) plays a perfect roll for that. But that's not all. One of the most powerful tools in es6 is the module system. It uses relative paths inorder to load different modules we implement. `babel` can't do that alone because it can't load relative modules using sytax only. We will need some sort of a module bundler.

That's where [Webpack](https://webpack.github.io/) kicks in. `Webpack` is just a module bundler, but it can also use pre-processors on the way and it can be easily configured by whatever rules we specify, and is a very powerful tool and it is being used very commonly.

`Meteor` also uses the same techniques to implement es6, and load `NPM` modules into client side code, but since we're using `Ionic` CLI and not `Meteor`, we will implement our own `Webpack` configuration, using our own rules.

Now that we have the idea of what `Webpack` is all about, let's setup our initial config:

{{> DiffBox tutorialName="ionic2-tutorial" step="2.1"}}

> *NOTE*: Since we don't want to digress from this tutorial's subject, we won't go into details about `Webpack`'s config. For more information, see [reference](https://webpack.github.io/docs/configuration.html).

We would also like to initiate `Webpack` once we build our app. All our tasks are defined in one file called `gulpfile.js`, which uses [gulp](http://gulpjs.com/)'s API to perform and chain them.

Let's edit our `gulpfile.js` accordingly:

{{> DiffBox tutorialName="ionic2-tutorial" step="2.2"}}

Note that we replaced `Ionic`'s build module with a `Webpack` compiler. Eventually they gonna achieve the same result, only now we can apply whatever rules we're intrested in the build process like aliases and references to external libraries, which will come in handy in the next steps.

> *NOTE*: Again, we would like to focus on building our app rather than expalining about 3rd party libraties. For more information about tasks in `Gulp` see [reference](https://github.com/gulpjs/gulp/blob/master/docs/API.md).

And last but not least, let's install the necessary dependencies inorder to make our setup work:

    $ npm install babel --save
    $ npm install babel-core --save
    $ npm install babel-loader --save
    $ npm install babel-plugin-add-module-exports --save
    $ npm install babel-plugin-transform-decorators-legacy --save
    $ npm install babel-preset-es2015 --save
    $ npm install babel-preset-stage-0 --save
    $ npm install lodash.camelcase --save
    $ npm install lodash.upperfirst --save
    $ npm install webpack --save

> *TIP*: You can also write it as a single line using `npm i <package1> <package2> ... --save`.

Our `package.json` should look like this:

{{> DiffBox tutorialName="ionic2-tutorial" step="2.3"}}

Our app is written in the `app` dir, and if you go ahead and look at it you can see that `Ionic` has a very clear stracture. Our app is made out of pages, each page has a component, a template and a stylesheet.

As for now, non of the default pages is necessary for us. Let's delete them:

    $ cd app/pages
    $ rm -rf about
    $ rm -rf contact
    $ rm -rf home

And let's delete the pages' correlated [SASS](http://sass-lang.com/) (A css pre-processor) files importations.

{{> DiffBox tutorialName="ionic2-tutorial" step="2.5"}}

And let's transform our `app.js` file, which is our app's entry point, into es6 and make the necessary changes:

{{> DiffBox tutorialName="ionic2-tutorial" step="2.6"}}

{{/template}}