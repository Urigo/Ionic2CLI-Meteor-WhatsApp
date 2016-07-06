{{#template name="tutorials.messenger.ionic2.step_3.md"}}

Now that we've finished making our initial setup, let's dive into the code of our app.

In our app we gonna have 4 tabs, 'Chats', 'Contacts', 'Favorites', 'History', but since we don't want this tutorial to be an overkill we only gonna focus on the chats tab. The rest of the tabs are just for the layout.

Let's edit the tabs template accordingly:

{{> DiffBox tutorialName="ionic2-tutorial" step="3.1"}}

As you can see one of the tabs has a `[root]` attribute set to `chatsTabRoot` property of the component, which basically determines the page that will be shown once we enter this tab. The other tabs are not referencing to any page since they are only exist for the layout and we don't want anything to happen once we click on them.

Let's edit the chats component to have a reference to the chats page:

{{> DiffBox tutorialName="ionic2-tutorial" step="3.2"}}

> *NOTE*: The square brackets around the `[root]` attribute references to the `root` propery of the tab component and is part of new `AngularJS2`'s new template syntax. For more information about `AngularJS2`'s template syntax see [reference](angular.io/docs/dart/latest/guide/template-syntax.html). I'm gonna assume that your'e already familiar with it further in this tutorial.

Before we go ahead and implement the chats page for the chats tab, let's first install an `NPM` package called `Moment` which is a utility library for manipulating the date object:

    $ npm install moment --save

Now that `Moment` is lock and loaded, we will create our chats component and we will use it to create some data stubs:

{{> DiffBox tutorialName="ionic2-tutorial" step="3.3"}}

The data stubs are just a temporary fabricated data which will be used to test our application to see how it reacts with it. You can also look at the documents' scheme and figure out how our application is gonna look like.

Each should have a template. Our chats should be presented in a list (`ion-list`), and once we click on one of the chat items (`ion-item`), we will be promoted into it's messages page. The chats data set can be iterated in the view using a special directive called `*ngFor` provided to us by `AngularJS2`.

If we put it all together it should look like so:

{{> DiffBox tutorialName="ionic2-tutorial" step="3.4"}}

As for now, our chats' dates are presented in a very messy format which is not very informative for the every-day user. We wanna present it in a calendar format. Therefore we gotta use a calendar pipe, which is provided to us by a library called `angular2-moment`. This library takes some of `Moment`'s date filters and makes them available as pipes.

Let's install it:

    $ npm install angular2-moment --save

And now that we have it, let's import the `CalendarPipe` and provide it:

{{> DiffBox tutorialName="ionic2-tutorial" step="3.6"}}

Now that it is provided we can use it in the template as well:

{{> DiffBox tutorialName="ionic2-tutorial" step="3.7"}}

We would also like to be able to remove a chat by adding a remove button that will appear anytime we slide the item to the left. For this we gonna replace the `ion-item` element inside a element called `ion-item-sliding` and the remove button is gonna be placed inside an `ion-item-options` element.

It should look like so:

{{> DiffBox tutorialName="ionic2-tutorial" step="3.8"}}

Let's add the `removeChat()` method into our component:

{{> DiffBox tutorialName="ionic2-tutorial" step="3.9"}}

And now let's add some style into it:

{{> DiffBox tutorialName="ionic2-tutorial" step="3.10"}}

{{> DiffBox tutorialName="ionic2-tutorial" step="3.11"}}

By now, this is how the chats view should look like:

{{tutorialImage 'ionic2' '1.png' 500}}

And once you swap one of the items to the left, it should look like so:

{{tutorialImage 'ionic2' '2.png' 500}}

{{/template}}