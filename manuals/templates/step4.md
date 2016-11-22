In this step we will add the messages view and the ability to send messages.

Before we implement anything related to the messages pages, we first have to make sure that once we click on a chat item in the chats page, we will be promoted into its corresponding messages view.

Let's first implement the `showMessages()` method in the chats component:

{{{diff_step 4.1}}}

And let's register the click event in the view:

{{{diff_step 4.2}}}

Notice how we used a controller called `NavController`. The NavController is Ionic's new method to navigate in our app, we can also use a traditional router, but since in a mobile app we have no access to the url bar, this might come more in handy. You can read more about the NavController [here](http://ionicframework.com/docs/v2/api/components/nav/NavController/).

Let's go ahead and implement the messages component. We'll call it `MessagesPage`:

{{{diff_step 4.3}}}

As you can see, in order to get the chat's id we used the `NavParams` service. This is a simple service which gives you access to a key-value storage containing all the parameters we've passed using the NavController. For more information about the NavParams service, see the following [link](http://ionicframework.com/docs/v2/api/components/nav/NavParams).

Don't forget that any component you create has to be imported in the app's module:

{{{diff_step 4.4}}}

Now we can complete our `ChatsPage`'s navigation method by importing the `MessagesPage`:

{{{diff_step 4.5}}}

We're missing some important details in the messages page. We don't know who we're chatting with, we don't know how does he look like, and we don't know which message is ours, and which is not. We can add these using the following code snippet:

{{{diff_step 4.6}}}

Since now we're not really able to determine the author of a message, we mark every even message as ours; But later on once we have an authentication system and users, we will be filling the missing gap.

We will also have to update the message model to have an `ownership` property:

{{{diff_step 4.7}}}

Now that we have a basic component, let's implement a messages view as well:

{{{diff_step 4.8}}}

The template consists of a picture and a title inside the navigation bar. It also has two buttons. The purpose of the first button from the left would be sending attachments, and the second one should show an options pop-over, just like in the chats page.

As for the content, we simply used list of messages to show all available messages in the selected chat. To complete the view, let's write its belonging stylesheet:

{{{diff_step 4.9}}}

This style requires us to add some assets. So inside the `src/assets` dir, download the following:

    src/assets$ wget https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/raw/4a48a2fba2ff720b4dd7c903cd9ac68522aff7c7/src/assets/chat-background.jpg
    src/assets$ wget https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/raw/4a48a2fba2ff720b4dd7c903cd9ac68522aff7c7/src/assets/message-mine.png
    src/assets$ wget https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/raw/4a48a2fba2ff720b4dd7c903cd9ac68522aff7c7/src/assets/message-other.png

Now we need to take care of the message's timestamp and format it, then again we gonna use `angular2-moment` only this time we gonna use a different format using the `AmDateFormat` pipe:

{{{diff_step 4.11}}}

Our messages are set, but there is one really important feature missing which would be sending messages. Let's implement our message editor.

We will start with the view itself. We will add an input for editing our messages, a `send` button, and a `record` button whose logic won't be implemented in this tutorial since we only wanna focus on the text messaging system. To fulfill this layout we gonna use a tool-bar (`ion-toolbar`) inside a footer (`ion-footer`) and place it underneath the content of the view:

{{{diff_step 4.12}}}

Our stylesheet requires few adjustments as well:

{{{diff_step 4.13}}}

Now we can implement the handler for messages sending in the component:

{{{diff_step 4.14}}}

As you can see, we've used a Meteor method called `addMessage`, which is yet to exist. This method will add messages to our messages collection and run on both client's local cache and server. Now we're going to create a `server/imports/methods/methods.ts` file in our server and implement the method's logic:

{{{diff_step 4.15}}}

Let's import it and call the initialization function in the main server file:

{{{diff_step 4.16}}}

We would also like to validate some data sent to methods we define. For this we're gonna use a utility package provided to us by Meteor and it's called `check`. It requires us to add this package in the server:

    api$ meteor add check

And we're gonna use it in the `addMessage` method we've just defined:

{{{diff_step 4.18}}}

In addition, we would like the view to auto-scroll down whenever a new message is added. We can achieve that using a native class called [MutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver), which can detect changes in the view:

{{{diff_step 4.19}}}

Why didn't we update the scrolling position on a Meter computation? That's because we want to initiate the scrolling function once the **view** is ready, not the **data**. They might look similar, but the difference is crucial.