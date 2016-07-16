{{#template name="tutorials.messenger.ionic2.step_01.md"}}

Both `Meteor` and `Ionic` took their platform to the next level in tooling.
Both provide CLI interface instead of bringing bunch of dependencies and configure build tools.
There are also differences between those tools, in this post we will focus on the `Ionic` CLI.

To begin with, we need to install `Ionic` using `NPM`:

    $ npm install -g ionic@beta

Now let's create a new `Ionic` app:

    $ ionic start messenger --v2

And to start it in the browser, simply type:

    $ ionic serve

`Ionic` also uses [Cordova](cordova.apache.org) which let's you build your app for a mobile device. For more information on how to run `Ionic` apps on `android` or `iOS` see the following [link](http://ionicframework.com/docs/v2/getting-started/installation/).

{{/template}}