## Meteor Accounts (Server Side)

In this step we will authenticate and identify users in our app.

Before we go ahead and start extending our app, we will add a few packages which will make our lives a bit less complex when it comes to authentication and users management.

First we will update our Meteor server and add few Meteor packages called `accounts-base` and `accounts-phone` which will give us the ability to verify a user using an SMS code, so run the following inside `api` directory:

    $ meteor add accounts-base
    $ meteor add npm-bcrypt
    $ meteor add mys:accounts-phone

For the sake of debugging we gonna write an authentication settings file (`api/private/settings.json`) which might make our life easier, but once your'e in production mode you *shouldn't* use this configuration:

{{{diff_step 5.2}}}

Now anytime we run our app we should provide it with a `settings.json`:

    $ meteor run --settings private/settings.json

To make it simpler we can add `start` script to `package.json`:

{{{diff_step 5.3}}}

> *NOTE*: If you would like to test the verification with a real phone number, `accounts-phone` provides an easy access for [twilio's API](https://www.twilio.com/), for more information see [accounts-phone's repo](https://github.com/okland/accounts-phone).

We will now apply the settings file we've just created so it can actually take effect:

{{{diff_step 5.4}}}

## Meteor Accounts (Client Side)

And second, we will update the client, and add the corresponding authentication packages to it as well (run in the root directory):

    $ npm install accounts-base-client-side --save
    $ npm install accounts-phone --save

Let's import these packages in the app's main component so they can be a part of our bundle:

{{{diff_step 5.5}}}

Install the necessary typings:

    $ npm install @types/meteor-accounts-phone

And import them:

{{{diff_step 5.6 api/typings.d.ts}}}

## UI

For authentication we gonna create the following flow in our app:

- login - The initial page. Ask for the user's phone number.
- verification - Verify a user's phone number by an SMS authentication.
- profile - Ask a user to pickup its name. Afterwards he will be promoted to the tabs page.

Before we implement these page, we need to identify if a user is currently logged in. If so, he will be automatically promoted to the chats view, if not, he is gonna be promoted to the login view and enter a phone number.

Let's apply this feature to our app's NgModule bootstrap:

{{{diff_step 5.8}}}

And to production mode's entry point as well:

{{{diff_step 5.9}}}

Great, now that we're set, let's start implementing the views we mentioned earlier.

Let's start by creating the `LoginComponent`:

In this component we will request an SMS verification right after a phone number has been entered:

{{{diff_step 5.10}}}

Few things to be explained:

- `onInputKeypress` is to catch Enter key press
- `login` method creates an alert (see [documentation](http://ionicframework.com/docs/v2/components/#alert)) to confirm the action
- `handleError` creates an alert with an error message
- `handleLogin` calls `Accounts.requestPhoneVerification` request an SMS verification and moves to verification view.

Okay, the logic is clear. Let's move to the template:

{{{diff_step 5.11}}}

And let's add some styles:

{{{diff_step 5.12}}}

And add the Login Component to the NgModule definition:

{{{diff_step 5.13}}}

Now let's add the ability to identify whih page should be loaded - the main or login:

{{{diff_step 5.14}}}

That's great, everything is set up. We can now move to verification page.

Let's create a component called `VerificationComponent`:

{{{diff_step 5.15}}}

Logic is pretty much the same as in LoginComponent. When verification succeed we redirect user to the `ProfileComponent` (this code is in comment, we will later remove the comment, after we add the actual component):

So let's add the view and the styles:

{{{diff_step 5.16}}}

{{{diff_step 5.17}}}

And add it to the NgModule:

{{{diff_step 5.18}}}

And now that we have the `VerificationComponent` we can use it inside the `LoginComponent`:

{{{diff_step 5.19}}}

Last step of our authentication pattern is to pickup a name.

Let's add a `Profile` interface, we will use it soon:

{{{diff_step 5.20}}}

And let's create the `ProfileComponent`:

{{{diff_step 5.21}}}

The logic is simple, call `updateProfile` (we will implement it soon!) and redirect to `TabsPage` which is our main view if the action succeed.

If you'll take a look at the constructor's logic we set the default profile picture to be one of ionicon's svgs. We need to make sure there is an access point available through the network to that asset. If we'd like to serve files as-is we simply gonna add them to the `www` dir. But first we'll need to update our `.gitignore` file to contain the upcoming changes:

{{{diff_step 5.22}}}

And now that git can recognize our changes, let's add a symlink to `ionicons` in the `www` dir:

{{{diff_step 5.23}}}

There's no component without a view:

{{{diff_step 5.24}}}

And styles:

{{{diff_step 5.25}}}

And add it to the NgModule:

{{{diff_step 5.26}}}

And let's use it in the `VerificationComponent`:

{{{diff_step 5.27}}}


Our authentication flow is complete! However there are some few adjustments we need to make before we proceed to the next step.

For the messaging system, each message should have an owner. If a user is logged-in a message document should be inserted with an additional `senderId` field:

{{{diff_step 5.28}}}

{{{diff_step 5.29}}}

We can determine message ownership inside the component:

{{{diff_step 5.30}}}

Now we're going to add the abilities to log-out and edit our profile as well, which are going to be presented to us using a popover. 

Let's show a popover any time we press on the options icon in the top right corner of the chats view!

Let's start by adding the actual Component that will open on the popover:

{{{diff_step 5.31}}}

> It uses popover functionality from Ionic ([see documentation](http://ionicframework.com/docs/v2/components/#popovers)).

{{{diff_step 5.32}}}

{{{diff_step 5.33}}}

And add it to the NgModule:

{{{diff_step 5.34}}}

Now let's use it inside the `ChatsPage`:

{{{diff_step 5.35}}}

And let's add an event handler in the view:

{{{diff_step 5.36}}}

As for now, once you click on the options icon in the chats view, the popover should appear in the middle of the screen. To fix it, we simply gonna edit the `scss` file of the chats page:

{{{diff_step 5.37}}}

And last, let's implement the server side method (`updateProfile`):

{{{diff_step 5.38}}}
