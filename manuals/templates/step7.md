In this step we gonna take care of the app's security and encapsulation, since we don't want the users to do whatever they want, and we don't want them to be able to see content which is irrelevant for them.

We gonna start by removing a Meteor package named `insecure`.

This package provides the client with the ability to run collection mutation methods. This is a behavior we are not interested in since removing data and creating data should be done in the server and only after certain validations.

Meteor includes this package by default only for development purposes and it should be removed once our app is ready for production.

So let's remove this package by running this command:

    $ meteor remove insecure

With that we're able to add ability to remove chats:

{{{diff_step 7.2}}}

Now that we have a dedicated method in the server, we can go ahead and take advantage of in in our app. In the messages page we have two buttons in the navigation bar, one is for sending attachments and one to open the options menu. The options menu is gonna be a pop-over, the same as in the chats page. Let's implement its component, which is gonna be called `MessagesOptionsComponent`:

{{{diff_step 7.3}}}

{{{diff_step 7.4}}}

{{{diff_step 7.5}}}

{{{diff_step 7.6}}}

Now we can go ahead and implement the method in the messages page for showing this popover:

{{{diff_step 7.7}}}

And last but not least, let's update our view and bind the event to its handler:

{{{diff_step 7.8}}}

Now let's use the chat removal method in the chats view once we slide a chat item to the right and press the `remove` button:

{{{diff_step 7.9}}}

Right now all the chats are published to all the clients which is not very good for privacy. Let's fix that.

First thing we need to do in order to stop all the automatic publication of information is to remove the `autopublish` package from the Meteor server:

    $ meteor remove autopublish

Now we need to explicitly define our publications. Let's start by sending the users' information:

{{{diff_step 7.11}}}

And add the messages:

{{{diff_step 7.12}}}

We will now add the [publish-composite](https://atmospherejs.com/reywood/publish-composite) package which will help us implement joined collection publications.

    $ meteor add reywood:publish-composite

And we will install its typings declarations:

    $ npm install --save @types/meteor-publish-composite

And import them:

{{{diff_step 7.14 src/declarations.d.ts}}}

Now we will use `Meteor.publishComposite` from the package we installed and create a publication of `Chats`:

{{{diff_step 7.15}}}

The chats publication is a composite publication which is made of several nodes. First we gonna find all the relevant chats for the current user logged in. After we have the chats, we gonna return the following cursor for each chat document we found. First we gonna return all the last messages, and second we gonna return all the users we're currently chatting with.

Those publications are still not visible by server, we need to import and run the init method:

{{{diff_step 7.16}}}

Let's add the subscription for the chats publication in the chats component:

{{{diff_step 7.17}}}

The users publication publishes all the users' profiles, and we need to use it in the new chat dialog whenever we wanna create a new chat.

Let's subscribe to the users publication in the new chat component:

{{{diff_step 7.18}}}

The messages publication is responsible for bringing all the relevant messages for a certain chat. This publication is actually parameterized and it requires us to pass a chat id during subscription.

Let's subscribe to the messages publication in the messages component, and pass the current active chat id provided to us by the nav params:

{{{diff_step 7.19}}}
