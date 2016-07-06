{{#template name="tutorials.messenger.ionic2.step_08.md"}}

In this step we gonna take care of the app's security and encapsulation, since we don't want the users to do whatever they want, and we don't want them to be able to see content which is unrelevant for them.

We gonna start by removing a `Meteor` package named `insecure`.

This package provides the client with the ability to run collection mutation methods. This is a behavior we are not intrested in since removing data and creating data should be done in the server and only after certain validations.

`Meteor` includes this package by default only for development purposes and it should be removed once our app is ready for production.

So let's remove this package by running this command:

    $ meteor remove insecure

Now that we don't have the ability to remove whatever document we want anymore, we need to update the logic for the `removeChat()` method in our chats component.

First we need to implement the corresponding method in our server:

{{> DiffBox tutorialName="ionic2-tutorial" step="8.1"}}

And now we need to call this method from the component:

{{> DiffBox tutorialName="ionic2-tutorial" step="8.2"}}

Right now all the chats are published to all the clients which is not very safe for privacy. Let's fix that.

First thing we need to do inorder to stop all the automatic publication of information is to remove the `autopublish` package from the `Meteor` server:

    $ meteor remove autopublish

We will add now the [publish-composite](https://atmospherejs.com/reywood/publish-composite) package which will help us implement joined collection pubications.

    $ meteor add reywood:publish-composite

Now we need to explicitly define our publications. Let's start by sending the users' information.

Create a file named `publications.js` under the `api/server` dir with the following contents:

{{> DiffBox tutorialName="ionic2-tutorial" step="8.5"}}

Let's have a brief overview for each of the publications and update the corresponding components to subscribe to them.

The `chats` publication is a composite publication which is made of several nodes. First we gonna find all the relevant chats for the current user logged in. After we have the chats, we gonna return the following cursor for each chat document. First we gonna return all the last messages, and second we gonna return all the users we're currently chatting with.

Let's add the subscription for the `chats` publication in the chats component:

{{> DiffBox tutorialName="ionic2-tutorial" step="8.6"}}

The `users` publication publishes all the users' profiles, and we need to use it in the new chat dialog whenever we wanna create a new chat:

Let's subscribe to the `users` publication in the new chat component:

{{> DiffBox tutorialName="ionic2-tutorial" step="8.7"}}

The `messages` publication is responsible for biringing all the relevant messages for a certain chat. This publication is actually parameterized and it requires us to pass a chat id during subscription.

Let's subscribe to the `users` publication in the messages component, and pass the current active chat id provided to us by the nav params:

{{> DiffBox tutorialName="ionic2-tutorial" step="8.8"}}

{{/template}}