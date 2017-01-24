# Step 9: Privacy &amp; Subscriptions

In this step we gonna take care of the app's security and encapsulation, since we don't want the users to do whatever they want, and we don't want them to be able to see content which is irrelevant for them.

We gonna start by removing a `Meteor` package named `insecure`. This package provides the client with the ability to run collection mutation methods. This is a behavior we are not interested in since removing data and creating data should be done in the server and only after certain validations. Meteor includes this package by default only for development purposes and it should be removed once our app is ready for production. As said, we will remove this package by typing the following command:

    api$ meteor remove insecure

## Secure Mutations

Since we enabled restrictions to run certain operations on data-collections directly from the client, we will need to define a method on the server which will handle each of these. By calling these methods, we will be able to manipulate the data the way we want, but not directly. The first method we're going to take care of would be the `removeChat` method, which will handle, obviously, chat removals by given ID:

[{]: <helper> (diffStep "9.2")

#### [Step 9.2: Add removeChat method on server side](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/796f9498)

##### Changed api&#x2F;server&#x2F;methods.ts
```diff
@@ -37,6 +37,23 @@
 ┊37┊37┊
 ┊38┊38┊    Chats.insert(chat);
 ┊39┊39┊  },
+┊  ┊40┊  removeChat(chatId: string): void {
+┊  ┊41┊    if (!this.userId) {
+┊  ┊42┊      throw new Meteor.Error('unauthorized',
+┊  ┊43┊        'User must be logged-in to remove chat');
+┊  ┊44┊    }
+┊  ┊45┊
+┊  ┊46┊    check(chatId, nonEmptyString);
+┊  ┊47┊
+┊  ┊48┊    const chatExists = !!Chats.collection.find(chatId).count();
+┊  ┊49┊
+┊  ┊50┊    if (!chatExists) {
+┊  ┊51┊      throw new Meteor.Error('chat-not-exists',
+┊  ┊52┊        'Chat doesn\'t exist');
+┊  ┊53┊    }
+┊  ┊54┊
+┊  ┊55┊    Chats.remove(chatId);
+┊  ┊56┊  },
 ┊40┊57┊  updateProfile(profile: Profile): void {
 ┊41┊58┊    if (!this.userId) throw new Meteor.Error('unauthorized',
 ┊42┊59┊      'User must be logged-in to create a new chat');
```

[}]: #

We will carefully replace the removal method invocation in the `ChatsPage` with the method we've just defined:

[{]: <helper> (diffStep "9.3")

#### [Step 9.3: Use removeChat on client side](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/77521b2d)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
```diff
@@ -1,7 +1,7 @@
 ┊1┊1┊import { Component, OnInit } from '@angular/core';
 ┊2┊2┊import { Chats, Messages, Users } from 'api/collections';
 ┊3┊3┊import { Chat, Message } from 'api/models';
-┊4┊ ┊import { NavController, PopoverController, ModalController } from 'ionic-angular';
+┊ ┊4┊import { NavController, PopoverController, ModalController, AlertController } from 'ionic-angular';
 ┊5┊5┊import { MeteorObservable } from 'meteor-rxjs';
 ┊6┊6┊import { Observable, Subscriber } from 'rxjs';
 ┊7┊7┊import { MessagesPage } from '../messages/messages';
```
```diff
@@ -18,7 +18,8 @@
 ┊18┊18┊  constructor(
 ┊19┊19┊    private navCtrl: NavController,
 ┊20┊20┊    private popoverCtrl: PopoverController,
-┊21┊  ┊    private modalCtrl: ModalController) {
+┊  ┊21┊    private modalCtrl: ModalController,
+┊  ┊22┊    private alertCtrl: AlertController) {
 ┊22┊23┊    this.senderId = Meteor.userId();
 ┊23┊24┊  }
 ┊24┊25┊
```
```diff
@@ -90,8 +91,25 @@
 ┊ 90┊ 91┊  }
 ┊ 91┊ 92┊
 ┊ 92┊ 93┊  removeChat(chat: Chat): void {
-┊ 93┊   ┊    Chats.remove({_id: chat._id}).subscribe(() => {
+┊   ┊ 94┊    MeteorObservable.call('removeChat', chat._id).subscribe({
+┊   ┊ 95┊      error: (e: Error) => {
+┊   ┊ 96┊        if (e) {
+┊   ┊ 97┊          this.handleError(e);
+┊   ┊ 98┊        }
+┊   ┊ 99┊      }
+┊   ┊100┊    });
+┊   ┊101┊  }
+┊   ┊102┊
+┊   ┊103┊  handleError(e: Error): void {
+┊   ┊104┊    console.error(e);
+┊   ┊105┊
+┊   ┊106┊    const alert = this.alertCtrl.create({
+┊   ┊107┊      buttons: ['OK'],
+┊   ┊108┊      message: e.message,
+┊   ┊109┊      title: 'Oops!'
 ┊ 94┊110┊    });
+┊   ┊111┊
+┊   ┊112┊    alert.present();
 ┊ 95┊113┊  }
 ┊ 96┊114┊
 ┊ 97┊115┊  showOptions(): void {
```

[}]: #

In the `MessagesPage` we have options icon presented as three periods at the right side of the navigation bar. We will now implement this option menu which should pop-over once clicked. We will start by implementing its corresponding component called `MessagesOptionsComponent`, along with its view-template, style-sheet, and necessary importations:

[{]: <helper> (diffStep "9.4")

#### [Step 9.4: Add message options component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/897966be)

##### Added src&#x2F;pages&#x2F;messages&#x2F;messages-options.ts
```diff
@@ -0,0 +1,76 @@
+┊  ┊ 1┊import { Component } from '@angular/core';
+┊  ┊ 2┊import { AlertController, NavController, NavParams, ViewController } from 'ionic-angular';
+┊  ┊ 3┊import { MeteorObservable } from 'meteor-rxjs';
+┊  ┊ 4┊import { ChatsPage } from '../chats/chats';
+┊  ┊ 5┊
+┊  ┊ 6┊@Component({
+┊  ┊ 7┊  selector: 'messages-options',
+┊  ┊ 8┊  templateUrl: 'messages-options.html'
+┊  ┊ 9┊})
+┊  ┊10┊export class MessagesOptionsComponent {
+┊  ┊11┊  constructor(
+┊  ┊12┊    public alertCtrl: AlertController,
+┊  ┊13┊    public navCtrl: NavController,
+┊  ┊14┊    public params: NavParams,
+┊  ┊15┊    public viewCtrl: ViewController
+┊  ┊16┊  ) {}
+┊  ┊17┊
+┊  ┊18┊  remove(): void {
+┊  ┊19┊    const alert = this.alertCtrl.create({
+┊  ┊20┊      title: 'Remove',
+┊  ┊21┊      message: 'Are you sure you would like to proceed?',
+┊  ┊22┊      buttons: [
+┊  ┊23┊        {
+┊  ┊24┊          text: 'Cancel',
+┊  ┊25┊          role: 'cancel'
+┊  ┊26┊        },
+┊  ┊27┊        {
+┊  ┊28┊          text: 'Yes',
+┊  ┊29┊          handler: () => {
+┊  ┊30┊            this.handleRemove(alert);
+┊  ┊31┊            return false;
+┊  ┊32┊          }
+┊  ┊33┊        }
+┊  ┊34┊      ]
+┊  ┊35┊    });
+┊  ┊36┊
+┊  ┊37┊    this.viewCtrl.dismiss().then(() => {
+┊  ┊38┊      alert.present();
+┊  ┊39┊    });
+┊  ┊40┊  }
+┊  ┊41┊
+┊  ┊42┊  private handleRemove(alert): void {
+┊  ┊43┊    MeteorObservable.call('removeChat', this.params.get('chat')._id).subscribe({
+┊  ┊44┊      next: () => {
+┊  ┊45┊        alert.dismiss().then(() => {
+┊  ┊46┊          this.navCtrl.setRoot(ChatsPage, {}, {
+┊  ┊47┊            animate: true
+┊  ┊48┊          });
+┊  ┊49┊        });
+┊  ┊50┊      },
+┊  ┊51┊      error: (e: Error) => {
+┊  ┊52┊        alert.dismiss().then(() => {
+┊  ┊53┊          if (e) {
+┊  ┊54┊            return this.handleError(e);
+┊  ┊55┊          }
+┊  ┊56┊
+┊  ┊57┊          this.navCtrl.setRoot(ChatsPage, {}, {
+┊  ┊58┊            animate: true
+┊  ┊59┊          });
+┊  ┊60┊        });
+┊  ┊61┊      }
+┊  ┊62┊    });
+┊  ┊63┊  }
+┊  ┊64┊
+┊  ┊65┊  private handleError(e: Error): void {
+┊  ┊66┊    console.error(e);
+┊  ┊67┊
+┊  ┊68┊    const alert = this.alertCtrl.create({
+┊  ┊69┊      title: 'Oops!',
+┊  ┊70┊      message: e.message,
+┊  ┊71┊      buttons: ['OK']
+┊  ┊72┊    });
+┊  ┊73┊
+┊  ┊74┊    alert.present();
+┊  ┊75┊  }
+┊  ┊76┊}
```

[}]: #

[{]: <helper> (diffStep "9.5")

#### [Step 9.5: Add messages options template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/e7dcfd7d)

##### Added src&#x2F;pages&#x2F;messages&#x2F;messages-options.html
```diff
@@ -0,0 +1,8 @@
+┊ ┊1┊<ion-content class="chats-options-page-content">
+┊ ┊2┊  <ion-list class="options">
+┊ ┊3┊    <button ion-item class="option option-remove" (click)="remove()">
+┊ ┊4┊      <ion-icon name="trash" class="option-icon"></ion-icon>
+┊ ┊5┊      <div class="option-name">Remove</div>
+┊ ┊6┊    </button>
+┊ ┊7┊  </ion-list>
+┊ ┊8┊</ion-content>
```

[}]: #

[{]: <helper> (diffStep "9.6")

#### [Step 9.6: Add message options styles](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/4e39aed9)

##### Added src&#x2F;pages&#x2F;messages&#x2F;messages-options.scss
```diff
@@ -0,0 +1,13 @@
+┊  ┊ 1┊.chats-options-page-content {
+┊  ┊ 2┊  .options {
+┊  ┊ 3┊    margin: 0;
+┊  ┊ 4┊  }
+┊  ┊ 5┊
+┊  ┊ 6┊  .option-name {
+┊  ┊ 7┊    float: left;
+┊  ┊ 8┊  }
+┊  ┊ 9┊
+┊  ┊10┊  .option-icon {
+┊  ┊11┊    float: right;
+┊  ┊12┊  }
+┊  ┊13┊}
```

[}]: #

[{]: <helper> (diffStep "9.7")

#### [Step 9.7: Import messages options component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/12144335)

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -9,6 +9,7 @@
 ┊ 9┊ 9┊import { ChatsOptionsComponent } from '../pages/chats/chats-options';
 ┊10┊10┊import { LoginPage } from '../pages/login/login';
 ┊11┊11┊import { MessagesPage } from '../pages/messages/messages';
+┊  ┊12┊import { MessagesOptionsComponent } from '../pages/messages/messages-options';
 ┊12┊13┊import { ProfilePage } from '../pages/profile/profile';
 ┊13┊14┊import { VerificationPage } from '../pages/verification/verification';
 ┊14┊15┊import { PhoneService } from '../services/phone';
```
```diff
@@ -23,7 +24,8 @@
 ┊23┊24┊    VerificationPage,
 ┊24┊25┊    ProfilePage,
 ┊25┊26┊    ChatsOptionsComponent,
-┊26┊  ┊    NewChatComponent
+┊  ┊27┊    NewChatComponent,
+┊  ┊28┊    MessagesOptionsComponent
 ┊27┊29┊  ],
 ┊28┊30┊  imports: [
 ┊29┊31┊    BrowserModule,
```
```diff
@@ -39,7 +41,8 @@
 ┊39┊41┊    VerificationPage,
 ┊40┊42┊    ProfilePage,
 ┊41┊43┊    ChatsOptionsComponent,
-┊42┊  ┊    NewChatComponent
+┊  ┊44┊    NewChatComponent,
+┊  ┊45┊    MessagesOptionsComponent
 ┊43┊46┊  ],
 ┊44┊47┊  providers: [
 ┊45┊48┊    StatusBar,
```

[}]: #

Now that the component is ready, we will implement the handler in the `MessagesPage` which will actually show it, using the `PopoverController`:

[{]: <helper> (diffStep "9.8")

#### [Step 9.8: Implemente showOptions method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/10d73b1f)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
```diff
@@ -1,10 +1,11 @@
 ┊ 1┊ 1┊import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
-┊ 2┊  ┊import { NavParams } from 'ionic-angular';
+┊  ┊ 2┊import { NavParams, PopoverController } from 'ionic-angular';
 ┊ 3┊ 3┊import { Chat, Message, MessageType } from 'api/models';
 ┊ 4┊ 4┊import { Messages } from 'api/collections';
 ┊ 5┊ 5┊import { MeteorObservable } from 'meteor-rxjs';
 ┊ 6┊ 6┊import * as moment from 'moment';
 ┊ 7┊ 7┊import * as _ from 'lodash';
+┊  ┊ 8┊import { MessagesOptionsComponent } from './messages-options';
 ┊ 8┊ 9┊
 ┊ 9┊10┊@Component({
 ┊10┊11┊  selector: 'messages-page',
```
```diff
@@ -22,7 +23,8 @@
 ┊22┊23┊
 ┊23┊24┊  constructor(
 ┊24┊25┊    navParams: NavParams,
-┊25┊  ┊    private el: ElementRef
+┊  ┊26┊    private el: ElementRef,
+┊  ┊27┊    private popoverCtrl: PopoverController
 ┊26┊28┊  ) {
 ┊27┊29┊    this.selectedChat = <Chat>navParams.get('chat');
 ┊28┊30┊    this.title = this.selectedChat.title;
```
```diff
@@ -56,6 +58,16 @@
 ┊56┊58┊    this.messagesDayGroups = this.findMessagesDayGroups();
 ┊57┊59┊  }
 ┊58┊60┊
+┊  ┊61┊  showOptions(): void {
+┊  ┊62┊    const popover = this.popoverCtrl.create(MessagesOptionsComponent, {
+┊  ┊63┊      chat: this.selectedChat
+┊  ┊64┊    }, {
+┊  ┊65┊      cssClass: 'options-popover messages-options-popover'
+┊  ┊66┊    });
+┊  ┊67┊
+┊  ┊68┊    popover.present();
+┊  ┊69┊  }
+┊  ┊70┊
 ┊59┊71┊  findMessagesDayGroups() {
 ┊60┊72┊    return Messages.find({
 ┊61┊73┊      chatId: this.selectedChat._id
```

[}]: #

And we will bind the handler for the view so any time we press on the `options` button the event will be trigger the handler:

[{]: <helper> (diffStep "9.9")

#### [Step 9.9: Bind showOptions to messages options button](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/011b5c92)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.html
```diff
@@ -8,7 +8,7 @@
 ┊ 8┊ 8┊
 ┊ 9┊ 9┊    <ion-buttons end>
 ┊10┊10┊      <button ion-button icon-only class="attach-button"><ion-icon name="attach"></ion-icon></button>
-┊11┊  ┊      <button ion-button icon-only class="options-button"><ion-icon name="more"></ion-icon></button>
+┊  ┊11┊      <button ion-button icon-only class="options-button" (click)="showOptions()"><ion-icon name="more"></ion-icon></button>
 ┊12┊12┊    </ion-buttons>
 ┊13┊13┊  </ion-navbar>
 ┊14┊14┊</ion-header>
```

[}]: #

Right now all the chats are published to all the clients which is not very good for privacy, and it's inefficient since the entire data-base is being fetched automatically rather than fetching only the data which is necessary for the current view. This behavior occurs because of a `Meteor` package, which is installed by default for development purposes, called `autopublish`. To get rid of the auto-publishing behavior we will need to get rid of the `autopublish` package as well:

    api$ meteor remove autopublish

This requires us to explicitly define our publications. We will start with the `users` publication which will be used in the `NewChatComponent` to fetch all the users who we can potentially chat with:

[{]: <helper> (diffStep "9.11")

#### [Step 9.11: Add users publication](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/5f970ebb)

##### Added api&#x2F;server&#x2F;publications.ts
```diff
@@ -0,0 +1,14 @@
+┊  ┊ 1┊import { User } from './models';
+┊  ┊ 2┊import { Users } from './collections/users';
+┊  ┊ 3┊
+┊  ┊ 4┊Meteor.publish('users', function(): Mongo.Cursor<User> {
+┊  ┊ 5┊  if (!this.userId) {
+┊  ┊ 6┊    return;
+┊  ┊ 7┊  }
+┊  ┊ 8┊
+┊  ┊ 9┊  return Users.collection.find({}, {
+┊  ┊10┊    fields: {
+┊  ┊11┊      profile: 1
+┊  ┊12┊    }
+┊  ┊13┊  });
+┊  ┊14┊});
```

[}]: #

The second publication we're going to implement would be the `messages` publication which will be used in the `MessagesPage`:

[{]: <helper> (diffStep "9.12")

#### [Step 9.12: Publish messages](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/8d7ef377)

##### Changed api&#x2F;server&#x2F;publications.ts
```diff
@@ -1,5 +1,6 @@
-┊1┊ ┊import { User } from './models';
+┊ ┊1┊import { User, Message } from './models';
 ┊2┊2┊import { Users } from './collections/users';
+┊ ┊3┊import { Messages } from './collections/messages';
 ┊3┊4┊
 ┊4┊5┊Meteor.publish('users', function(): Mongo.Cursor<User> {
 ┊5┊6┊  if (!this.userId) {
```
```diff
@@ -12,3 +13,15 @@
 ┊12┊13┊    }
 ┊13┊14┊  });
 ┊14┊15┊});
+┊  ┊16┊
+┊  ┊17┊Meteor.publish('messages', function(chatId: string): Mongo.Cursor<Message> {
+┊  ┊18┊  if (!this.userId || !chatId) {
+┊  ┊19┊    return;
+┊  ┊20┊  }
+┊  ┊21┊
+┊  ┊22┊  return Messages.collection.find({
+┊  ┊23┊    chatId
+┊  ┊24┊  }, {
+┊  ┊25┊    sort: { createdAt: -1 }
+┊  ┊26┊  });
+┊  ┊27┊});
```

[}]: #

As you see, all our publications so far are only focused on fetching data from a single collection. We will now add the [publish-composite](https://atmospherejs.com/reywood/publish-composite) package which will help us implement joined collection publications:

    api$ meteor add reywood:publish-composite

We will install the package's declarations as well so the compiler can recognize the extensions made in `Meteor`'s API:

    $ npm install --save-dev @types/meteor-publish-composite

And we will import the declarations by adding the following field in the `tsconfig` file:

[{]: <helper> (diffStep "9.15")

#### [Step 9.15: Import @types/meteor-publish-composite](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/6db29a13)

##### Changed api&#x2F;tsconfig.json
```diff
@@ -17,7 +17,8 @@
 ┊17┊17┊    "noImplicitAny": false,
 ┊18┊18┊    "types": [
 ┊19┊19┊      "@types/meteor",
-┊20┊  ┊      "@types/meteor-accounts-phone"
+┊  ┊20┊      "@types/meteor-accounts-phone",
+┊  ┊21┊      "@types/meteor-publish-composite"
 ┊21┊22┊    ]
 ┊22┊23┊  },
 ┊23┊24┊  "exclude": [
```

[}]: #

Now we will implement our first composite-publication, called `chats`. Why exactly does the `chats` publication has to count on multiple collections? That's because we're relying on multiple collections when presenting the data in the `ChatsPage`:

- **ChatsCollection** - Used to retrieve the actual information for each chat.
- **MessagesCollection** - Used to retrieve the last message for the corresponding chat.
- **UsersCollection** - Used to retrieve the receiver's information for the corresponding chat.

To implement this composite publication we will use the `Meteor.publishComposite` method:

[{]: <helper> (diffStep "9.16")

#### [Step 9.16: Implement chats publication](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/b5b1da65)

##### Changed api&#x2F;server&#x2F;publications.ts
```diff
@@ -1,6 +1,7 @@
-┊1┊ ┊import { User, Message } from './models';
+┊ ┊1┊import { User, Message, Chat } from './models';
 ┊2┊2┊import { Users } from './collections/users';
 ┊3┊3┊import { Messages } from './collections/messages';
+┊ ┊4┊import { Chats } from './collections/chats';
 ┊4┊5┊
 ┊5┊6┊Meteor.publish('users', function(): Mongo.Cursor<User> {
 ┊6┊7┊  if (!this.userId) {
```
```diff
@@ -25,3 +26,35 @@
 ┊25┊26┊    sort: { createdAt: -1 }
 ┊26┊27┊  });
 ┊27┊28┊});
+┊  ┊29┊
+┊  ┊30┊Meteor.publishComposite('chats', function(): PublishCompositeConfig<Chat> {
+┊  ┊31┊  if (!this.userId) {
+┊  ┊32┊    return;
+┊  ┊33┊  }
+┊  ┊34┊
+┊  ┊35┊  return {
+┊  ┊36┊    find: () => {
+┊  ┊37┊      return Chats.collection.find({ memberIds: this.userId });
+┊  ┊38┊    },
+┊  ┊39┊
+┊  ┊40┊    children: [
+┊  ┊41┊      <PublishCompositeConfig1<Chat, Message>> {
+┊  ┊42┊        find: (chat) => {
+┊  ┊43┊          return Messages.collection.find({ chatId: chat._id }, {
+┊  ┊44┊            sort: { createdAt: -1 },
+┊  ┊45┊            limit: 1
+┊  ┊46┊          });
+┊  ┊47┊        }
+┊  ┊48┊      },
+┊  ┊49┊      <PublishCompositeConfig1<Chat, User>> {
+┊  ┊50┊        find: (chat) => {
+┊  ┊51┊          return Users.collection.find({
+┊  ┊52┊            _id: { $in: chat.memberIds }
+┊  ┊53┊          }, {
+┊  ┊54┊            fields: { profile: 1 }
+┊  ┊55┊          });
+┊  ┊56┊        }
+┊  ┊57┊      }
+┊  ┊58┊    ]
+┊  ┊59┊  };
+┊  ┊60┊});
```

[}]: #

The `chats` publication is made out of several nodes, which are structured according to the list above.

We finished with all the necessary publications for now, all is left to do is using them. The usages of these publications are called `subscriptions`, so whenever we subscribe to a publication, we will fetch the data exported by it, and then we can run queries of this data in our client, as we desire.

The first subscription we're going to make would be the `users` subscription in the `NewChatComponent`, so whenever we open the dialog a subscription should be made:

[{]: <helper> (diffStep "9.17")

#### [Step 9.17: Subscribe to users](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/6c8162c5)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;new-chat.ts
```diff
@@ -40,7 +40,13 @@
 ┊40┊40┊  }
 ┊41┊41┊
 ┊42┊42┊  loadUsers(): void {
-┊43┊  ┊    this.users = this.findUsers();
+┊  ┊43┊    // Fetch all users matching search pattern
+┊  ┊44┊    const subscription = MeteorObservable.subscribe('users');
+┊  ┊45┊    const autorun = MeteorObservable.autorun();
+┊  ┊46┊
+┊  ┊47┊    Observable.merge(subscription, autorun).subscribe(() => {
+┊  ┊48┊      this.users = this.findUsers();
+┊  ┊49┊    });
 ┊44┊50┊  }
 ┊45┊51┊
 ┊46┊52┊  findUsers(): Observable<User[]> {
```

[}]: #

The second subscription we're going to define would be the `chats` subscription in the `ChatsPage`, this way we will have the necessary data to work with when presenting the users we're chatting with:

[{]: <helper> (diffStep "9.18")

#### [Step 9.18: Subscribe to chats](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/53d58987)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
```diff
@@ -29,7 +29,11 @@
 ┊29┊29┊  }
 ┊30┊30┊
 ┊31┊31┊  ngOnInit() {
-┊32┊  ┊    this.chats = this.findChats();
+┊  ┊32┊    MeteorObservable.subscribe('chats').subscribe(() => {
+┊  ┊33┊      MeteorObservable.autorun().subscribe(() => {
+┊  ┊34┊        this.chats = this.findChats();
+┊  ┊35┊      });
+┊  ┊36┊    });
 ┊33┊37┊  }
 ┊34┊38┊
 ┊35┊39┊  findChats(): Observable<Chat[]> {
```

[}]: #

The `messages` publication is responsible for bringing all the relevant messages for a certain chat. Unlike the other two publications, this publication is actually parameterized and it requires us to pass a chat id during subscription. Let's subscribe to the `messages` publication in the `MessagesPage`, and pass the current active chat ID provided to us by the navigation parameters:

[{]: <helper> (diffStep "9.19")

#### [Step 9.19: Subscribe to messages](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/e2793434)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
```diff
@@ -6,6 +6,7 @@
 ┊ 6┊ 6┊import * as moment from 'moment';
 ┊ 7┊ 7┊import * as _ from 'lodash';
 ┊ 8┊ 8┊import { MessagesOptionsComponent } from './messages-options';
+┊  ┊ 9┊import { Subscription } from 'rxjs';
 ┊ 9┊10┊
 ┊10┊11┊@Component({
 ┊11┊12┊  selector: 'messages-page',
```
```diff
@@ -20,6 +21,8 @@
 ┊20┊21┊  autoScroller: MutationObserver;
 ┊21┊22┊  scrollOffset = 0;
 ┊22┊23┊  senderId: string;
+┊  ┊24┊  loadingMessages: boolean;
+┊  ┊25┊  messagesComputation: Subscription;
 ┊23┊26┊
 ┊24┊27┊  constructor(
 ┊25┊28┊    navParams: NavParams,
```
```diff
@@ -53,9 +56,32 @@
 ┊53┊56┊    this.autoScroller.disconnect();
 ┊54┊57┊  }
 ┊55┊58┊
-┊56┊  ┊  subscribeMessages() {
+┊  ┊59┊  // Subscribes to the relevant set of messages
+┊  ┊60┊  subscribeMessages(): void {
+┊  ┊61┊    // A flag which indicates if there's a subscription in process
+┊  ┊62┊    this.loadingMessages = true;
+┊  ┊63┊    // A custom offset to be used to re-adjust the scrolling position once
+┊  ┊64┊    // new dataset is fetched
 ┊57┊65┊    this.scrollOffset = this.scroller.scrollHeight;
-┊58┊  ┊    this.messagesDayGroups = this.findMessagesDayGroups();
+┊  ┊66┊
+┊  ┊67┊    MeteorObservable.subscribe('messages',
+┊  ┊68┊      this.selectedChat._id
+┊  ┊69┊    ).subscribe(() => {
+┊  ┊70┊      // Keep tracking changes in the dataset and re-render the view
+┊  ┊71┊      if (!this.messagesComputation) {
+┊  ┊72┊        this.messagesComputation = this.autorunMessages();
+┊  ┊73┊      }
+┊  ┊74┊
+┊  ┊75┊      // Allow incoming subscription requests
+┊  ┊76┊      this.loadingMessages = false;
+┊  ┊77┊    });
+┊  ┊78┊  }
+┊  ┊79┊
+┊  ┊80┊  // Detects changes in the messages dataset and re-renders the view
+┊  ┊81┊  autorunMessages(): Subscription {
+┊  ┊82┊    return MeteorObservable.autorun().subscribe(() => {
+┊  ┊83┊      this.messagesDayGroups = this.findMessagesDayGroups();
+┊  ┊84┊    });
 ┊59┊85┊  }
 ┊60┊86┊
 ┊61┊87┊  showOptions(): void {
```
```diff
@@ -113,6 +139,11 @@
 ┊113┊139┊  }
 ┊114┊140┊
 ┊115┊141┊  scrollDown(): void {
+┊   ┊142┊    // Don't scroll down if messages subscription is being loaded
+┊   ┊143┊    if (this.loadingMessages) {
+┊   ┊144┊      return;
+┊   ┊145┊    }
+┊   ┊146┊
 ┊116┊147┊    // Scroll down and apply specified offset
 ┊117┊148┊    this.scroller.scrollTop = this.scroller.scrollHeight - this.scrollOffset;
 ┊118┊149┊    // Zero offset for next invocation
```

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/filter-and-pagination" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/chats-mutations")

| [< Previous Step](https://angular-meteor.com/tutorials/whatsapp2/ionic/chats-mutations) | [Next Step >](https://angular-meteor.com/tutorials/whatsapp2/ionic/filter-and-pagination) |
|:--------------------------------|--------------------------------:|

[}]: #

