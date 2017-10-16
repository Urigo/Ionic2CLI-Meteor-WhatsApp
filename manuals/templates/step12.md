In this step, we will be using `Ionic 2` to pick up some images from our device's gallery, and we will use them to send pictures, and to set our profile picture.

## Image Picker

First, we will a `Cordova` plug-in which will give us the ability to access the gallery:

    $ ionic plugin add cordova-plugin-image-picker

## Meteor FS

Up next, would be adding the ability to store some files in our data-base. This requires us to add 2 `Meteor` packages, called `ufs` and `ufs-gridfs` (Which adds support for `GridFS` operations. See [reference](https://docs.mongodb.com/manual/core/gridfs/)), which will take care of FS operations:

    api$ meteor add jalik:ufs
    api$ meteor add jalik:ufs-gridfs

And be sure to re-bundle the `Meteor` client whenever you make changes in the server:

    $ npm run meteor-client:bundle

## Client Side

Before we proceed to the server, we will add the ability to select and upload pictures in the client. All our picture-related operations will be defined in a single service called `PictureService`; The first bit of this service would be picture-selection. The `UploadFS` package already supports that feature, **but only for the browser**, therefore we will be using the `Cordova` plug-in we've just installed to select some pictures from our mobile device:

{{{diff_step 12.3}}}

In order to use the service we will need to import it in the app's `NgModule` as a `provider`:

{{{diff_step 12.4}}}

Since now we will be sending pictures, we will need to update the message schema to support picture typed messages:

{{{diff_step 12.5}}}

In the attachments menu, we will add a new handler for sending pictures, called `sendPicture`:

{{{diff_step 12.6}}}

And we will bind that handler to the view, so whenever we press the right button, the handler will be invoked with the selected picture:

{{{diff_step 12.7}}}

Now we will be extending the `MessagesPage`, by adding a method which will send the picture selected in the attachments menu:

{{{diff_step 12.8}}}

For now, we will add a stub for the `upload` method in the `PictureService` and we will get back to it once we finish implementing the necessary logic in the server for storing a picture:

{{{diff_step 12.9}}}

## Server Side

So as we said, need to handle storage of pictures that were sent by the client. First, we will create a `Picture` model so the compiler can recognize a picture object:

{{{diff_step 12.10}}}

If you're familiar with `Whatsapp`, you'll know that sent pictures are compressed. That's so the data-base can store more pictures, and the traffic in the network will be faster. To compress the sent pictures, we will be using an `NPM` package called [sharp](https://www.npmjs.com/package/sharp), which is a utility library which will help us perform transformations on pictures:

    $ meteor npm install --save sharp

> Be sure to use `meteor npm` and not `npm`, and that's because we wanna make sure that `sharp` is compatible with the server.

Now we will create a picture store which will compress pictures using `sharp` right before they are inserted into the data-base:

{{{diff_step 12.12}}}

You can look at a store as some sort of a wrapper for a collection, which will run different kind of a operations before it mutates it or fetches data from it. Note that we used `GridFS` because this way an uploaded file is split into multiple packets, which is more efficient for storage. We also defined a small utility function on that store which will retrieve a profile picture. If the ID was not found, it will return a link for the default picture. To make things convenient, we will also export the store from the `index` file:

{{{diff_step 12.13}}}

Now that we have the pictures store, and the server knows how to handle uploaded pictures, we will implement the `upload` stub in the `PictureService`:

{{{diff_step 12.14}}}

Since `sharp` is a server-only package, and it is not supported by the client, at all, we will replace it with an empty dummy-object so errors won't occur. This requires us to change the `Webpack` config as shown below:

{{{diff_step 12.15}}}

## View Picture Messages

We will now add the support for picture typed messages in the `MessagesPage`, so whenever we send a picture, we will be able to see them in the messages list like any other message:

{{{diff_step 12.16}}}

As you can see, we also bound the picture message to the `click` event, which means that whenever we click on it, a picture viewer should be opened with the clicked picture. Let's create the component for that picture viewer:

{{{diff_step 12.17}}}

{{{diff_step 12.18}}}

{{{diff_step 12.19}}}

{{{diff_step 12.20}}}

And now that we have that component ready, we will implement the `showPicture` method in the `MessagesPage` component, which will create a new instance of the `ShowPictureComponent`:

{{{diff_step 12.21}}}

## Profile Picture

We have the ability to send picture messages. Now we will add the ability to change the user's profile picture using the infrastructure we've just created. To begin with, we will define a new property to our `User` model called `pictureId`, which will be used to determine the belonging profile picture of the current user:

{{{diff_step 12.22}}}

We will bind the editing button in the profile selection page into an event handler:

{{{diff_step 12.23}}}

And we will add all the missing logic in the component, so the `pictureId` will be transformed into and actual reference, and so we can have the ability to select a picture from our gallery and upload it:

{{{diff_step 12.24}}}

We will also define a new hook in the `Meteor.users` collection so whenever we update the profile picture, the previous one will be removed from the data-base. This way we won't have some unnecessary data in our data-base, which will save us some precious storage:

{{{diff_step 12.25}}}

Collection hooks are not part of `Meteor`'s official API and are added through a third-party package called `matb33:collection-hooks`. This requires us to install the necessary type definition:

    $ npm install --save-dev @types/meteor-collection-hooks

Now we need to import the type definition we've just installed in the `tsconfig.json` file:

{{{diff_step 12.27}}}

We now add a `user` publication which should be subscribed whenever we initialize the `ProfilePage`. This subscription should fetch some data from other collections which is related to the user which is currently logged in; And to be more specific, the document associated with the `profileId` defined in the `User` model:

{{{diff_step 12.28}}}

We will also modify the `users` and `chats` publication, so each user will contain its corresponding picture document as well:

{{{diff_step 12.29}}}

{{{diff_step 12.10}}}

Since we already set up some collection hooks on the users collection, we can take it a step further by defining collection hooks on the chat collection, so whenever a chat is being removed, all its corresponding messages will be removed as well:

{{{diff_step 12.31}}}

We will now update the `updateProfile` method in the server to accept `pictureId`, so whenever we pick up a new profile picture the server won't reject it:

{{{diff_step 12.32}}}

Now we will update the users fabrication in our server's initialization, so instead of using hard-coded URLs, we will insert them as new documents to the `PicturesCollection`:

{{{diff_step 12.33}}}

To avoid some unexpected behaviors, we will reset our data-base so our server can re-fabricate the data:

    api$ meteor reset

We will now update the `ChatsPage` to add the belonging picture for each chat during transformation:

{{{diff_step 12.34}}}

And we will do the same in the `NewChatComponent`:

{{{diff_step 12.35}}}

{{{diff_step 12.36}}}
