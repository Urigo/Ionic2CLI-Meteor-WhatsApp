[{]: <region> (header)
# Step 3: Realtime Meteor server
[}]: #
[{]: <region> (body)
# Meteor Client Side package

We want to have Meteor essentials available in our client so we can interface with our Meteor server. 

We gonna install a package called `meteor-client-side` which gonna provide us with them:

    $ npm install --save meteor-client-side

And let's import it into our project, in the `src/app/main.dev.ts` file:

[{]: <helper> (diff_step 3.2)
#### Step 3.2: Import meteor client side into the project

##### Changed src/app/main.dev.ts
```diff
@@ -1,3 +1,5 @@
+┊ ┊1┊import 'meteor-client-side';
+┊ ┊2┊
 ┊1┊3┊import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
 ┊2┊4┊
 ┊3┊5┊import { AppModule } from './app.module';
```
[}]: #

And `src/app/main.prod.ts`

[{]: <helper> (diff_step 3.3)
#### Step 3.3: Import meteor client side into the project, production

##### Changed src/app/main.prod.ts
```diff
@@ -1,3 +1,5 @@
+┊ ┊1┊import 'meteor-client-side';
+┊ ┊2┊
 ┊1┊3┊import { platformBrowser } from '@angular/platform-browser';
 ┊2┊4┊import { enableProdMode } from '@angular/core';
```
[}]: #

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

[{]: <helper> (diff_step 3.6 api/.gitignore)
#### Step 3.6: Add a symbolic link to node_modules in api

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

And because we use TypeScript, let's change the main server file extension from `.js` to `.ts` (`api/server/main.ts`).

And we need to add TypeScript config file also to the server side, so let's add it under `api/tsconfig.json`:

[{]: <helper> (diff_step 3.10)
#### Step 3.10: Created tsconfig.json

##### Added api/tsconfig.json
```diff
@@ -0,0 +1,25 @@
+┊  ┊ 1┊{
+┊  ┊ 2┊  "compilerOptions": {
+┊  ┊ 3┊    "target": "es5",
+┊  ┊ 4┊    "lib": [
+┊  ┊ 5┊      "es6",
+┊  ┊ 6┊      "dom"
+┊  ┊ 7┊    ],
+┊  ┊ 8┊    "module": "commonjs",
+┊  ┊ 9┊    "moduleResolution": "node",
+┊  ┊10┊    "experimentalDecorators": true,
+┊  ┊11┊    "emitDecoratorMetadata": true,
+┊  ┊12┊    "sourceMap": true
+┊  ┊13┊  },
+┊  ┊14┊  "exclude": [
+┊  ┊15┊    "node_modules"
+┊  ┊16┊  ],
+┊  ┊17┊  "files": [
+┊  ┊18┊    "typings.d.ts"
+┊  ┊19┊  ],
+┊  ┊20┊  "compileOnSave": false,
+┊  ┊21┊  "angularCompilerOptions": {
+┊  ┊22┊    "genDir": "aot",
+┊  ┊23┊    "skipMetadataEmit": true
+┊  ┊24┊  }
+┊  ┊25┊}
```
[}]: #

Note that we declared a file called `typings.d.ts` which will load any external TypeScript types, so let's add the file with the required typings:

[{]: <helper> (diff_step 3.11)
#### Step 3.11: Created TypeScript typings file

##### Added api/typings.d.ts
```diff
@@ -0,0 +1,2 @@
+┊ ┊1┊/// <reference types="@types/meteor" />
+┊ ┊2┊/// <reference types="@types/underscore" />
```
[}]: #

And we will also need to add some missing package for our server side, so run the following command:

    $ npm install --save @types/meteor
    $ npm install --save babel-runtime
    $ npm install --save meteor-node-stubs
    $ npm install --save meteor-rxjs

Now, in order to have access to the TypeScript interface we created in the previous step also in the server side, let's move the `models` directory into the `api` directory.

> Remember the alias we created in the first step, for `api` directory? this is why we created it! so we can share TypeScript file between the server and the client!

And update the import path in the TypeScript config file of the client side, after moving the directory:

[{]: <helper> (diff_step 3.13)
#### Step 3.13: Updated import path

##### Changed src/declarations.d.ts
```diff
@@ -11,5 +11,5 @@
 ┊11┊11┊  For more info on type definition files, check out the Typescript docs here:
 ┊12┊12┊  https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
 ┊13┊13┊*/
-┊14┊  ┊/// <reference path="../models/whatsapp-models.d.ts" />
+┊  ┊14┊/// <reference path="../api/models/whatsapp-models.d.ts" />
 ┊15┊15┊declare module '*';🚫↵
```
[}]: #

## Collections

In Meteor, we keep data inside `Mongo.Collections`.

This collection is actually a reference to a [MongoDB](http://mongodb.com) collection, and it is provided to us by a Meteor package called [Minimongo](https://guide.meteor.com/collections.html), and it shares almost the same API as a native MongoDB collection.

We can also wrap it with RxJS' `Observables` using [`meteor-rxjs`](http://npmjs.com/package/meteor-rxjs).

That package has been already installed, we installed it earlier in the server side!

Let's create a Collection of Chats and Messages:

[{]: <helper> (diff_step 3.14)
#### Step 3.14: Created Collections

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

Since we have Collections, we can now move on to fill them with data and later we will connect that data into the client side.

So first, add a reference to `moment`'s typings deceleration file in the api dir:

[{]: <helper> (diff_step 3.15)
#### Step 3.15: Added moment to the server side

##### Changed api/typings.d.ts
```diff
@@ -1,2 +1,3 @@
 ┊1┊1┊/// <reference types="@types/meteor" />
 ┊2┊2┊/// <reference types="@types/underscore" />
+┊ ┊3┊/// <reference types="moment" />
```
[}]: #

And let's create our data fixtures in the server side:

[{]: <helper> (diff_step 3.16)
#### Step 3.16: Added stub data to the collection in the server side

##### Changed api/server/main.ts
```diff
@@ -1,5 +1,64 @@
 ┊ 1┊ 1┊import { Meteor } from 'meteor/meteor';
+┊  ┊ 2┊import { Chats, Messages } from "../collections/whatsapp-collections";
+┊  ┊ 3┊import * as moment from "moment";
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

Quick overview.
We use `.collection` to get the actual `Mongo.Collection` instance, this way we avoid using Observables.
At the beginning we check if Chats Collection is empty by using `.count()` operator.
Then we provide few chats with one message each.

We also bundled Message with a Chat using `chatId` property.

## UI

Since Meteor's API requires us to share some of the code in both client and server, we have to import all the collections on the client-side too.

We also want to provide that data to the component:

[{]: <helper> (diff_step 3.18)
#### Step 3.18: Added the chats with the last message using RxJS operators

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

As you can see, we moved `chats` property initialization to `ngOnInit`,  one of the Angular's lifehooks.
It's being called when Component is initalized.

Here comes a quick lesson of RxJS.

Since `Chats.find()` returns an `Observable` we can take advantage of that and bundle it with `Messages.find()` to look for last messages of each chat. This way everything will work as a one body, one Observable.

So what's really going on there?

#### Find chats

First thing is to get all the chats by using `Chats.find({})`.

The result of it will be an array of `Chat` objects.

Let's use `map` operator to make a space for adding the last messages.

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

For each chat we need to find the last message.
We can achieve this by calling `Messages.find` with proper selector and options.

Let's go through each element of the `chats` property to call `Messages.find`.

```js
const chatsWithMessages = chats.map(chat => Messages.find(/* selector, options*/));
```

That returns an array of Observables.

We need to create a selector.
We have to look for a message that is a part of required chat:

```js
{
    chatId: chat._id
}
```

Okay, but we need only one, last message. Let's sort them by `createdAt`:

```js
{
    sort: {
        createdAt: -1
    }
}
```

This way we get them sorted from newest to oldest.

We look for just one, so selector will look like this:

```js
{
    sort: {
        createdAt: -1
    },
    limit: 1
}
```

Now we can add the last message to the chat.

```js
Messages.find(/*...*/)
    .map(messages => {
        if (messages) chat.lastMessage = messages[0];
        return chat;
    })
```

Great! But what if there are no messages? Wouldn't it emit a value at all?

RxJS contains a operator called `startWith`. It allows to emit some value before Messages.find beings to emit messages.
This way we avoid the waiting for non existing message.

The result:

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

#### Combine those two

Last thing to do is to handle the array of Observables we created (`chatsWithMessages`).

Yet again, RxJS comes with a rescue. We will use `combineLatest` which takes few Observables and combines them into one Observable.

It works like this:

```js
const source1 = /* an Observable */
const source2 = /* an Observable */

Observable.combineLatest(source1, source2);
```

This combination returns an array of both results (`result`). So the first item of that array will come from `source1` (`result[0]`), second from `source2` (`result[1]`).

Let's see how it applies to our example:

```js
Observable.combineLatest(...chatsWithMessages);
```

We used `...array` because `Observable.combineLatest` expects arguments, not a single one that with an array of Observables.

To merge that observable into `Chats.find({})` we need to use `mergeMap` operator instead of `map`:

```js
Chats.find({})
    .mergeMap(chats => Observable.combineLatest(...chatsWithMessages));
```

In Whatsapp we used `chats.map(/*...*/)` directly instead of creating another variables like we did with `chatsWithMessages`.

With all this, we have now Chats with their last messages available in the UI view.

Run the following command in the api directory before running ionic serve:

    $ meteor

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step2.md) | [Next Step >](step4.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #