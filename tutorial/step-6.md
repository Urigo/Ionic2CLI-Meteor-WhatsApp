{{#template name="tutorials.messenger.ionic2.step_06.md"}}

On this step we will authenticate and identify users in our app.

Before we go ahead and start extending our app, we will add a few packages which will make our lives a bit less complex when it comes to authentication and users management.

Firt we will update our `api` and add a meteor package called `accounts-phone` which gives us the ability to verify a user using an SMS code:

    $ meteor add okland:accounts-phone

And second, we will update the client, and add authentication packages to it. We will add `accounts-phone` which is the same package we installed in our `api`, only this time it's for the client:

    $ npm install accounts-phone --save

Inorder to make the SMS verification work we will need to create a file locaed in `api/server/sms.js` with the following contents:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.3"}}

Note how we use the `Meteor.settings` object, this means that whenever we run our server we can provide it with a `settings.json` file like so:

    $ meteor run --settings settings.json

For the sake of debugging we gonna write a settings file which might make our life easier, but once your'e in production mode you *shouldn't* use this configuration:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.5"}}

> *NOTE*: If you would like to test the verification with a real phone number, `accouts-phone` provides an easy access for [twilio's API](https://www.twilio.com/), for more information see [accounts-phone's repo](https://github.com/okland/accounts-phone).

For authentication we gonna create the following flow:

- login - Ask for the user's phone number.
- verification - Verify a user's phone number by an SMS authentication.
- profile - Ask a user to pickup its name.

Before we implement the corresponding, we need to identify if a current user is logged in. If so, he is gonna be promoted into the chats view automatically, if not, he is gonna be promoted to the login view and enter a phone number.

Let's apply this feature to our app's main component:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.6"}}

Cool, now that we're set, let's start implementing the views we mentioned earlier. We will start with the login view.

The login view contains an input and a save button, and after the save button has been saved, we should be forwarded to the verification view, right after an SMS has been sent to the entered phone number:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.7"}}

And for the component - the logic is simple. We ask the user to check again his phone number, and then we will use `accounts` API in order to ask for SMS verification:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.8"}}

Now all is left is adding a stylesheet and the login view is ready:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.9"}}

{{> DiffBox tutorialName="ionic2-tutorial" step="6.10"}}

This is how the login view should look like:

{{tutorialImage 'ionic2' '4.png' 500}}

Up next, would be the verification view.

e will use `accounts` API again to verify the user and in case of successful authentication we will transition to the profile view.

Let's implement the component:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.11"}}

The view template:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.12"}}

And the stylesheet:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.13"}}

{{> DiffBox tutorialName="ionic2-tutorial" step="6.14"}}

This is how the verification view should look like:

{{tutorialImage 'ionic2' '5.png' 500}}

The last stage in the authentication flow would be profiling. The profile view provides the ability to enter the user's nickname and profile picture (Which, unfortunately, is not yet implemented in this tutorial).

Since the profile view is responsible for updating the profile we need to implement the corresponding `Meteor` method:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.15"}}

Here's the component:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.16"}}

Notice how we referenced an icon provided to us by `Ionic` as the default profile picture. We need path to be available to us. Everyting that is placed under the `www` dir will be served as is, therefore we can just add a symbolic link which will make all the icons available to be served as public assets:

    $ cd www
    $ ln -s ../node_modules/ionicons/dist/svg

Now let's implement the template:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.18"}}

And the stylesheet:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.19"}}

{{> DiffBox tutorialName="ionic2-tutorial" step="6.20"}}

This is how the profile view should look like:

{{tutorialImage 'ionic2' '6.png' 500}}

Our authentication flow is complete! However there are some few adjustments we need to make before we proceed to the next step.

Now that we have an authentication system, each message should have an owner. Let's add a validation to see if any user is logged in, if so the message document will be inserted with an additional `senderId` field:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.21"}}

And in the messages component instead of determining whenever the message is mine or not by it's parity, we can do that whenever the sender id is the same as the id of the current user logged in:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.22"}}

Now we wanna add the abilities to log-out and edit our profile as well, which are gonna be presented to us using a popover. Let's show a popover any time we press on the options icon in the top right corner of the chats view:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.23"}}

Now let's implement the component for the chats options which will handle the profile editing and logging-out:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.24"}}

And let's implement the view as well:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.25"}}

And ofcourse it needs some style re-adjustments:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.26"}}

As for now, once you click on the options icon in the chats view, the popover should appear in the middle of the screen. To fix it, we simply gonna edit the `scss` file of the chats page:

{{> DiffBox tutorialName="ionic2-tutorial" step="6.27"}}

This should be the final result of the popover:

{{tutorialImage 'ionic2' '7.png' 500}}

We're not gonna implement the `about` option in this tutorial since its unrelevant. If you want you can go ahead and do so using the techniques we learned so far.

{{/template}}