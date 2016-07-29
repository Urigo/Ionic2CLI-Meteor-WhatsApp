{{#template name="tutorials.whatsapp2.ionic.step_04.md"}}

In this step we will add the messages view and the ability to send messages.

Before we implement anything related to the messages pages, we first have to make sure that once we click on a chat item in the chats page, we will be promoted into its corresponding messages view.

Let's first implement the `showMessages()` method in the chats component

{{> DiffBox tutorialName="ionic-tutorial" step="4.1"}}

And let's register the click event in the view:

{{> DiffBox tutorialName="ionic-tutorial" step="4.2"}}

Notice how we used we used a controller called `NavController`. The NavController is `Ionic`'s new method to navigate in our app, we can also use a traditional router, but since in a mobile app we have no access to the url bar, this might come more in handy. You can read more about the NavController [here](ionicframework.com/docs/v2/api/components/nav/NavController/).

Let's go ahead and implement the messages component.

We need to have some data about the messages, and iterate through it. We will define a cursor on the component, but instead of fetching the entire data in the collection, we only gonna find the messages correlated with the current chat using a simple query. Also we need to determine whenever a message is our's or the reciever's. As for now we gonna do it based on the message's pairity. If it's even, it's gonna be our's, else, it's gonna be the receiver's. The basic component should look like so:

{{> DiffBox tutorialName="ionic-tutorial" step="4.3"}}

We also need to update the message model to contain an `ownership` field:

{{> DiffBox tutorialName="ionic-tutorial" step="4.4"}}

As you can see, inorder to get the chat's id we used the `NavParams` service. This is a simple service which gives you access to a key-value storage containing all the parameters we've passed using the NavController. For more information about the NavParams service, see the following [link](ionicframework.com/docs/v2/api/components/nav/NavParams).

Let's implement the basic messages view template and define a stylesheet:

{{> DiffBox tutorialName="ionic-tutorial" step="4.5"}}

{{> DiffBox tutorialName="ionic-tutorial" step="4.6"}}

{{> DiffBox tutorialName="ionic-tutorial" step="4.7"}}

This style requires us to add some assets, first we will create a copy called `assets` and then we will copy them like so:

    $ mkdir www/assets
    $ cd www/assets
    $ wget https://github.com/DAB0mB/ionic2-meteor-messenger/blob/master/www/assets/chat-background.jpg
    $ wget https://github.com/DAB0mB/ionic2-meteor-messenger/blob/master/www/assets/message-mine.jpg
    $ wget https://github.com/DAB0mB/ionic2-meteor-messenger/blob/master/www/assets/message-other.jpg

Now we need to take care of the message's timestamp and format it, then again we gonna use `angular2-moment` only this time we gonna use a different format using the `DateFormat` pipe:

{{> DiffBox tutorialName="ionic-tutorial" step="4.9"}}

{{> DiffBox tutorialName="ionic-tutorial" step="4.10"}}

> *Note*: The current pipe can be provided with the layout we're intrested in, therefore we provided it with the `HH:MM` parameter ('H' stands for 'hour' and 'M' stands for 'minute'). More information about date formats can be found in [`Moment`'s official website](momentjs.com).

Our messages are set, but there is one really important feature missing and that's sending messages. Let's implement our message editor.

We will start with the view itself. We will add an input for editing our messages, a `send` button, and a `record` button whos logic won't be implemented in this tutorial since we only wanna focus on the text messaging system. To fulfill this layout we gonna use a tool-bar (`ion-toolbar`) inside a footer (`ion-footer`) and place it underneath the content of the view:

{{> DiffBox tutorialName="ionic-tutorial" step="4.11"}}

Our stylesheet requires few adjustments as well:

{{> DiffBox tutorialName="ionic-tutorial" step="4.12"}}

Before we go ahead and implement the logic in the component, we need to implement a method which will add messages to our messages collection and run on both client's local cache and server. Therefore we gonna create a `methods.ts` file in our server and implement the `addMessage()` method:

{{> DiffBox tutorialName="ionic-tutorial" step="4.13"}}

And now since we want it to run on the client as well we need to import it so it can be a part of our bundle:

{{> DiffBox tutorialName="ionic-tutorial" step="4.14"}}

We would also like to validate some data sent to methods we define. For this we gonna use a utility package provided to us by Meteor and it's called `check`. Let's add it to the server:

    $ meteor add check

And we gonna use it in our method we just defined:

{{> DiffBox tutorialName="ionic-tutorial" step="4.16"}}

This package is already included with the `meteor-client-side` package therefore there's no need in installing it again.

Now that our method handler is finally ready, we can go ahead and update our messages component:

{{> DiffBox tutorialName="ionic-tutorial" step="4.17"}}

In addition, we would like the view to auto-scroll down whenever a new message is added. For this we gonna use the [MutationObserver](developer.mozilla.org/en/docs/Web/API/MutationObserver), which lets us detect changes in the DOM whenever a new message item was appended:

{{> DiffBox tutorialName="ionic-tutorial" step="4.18"}}

This is how the messages view should like:

> *android* {{tutorialImage 'ionic' 'screenshot-3-md.png' 500}}

> *ios* {{tutorialImage 'ionic' 'screenshot-3-ios.png' 500}}

{{/template}}