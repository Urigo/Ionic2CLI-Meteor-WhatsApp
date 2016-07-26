{{#template name="tutorials.whatsapp2.ionic.step_03.md"}}

Now that we have the initial chats layout and its component, we will take it a step further by providing the chats data from a server instead of having it locally. In this step we will be implementing the API server and we will do so using Meteor.

First make sure that you have Meteor installed. If not, install it by typing the following command:

    $ curl https://install.meteor.com/ | sh

We will start by creating the Meteor project which will be placed inside the `api` dir:

    $ meteor create api

> **NOTE:** Despite our decision to stick to Ionic's CLI, there is no other way to create a proper Meteor project except for using its CLI.

Since we will be writing our app using Typescript and not Javascript, we will need to support it in our Meteor project as well, especially when the client and the server share some of the script files. To add this support let's add the following package to our Meteor project:

    $ meteor add meteortypescript:compiler

And let's link the necessary Typescript assets in both projects so they can have the same declerations and rules:

    $ cd api
    $ ln -s ../typings
    $ ln -s ../tsconfig.json
    $ ln -s ../tslint.json

As you can probably see this is not a NodeJS package we're dealing with, rather than a Meteor package. All Meteor packages are defined in a package manager called [Atmosphere](atmospherejs.com). Normally we should use NPM since we don't want to be messing around with several package managers, but some functionalities are related exclusively to Meteor, in which case we gonna use Atmosphere.

We also wanna have Meteor decleration Typescript files so we can have Meteor data-types available to us once we use Typescript. For this we gonna use a decleration files manager called [typings](). All of the decleration files we installed are gonna be available to us in the `typings.json` file. To add Meteor decleration files, type the following in the command line:

    $ typings install registry:env/meteor --global --save

A Meteor project will contain the following dirs by default:

- client - A dir containing all client scripts.
- server - A dir containing all server scripts.

These scripts should be loaded automatically by their alphabetic order on their belonging platform, e.g. a script defined under the client dir should be loaded by Meteor only on the client. A script defined in neither of these folders should be loaded on both. Since we're using Ionic's CLI for the client code we have no need in the client dir in the Meteor project. Let's get rid of it:

    $ rm -rf api/client

We want our server and client to share the same resources, which means that once we install an NPM package in the Ionic project it's gonna be available in the Meteor project as well. To achieve that we gonna add a symbolic link to `node_modules` dir in our Meteor project:

    $ cd api
    $ ln -s ../node_modules

Since they share the same packages we have no need to configure our Meteor project using `package.json`:

    $ rm api/package.json

And let's not forget to add the Meteor NPM dependencies to the Ionic project as well:

    $ npm install meteor-node-stubs --save

Our API server is set! Now instead of fabricating the chats data in the chats component we can do so during the server initialization. We will start by creating a `chats` collection which will be used to insert new chat documents into the database:

{{> DiffBox tutorialName="ionic-tutorial" step="3.9"}}

This collection is actually a reference to a [MongoDB](mongodb.com) collection, and it is provided to us by a Meteor package called [Minimongo](meteor.com/mini-databases), and it shares almost the same API as a native MongoDB collection.

Now we will go into the server's entry file located in `server/main.js` and we will use the chats collection we've just created to insert some chat documents. First we need to rename this file since we're using Typesript and we want it to have a `.ts` extension:

    $ cd api/server
    $ mv main.js main.ts

And afterwards we can go ahead and write our code:

{{> DiffBox tutorialName="ionic-tutorial" step="3.11"}}

What we did is simple. Once the server is ready, we look for existing chats, if no chat exists we will proceed the method and create new ones.

We also need to update the message model decleration to contain a `chatId` field:

{{> DiffBox tutorialName="ionic-tutorial" step="3.12"}}

Since Meteor's API requires us to share some of the code in both client and server, we gonna have to import some of the files in our Meteor project in our Ionic project, and we wanna make these files as easyily to access accessable as possible. Thanks to Webpack, we can define module aliases instead of writing a full relative path, e.g. instead of writing:

```js
import * as Collections from '../../api/server/collections';
```

We gonna write:

```js
import * as Collections from 'api/collections';
```

All it requires is a simple adjustment in our `webpack.config.js`:

{{> DiffBox tutorialName="ionic-tutorial" step="3.13"}}

Now we wanna have Meteor essentials available in our client so we can interface with our Meteor server. We gonna install a package called `meteor-client-side` which gonna provide us with them:

    $ npm install meteor-client-side --save

And we gonna need to import it so it will be a part of our bundle:

{{> DiffBox tutorialName="ionic-tutorial" step="3.15"}}

> *NOTE*: `meteor-client-side` will try to connect to `localhost:3000` by default. To change it, simply set a global object named `__meteor_runtime_config__` with a property called `DDP_DEFAULT_CONNECTION_URL` and set whatever server url you'd like to connect to.

> *TIP*: You can have a static separate front end app that works with a `Meteor` server. you can use `Meteor` as a back end server to any front end app without changing anything in your app structure or build process.

As for now, Meteor packages can be accessed in the client using the following syntax:

```js
const {EJSON} = window.Package['ejson'];
```

But in the server the method is different:

```js
import {EJSON} from 'meteor/ejson';
```

Since we want this behavior to be consistent and identical, we gonna make the server's method for loading Meteor packages available in the client as well. Then again it only takes a simple configuration adjustment:

{{> DiffBox tutorialName="ionic-tutorial" step="3.16"}}

Our Meteor configuration in the client is ready! Now we can use the chats collection in the chats component as well. Instead of using an array of chats, we will be using a [Mongo.Cursor](docs.meteor.com/api/collections.html#mongo_cursor) returned to us by queries we run on the chats collection:

{{> DiffBox tutorialName="ionic-tutorial" step="3.17"}}

If you will look closely you will see that the component inherits from [MeteorComponent](angular-meteor.com/api/angular2/0.4.2/meteorComponent) which exposes Meteor's API on the component and binds subscriptions and computations to our component, which means that once our component is destroyed then our subsriptions and computations are gonna be destroyed as well.

Since the messages are defined in a seperate collection and not as a nested object inside a chat document anymore, they need to be queried seperately. In addition, the last message of a chat can be changed, so we want it to be recomputated anytime the result of its query changes, therefore we wrapped its calculation insdie a [Computation](docs.meteor.com/api/tracker.html#Tracker-autorun). However, this method causes a memory leak issue since whenever a chat is being removed or replaced with another one, the computation is gonna keep running in the background until the entire component is destroyed. To solve it, we observed changes in the returned cursor using the [Mongo.Cursor.observe()](docs.meteor.com/api/collections.html#Mongo-Cursor-observe) method, and now whenever a chat is removed or chaned its belonging last message computation is gonna stop as well, thanks to a callbak we defined called `disposeChat()`.

Iorder to be able to store a computation on a chat document we also need to update the chat model decleration to contain a `lastMessageComp` field:

{{> DiffBox tutorialName="ionic-tutorial" step="3.18"}}

Since we're not dealing with an array anymore, we can't iterate it in the view. We need a way to iterate a Mongo.Cursor using the `*ngFor` directive. That's where [Angular2-Meteor](angular-meteor.com/angular2) kicks in. Let's install it:

{{> DiffBox tutorialName="ionic-tutorial" step="3.19"}}

And we gonna apply its providers during bootstrap in our app's main component, which will actually give us the iteration abilities:

{{> DiffBox tutorialName="ionic-tutorial" step="3.20"}}

Angular2-Meteor provides us with more abilities which will be revealed and explained further in this tutorial.

The current version of angular2-meteor relies on Meteor packages called `check` and `ejson` to be global otherwise it breaks. Normally that's the way it should be, but since we're not using on a Meteor environment then we gonna have to explicitly define them inorder for angular2-meteor to properly work:

{{> DiffBox tutorialName="ionic-tutorial" step="3.21"}}

Now all the clients can be synced with our server in real time!

If you will go ahead and open another instance of the app, you can see that once you remove one of the chats in one instance, it will update the other instance's view as well.

You can also update the chats collection directly from the database as well and see how the view re-renders. To do so, simply navigate to the `api` dir and type `meteor mongo` while our Meteor server is up.

Once your'e connected to the database, simply type:

```js
  chat = db.chats.findOne({})
  db.chats.remove({_id: chat._id})
```

And see how the view updates.

{{/template}}