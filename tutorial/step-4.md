{{#template name="tutorials.messenger.ionic2.step_04.md"}}

Now that we have the initial layout ready, we will take it a step further by providing its data from a server and not locally. In this step we will start implementing the server and we will be using `Meteor`.

First make sure that you have `Meteor` installed, if not, install it by typing:

    $ curl https://install.meteor.com/ | sh

> *NOTE*: I gonna assume that your'e already familiar with `Meteor`'s API further in this tutorial. For more information about `Meteor` you can visit their official website [here](meteor.com).

Now let's create our `Meteor` server which will be placed inside the `api` dir:

    $ meteor create api

As you can see `Meteor` provides with an exmaple app. Since we're only intrested in the server side, let's remove the `client` dir;

    $ rm -rf api/client

By now you probably noticed that `Meteor` uses `NPM`, just like the our `Ionic` project. Since we don't want our client and server to be seperated and require a duplicated installation for each package we decide to add, we'll need to find a way to make them share the same resource.

We will acheive that by symbolic linking the `node_modules` dir:

    $ cd api
    $ rm -rf node_modules
    $ ln -s ../node_modules

> *NOTE*: Our symbolic link needs to be relative, otherwise it won't work on other machines cloning the project.

And since we share the same resource for `NPM` modules we also don't need the `package.json` file in the `Meteor` project:

    $ rm api/package.json

Don't forget to reinstall `Meteor`'s node dependencies after we deleted the `node_modules` dir:

    $ npm install meteor-node-stubs --save

Now that we finished setting up our server, let's define two `Mongo` collections - 'chats' and 'messages':

{{> DiffBox tutorialName="ionic2-tutorial" step="4.6"}}

We would also like to make these collections available on our client. To do so, we need to bring `Meteor`'s powerful tools into the client side, which will help us stay synced with the `Meteor` server in real time.

For this we gonna install a package called `meteor-client-side`:

    $ npm install meteor-client-side --save

And ofcourse don't forget to import it, so it will be bundled with our app as well:

{{> DiffBox tutorialName="ionic2-tutorial" step="4.8"}}

Now once we wanna use our collections we can simply import them from the `collections.js` file. Since our path is relative, any time we want to approach one of our server's files we have to write a long and complicated path.

We can solve it by adding an alias to the server in the `Webpack` config:

{{> DiffBox tutorialName="ionic2-tutorial" step="4.9"}}

So now, for example, if we'd like to approach the `collections.js` file, instead of importing `../../api/server/collections` we can simply type `api/collections`.

In addition we'd also wanna have access to `Meteor` packages. Normally we can access them from a global object called `Package`, but we can make it declerative by adding the following handler into our `Webpack` config:

{{> DiffBox tutorialName="ionic2-tutorial" step="4.10"}}

So the following code:

```js
const Tracker = window.Package['tracker'].Tracker;
```

Can be replaced with:

```
import {Tracker} from 'meteor/tracker';
```

Now we also gonna install a package called `angular2-meteor`:

    $ npm install angular2-meteor --save

`angular2-meteor` is a utility library which lets us use `Meteor`'s powerful API along with `AngularJS2` as the layer view. For more information about `angular2-meteor`, visit its website [here](angular-meteor.com).

First, we need to apply `angular2-meteor`'s providers during bootstrap:

{{> DiffBox tutorialName="ionic2-tutorial" step="4.12"}}

As for now, the current version of `angular2-meteor` (version 0.6.0) relies on `Meteor` packages called `check` and `ejson` to be global, otherwise a runtime error might be thrown by this library. So before we use it we gotta expose this packages:

{{> DiffBox tutorialName="ionic2-tutorial" step="4.13"}}

> *NOTE*: This is a temporary workaround that shouldn't exist once this issue is solved.

Now instead of mocking some static data in the controller, we can mock it in the server:

{{> DiffBox tutorialName="ionic2-tutorial" step="4.14"}}

The code is pretty easy and self explanatory.

Now we can simply import the chats collection and define a cursor on the chats component. The cursor can be iterated in the view thanks to `angular2-meteor`. Ofcourse, since our data is not a simple array anymore, it means that we need to update the rest of the logic in the component to match `Mongo`'s API.

This is how our component should look like:

{{> DiffBox tutorialName="ionic2-tutorial" step="4.15"}}

> *NOTE*: `meteor-client-side` will try to connect to `localhost:3000` by default. To change it, simply set a global object named `__meteor_runtime_config__` with a property called `DDP_DEFAULT_CONNECTION_URL` and set whatever server url you'd like to connect to.

> *TIP*: You can have a static separate front end app that works with a `Meteor` server. you can use `Meteor` as a back end server to any front end app without changing anything in your app structure or build process.

Now all the clients can be synced with our server in real time!

If you will go ahead and open another instance of the app, you can see that once you remove one of the chats in one instance, it will update the other instance's view as well.

You can also update the chats collection directly from the database as well and see how the view re-renders. To do so, simply navigate to the `api` dir and type `meteor mongo` while our `Meteor` server is up.

Once your'e connected to the database, simply type:

```js
  chat = db.chats.findOne({})
  db.chats.remove({_id: chat._id})
```

And see how the view updates.

{{/template}}