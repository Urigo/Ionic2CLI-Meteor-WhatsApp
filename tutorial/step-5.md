{{#template name="tutorials.messenger.ionic2.step_05.md"}}

In this step we will add the chat view and the ability to send messages. We still don't have an identity for each user, we will add it later, but we can still send messages to existing chats.

Before we implement anything related to the messages pages, we first have to make sure that once we click on a chat item in the chats page, we will be promoted into its corresponding messages view.

Let's first implement the `showMessages()` method in the chats component

{{> DiffBox tutorialName="ionic2-tutorial" step="5.1"}}

And let's register the click event on the view:

{{> DiffBox tutorialName="ionic2-tutorial" step="5.2"}}

Notice how we used we used a controller called `NavController`. The `NavController` is `Ionic`'s new method to navigate in our app, we can also use a traditional router, but since in a mobile app we have no access to the url bar, this might come more in handy. You can read more about the `NavController` [here](ionicframework.com/docs/v2/api/components/nav/NavController/).

Let's implement the messages component.

we need to have some data about the messages, and iterate through it. We will define a cursor on the component, but instead of fetching the entire data in the collection, we only gonna find the messages correlated with the current chat using a simple query. Also we need to determine whenever a message is our's or the reciever's. As for now we gonna do it based on the message's pairity. If it's even, it's gonna be our's, else, it's gonna be the receiver's.

The basic component should look like so:

{{> DiffBox tutorialName="ionic2-tutorial" step="5.3"}}

As you can see, inorder to get the chat's id we just forwarded we used the `NavParams` service. This is a simple service which let's you get all the parameters you passed using the `NavController`. For more information about the `NavParams` service, see the following [link](ionicframework.com/docs/v2/api/components/nav/NavParams/).

Now that we have a messages cursor on our component, we can go ahead and iterate it through the view, and present each message:

{{> DiffBox tutorialName="ionic2-tutorial" step="5.4"}}

Let's add a basic stylesheet to our messages view:

{{> DiffBox tutorialName="ionic2-tutorial" step="5.5"}}

{{> DiffBox tutorialName="ionic2-tutorial" step="5.6"}}

Now we just need to take care of the message timestamp and format it.

Then again we gonna use `angular2-moment` only this time we gonna use a different format using the `DateFormat` pipe:

{{> DiffBox tutorialName="ionic2-tutorial" step="5.7"}}

{{> DiffBox tutorialName="ionic2-tutorial" step="5.8"}}

> *Note*: The current pipe can be provided with the layout we're intrested in, therefore we provided it with the `HH:MM` parameter ('H' stands for 'hour' and 'M' stands for 'minute'). More information about date formats can be found in [`Moment`'s official website](momentjs.com/).

Our messages are set, but there is one really important feature missing and that's sending messages. Let's implement our message editor.

We will start with the view itself. We will add an input for editing our messages, a `send` button, and a `record` button whos logic won't be implemented in this tutorial since we only wanna focus on the text messaging system.

To fulfill this layout we gonna use a tool-bar (`ion-toolbar`) inside a footer (`ion-footer`) and place in underneath the content of the view:

{{> DiffBox tutorialName="ionic2-tutorial" step="5.9"}}

And ofcourse we need to design the layout:

{{> DiffBox tutorialName="ionic2-tutorial" step="5.10"}}

Before we go ahead and implement the logic in the component, we need to implement a method which will add messages to our messages collection and run on both client's local cache and server. Therefore we gonna create a `methods.js` file in our server and implement the `addMessage()` method:

{{> DiffBox tutorialName="ionic2-tutorial" step="5.11"}}

And now since we want it to run on the client as well we need to import it so it can be a part of our bundle:

{{> DiffBox tutorialName="ionic2-tutorial" step="5.12"}}

We would also like to validate some data sent to methods we define. For this we gonna use a utility package provided to us by `Meteor` and it's called `check`. Let's add it to the server:

    $ cd api
    $ meteor add check

And we gonna use it in our method:

{{> DiffBox tutorialName="ionic2-tutorial" step="5.14"}}

This package is already included with the `meteor-client-side` package therefore there's no need in installing it again.

Now that our method handler is finally ready, we can go ahead and update our messages component:

{{> DiffBox tutorialName="ionic2-tutorial" step="5.15"}}

In addition, we would like the view to auto-scroll down whenever a new message is added. For this we gonna use the [MutationObserver](developer.mozilla.org/en/docs/Web/API/MutationObserver), which lets us detect changes in the DOM whenever a new message item was appended:

{{> DiffBox tutorialName="ionic2-tutorial" step="5.16"}}

This is how the messages view should like:

{{tutorialImage 'ionic2' '3.png' 500}}

{{/template}}