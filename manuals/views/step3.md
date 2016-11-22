# Step 3: Realtime Meteor server

# Meteor Client Side package

We want to have Meteor essentials available in our client so we can interface with our Meteor server.

We're gonna install a package called `meteor-client-side` which is gonna provide us with them:

    $ npm install --save meteor-client-side

And let's import it into our project, in the `src/app/main.ts` file:

[{]: <helper> (diff_step 3.2)
#### Step 3.2: Import meteor client side into the project

##### Changed src/app/main.ts
```diff
@@ -1,3 +1,5 @@
+┊ ┊1┊import 'meteor-client-side';
+┊ ┊2┊
 ┊1┊3┊import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
 ┊2┊4┊
 ┊3┊5┊import { AppModule } from './app.module';
```
[}]: #

By default, our Meteor client will try to connect to `localhost:3000`. If you'd like to change that, add the following script tag in your `index.html`:

```html
<script>
    (function() {
      __meteor_runtime_config__ = {
        // Your server's IP address goes here
        DDP_DEFAULT_CONNECTION_URL: "http://api.server.com"
      };
    })();
</script>
```

More information can be found here: https://github.com/idanwe/meteor-client-side

# Meteor Server

Now that we have the initial chats layout and its component, we will take it a step further by providing the chats data from a server instead of having it locally. In this step we will be implementing the API server and we will do so using Meteor.

First make sure that you have Meteor installed. If not, install it by typing the following command:

    $ curl https://install.meteor.com/ | sh

We will start by creating the Meteor project which will be placed inside the `api` dir:

    $ meteor create api

> **NOTE:** Despite our decision to stick to Ionic's CLI, there is no other way to create a proper Meteor project except for using its CLI.

Let's start by removing the client side from the base Meteor project.

A Meteor project will contain the following dirs by default:

- client - A dir containing all client scripts.
- server - A dir containing all server scripts.

These scripts should be loaded automatically by their alphabetic order on their belonging platform, e.g. a script defined under the client dir should be loaded by Meteor only on the client. A script defined in neither of these folders should be loaded on both. Since we're using Ionic's CLI for the client code we have no need in the client dir in the Meteor project. Let's get rid of it:

    api$ rm -rf client

We also want to make sure that node modules are accessible from both client and server. To fulfill it, we gonna create a symbolic link in the `api` dir which will reference to the project's root node modules:

    api$ ln -s ../node_modules

And remove its ignore rule:

[{]: <helper> (diff_step 3.5 files="api/.gitignore")
#### Step 3.5: Add a symbolic link to node_modules in api

##### Changed api/.gitignore
```diff
@@ -1 +0,0 @@
-┊1┊ ┊node_modules/
```
[}]: #

Now that we share the same resource there is no need in two `package.json` dependencies specifications, so we can just remove it:

    api$ rm package.json

Since we will be writing our app using Typescript also in the server side, we will need to support it in our Meteor project as well, especially when the client and the server share some of the script files. To add this support let's add the following package to our Meteor project:

    api$ meteor add barbatus:typescript

Because we use TypeScript, let's change the main server file extension from `.js` to `.ts`:

    api$ mv server/main.js server/main.ts

We will also need to add a configuration file for the TypeScript compiler in the Meteor server, which is based on our Ionic app's config:

[{]: <helper> (diff_step 3.9)
#### Step 3.9: Created tsconfig.json

##### Added api/tsconfig.json
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
+┊  ┊17┊    "noImplicitAny": false
+┊  ┊18┊  },
+┊  ┊19┊  "exclude": [
+┊  ┊20┊    "node_modules"
+┊  ┊21┊  ],
+┊  ┊22┊  "files": [
+┊  ┊23┊    "declarations.d.ts"
+┊  ┊24┊  ],
+┊  ┊25┊  "compileOnSave": false,
+┊  ┊26┊  "atom": {
+┊  ┊27┊    "rewriteTsconfig": false
+┊  ┊28┊  }
+┊  ┊29┊}🚫↵
```
[}]: #

Now we will need to create a symbolic link to the declaration file located in `src/declarations.d.ts`. This way we can share external TypeScript declarations in both client and server. To create the desired symbolic link, simply type the following command in the command line:

    $ api ln -s ../src/declarations.d.ts

Once we've created the symbolic link we can go ahead and add the missing declarations so our Meteor project can function properly using the TypeScript compiler:

[{]: <helper> (diff_step 3.1 files="src/declarations.d.ts")
#### Step 3.1: Added meteor-clint-side


[}]: #

The following dependencies are required to be installed so our server can function properly:

    $ npm install --save @types/meteor
    $ npm install --save @types/underscore
    $ npm install --save babel-runtime
    $ npm install --save meteor-node-stubs
    $ npm install --save meteor-rxjs
    $ npm install --save meteor-typings

Now we'll have to move our models interfaces to the `api` dir so the server will have access to them as well:

    $ mv models/whatsapp-models.d.ts api/whatsapp-models.d.ts

This requires us to update its reference in the declarations file as well:

[{]: <helper> (diff_step 3.12)
#### Step 3.12: Updated import path

##### Changed src/declarations.d.ts
```diff
@@ -13,6 +13,6 @@
 ┊13┊13┊*/
 ┊14┊14┊/// <reference types="meteor-typings" />
 ┊15┊15┊/// <reference types="@types/underscore" />
-┊16┊  ┊/// <reference path="../models/whatsapp-models.d.ts" />
+┊  ┊16┊/// <reference path="../api/models/whatsapp-models.d.ts" />
 ┊17┊17┊declare module '*';
```
[}]: #

## Collections

In Meteor, we keep data inside `Mongo.Collections`.

This collection is actually a reference to a [MongoDB](http://mongodb.com) collection, and it is provided to us by a Meteor package called [Minimongo](https://guide.meteor.com/collections.html), and it shares almost the same API as a native MongoDB collection. In this tutorial we will be wrapping our collections using RxJS's `Observables`, which is available to us thanks to [meteor-rxjs](http://npmjs.com/package/meteor-rxjs).

Let's create a chats and messages collection, which will be used to store data related to newly created chats and written messages:

[{]: <helper> (diff_step 3.13)
#### Step 3.13: Created Collections

##### Added api/collections/whatsapp-collections.ts
```diff
@@ -0,0 +1,4 @@
+┊ ┊1┊import { MongoObservable } from "meteor-rxjs";
+┊ ┊2┊
+┊ ┊3┊export const Chats = new MongoObservable.Collection("chats");
+┊ ┊4┊export const Messages = new MongoObservable.Collection("messages");
```
[}]: #

## Data fixtures

Since we have real collections now, and not dummy ones, we will need to fill them up with some initial data so we will have something to test our application against to. Let's create our data fixtures in the server:

[{]: <helper> (diff_step 3.14)
#### Step 3.14: Added stub data to the collection in the server side

##### Changed api/server/main.ts
```diff
@@ -1,5 +1,64 @@
+┊  ┊ 1┊import * as moment from "moment";
 ┊ 1┊ 2┊import { Meteor } from 'meteor/meteor';
+┊  ┊ 3┊import { Chats, Messages } from "../collections/whatsapp-collections";
 ┊ 2┊ 4┊
 ┊ 3┊ 5┊Meteor.startup(() => {
-┊ 4┊  ┊  // code to run on server at startup
+┊  ┊ 6┊  if (Chats.find({}).cursor.count() === 0) {
+┊  ┊ 7┊    let chatId;
+┊  ┊ 8┊
+┊  ┊ 9┊    chatId = Chats.collection.insert({
+┊  ┊10┊      title: 'Ethan Gonzalez',
+┊  ┊11┊      picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg'
+┊  ┊12┊    });
+┊  ┊13┊
+┊  ┊14┊    Messages.collection.insert({
+┊  ┊15┊      chatId: chatId,
+┊  ┊16┊      content: 'You on your way?',
+┊  ┊17┊      createdAt: moment().subtract(1, 'hours').toDate()
+┊  ┊18┊    });
+┊  ┊19┊
+┊  ┊20┊    chatId = Chats.collection.insert({
+┊  ┊21┊      title: 'Bryan Wallace',
+┊  ┊22┊      picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg'
+┊  ┊23┊    });
+┊  ┊24┊
+┊  ┊25┊    Messages.collection.insert({
+┊  ┊26┊      chatId: chatId,
+┊  ┊27┊      content: 'Hey, it\'s me',
+┊  ┊28┊      createdAt: moment().subtract(2, 'hours').toDate()
+┊  ┊29┊    });
+┊  ┊30┊
+┊  ┊31┊    chatId = Chats.collection.insert({
+┊  ┊32┊      title: 'Avery Stewart',
+┊  ┊33┊      picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg'
+┊  ┊34┊    });
+┊  ┊35┊
+┊  ┊36┊    Messages.collection.insert({
+┊  ┊37┊      chatId: chatId,
+┊  ┊38┊      content: 'I should buy a boat',
+┊  ┊39┊      createdAt: moment().subtract(1, 'days').toDate()
+┊  ┊40┊    });
+┊  ┊41┊
+┊  ┊42┊    chatId = Chats.collection.insert({
+┊  ┊43┊      title: 'Katie Peterson',
+┊  ┊44┊      picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg'
+┊  ┊45┊    });
+┊  ┊46┊
+┊  ┊47┊    Messages.collection.insert({
+┊  ┊48┊      chatId: chatId,
+┊  ┊49┊      content: 'Look at my mukluks!',
+┊  ┊50┊      createdAt: moment().subtract(4, 'days').toDate()
+┊  ┊51┊    });
+┊  ┊52┊
+┊  ┊53┊    chatId = Chats.collection.insert({
+┊  ┊54┊      title: 'Ray Edwards',
+┊  ┊55┊      picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg'
+┊  ┊56┊    });
+┊  ┊57┊
+┊  ┊58┊    Messages.collection.insert({
+┊  ┊59┊      chatId: chatId,
+┊  ┊60┊      content: 'This is wicked good ice cream.',
+┊  ┊61┊      createdAt: moment().subtract(2, 'weeks').toDate()
+┊  ┊62┊    });
+┊  ┊63┊  }
 ┊ 5┊64┊});
```
[}]: #

Here's a quick overview: We use `.collection` to get the actual `Mongo.Collection` instance, this way we avoid using Observables. At the beginning we check if Chats Collection is empty by using `.count()` operator. Then we provide few chats with one message each. We also bundled a message along with a chat using its id.

## UI

Since Meteor's API requires us to share some of the code in both client and server, we have to import all the collections on the client-side too. Let's use the collections in the chats component:

[{]: <helper> (diff_step 3.16)
#### Step 3.16: Added the chats with the last message using RxJS operators

##### Changed src/pages/chats/chats.ts
```diff
@@ -1,66 +1,34 @@
-┊ 1┊  ┊import * as moment from 'moment';
-┊ 2┊  ┊import { Component } from '@angular/core';
+┊  ┊ 1┊import { Component, OnInit } from '@angular/core';
 ┊ 3┊ 2┊import { Observable } from "rxjs";
 ┊ 4┊ 3┊import { Chat } from "api/models/whatsapp-models";
+┊  ┊ 4┊import { Chats, Messages } from "api/collections/whatsapp-collections";
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
+┊  ┊13┊
 ┊14┊14┊  }
 ┊15┊15┊
-┊16┊  ┊  private findChats(): Observable<Chat[]> {
-┊17┊  ┊    return Observable.of([
-┊18┊  ┊      {
-┊19┊  ┊        _id: '0',
-┊20┊  ┊        title: 'Ethan Gonzalez',
-┊21┊  ┊        picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
-┊22┊  ┊        lastMessage: {
-┊23┊  ┊          content: 'You on your way?',
-┊24┊  ┊          createdAt: moment().subtract(1, 'hours').toDate()
-┊25┊  ┊        }
-┊26┊  ┊      },
-┊27┊  ┊      {
-┊28┊  ┊        _id: '1',
-┊29┊  ┊        title: 'Bryan Wallace',
-┊30┊  ┊        picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
-┊31┊  ┊        lastMessage: {
-┊32┊  ┊          content: 'Hey, it\'s me',
-┊33┊  ┊          createdAt: moment().subtract(2, 'hours').toDate()
-┊34┊  ┊        }
-┊35┊  ┊      },
-┊36┊  ┊      {
-┊37┊  ┊        _id: '2',
-┊38┊  ┊        title: 'Avery Stewart',
-┊39┊  ┊        picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
-┊40┊  ┊        lastMessage: {
-┊41┊  ┊          content: 'I should buy a boat',
-┊42┊  ┊          createdAt: moment().subtract(1, 'days').toDate()
-┊43┊  ┊        }
-┊44┊  ┊      },
-┊45┊  ┊      {
-┊46┊  ┊        _id: '3',
-┊47┊  ┊        title: 'Katie Peterson',
-┊48┊  ┊        picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
-┊49┊  ┊        lastMessage: {
-┊50┊  ┊          content: 'Look at my mukluks!',
-┊51┊  ┊          createdAt: moment().subtract(4, 'days').toDate()
-┊52┊  ┊        }
-┊53┊  ┊      },
-┊54┊  ┊      {
-┊55┊  ┊        _id: '4',
-┊56┊  ┊        title: 'Ray Edwards',
-┊57┊  ┊        picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
-┊58┊  ┊        lastMessage: {
-┊59┊  ┊          content: 'This is wicked good ice cream.',
-┊60┊  ┊          createdAt: moment().subtract(2, 'weeks').toDate()
-┊61┊  ┊        }
-┊62┊  ┊      }
-┊63┊  ┊    ]);
+┊  ┊16┊  ngOnInit() {
+┊  ┊17┊    this.chats = Chats
+┊  ┊18┊      .find({})
+┊  ┊19┊      .mergeMap((chats: Chat[]) =>
+┊  ┊20┊        Observable.combineLatest(
+┊  ┊21┊          ...chats.map((chat: Chat) =>
+┊  ┊22┊            Messages
+┊  ┊23┊              .find({chatId: chat._id})
+┊  ┊24┊              .startWith(null)
+┊  ┊25┊              .map(messages => {
+┊  ┊26┊                if (messages) chat.lastMessage = messages[0];
+┊  ┊27┊                return chat;
+┊  ┊28┊              })
+┊  ┊29┊          )
+┊  ┊30┊        )
+┊  ┊31┊      ).zone();
 ┊64┊32┊  }
 ┊65┊33┊
 ┊66┊34┊  removeChat(chat: Chat): void {
```
[}]: #

As you can see, we moved the `chats`'s property initialization to `ngOnInit`, one of Angular's lifehooks. It's being called when the component is initialized.

I'd also like to point something regards RxJS. Since `Chats.find()` returns an `Observable` we can take advantage of that and bundle it with `Messages.find()` to look for the last messages of each chat. This way everything will work as a single unit. Let's dive into RxJS's internals to have a deeper understanding of the process.

#### Find chats

First thing is to get all the chats by using `Chats.find({})`. The result of it will be an array of `Chat` objects. Let's use the `map` to reserve the `lastMessage` property in each chat:

```js
Chats.find({})
    .map(chats => {
        const chatsWithMessages = chats.map(chat => {
            chat.lastMessage = undefined;
            return chat;
        });

        return chatsWithMessages;
    })
```

#### Look for the last message

For each chat we need to find the last message. We can achieve that by calling `Messages.find` with proper selector and options.

Let's go through each element of the `chats` property to call `Messages.find`:

```js
const chatsWithMessages = chats.map(chat => Messages.find(/* selector, options*/));
```

This should return an array of Observables.
Our selector would consist of a query which looks for a message that is a part of the required chat:

```js
{
    chatId: chat._id
}
```

Since we're only interested the last message, we will be using the `sort` option based on the `createdAt` field:

```js
{
    sort: {
        createdAt: -1
    }
}
```

This way we get all the messages sorted from newest to oldest.
Since we're only interested in one, we will be limiting our result set:

```js
{
    sort: {
        createdAt: -1
    },
    limit: 1
}
```

Now we can add the last message to the chat:

```js
Messages.find(/*...*/)
    .map(messages => {
        if (messages) chat.lastMessage = messages[0];
        return chat;
    })
```

Great! But what if there aren't any messages? Wouldn't it emit a value at all?
RxJS contains an operator called `startWith`. It allows us to emit an initial value before we map our messages. This way we avoid the waiting for non existing message:

```js
const chatsWithMessages = chats.map(chat => {
    return Messages.find(/*...*/)
        .startWith(null)
        .map(messages => {
            if (messages) chat.lastMessage = messages[0];
            return chat;
        })
})
```

#### Combine these two

Last thing to do would be handling the array of Observables we created (`chatsWithMessages`).

Yet again, RxJS comes with a rescue. We will use `combineLatest` which takes few Observables and combines them into a single one.

Here's a quick example:

```js
const source1 = /* an Observable */
const source2 = /* an Observable */

const result = Observable.combineLatest(source1, source2);
```

This combination returns an array of both results (`result`). So the first item of that array will come from `source1` (`result[0]`), second from `source2` (`result[1]`).

Let's see how it applies to our app:

```js
Observable.combineLatest(...chatsWithMessages);
```

We used `...array` because `Observable.combineLatest` expects to be invoked with chained arguments, not a single array of Observables.

To merge that observable into `Chats.find({})` we need to use `mergeMap` operator instead of `map`:

```js
Chats.find({})
    .mergeMap(chats => Observable.combineLatest(...chatsWithMessages));
```

In our app we used `chats.map(/*...*/)` directly instead of creating another variables like we did with `chatsWithMessages`.

By now we should have a data-set which consists of a bunch of chats, and each should have its last message defined on it.

To run our Meteor server, simply type the following command in the `api` dir:

    api$ meteor

Now you can go ahead and test our application against the server.

[{]: <helper> (nav_step next_ref="https://angular-meteor.com/tutorials/whatsapp2/ionic/1.0.0/messages-page" prev_ref="https://angular-meteor.com/tutorials/whatsapp2/ionic/1.0.0/chats-page")
| [< Previous Step](https://angular-meteor.com/tutorials/whatsapp2/ionic/1.0.0/chats-page) | [Next Step >](https://angular-meteor.com/tutorials/whatsapp2/ionic/1.0.0/messages-page) |
|:--------------------------------|--------------------------------:|
[}]: #

