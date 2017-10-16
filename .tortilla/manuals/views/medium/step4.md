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

#### [Step 4.6: Add server&#x27;s tsconfig file](../../../../commit/2c72672)
<br>
##### Added api&#x2F;tsconfig.json
<pre>
<i>@@ -0,0 +1,29 @@</i>
<b>+┊  ┊ 1┊{</b>
<b>+┊  ┊ 2┊  &quot;compilerOptions&quot;: {</b>
<b>+┊  ┊ 3┊    &quot;allowSyntheticDefaultImports&quot;: true,</b>
<b>+┊  ┊ 4┊    &quot;declaration&quot;: false,</b>
<b>+┊  ┊ 5┊    &quot;emitDecoratorMetadata&quot;: true,</b>
<b>+┊  ┊ 6┊    &quot;experimentalDecorators&quot;: true,</b>
<b>+┊  ┊ 7┊    &quot;lib&quot;: [</b>
<b>+┊  ┊ 8┊      &quot;dom&quot;,</b>
<b>+┊  ┊ 9┊      &quot;es2015&quot;</b>
<b>+┊  ┊10┊    ],</b>
<b>+┊  ┊11┊    &quot;module&quot;: &quot;commonjs&quot;,</b>
<b>+┊  ┊12┊    &quot;moduleResolution&quot;: &quot;node&quot;,</b>
<b>+┊  ┊13┊    &quot;sourceMap&quot;: true,</b>
<b>+┊  ┊14┊    &quot;target&quot;: &quot;es5&quot;,</b>
<b>+┊  ┊15┊    &quot;skipLibCheck&quot;: true,</b>
<b>+┊  ┊16┊    &quot;stripInternal&quot;: true,</b>
<b>+┊  ┊17┊    &quot;noImplicitAny&quot;: false,</b>
<b>+┊  ┊18┊    &quot;types&quot;: [</b>
<b>+┊  ┊19┊      &quot;meteor-typings&quot;</b>
<b>+┊  ┊20┊    ]</b>
<b>+┊  ┊21┊  },</b>
<b>+┊  ┊22┊  &quot;exclude&quot;: [</b>
<b>+┊  ┊23┊    &quot;node_modules&quot;</b>
<b>+┊  ┊24┊  ],</b>
<b>+┊  ┊25┊  &quot;compileOnSave&quot;: false,</b>
<b>+┊  ┊26┊  &quot;atom&quot;: {</b>
<b>+┊  ┊27┊    &quot;rewriteTsconfig&quot;: false</b>
<b>+┊  ┊28┊  }</b>
<b>+┊  ┊29┊}</b>
</pre>

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

#### [Step 4.11: Update the models import path](../../../../commit/03e914e)
<br>
##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
<pre>
<i>@@ -1,7 +1,7 @@</i>
 ┊1┊1┊import { Component } from &#x27;@angular/core&#x27;;
 ┊2┊2┊import { Observable } from &#x27;rxjs&#x27;;
 ┊3┊3┊import * as moment from &#x27;moment&#x27;;
<b>+┊ ┊4┊import { Chat, MessageType } from &#x27;api/models&#x27;;</b>
 ┊5┊5┊
 ┊6┊6┊@Component({
 ┊7┊7┊  templateUrl: &#x27;chats.html&#x27;
</pre>

[}]: #

We will also install the `meteor-rxjs` package so we can define collections and data streams and TypeScript definitions for Meteor:

    $ npm install --save meteor-rxjs
    $ npm install --save-dev @types/meteor

## Collections

This collection is actually a reference to a [MongoDB](http://mongodb.com) collection, and it is provided to us by a `Meteor` package called [Minimongo](https://guide.meteor.com/collections.html), and it shares almost the same API as a native `MongoDB` collection. In this tutorial we will be wrapping our collections using `RxJS`'s `Observables`, which is available to us thanks to [meteor-rxjs](http://npmjs.com/package/meteor-rxjs).

Our initial collections are gonna be the chats and messages collection, the one is going to store some chats-models, and the other is going to store messages-models:

[{]: <helper> (diffStep 4.13)

#### [Step 4.13: Create chats collection](../../../../commit/f6b6817)
<br>
##### Added api&#x2F;server&#x2F;collections&#x2F;chats.ts
<pre>
<i>@@ -0,0 +1,4 @@</i>
<b>+┊ ┊1┊import { MongoObservable } from &#x27;meteor-rxjs&#x27;;</b>
<b>+┊ ┊2┊import { Chat } from &#x27;../models&#x27;;</b>
<b>+┊ ┊3┊</b>
<b>+┊ ┊4┊export const Chats &#x3D; new MongoObservable.Collection&lt;Chat&gt;(&#x27;chats&#x27;);</b>
</pre>

[}]: #

[{]: <helper> (diffStep 4.14)

#### [Step 4.14: Added messages collection](../../../../commit/13d0741)
<br>
##### Added api&#x2F;server&#x2F;collections&#x2F;messages.ts
<pre>
<i>@@ -0,0 +1,4 @@</i>
<b>+┊ ┊1┊import { MongoObservable } from &#x27;meteor-rxjs&#x27;;</b>
<b>+┊ ┊2┊import { Message } from &#x27;../models&#x27;;</b>
<b>+┊ ┊3┊</b>
<b>+┊ ┊4┊export const Messages &#x3D; new MongoObservable.Collection&lt;Message&gt;(&#x27;messages&#x27;);</b>
</pre>

[}]: #

We chose to create a dedicated module for each collection, because in the near future there might be more logic added into each one of them. To make importation convenient, we will export all collections from a single file:

[{]: <helper> (diffStep 4.15)

#### [Step 4.15: Added main export file](../../../../commit/62e0c87)
<br>
##### Added api&#x2F;server&#x2F;collections&#x2F;index.ts
<pre>
<i>@@ -0,0 +1,2 @@</i>
<b>+┊ ┊1┊export * from &#x27;./chats&#x27;;</b>
<b>+┊ ┊2┊export * from &#x27;./messages&#x27;;</b>
</pre>

[}]: #

Now instead of requiring each collection individually, we can just require them from the `index.ts` file.

## Data fixtures

Since we have real collections now, and not dummy ones, we will need to fill them up with some data in case they are empty, so we can test our application properly. Let's create our data fixtures in the server:

[{]: <helper> (diffStep 4.16)

#### [Step 4.16: Move stubs data to the server side](../../../../commit/99c12dc)
<br>
##### Changed api&#x2F;server&#x2F;main.ts
<pre>
<i>@@ -1,5 +1,71 @@</i>
 ┊ 1┊ 1┊import { Meteor } from &#x27;meteor/meteor&#x27;;
<b>+┊  ┊ 2┊import { Chats } from &#x27;./collections/chats&#x27;;</b>
<b>+┊  ┊ 3┊import { Messages } from &#x27;./collections/messages&#x27;;</b>
<b>+┊  ┊ 4┊import * as moment from &#x27;moment&#x27;;</b>
<b>+┊  ┊ 5┊import { MessageType } from &#x27;./models&#x27;;</b>
 ┊ 2┊ 6┊
 ┊ 3┊ 7┊Meteor.startup(() &#x3D;&gt; {
<b>+┊  ┊ 8┊  if (Chats.find({}).cursor.count() &#x3D;&#x3D;&#x3D; 0) {</b>
<b>+┊  ┊ 9┊    let chatId;</b>
<b>+┊  ┊10┊</b>
<b>+┊  ┊11┊    chatId &#x3D; Chats.collection.insert({</b>
<b>+┊  ┊12┊      title: &#x27;Ethan Gonzalez&#x27;,</b>
<b>+┊  ┊13┊      picture: &#x27;https://randomuser.me/api/portraits/thumb/men/1.jpg&#x27;</b>
<b>+┊  ┊14┊    });</b>
<b>+┊  ┊15┊</b>
<b>+┊  ┊16┊    Messages.collection.insert({</b>
<b>+┊  ┊17┊      chatId: chatId,</b>
<b>+┊  ┊18┊      content: &#x27;You on your way?&#x27;,</b>
<b>+┊  ┊19┊      createdAt: moment().subtract(1, &#x27;hours&#x27;).toDate(),</b>
<b>+┊  ┊20┊      type: MessageType.TEXT</b>
<b>+┊  ┊21┊    });</b>
<b>+┊  ┊22┊</b>
<b>+┊  ┊23┊    chatId &#x3D; Chats.collection.insert({</b>
<b>+┊  ┊24┊      title: &#x27;Bryan Wallace&#x27;,</b>
<b>+┊  ┊25┊      picture: &#x27;https://randomuser.me/api/portraits/thumb/lego/1.jpg&#x27;</b>
<b>+┊  ┊26┊    });</b>
<b>+┊  ┊27┊</b>
<b>+┊  ┊28┊    Messages.collection.insert({</b>
<b>+┊  ┊29┊      chatId: chatId,</b>
<b>+┊  ┊30┊      content: &#x27;Hey, it\&#x27;s me&#x27;,</b>
<b>+┊  ┊31┊      createdAt: moment().subtract(2, &#x27;hours&#x27;).toDate(),</b>
<b>+┊  ┊32┊      type: MessageType.TEXT</b>
<b>+┊  ┊33┊    });</b>
<b>+┊  ┊34┊</b>
<b>+┊  ┊35┊    chatId &#x3D; Chats.collection.insert({</b>
<b>+┊  ┊36┊      title: &#x27;Avery Stewart&#x27;,</b>
<b>+┊  ┊37┊      picture: &#x27;https://randomuser.me/api/portraits/thumb/women/1.jpg&#x27;</b>
<b>+┊  ┊38┊    });</b>
<b>+┊  ┊39┊</b>
<b>+┊  ┊40┊    Messages.collection.insert({</b>
<b>+┊  ┊41┊      chatId: chatId,</b>
<b>+┊  ┊42┊      content: &#x27;I should buy a boat&#x27;,</b>
<b>+┊  ┊43┊      createdAt: moment().subtract(1, &#x27;days&#x27;).toDate(),</b>
<b>+┊  ┊44┊      type: MessageType.TEXT</b>
<b>+┊  ┊45┊    });</b>
<b>+┊  ┊46┊</b>
<b>+┊  ┊47┊    chatId &#x3D; Chats.collection.insert({</b>
<b>+┊  ┊48┊      title: &#x27;Katie Peterson&#x27;,</b>
<b>+┊  ┊49┊      picture: &#x27;https://randomuser.me/api/portraits/thumb/women/2.jpg&#x27;</b>
<b>+┊  ┊50┊    });</b>
<b>+┊  ┊51┊</b>
<b>+┊  ┊52┊    Messages.collection.insert({</b>
<b>+┊  ┊53┊      chatId: chatId,</b>
<b>+┊  ┊54┊      content: &#x27;Look at my mukluks!&#x27;,</b>
<b>+┊  ┊55┊      createdAt: moment().subtract(4, &#x27;days&#x27;).toDate(),</b>
<b>+┊  ┊56┊      type: MessageType.TEXT</b>
<b>+┊  ┊57┊    });</b>
<b>+┊  ┊58┊</b>
<b>+┊  ┊59┊    chatId &#x3D; Chats.collection.insert({</b>
<b>+┊  ┊60┊      title: &#x27;Ray Edwards&#x27;,</b>
<b>+┊  ┊61┊      picture: &#x27;https://randomuser.me/api/portraits/thumb/men/2.jpg&#x27;</b>
<b>+┊  ┊62┊    });</b>
<b>+┊  ┊63┊</b>
<b>+┊  ┊64┊    Messages.collection.insert({</b>
<b>+┊  ┊65┊      chatId: chatId,</b>
<b>+┊  ┊66┊      content: &#x27;This is wicked good ice cream.&#x27;,</b>
<b>+┊  ┊67┊      createdAt: moment().subtract(2, &#x27;weeks&#x27;).toDate(),</b>
<b>+┊  ┊68┊      type: MessageType.TEXT</b>
<b>+┊  ┊69┊    });</b>
<b>+┊  ┊70┊  }</b>
 ┊ 5┊71┊});
</pre>

[}]: #

> This behavior is **not** recommended and should be removed once we're ready for production. A conditioned environment variable may also be a great solution

Note how we use the `.collection` property to get the actual `Mongo.Collection` instance. In the `Meteor` server we want to avoid the usage of observables since it uses `fibers`. More information about fibers can be fond [here](https://www.npmjs.com/package/fibers).

## Preparing the Meteor client

In order to connect to the `Meteor` server, we need a client which is capable of doing so. To create a `Meteor` client, we will use a bundler called [meteor-client-bundler](https://github.com/Urigo/meteor-client-bundler). This bundler, bundles all the necessary `Meteor` client script files into a single module. This is very useful when we want to interact with [Atmosphere](https://atmospherejs.com/) packages integrate them our client. To install `meteor-client-bundler`, run the following command:

    $ sudo npm install -g meteor-client-bundler

Now we'll add a bundling script to the `package.json` as followed:

[{]: <helper> (diffStep 4.17)

#### [Step 4.17: Created a script for generating the Meteor client bundle](../../../../commit/8d706c4)
<br>
##### Changed package.json
<pre>
<i>@@ -7,7 +7,8 @@</i>
 ┊ 7┊ 7┊    &quot;clean&quot;: &quot;ionic-app-scripts clean&quot;,
 ┊ 8┊ 8┊    &quot;build&quot;: &quot;ionic-app-scripts build&quot;,
 ┊ 9┊ 9┊    &quot;ionic:build&quot;: &quot;ionic-app-scripts build&quot;,
<b>+┊  ┊10┊    &quot;ionic:serve&quot;: &quot;ionic-app-scripts serve&quot;,</b>
<b>+┊  ┊11┊    &quot;meteor-client:bundle&quot;: &quot;meteor-client bundle -s api&quot;</b>
 ┊11┊12┊  },
 ┊12┊13┊  &quot;dependencies&quot;: {
 ┊13┊14┊    &quot;@angular/common&quot;: &quot;2.2.1&quot;,
</pre>
<pre>
<i>@@ -37,6 +38,7 @@</i>
 ┊37┊38┊    &quot;@types/meteor&quot;: &quot;^1.3.31&quot;,
 ┊38┊39┊    &quot;@types/underscore&quot;: &quot;^1.7.36&quot;,
 ┊39┊40┊    &quot;meteor-typings&quot;: &quot;^1.3.1&quot;,
<b>+┊  ┊41┊    &quot;tmp&quot;: &quot;0.0.31&quot;,</b>
 ┊40┊42┊    &quot;typescript&quot;: &quot;2.0.9&quot;,
 ┊41┊43┊    &quot;typescript-extends&quot;: &quot;^1.0.1&quot;
 ┊42┊44┊  },
</pre>

[}]: #

To execute it, simply run:

    $ npm run meteor-client:bundle

This will generate a file called `meteor-client.js` under the `node_modules` dir, which needs to be imported in our application like so:

[{]: <helper> (diffStep 4.18)

#### [Step 4.18: Import meteor client bundle](../../../../commit/a8562e8)
<br>
##### Changed src&#x2F;app&#x2F;main.ts
<pre>
<i>@@ -1,3 +1,5 @@</i>
<b>+┊ ┊1┊import &#x27;meteor-client&#x27;;</b>
<b>+┊ ┊2┊</b>
 ┊1┊3┊import { platformBrowserDynamic } from &#x27;@angular/platform-browser-dynamic&#x27;;
 ┊2┊4┊
 ┊3┊5┊import { AppModule } from &#x27;./app.module&#x27;;
</pre>

[}]: #

> By default, the client will assume that the server is running at `localhost:3000`. If you'd like to change that, you can simply specify a `--url` option in the `NPM` script. Further information can be found [here](https://github.com/Urigo/meteor-client-bundler).

The client we've just imported gives us the ability to interact with the server. Let's replace the local chats-data with a data which is fetched from the `Meteor` server:

[{]: <helper> (diffStep 4.19)

#### [Step 4.19: Use server side data](../../../../commit/8c8cc3a)
<br>
##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
<pre>
<i>@@ -1,75 +1,37 @@</i>
<b>+┊  ┊ 1┊import { Component, OnInit } from &#x27;@angular/core&#x27;;</b>
<b>+┊  ┊ 2┊import { Chats, Messages } from &#x27;api/collections&#x27;;</b>
<b>+┊  ┊ 3┊import { Chat } from &#x27;api/models&#x27;;</b>
 ┊ 2┊ 4┊import { Observable } from &#x27;rxjs&#x27;;
 ┊ 5┊ 5┊
 ┊ 6┊ 6┊@Component({
 ┊ 7┊ 7┊  templateUrl: &#x27;chats.html&#x27;
 ┊ 8┊ 8┊})
<b>+┊  ┊ 9┊export class ChatsPage implements OnInit {</b>
<b>+┊  ┊10┊  chats;</b>
 ┊11┊11┊
 ┊12┊12┊  constructor() {
 ┊14┊13┊  }
 ┊15┊14┊
<b>+┊  ┊15┊  ngOnInit() {</b>
<b>+┊  ┊16┊    this.chats &#x3D; Chats</b>
<b>+┊  ┊17┊      .find({})</b>
<b>+┊  ┊18┊      .mergeMap((chats: Chat[]) &#x3D;&gt;</b>
<b>+┊  ┊19┊        Observable.combineLatest(</b>
<b>+┊  ┊20┊          ...chats.map((chat: Chat) &#x3D;&gt;</b>
<b>+┊  ┊21┊            Messages</b>
<b>+┊  ┊22┊              .find({chatId: chat._id})</b>
<b>+┊  ┊23┊              .startWith(null)</b>
<b>+┊  ┊24┊              .map(messages &#x3D;&gt; {</b>
<b>+┊  ┊25┊                if (messages) chat.lastMessage &#x3D; messages[0];</b>
<b>+┊  ┊26┊                return chat;</b>
<b>+┊  ┊27┊              })</b>
<b>+┊  ┊28┊          )</b>
<b>+┊  ┊29┊        )</b>
<b>+┊  ┊30┊      ).zone();</b>
 ┊69┊31┊  }
 ┊70┊32┊
 ┊71┊33┊  removeChat(chat: Chat): void {
<b>+┊  ┊34┊    this.chats &#x3D; this.chats.map(chatsArray &#x3D;&gt; {</b>
 ┊73┊35┊      const chatIndex &#x3D; chatsArray.indexOf(chat);
 ┊74┊36┊      chatsArray.splice(chatIndex, 1);
</pre>

[}]: #

And re-implement the `removeChat` method using the actual `Meteor` collection:

[{]: <helper> (diffStep 4.2)

#### [Step 4.2: Remove old client files](../../../../commit/67a2cc9)
<br>
##### Deleted api&#x2F;client&#x2F;main.css
<pre>
<i>@@ -1 +0,0 @@</i>
</pre>

##### Deleted api&#x2F;client&#x2F;main.html
<pre>
<i>@@ -1,25 +0,0 @@</i>
</pre>

##### Deleted api&#x2F;client&#x2F;main.js
<pre>
<i>@@ -1,22 +0,0 @@</i>
</pre>

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/folder-structure" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/rxjs")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/rxjs">PREVIOUS STEP</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/folder-structure">NEXT STEP</a> ⟹

[}]: #

