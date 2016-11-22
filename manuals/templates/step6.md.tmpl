Our next step is about adding the ability to create new chats. So far we had the chats list and the users feature, we just need to connect them.

We will open the new chat view using Ionic's modal dialog. The dialog is gonna pop up from the chats view once we click on the icon at the top right corner of the view. Let's implement the handler in the chats component first:

{{{diff_step 6.1}}}

And let's bind the event to the view:

{{{diff_step 6.2}}}

The dialog should contain a list of all the users whose chat does not exist yet. Once we click on one of these users we should be demoted to the chats view with the new chat we've just created.

Since we wanna insert a new chat we need to create the corresponding method in the `methods.ts` file:

{{{diff_step 6.3}}}

As you can see, a chat is inserted with an additional `memberIds` field. Let's update the chat model accordingly:

{{{diff_step 6.4}}}

Now, in order to have access to the users collection, we need to wrap it with a `MeteorObservable`:

{{{diff_step 6.5}}}

We're also required to create an interface to the user model so TypeScript will recognize it:

{{{diff_step 6.6}}}

Now that we have the method ready we can go ahead and implement the new chat dialog:

{{{diff_step 6.7}}}

{{{diff_step 6.8}}}

{{{diff_step 6.9}}}

{{{diff_step 6.10}}}

Thanks to our new-chat dialog, we can create chats dynamically with no need in initial fabrication. Let's replace the chats fabrication with users fabrication in the Meteor server:

{{{diff_step 6.11}}}

And let's add the missing import inside the `ChatsPage`:

{{{diff_step 6.12}}}

Since we've changed the data fabrication method, the chat's title and picture are not hardcoded anymore, therefore they should be calculated in the components themselves. Let's calculate those fields in the chats component:

{{{diff_step 6.13}}}

Now we want our changes to take effect. We will reset the database so next time we run our Meteor server the users will be fabricated. To reset the database, first make sure the Meteor server is stopped and then type the following command:

    $ meteor reset

And once we start our server again it should go through the initialization method and fabricate the users.
