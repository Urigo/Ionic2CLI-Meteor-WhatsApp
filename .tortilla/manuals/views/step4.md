# Step 4: Realtime Meteor Server

Now that we have the initial chats layout and its component, we will take it a step further by providing the chats data from a server instead of having it locally. In this step we will be implementing the API server and we will do so using `Meteor`.

First make sure that you have `Meteor` installed. If not, install it by typing the following command:

    $ curl https://install.meteor.com/ | sh

We will start by creating the `Meteor` project which will be placed inside the `api` dir:

    $ meteor create api

A `Meteor` project will contain the following dirs by default:

- client - A dir containing all client scripts.
- server - A dir containing all server scripts.

These scripts should be loaded automatically by their alphabetic order on their belonging platform, e.g. a script defined under the client dir should be loaded by `Meteor` only on the client. A script defined in neither of these folders should be loaded on both. Since we're using `Ionic`'s CLI for the client code we have no need in the client dir in the `Meteor` project. Let's get rid of it:

    api$ rm -rf client

Since we don't wanna have duplicate resources between the client and the server, we will remove the `package.json` file in the `api` dir:

    api$ rm package.json

And we will add a symbolic link between the client's `node_modules` and client `node_modules`:

    api$ ln -s ../node_modules

Since we will be writing our app using `Typescript`, we will need to support it in our `Meteor` project as well, especially when the client and the server share some of the script files. To add this support we will add the following package to our `Meteor` project:

    api$ meteor add barbatus:typescript

We will also need to add a configuration file for the `TypeScript` compiler in the `Meteor` server, which is derived from our `Ionic` app's config:

[{]: <helper> (diffStep 4.6)

#### [Step 4.6: Add server&#x27;s tsconfig file](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/7058308)

##### Added api&#x2F;tsconfig.json
```diff
@@ -0,0 +1,29 @@
+┊  ┊ 1┊{
+┊  ┊ 2┊  "compilerOptions": {
+┊  ┊ 3┊    "allowSyntheticDefaultImports": true,
+┊  ┊ 4┊    "declaration": false,
+┊  ┊ 5┊    "emitDecoratorMetadata": true,
+┊  ┊ 6┊    "experimentalDecorators": true,
+┊  ┊ 7┊    "lib": [
+┊  ┊ 8┊      "dom",
+┊  ┊ 9┊      "es2015"
+┊  ┊10┊    ],
+┊  ┊11┊    "module": "commonjs",
+┊  ┊12┊    "moduleResolution": "node",
+┊  ┊13┊    "sourceMap": true,
+┊  ┊14┊    "target": "es5",
+┊  ┊15┊    "skipLibCheck": true,
+┊  ┊16┊    "stripInternal": true,
+┊  ┊17┊    "noImplicitAny": false,
+┊  ┊18┊    "types": [
+┊  ┊19┊      "meteor-typings"
+┊  ┊20┊    ]
+┊  ┊21┊  },
+┊  ┊22┊  "exclude": [
+┊  ┊23┊    "node_modules"
+┊  ┊24┊  ],
+┊  ┊25┊  "compileOnSave": false,
+┊  ┊26┊  "atom": {
+┊  ┊27┊    "rewriteTsconfig": false
+┊  ┊28┊  }
+┊  ┊29┊}
```

[}]: #

Since we're using `TypeScript`, let's change the main server file extension from `.js` to `.ts`:

    api$ mv server/main.js server/main.ts

Now we will need to create a symbolic link to the declaration file located in `src/declarations.d.ts`. This way we can share external `TypeScript` declarations in both client and server. To create the desired symbolic link, simply type the following command in the command line:

    api$ ln -s ../src/declarations.d.ts

The following dependencies are required to be installed so our server can function properly:

    $ npm install --save babel-runtime
    $ npm install --save meteor-node-stubs

Now we'll have to move our models interfaces to the `api` dir so the server will have access to them as well:

    $ mv src/models.ts api/server/models.ts

This requires us to update its reference in the declarations file as well:

[{]: <helper> (diffStep 4.11)

#### [Step 4.11: Update the models import path](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/a755e86)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
```diff
@@ -1,7 +1,7 @@
 ┊1┊1┊import { Component } from '@angular/core';
 ┊2┊2┊import { Observable } from 'rxjs';
 ┊3┊3┊import * as moment from 'moment';
-┊4┊ ┊import { Chat, MessageType } from '../../models';
+┊ ┊4┊import { Chat, MessageType } from 'api/models';
 ┊5┊5┊
 ┊6┊6┊@Component({
 ┊7┊7┊  templateUrl: 'chats.html'
```

[}]: #

We will also install the `meteor-rxjs` package so we can define collections and data streams and TypeScript definitions for Meteor:

    $ npm install --save meteor-rxjs
    $ npm install --save-dev @types/meteor

## Collections

This collection is actually a reference to a [MongoDB](http://mongodb.com) collection, and it is provided to us by a `Meteor` package called [Minimongo](https://guide.meteor.com/collections.html), and it shares almost the same API as a native `MongoDB` collection. In this tutorial we will be wrapping our collections using `RxJS`'s `Observables`, which is available to us thanks to [meteor-rxjs](http://npmjs.com/package/meteor-rxjs).

Our initial collections are gonna be the chats and messages collection, the one is going to store some chats-models, and the other is going to store messages-models:

[{]: <helper> (diffStep 4.13)

#### [Step 4.13: Create chats collection](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/bf269d8)

##### Added api&#x2F;server&#x2F;collections&#x2F;chats.ts
```diff
@@ -0,0 +1,4 @@
+┊ ┊1┊import { MongoObservable } from 'meteor-rxjs';
+┊ ┊2┊import { Chat } from '../models';
+┊ ┊3┊
+┊ ┊4┊export const Chats = new MongoObservable.Collection<Chat>('chats');
```

[}]: #

[{]: <helper> (diffStep 4.14)

#### [Step 4.14: Added messages collection](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/a251004)

##### Added api&#x2F;server&#x2F;collections&#x2F;messages.ts
```diff
@@ -0,0 +1,4 @@
+┊ ┊1┊import { MongoObservable } from 'meteor-rxjs';
+┊ ┊2┊import { Message } from '../models';
+┊ ┊3┊
+┊ ┊4┊export const Messages = new MongoObservable.Collection<Message>('messages');
```

[}]: #

We chose to create a dedicated module for each collection, because in the near future there might be more logic added into each one of them. To make importation convenient, we will export all collections from a single file:

[{]: <helper> (diffStep 4.15)

#### [Step 4.15: Added main export file](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/c732735)

##### Added api&#x2F;server&#x2F;collections&#x2F;index.ts
```diff
@@ -0,0 +1,2 @@
+┊ ┊1┊export * from './chats';
+┊ ┊2┊export * from './messages';
```

[}]: #

Now instead of requiring each collection individually, we can just require them from the `index.ts` file.

## Data fixtures

Since we have real collections now, and not dummy ones, we will need to fill them up with some data in case they are empty, so we can test our application properly. Let's create our data fixtures in the server:

[{]: <helper> (diffStep 4.16)

#### [Step 4.16: Move stubs data to the server side](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/fb5c25b)

##### Changed api&#x2F;server&#x2F;main.ts
```diff
@@ -1,5 +1,71 @@
 ┊ 1┊ 1┊import { Meteor } from 'meteor/meteor';
+┊  ┊ 2┊import { Chats } from './collections/chats';
+┊  ┊ 3┊import { Messages } from './collections/messages';
+┊  ┊ 4┊import * as moment from 'moment';
+┊  ┊ 5┊import { MessageType } from './models';
 ┊ 2┊ 6┊
 ┊ 3┊ 7┊Meteor.startup(() => {
-┊ 4┊  ┊  // code to run on server at startup
+┊  ┊ 8┊  if (Chats.find({}).cursor.count() === 0) {
+┊  ┊ 9┊    let chatId;
+┊  ┊10┊
+┊  ┊11┊    chatId = Chats.collection.insert({
+┊  ┊12┊      title: 'Ethan Gonzalez',
+┊  ┊13┊      picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg'
+┊  ┊14┊    });
+┊  ┊15┊
+┊  ┊16┊    Messages.collection.insert({
+┊  ┊17┊      chatId: chatId,
+┊  ┊18┊      content: 'You on your way?',
+┊  ┊19┊      createdAt: moment().subtract(1, 'hours').toDate(),
+┊  ┊20┊      type: MessageType.TEXT
+┊  ┊21┊    });
+┊  ┊22┊
+┊  ┊23┊    chatId = Chats.collection.insert({
+┊  ┊24┊      title: 'Bryan Wallace',
+┊  ┊25┊      picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg'
+┊  ┊26┊    });
+┊  ┊27┊
+┊  ┊28┊    Messages.collection.insert({
+┊  ┊29┊      chatId: chatId,
+┊  ┊30┊      content: 'Hey, it\'s me',
+┊  ┊31┊      createdAt: moment().subtract(2, 'hours').toDate(),
+┊  ┊32┊      type: MessageType.TEXT
+┊  ┊33┊    });
+┊  ┊34┊
+┊  ┊35┊    chatId = Chats.collection.insert({
+┊  ┊36┊      title: 'Avery Stewart',
+┊  ┊37┊      picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg'
+┊  ┊38┊    });
+┊  ┊39┊
+┊  ┊40┊    Messages.collection.insert({
+┊  ┊41┊      chatId: chatId,
+┊  ┊42┊      content: 'I should buy a boat',
+┊  ┊43┊      createdAt: moment().subtract(1, 'days').toDate(),
+┊  ┊44┊      type: MessageType.TEXT
+┊  ┊45┊    });
+┊  ┊46┊
+┊  ┊47┊    chatId = Chats.collection.insert({
+┊  ┊48┊      title: 'Katie Peterson',
+┊  ┊49┊      picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg'
+┊  ┊50┊    });
+┊  ┊51┊
+┊  ┊52┊    Messages.collection.insert({
+┊  ┊53┊      chatId: chatId,
+┊  ┊54┊      content: 'Look at my mukluks!',
+┊  ┊55┊      createdAt: moment().subtract(4, 'days').toDate(),
+┊  ┊56┊      type: MessageType.TEXT
+┊  ┊57┊    });
+┊  ┊58┊
+┊  ┊59┊    chatId = Chats.collection.insert({
+┊  ┊60┊      title: 'Ray Edwards',
+┊  ┊61┊      picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg'
+┊  ┊62┊    });
+┊  ┊63┊
+┊  ┊64┊    Messages.collection.insert({
+┊  ┊65┊      chatId: chatId,
+┊  ┊66┊      content: 'This is wicked good ice cream.',
+┊  ┊67┊      createdAt: moment().subtract(2, 'weeks').toDate(),
+┊  ┊68┊      type: MessageType.TEXT
+┊  ┊69┊    });
+┊  ┊70┊  }
 ┊ 5┊71┊});
```

[}]: #

> This behavior is **not** recommended and should be removed once we're ready for production. A conditioned environment variable may also be a great solution

Note how we use the `.collection` property to get the actual `Mongo.Collection` instance. In the `Meteor` server we want to avoid the usage of observables since it uses `fibers`. More information about fibers can be fond [here](https://www.npmjs.com/package/fibers).

## Preparing the Meteor client

In order to connect to the `Meteor` server, we need a client which is capable of doing so. To create a `Meteor` client, we will use a bundler called [meteor-client-bundler](https://github.com/Urigo/meteor-client-bundler). This bundler, bundles all the necessary `Meteor` client script files into a single module. This is very useful when we want to interact with [Atmosphere](https://atmospherejs.com/) packages integrate them our client. To install `meteor-client-bundler`, run the following command:

    $ sudo npm install -g meteor-client-bundler

Now we'll add a bundling script to the `package.json` as followed:

[{]: <helper> (diffStep 4.17)

#### [Step 4.17: Created a script for generating the Meteor client bundle](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/f7f7658)

##### Changed package.json
```diff
@@ -11,7 +11,8 @@
 ┊11┊11┊    "clean": "ionic-app-scripts clean",
 ┊12┊12┊    "build": "ionic-app-scripts build",
 ┊13┊13┊    "ionic:build": "ionic-app-scripts build",
-┊14┊  ┊    "ionic:serve": "ionic-app-scripts serve"
+┊  ┊14┊    "ionic:serve": "ionic-app-scripts serve",
+┊  ┊15┊    "meteor-client:bundle": "meteor-client bundle -s api"
 ┊15┊16┊  },
 ┊16┊17┊  "dependencies": {
 ┊17┊18┊    "@angular/common": "2.2.1",
```
```diff
@@ -41,6 +42,7 @@
 ┊41┊42┊    "@types/meteor": "^1.3.31",
 ┊42┊43┊    "@types/underscore": "^1.7.36",
 ┊43┊44┊    "meteor-typings": "^1.3.1",
+┊  ┊45┊    "tmp": "0.0.31",
 ┊44┊46┊    "typescript": "2.0.9",
 ┊45┊47┊    "typescript-extends": "^1.0.1"
 ┊46┊48┊  },
```

[}]: #

To execute it, simply run:

    $ npm run meteor-client:bundle

This will generate a file called `meteor-client.js` under the `node_modules` dir, which needs to be imported in our application like so:

[{]: <helper> (diffStep 4.18)

#### [Step 4.18: Import meteor client bundle](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/84afdcc)

##### Changed src&#x2F;app&#x2F;main.ts
```diff
@@ -1,3 +1,5 @@
+┊ ┊1┊import 'meteor-client';
+┊ ┊2┊
 ┊1┊3┊import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
 ┊2┊4┊
 ┊3┊5┊import { AppModule } from './app.module';
```

[}]: #

> By default, the client will assume that the server is running at `localhost:3000`. If you'd like to change that, you can simply specify a `--url` option in the `NPM` script. Further information can be found [here](https://github.com/Urigo/meteor-client-bundler).

The client we've just imported gives us the ability to interact with the server. Let's replace the local chats-data with a data which is fetched from the `Meteor` server:

[{]: <helper> (diffStep 4.19)

#### [Step 4.19: Use server side data](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/2dca203)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
```diff
@@ -1,75 +1,37 @@
-┊ 1┊  ┊import { Component } from '@angular/core';
+┊  ┊ 1┊import { Component, OnInit } from '@angular/core';
+┊  ┊ 2┊import { Chats, Messages } from 'api/collections';
+┊  ┊ 3┊import { Chat } from 'api/models';
 ┊ 2┊ 4┊import { Observable } from 'rxjs';
-┊ 3┊  ┊import * as moment from 'moment';
-┊ 4┊  ┊import { Chat, MessageType } from 'api/models';
 ┊ 5┊ 5┊
 ┊ 6┊ 6┊@Component({
 ┊ 7┊ 7┊  templateUrl: 'chats.html'
 ┊ 8┊ 8┊})
-┊ 9┊  ┊export class ChatsPage {
-┊10┊  ┊  chats: Observable<Chat[]>;
+┊  ┊ 9┊export class ChatsPage implements OnInit {
+┊  ┊10┊  chats;
 ┊11┊11┊
 ┊12┊12┊  constructor() {
-┊13┊  ┊    this.chats = this.findChats();
 ┊14┊13┊  }
 ┊15┊14┊
-┊16┊  ┊  private findChats(): Observable<Chat[]> {
-┊17┊  ┊    return Observable.of([
-┊18┊  ┊      {
-┊19┊  ┊        _id: '0',
-┊20┊  ┊        title: 'Ethan Gonzalez',
-┊21┊  ┊        picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
-┊22┊  ┊        lastMessage: {
-┊23┊  ┊          content: 'You on your way?',
-┊24┊  ┊          createdAt: moment().subtract(1, 'hours').toDate(),
-┊25┊  ┊          type: MessageType.TEXT
-┊26┊  ┊        }
-┊27┊  ┊      },
-┊28┊  ┊      {
-┊29┊  ┊        _id: '1',
-┊30┊  ┊        title: 'Bryan Wallace',
-┊31┊  ┊        picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
-┊32┊  ┊        lastMessage: {
-┊33┊  ┊          content: 'Hey, it\'s me',
-┊34┊  ┊          createdAt: moment().subtract(2, 'hours').toDate(),
-┊35┊  ┊          type: MessageType.TEXT
-┊36┊  ┊        }
-┊37┊  ┊      },
-┊38┊  ┊      {
-┊39┊  ┊        _id: '2',
-┊40┊  ┊        title: 'Avery Stewart',
-┊41┊  ┊        picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
-┊42┊  ┊        lastMessage: {
-┊43┊  ┊          content: 'I should buy a boat',
-┊44┊  ┊          createdAt: moment().subtract(1, 'days').toDate(),
-┊45┊  ┊          type: MessageType.TEXT
-┊46┊  ┊        }
-┊47┊  ┊      },
-┊48┊  ┊      {
-┊49┊  ┊        _id: '3',
-┊50┊  ┊        title: 'Katie Peterson',
-┊51┊  ┊        picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
-┊52┊  ┊        lastMessage: {
-┊53┊  ┊          content: 'Look at my mukluks!',
-┊54┊  ┊          createdAt: moment().subtract(4, 'days').toDate(),
-┊55┊  ┊          type: MessageType.TEXT
-┊56┊  ┊        }
-┊57┊  ┊      },
-┊58┊  ┊      {
-┊59┊  ┊        _id: '4',
-┊60┊  ┊        title: 'Ray Edwards',
-┊61┊  ┊        picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
-┊62┊  ┊        lastMessage: {
-┊63┊  ┊          content: 'This is wicked good ice cream.',
-┊64┊  ┊          createdAt: moment().subtract(2, 'weeks').toDate(),
-┊65┊  ┊          type: MessageType.TEXT
-┊66┊  ┊        }
-┊67┊  ┊      }
-┊68┊  ┊    ]);
+┊  ┊15┊  ngOnInit() {
+┊  ┊16┊    this.chats = Chats
+┊  ┊17┊      .find({})
+┊  ┊18┊      .mergeMap((chats: Chat[]) =>
+┊  ┊19┊        Observable.combineLatest(
+┊  ┊20┊          ...chats.map((chat: Chat) =>
+┊  ┊21┊            Messages
+┊  ┊22┊              .find({chatId: chat._id})
+┊  ┊23┊              .startWith(null)
+┊  ┊24┊              .map(messages => {
+┊  ┊25┊                if (messages) chat.lastMessage = messages[0];
+┊  ┊26┊                return chat;
+┊  ┊27┊              })
+┊  ┊28┊          )
+┊  ┊29┊        )
+┊  ┊30┊      ).zone();
 ┊69┊31┊  }
 ┊70┊32┊
 ┊71┊33┊  removeChat(chat: Chat): void {
-┊72┊  ┊    this.chats = this.chats.map<Chat[]>(chatsArray => {
+┊  ┊34┊    this.chats = this.chats.map(chatsArray => {
 ┊73┊35┊      const chatIndex = chatsArray.indexOf(chat);
 ┊74┊36┊      chatsArray.splice(chatIndex, 1);
```

[}]: #

And re-implement the `removeChat` method using the actual `Meteor` collection:

[{]: <helper> (diffStep 4.2)

#### [Step 4.2: Remove old client files](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/63956e2)

##### Deleted api&#x2F;client&#x2F;main.css
```diff
@@ -1 +0,0 @@
-┊1┊ ┊/* CSS declarations go here */
```

##### Deleted api&#x2F;client&#x2F;main.html
```diff
@@ -1,25 +0,0 @@
-┊ 1┊  ┊<head>
-┊ 2┊  ┊  <title>api</title>
-┊ 3┊  ┊</head>
-┊ 4┊  ┊
-┊ 5┊  ┊<body>
-┊ 6┊  ┊  <h1>Welcome to Meteor!</h1>
-┊ 7┊  ┊
-┊ 8┊  ┊  {{> hello}}
-┊ 9┊  ┊  {{> info}}
-┊10┊  ┊</body>
-┊11┊  ┊
-┊12┊  ┊<template name="hello">
-┊13┊  ┊  <button>Click Me</button>
-┊14┊  ┊  <p>You've pressed the button {{counter}} times.</p>
-┊15┊  ┊</template>
-┊16┊  ┊
-┊17┊  ┊<template name="info">
-┊18┊  ┊  <h2>Learn Meteor!</h2>
-┊19┊  ┊  <ul>
-┊20┊  ┊    <li><a href="https://www.meteor.com/try" target="_blank">Do the Tutorial</a></li>
-┊21┊  ┊    <li><a href="http://guide.meteor.com" target="_blank">Follow the Guide</a></li>
-┊22┊  ┊    <li><a href="https://docs.meteor.com" target="_blank">Read the Docs</a></li>
-┊23┊  ┊    <li><a href="https://forums.meteor.com" target="_blank">Discussions</a></li>
-┊24┊  ┊  </ul>
-┊25┊  ┊</template>
```

##### Deleted api&#x2F;client&#x2F;main.js
```diff
@@ -1,22 +0,0 @@
-┊ 1┊  ┊import { Template } from 'meteor/templating';
-┊ 2┊  ┊import { ReactiveVar } from 'meteor/reactive-var';
-┊ 3┊  ┊
-┊ 4┊  ┊import './main.html';
-┊ 5┊  ┊
-┊ 6┊  ┊Template.hello.onCreated(function helloOnCreated() {
-┊ 7┊  ┊  // counter starts at 0
-┊ 8┊  ┊  this.counter = new ReactiveVar(0);
-┊ 9┊  ┊});
-┊10┊  ┊
-┊11┊  ┊Template.hello.helpers({
-┊12┊  ┊  counter() {
-┊13┊  ┊    return Template.instance().counter.get();
-┊14┊  ┊  },
-┊15┊  ┊});
-┊16┊  ┊
-┊17┊  ┊Template.hello.events({
-┊18┊  ┊  'click button'(event, instance) {
-┊19┊  ┊    // increment the counter when button is clicked
-┊20┊  ┊    instance.counter.set(instance.counter.get() + 1);
-┊21┊  ┊  },
-┊22┊  ┊});
```

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/folder-structure" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/rxjs")

| [< Previous Step](https://angular-meteor.com/tutorials/whatsapp2/ionic/rxjs) | [Next Step >](https://angular-meteor.com/tutorials/whatsapp2/ionic/folder-structure) |
|:--------------------------------|--------------------------------:|

[}]: #

