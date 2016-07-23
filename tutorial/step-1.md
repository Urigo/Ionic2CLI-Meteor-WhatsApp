{{# template name="tutorials.whatsapp2.ionic.step_01.md"}}

Both [Meteor](meteor.com) and [Ionic](ionicframework.com) took their platform to the next level in tooling.
Both provide CLI interface instead of bringing bunch of dependencies and configure build tools.
There are also differences between those tools. in this post we will focus on the Ionic CLI.

To begin with, we need to install Ionic using npm:

    $ npm install -g ionic@beta

We will create our Whatsapp app using the following command:

    $ ionic start whatsapp --v2

To start our app, simply type:

    $ ionic serve

> *Note*: Ionic framework is built on top of [Cordova](cordova.apache.org) which let's you build your app for mobile devices. For more information on how to run our app on a mobile device see the following [link](ionicframework.com/docs/v2/getting-started/installation/).

{{/template}}