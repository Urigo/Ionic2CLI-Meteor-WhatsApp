{{#template name="tutorials.messenger.ionic2.step_07.md"}}

Our next step is about adding the ability to create new chats. So far we had the chats list and the users feature, we just need to connect them.

We will open the new chat view using `Ionic`'s modal dialog. The dialog is gonna pop up from the chats view once we click on the icon at the top right corner of the view.

Let's implement the handler first:

{{> DiffBox tutorialName="ionic2-tutorial" step="7.1"}}

And let's bind the event to the view:

{{> DiffBox tutorialName="ionic2-tutorial" step="7.2"}}

The dialog should contain a list of all the users whom chat does not exist yet. Once we click on one of these users we should be demoted to the chats view with the new chat we've just created.

Since we wanna insert a new chat we need to create the corresponding method in the `methods.js` file:

{{> DiffBox tutorialName="ionic2-tutorial" step="7.3"}}

Now that we have the method ready we can go ahead and implement the component for the new chat dialog:

{{> DiffBox tutorialName="ionic2-tutorial" step="7.4"}}

After, we will implement the view template:

{{> DiffBox tutorialName="ionic2-tutorial" step="7.5"}}

And finally we gonna add the stylesheet:

{{> DiffBox tutorialName="ionic2-tutorial" step="7.6"}}

Now we want to get rid of the current data we have, which is just a static data.

So let's stop our `Meteor`'s server and reset the whole app by running:

    $ meteor reset

Let's add some users to the server instead of the old static data:

{{> DiffBox tutorialName="ionic2-tutorial" step="7.7"}}

And now once you enter the new chat dialog you should see all the users we created during the server's initialization:

{{tutorialImage 'ionic2' '8.png' 500}}

{{/template}}