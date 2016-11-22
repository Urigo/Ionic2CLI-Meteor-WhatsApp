# Meteor Client Side package

We want to have Meteor essentials available in our client so we can interface with our Meteor server. 

We gonna install a package called `meteor-client-side` which gonna provide us with them:

    $ npm install --save meteor-client-side

And let's import it into our project, in the `src/app/main.dev.ts` file:

{{{diff_step 3.2}}}

And `src/app/main.prod.ts`

{{{diff_step 3.3}}}

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

{{{diff_step 3.6 api/.gitignore}}}

Now that we share the same resource there is no need in two `package.json` dependencies specifications, so we can just remove it:

    api$ rm package.json

Since we will be writing our app using Typescript also in the server side, we will need to support it in our Meteor project as well, especially when the client and the server share some of the script files. To add this support let's add the following package to our Meteor project:

    api$ meteor add barbatus:typescript

And because we use TypeScript, let's change the main server file extension from `.js` to `.ts` (`api/server/main.ts`).

And we need to add TypeScript config file also to the server side, so let's add it under `api/tsconfig.json`:

{{{diff_step 3.10}}}

Note that we declared a file called `typings.d.ts` which will load any external TypeScript types, so let's add the file with the required typings:

{{{diff_step 3.11}}}

And we will also need to add some missing package for our server side, so run the following command:

    $ npm install --save @types/meteor
    $ npm install --save @types/underscore
    $ npm install --save babel-runtime
    $ npm install --save meteor-node-stubs
    $ npm install --save meteor-rxjs

Now, in order to have access to the TypeScript interface we created in the previous step also in the server side, let's move the `models` directory into the `api` directory.

> Remember the alias we created in the first step, for `api` directory? this is why we created it! so we can share TypeScript file between the server and the client!

And update the import path in the TypeScript config file of the client side, after moving the directory:

{{{diff_step 3.13}}}

## Collections

In Meteor, we keep data inside `Mongo.Collections`.

This collection is actually a reference to a [MongoDB](http://mongodb.com) collection, and it is provided to us by a Meteor package called [Minimongo](https://guide.meteor.com/collections.html), and it shares almost the same API as a native MongoDB collection.

We can also wrap it with RxJS' `Observables` using [`meteor-rxjs`](http://npmjs.com/package/meteor-rxjs).

That package has been already installed, we installed it earlier in the server side!

Let's create a Collection of Chats and Messages:

{{{diff_step 3.14}}}

## Data fixtures

Since we have Collections, we can now move on to fill them with data and later we will connect that data into the client side.

So first, add a reference to `moment`'s typings deceleration file in the api dir:

{{{diff_step 3.15}}}

And let's create our data fixtures in the server side:

{{{diff_step 3.16}}}

Quick overview.
We use `.collection` to get the actual `Mongo.Collection` instance, this way we avoid using Observables.
At the beginning we check if Chats Collection is empty by using `.count()` operator.
Then we provide few chats with one message each.

We also bundled Message with a Chat using `chatId` property.

## UI

Since Meteor's API requires us to share some of the code in both client and server, we have to import all the collections on the client-side too.

We also want to provide that data to the component:

{{{diff_step 3.18}}}

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
