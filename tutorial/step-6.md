{{#template name="tutorials.whatsapp2.ionic.step_06.md"}}

Our next step is about adding the ability to create new chats. So far we had the chats list and the users feature, we just need to connect them.

We will open the new chat view using Ionic's modal dialog. The dialog is gonna pop up from the chats view once we click on the icon at the top right corner of the view. Let's implement the handler in the chats component first:

{{> DiffBox tutorialName="ionic-tutorial" step="7.1"}}

And let's bind the event to the view:

{{> DiffBox tutorialName="ionic-tutorial" step="7.2"}}

The dialog should contain a list of all the users whom chat does not exist yet. Once we click on one of these users we should be demoted to the chats view with the new chat we've just created.

Since we wanna insert a new chat we need to create the corresponding method in the `methods.ts` file:

{{> DiffBox tutorialName="ionic-tutorial" step="7.3"}}

As you can see, a chat is inserted with an additional `memberIds` feild. Let's update the chat model accordingly:

{{> DiffBox tutorialName="ionic-tutorial" step="7.4"}}

Now that we have the method ready we can go ahead and implement the new chat dialog:

{{> DiffBox tutorialName="ionic-tutorial" step="7.5"}}

{{> DiffBox tutorialName="ionic-tutorial" step="7.6"}}

{{> DiffBox tutorialName="ionic-tutorial" step="7.7"}}

{{> DiffBox tutorialName="ionic-tutorial" step="7.8"}}

Thanks to our new-chat dialog, we can create chats dynamically with no need in initial fabrication. Let's replace the chats fabrication with users fabrication in the Meteor server:

{{> DiffBox tutorialName="ionic-tutorial" step="7.9"}}

Since we changed the data fabrication method, the chat's title and picture are not hardcoded anymore, therefore they should be calculated in the components themselves. Let's calculate those fields in the chats component:

{{> DiffBox tutorialName="ionic-tutorial" step="7.10"}}

{{> DiffBox tutorialName="ionic-tutorial" step="7.11"}}

And in the messages component as well for the active chat:

{{> DiffBox tutorialName="ionic-tutorial" step="7.12"}}

Now we want our changes to take effect. We want to get rid of the fabricated chats in the database, and replace them with users. To do so we need to reset our database. To do so, we need to stop the Meteor server, and type the followin command:

    $ meteor reset

And once we start our server again it should go through the initialization method and fabricate the users.

The fabricated users should appear in the new-chat dialog like so:

> *android* {{tutorialImage 'ionic' 'screenshot-8-md.png' 500}}

> *ios* {{tutorialImage 'ionic' 'screenshot-8-ios.png' 500}}

{{/template}}