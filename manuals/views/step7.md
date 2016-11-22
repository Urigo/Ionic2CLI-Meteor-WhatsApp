# Step 7: Privacy &amp; security

In this step we gonna take care of the app's security and encapsulation, since we don't want the users to do whatever they want, and we don't want them to be able to see content which is irrelevant for them.

We gonna start by removing a Meteor package named `insecure`.

This package provides the client with the ability to run collection mutation methods. This is a behavior we are not interested in since removing data and creating data should be done in the server and only after certain validations.

Meteor includes this package by default only for development purposes and it should be removed once our app is ready for production.

So let's remove this package by running this command:

    $ meteor remove insecure

With that we're able to add ability to remove chats:

[{]: <helper> (diff_step 7.2)
#### Step 7.2: Define 'removeChat' Method

##### Changed api/server/methods.ts
```diff
@@ -32,6 +32,20 @@
 ┊32┊32┊
 ┊33┊33┊      Chats.insert(chat);
 ┊34┊34┊    },
+┊  ┊35┊    removeChat(chatId: string): void {
+┊  ┊36┊      if (!this.userId) throw new Meteor.Error('unauthorized',
+┊  ┊37┊        'User must be logged-in to remove chat');
+┊  ┊38┊
+┊  ┊39┊      check(chatId, nonEmptyString);
+┊  ┊40┊
+┊  ┊41┊      const chatExists = !!Chats.collection.find(chatId).count();
+┊  ┊42┊
+┊  ┊43┊      if (!chatExists) throw new Meteor.Error('chat-not-exists',
+┊  ┊44┊        'Chat doesn\'t exist');
+┊  ┊45┊
+┊  ┊46┊      Messages.remove({chatId});
+┊  ┊47┊      Chats.remove(chatId);
+┊  ┊48┊    },
 ┊35┊49┊    updateProfile(profile: Profile): void {
 ┊36┊50┊      if (!this.userId) throw new Meteor.Error('unauthorized',
 ┊37┊51┊        'User must be logged-in to create a new chat');
```
[}]: #

Now that we have a dedicated method in the server, we can go ahead and take advantage of in in our app. In the messages page we have two buttons in the navigation bar, one is for sending attachments and one to open the options menu. The options menu is gonna be a pop-over, the same as in the chats page. Let's implement its component, which is gonna be called `MessagesOptionsComponent`:

[{]: <helper> (diff_step 7.3)
#### Step 7.3: Create MessagesOptionsComponent

##### Added src/pages/messages-options/messages-options.ts
```diff
@@ -0,0 +1,74 @@
+┊  ┊ 1┊import { Component } from '@angular/core';
+┊  ┊ 2┊import { NavParams, NavController, ViewController, AlertController } from 'ionic-angular';
+┊  ┊ 3┊import { MeteorObservable } from 'meteor-rxjs';
+┊  ┊ 4┊import { TabsPage } from "../tabs/tabs";
+┊  ┊ 5┊
+┊  ┊ 6┊@Component({
+┊  ┊ 7┊  selector: 'messages-options',
+┊  ┊ 8┊  templateUrl: 'messages-options.html'
+┊  ┊ 9┊})
+┊  ┊10┊export class MessagesOptionsComponent {
+┊  ┊11┊  constructor(
+┊  ┊12┊    public navCtrl: NavController,
+┊  ┊13┊    public viewCtrl: ViewController,
+┊  ┊14┊    public alertCtrl: AlertController,
+┊  ┊15┊    public params: NavParams
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
+┊  ┊46┊          this.navCtrl.setRoot(TabsPage, {}, {
+┊  ┊47┊            animate: true
+┊  ┊48┊          });
+┊  ┊49┊        });
+┊  ┊50┊      },
+┊  ┊51┊      error: (e: Error) => {
+┊  ┊52┊        alert.dismiss().then(() => {
+┊  ┊53┊          if (e) return this.handleError(e);
+┊  ┊54┊
+┊  ┊55┊          this.navCtrl.setRoot(TabsPage, {}, {
+┊  ┊56┊            animate: true
+┊  ┊57┊          });
+┊  ┊58┊        });
+┊  ┊59┊      }
+┊  ┊60┊    });
+┊  ┊61┊  }
+┊  ┊62┊
+┊  ┊63┊  private handleError(e: Error): void {
+┊  ┊64┊    console.error(e);
+┊  ┊65┊
+┊  ┊66┊    const alert = this.alertCtrl.create({
+┊  ┊67┊      title: 'Oops!',
+┊  ┊68┊      message: e.message,
+┊  ┊69┊      buttons: ['OK']
+┊  ┊70┊    });
+┊  ┊71┊
+┊  ┊72┊    alert.present();
+┊  ┊73┊  }
+┊  ┊74┊}
```
[}]: #

[{]: <helper> (diff_step 7.4)
#### Step 7.4: Create MessagesOptionsComponent view

##### Added src/pages/messages-options/messages-options.html
```diff
@@ -0,0 +1,8 @@
+┊ ┊1┊<ion-content class="chats-options-page-content">
+┊ ┊2┊  <ion-list class="options">
+┊ ┊3┊    <button ion-item class="option option-remove" (click)="remove()">
+┊ ┊4┊      <ion-icon name="remove" class="option-icon"></ion-icon>
+┊ ┊5┊      <div class="option-name">Remove</div>
+┊ ┊6┊    </button>
+┊ ┊7┊  </ion-list>
+┊ ┊8┊</ion-content>
```
[}]: #

[{]: <helper> (diff_step 7.5)
#### Step 7.5: Create MessagesOptionsComponent view style

##### Added src/pages/messages-options/messages-options.scss
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

[{]: <helper> (diff_step 7.6)
#### Step 7.6: Register the component

##### Changed src/app/app.module.ts
```diff
@@ -10,6 +10,7 @@
 ┊10┊10┊import { ProfileComponent } from "../pages/profile/profile";
 ┊11┊11┊import { ChatsOptionsComponent } from "../pages/chat-options/chat-options";
 ┊12┊12┊import { NewChatComponent } from "../pages/new-chat/new-chat";
+┊  ┊13┊import { MessagesOptionsComponent } from "../pages/messages-options/messages-options";
 ┊13┊14┊
 ┊14┊15┊@NgModule({
 ┊15┊16┊  declarations: [
```
```diff
@@ -22,6 +23,7 @@
 ┊22┊23┊    ProfileComponent,
 ┊23┊24┊    ChatsOptionsComponent,
 ┊24┊25┊    NewChatComponent,
+┊  ┊26┊    MessagesOptionsComponent
 ┊25┊27┊  ],
 ┊26┊28┊  imports: [
 ┊27┊29┊    IonicModule.forRoot(MyApp),
```
```diff
@@ -37,7 +39,8 @@
 ┊37┊39┊    VerificationComponent,
 ┊38┊40┊    ProfileComponent,
 ┊39┊41┊    ChatsOptionsComponent,
-┊40┊  ┊    NewChatComponent
+┊  ┊42┊    NewChatComponent,
+┊  ┊43┊    MessagesOptionsComponent
 ┊41┊44┊  ],
 ┊42┊45┊  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
 ┊43┊46┊})
```
[}]: #

Now we can go ahead and implement the method in the messages page for showing this popover:

[{]: <helper> (diff_step 7.7)
#### Step 7.7: Define component's method to open options

##### Changed src/pages/messages/messages.ts
```diff
@@ -1,9 +1,10 @@
-┊ 1┊  ┊import {Component, OnInit, OnDestroy, ElementRef} from "@angular/core";
-┊ 2┊  ┊import { NavParams } from "ionic-angular";
+┊  ┊ 1┊import { Component, OnInit, OnDestroy, ElementRef } from "@angular/core";
+┊  ┊ 2┊import { NavParams, PopoverController } from "ionic-angular";
 ┊ 3┊ 3┊import { Chat, Message } from "api/models/whatsapp-models";
 ┊ 4┊ 4┊import { Messages } from "api/collections/whatsapp-collections";
 ┊ 5┊ 5┊import { Observable } from "rxjs";
 ┊ 6┊ 6┊import { MeteorObservable } from "meteor-rxjs";
+┊  ┊ 7┊import { MessagesOptionsComponent } from "../messages-options/messages-options";
 ┊ 7┊ 8┊
 ┊ 8┊ 9┊@Component({
 ┊ 9┊10┊  selector: "messages-page",
```
```diff
@@ -18,12 +19,21 @@
 ┊18┊19┊  autoScroller: MutationObserver;
 ┊19┊20┊  senderId: string;
 ┊20┊21┊
-┊21┊  ┊  constructor(navParams: NavParams, element: ElementRef) {
+┊  ┊22┊  constructor(navParams: NavParams, element: ElementRef, public popoverCtrl: PopoverController) {
 ┊22┊23┊    this.selectedChat = <Chat>navParams.get('chat');
 ┊23┊24┊    this.title = this.selectedChat.title;
 ┊24┊25┊    this.picture = this.selectedChat.picture;
 ┊25┊26┊    this.senderId = Meteor.userId();
+┊  ┊27┊  }
+┊  ┊28┊
+┊  ┊29┊  showOptions(): void {
+┊  ┊30┊    const popover = this.popoverCtrl.create(MessagesOptionsComponent, {
+┊  ┊31┊      chat: this.selectedChat
+┊  ┊32┊    }, {
+┊  ┊33┊      cssClass: 'options-popover'
+┊  ┊34┊    });
 ┊26┊35┊
+┊  ┊36┊    popover.present();
 ┊27┊37┊  }
 ┊28┊38┊
 ┊29┊39┊  private get messagesPageContent(): Element {
```
[}]: #

And last but not least, let's update our view and bind the event to its handler:

[{]: <helper> (diff_step 7.8)
#### Step 7.8: Implement it in the view

##### Changed src/pages/messages/messages.html
```diff
@@ -8,7 +8,7 @@
 ┊ 8┊ 8┊
 ┊ 9┊ 9┊    <ion-buttons end>
 ┊10┊10┊      <button ion-button icon-only class="attach-button"><ion-icon name="attach"></ion-icon></button>
-┊11┊  ┊      <button ion-button icon-only class="settings-button"><ion-icon name="more"></ion-icon></button>
+┊  ┊11┊      <button ion-button icon-only class="settings-button" (click)="showOptions()"><ion-icon name="more"></ion-icon></button>
 ┊12┊12┊    </ion-buttons>
 ┊13┊13┊  </ion-navbar>
 ┊14┊14┊</ion-header>
```
[}]: #

Now let's use the chat removal method in the chats view once we slide a chat item to the right and press the `remove` button:

[{]: <helper> (diff_step 7.9)
#### Step 7.9: Use chat removal method in cahts component

##### Changed src/pages/chats/chats.ts
```diff
@@ -2,7 +2,7 @@
 ┊2┊2┊import { Observable } from "rxjs";
 ┊3┊3┊import { Chat } from "api/models/whatsapp-models";
 ┊4┊4┊import { Chats, Messages, Users } from "api/collections/whatsapp-collections";
-┊5┊ ┊import { NavController, PopoverController, ModalController } from "ionic-angular";
+┊ ┊5┊import { NavController, PopoverController, ModalController, AlertController } from "ionic-angular";
 ┊6┊6┊import { MessagesPage } from "../messages/messages";
 ┊7┊7┊import { ChatsOptionsComponent } from "../chat-options/chat-options";
 ┊8┊8┊import { NewChatComponent } from "../new-chat/new-chat";
```
```diff
@@ -17,7 +17,8 @@
 ┊17┊17┊  constructor(
 ┊18┊18┊    public navCtrl: NavController,
 ┊19┊19┊    public popoverCtrl: PopoverController,
-┊20┊  ┊    public modalCtrl: ModalController
+┊  ┊20┊    public modalCtrl: ModalController,
+┊  ┊21┊    public alertCtrl: AlertController
 ┊21┊22┊  ) {}
 ┊22┊23┊
 ┊23┊24┊  ngOnInit() {
```
```diff
@@ -71,10 +72,25 @@
 ┊71┊72┊  }
 ┊72┊73┊
 ┊73┊74┊  removeChat(chat: Chat): void {
-┊74┊  ┊    this.chats = this.chats.map<Chat[]>(chatsArray => {
-┊75┊  ┊      const chatIndex = chatsArray.indexOf(chat);
-┊76┊  ┊      chatsArray.splice(chatIndex, 1);
-┊77┊  ┊      return chatsArray;
+┊  ┊75┊    MeteorObservable.call('removeChat', chat._id).subscribe({
+┊  ┊76┊      complete: () => {
+┊  ┊77┊        this.chats = this.chats.zone();
+┊  ┊78┊      },
+┊  ┊79┊      error: (e: Error) => {
+┊  ┊80┊        if (e) this.handleError(e);
+┊  ┊81┊      }
 ┊78┊82┊    });
 ┊79┊83┊  }
+┊  ┊84┊
+┊  ┊85┊  private handleError(e: Error): void {
+┊  ┊86┊    console.error(e);
+┊  ┊87┊
+┊  ┊88┊    const alert = this.alertCtrl.create({
+┊  ┊89┊      title: 'Oops!',
+┊  ┊90┊      message: e.message,
+┊  ┊91┊      buttons: ['OK']
+┊  ┊92┊    });
+┊  ┊93┊
+┊  ┊94┊    alert.present();
+┊  ┊95┊  }
 ┊80┊96┊}
```
[}]: #

Right now all the chats are published to all the clients which is not very good for privacy. Let's fix that.

First thing we need to do in order to stop all the automatic publication of information is to remove the `autopublish` package from the Meteor server:

    $ meteor remove autopublish

Now we need to explicitly define our publications. Let's start by sending the users' information:

[{]: <helper> (diff_step 7.11)
#### Step 7.11: Added users publication

##### Added api/server/publications.ts
```diff
@@ -0,0 +1,17 @@
+┊  ┊ 1┊import { Meteor } from 'meteor/meteor';
+┊  ┊ 2┊import { Mongo } from 'meteor/mongo';
+┊  ┊ 3┊import { Users, Messages, Chats } from '../collections/whatsapp-collections';
+┊  ┊ 4┊import { User, Message, Chat } from 'api/models/whatsapp-models';
+┊  ┊ 5┊
+┊  ┊ 6┊export function initPublications() {
+┊  ┊ 7┊  Meteor.publish('users', function(): Mongo.Cursor<User> {
+┊  ┊ 8┊    if (!this.userId) return;
+┊  ┊ 9┊
+┊  ┊10┊    return Users.collection.find({}, {
+┊  ┊11┊      fields: {
+┊  ┊12┊        profile: 1
+┊  ┊13┊      }
+┊  ┊14┊    });
+┊  ┊15┊  });
+┊  ┊16┊
+┊  ┊17┊}
```
[}]: #

And add the messages:

[{]: <helper> (diff_step 7.12)
#### Step 7.12: Added messages publication

##### Changed api/server/publications.ts
```diff
@@ -14,4 +14,11 @@
 ┊14┊14┊    });
 ┊15┊15┊  });
 ┊16┊16┊
+┊  ┊17┊  Meteor.publish('messages', function(chatId: string): Mongo.Cursor<Message> {
+┊  ┊18┊    if (!this.userId) return;
+┊  ┊19┊    if (!chatId) return;
+┊  ┊20┊
+┊  ┊21┊    return Messages.collection.find({chatId});
+┊  ┊22┊  });
+┊  ┊23┊
 ┊17┊24┊}
```
[}]: #

We will now add the [publish-composite](https://atmospherejs.com/reywood/publish-composite) package which will help us implement joined collection publications.

    $ meteor add reywood:publish-composite

And we will install its typings declarations:

    $ npm install --save @types/meteor-publish-composite

And import them:

[{]: <helper> (diff_step 7.14 files="src/declarations.d.ts")
#### Step 7.14: Add meteor-publish-composite type declarations

##### Changed src/declarations.d.ts
```diff
@@ -13,6 +13,7 @@
 ┊13┊13┊*/
 ┊14┊14┊/// <reference types="meteor-typings" />
 ┊15┊15┊/// <reference types="@types/meteor-accounts-phone" />
+┊  ┊16┊/// <reference types="@types/meteor-publish-composite" />
 ┊16┊17┊/// <reference types="@types/underscore" />
 ┊17┊18┊/// <reference path="../api/models/whatsapp-models.d.ts" />
 ┊18┊19┊declare module '*';
```
[}]: #

Now we will use `Meteor.publishComposite` from the package we installed and create a publication of `Chats`:

[{]: <helper> (diff_step 7.15)
#### Step 7.15: Added chats publication

##### Changed api/server/publications.ts
```diff
@@ -21,4 +21,33 @@
 ┊21┊21┊    return Messages.collection.find({chatId});
 ┊22┊22┊  });
 ┊23┊23┊
+┊  ┊24┊  Meteor.publishComposite('chats', function() {
+┊  ┊25┊    if (!this.userId) return;
+┊  ┊26┊
+┊  ┊27┊    return {
+┊  ┊28┊      find: () => {
+┊  ┊29┊        return Chats.collection.find({memberIds: this.userId});
+┊  ┊30┊      },
+┊  ┊31┊
+┊  ┊32┊      children: [
+┊  ┊33┊        {
+┊  ┊34┊          find: (chat) => {
+┊  ┊35┊            return Messages.collection.find({chatId: chat._id}, {
+┊  ┊36┊              sort: {createdAt: -1},
+┊  ┊37┊              limit: 1
+┊  ┊38┊            });
+┊  ┊39┊          }
+┊  ┊40┊        },
+┊  ┊41┊        {
+┊  ┊42┊          find: (chat) => {
+┊  ┊43┊            return Users.collection.find({
+┊  ┊44┊              _id: {$in: chat.memberIds}
+┊  ┊45┊            }, {
+┊  ┊46┊              fields: {profile: 1}
+┊  ┊47┊            });
+┊  ┊48┊          }
+┊  ┊49┊        }
+┊  ┊50┊      ]
+┊  ┊51┊    };
+┊  ┊52┊  });
 ┊24┊53┊}
```
[}]: #

The chats publication is a composite publication which is made of several nodes. First we gonna find all the relevant chats for the current user logged in. After we have the chats, we gonna return the following cursor for each chat document we found. First we gonna return all the last messages, and second we gonna return all the users we're currently chatting with.

Those publications are still not visible by server, we need to import and run the init method:

[{]: <helper> (diff_step 7.16)
#### Step 7.16: Init publication on server start

##### Changed api/server/main.ts
```diff
@@ -2,10 +2,12 @@
 ┊ 2┊ 2┊import { Meteor } from 'meteor/meteor';
 ┊ 3┊ 3┊import { Accounts } from 'meteor/accounts-base';
 ┊ 4┊ 4┊import { initMethods } from "./methods";
+┊  ┊ 5┊import { initPublications } from "./publications";
 ┊ 5┊ 6┊import { Users } from "../collections/whatsapp-collections";
 ┊ 6┊ 7┊
 ┊ 7┊ 8┊Meteor.startup(() => {
 ┊ 8┊ 9┊  initMethods();
+┊  ┊10┊  initPublications();
 ┊ 9┊11┊
 ┊10┊12┊  if (Meteor.settings) {
 ┊11┊13┊    Object.assign(Accounts._options, Meteor.settings['accounts-phone']);
```
[}]: #

Let's add the subscription for the chats publication in the chats component:

[{]: <helper> (diff_step 7.17)
#### Step 7.17: Subscribe to 'chats'

##### Changed src/pages/chats/chats.ts
```diff
@@ -6,6 +6,7 @@
 ┊ 6┊ 6┊import { MessagesPage } from "../messages/messages";
 ┊ 7┊ 7┊import { ChatsOptionsComponent } from "../chat-options/chat-options";
 ┊ 8┊ 8┊import { NewChatComponent } from "../new-chat/new-chat";
+┊  ┊ 9┊import { MeteorObservable } from 'meteor-rxjs';
 ┊ 9┊10┊
 ┊10┊11┊@Component({
 ┊11┊12┊  templateUrl: 'chats.html'
```
```diff
@@ -24,34 +25,43 @@
 ┊24┊25┊  ngOnInit() {
 ┊25┊26┊    this.senderId = Meteor.userId();
 ┊26┊27┊
-┊27┊  ┊    this.chats = Chats
-┊28┊  ┊      .find({})
-┊29┊  ┊      .mergeMap((chats: Chat[]) =>
-┊30┊  ┊        Observable.combineLatest(
-┊31┊  ┊          ...chats.map((chat: Chat) =>
-┊32┊  ┊            Messages
-┊33┊  ┊              .find({chatId: chat._id})
-┊34┊  ┊              .startWith(null)
-┊35┊  ┊              .map(messages => {
-┊36┊  ┊                if (messages) chat.lastMessage = messages[0];
-┊37┊  ┊                return chat;
-┊38┊  ┊              })
-┊39┊  ┊          )
-┊40┊  ┊        )
-┊41┊  ┊      ).map(chats => {
-┊42┊  ┊        chats.forEach(chat => {
-┊43┊  ┊          chat.title = '';
-┊44┊  ┊          chat.picture = '';
-┊45┊  ┊
-┊46┊  ┊          const receiver = Users.findOne(chat.memberIds.find(memberId => memberId !== this.senderId));
-┊47┊  ┊          if (!receiver) return;
-┊48┊  ┊
-┊49┊  ┊          chat.title = receiver.profile.name;
-┊50┊  ┊          chat.picture = receiver.profile.picture;
-┊51┊  ┊        });
-┊52┊  ┊
-┊53┊  ┊        return chats;
-┊54┊  ┊      }).zone();
+┊  ┊28┊    MeteorObservable.subscribe('chats').subscribe(() => {
+┊  ┊29┊      MeteorObservable.autorun().subscribe(() => {
+┊  ┊30┊        if (this.chats) {
+┊  ┊31┊          this.chats.unsubscribe();
+┊  ┊32┊          this.chats = undefined;
+┊  ┊33┊        }
+┊  ┊34┊
+┊  ┊35┊        this.chats = Chats
+┊  ┊36┊          .find({})
+┊  ┊37┊          .mergeMap((chats: Chat[]) =>
+┊  ┊38┊            Observable.combineLatest(
+┊  ┊39┊              ...chats.map((chat: Chat) =>
+┊  ┊40┊                Messages
+┊  ┊41┊                  .find({chatId: chat._id})
+┊  ┊42┊                  .startWith(null)
+┊  ┊43┊                  .map(messages => {
+┊  ┊44┊                    if (messages) chat.lastMessage = messages[0];
+┊  ┊45┊                    return chat;
+┊  ┊46┊                  })
+┊  ┊47┊              )
+┊  ┊48┊            )
+┊  ┊49┊          ).map(chats => {
+┊  ┊50┊            chats.forEach(chat => {
+┊  ┊51┊              chat.title = '';
+┊  ┊52┊              chat.picture = '';
+┊  ┊53┊
+┊  ┊54┊              const receiver = Users.findOne(chat.memberIds.find(memberId => memberId !== this.senderId));
+┊  ┊55┊              if (!receiver) return;
+┊  ┊56┊
+┊  ┊57┊              chat.title = receiver.profile.name;
+┊  ┊58┊              chat.picture = receiver.profile.picture;
+┊  ┊59┊            });
+┊  ┊60┊
+┊  ┊61┊            return chats;
+┊  ┊62┊          }).zone();
+┊  ┊63┊      });
+┊  ┊64┊    });
 ┊55┊65┊  }
 ┊56┊66┊
 ┊57┊67┊  addChat(): void {
```
[}]: #

The users publication publishes all the users' profiles, and we need to use it in the new chat dialog whenever we wanna create a new chat.

Let's subscribe to the users publication in the new chat component:

[{]: <helper> (diff_step 7.18)
#### Step 7.18: Subscribe to 'users'

##### Changed src/pages/new-chat/new-chat.ts
```diff
@@ -21,8 +21,10 @@
 ┊21┊21┊  }
 ┊22┊22┊
 ┊23┊23┊  ngOnInit() {
-┊24┊  ┊    MeteorObservable.autorun().zone().subscribe(() => {
-┊25┊  ┊      this.users = this.findUsers().zone();
+┊  ┊24┊    MeteorObservable.subscribe('users').subscribe(() => {
+┊  ┊25┊      MeteorObservable.autorun().subscribe(() => {
+┊  ┊26┊        this.users = this.findUsers().zone();
+┊  ┊27┊      });
 ┊26┊28┊    });
 ┊27┊29┊  }
```
[}]: #

The messages publication is responsible for bringing all the relevant messages for a certain chat. This publication is actually parameterized and it requires us to pass a chat id during subscription.

Let's subscribe to the messages publication in the messages component, and pass the current active chat id provided to us by the nav params:

[{]: <helper> (diff_step 7.19)
#### Step 7.19: Subscribe to 'messages'

##### Changed src/pages/messages/messages.ts
```diff
@@ -57,15 +57,19 @@
 ┊57┊57┊  }
 ┊58┊58┊
 ┊59┊59┊  ngOnInit() {
-┊60┊  ┊    this.messages = Messages.find(
-┊61┊  ┊      {chatId: this.selectedChat._id},
-┊62┊  ┊      {sort: {createdAt: 1}}
-┊63┊  ┊    ).map((messages: Message[]) => {
-┊64┊  ┊      messages.forEach((message: Message) => {
-┊65┊  ┊        message.ownership = this.senderId == message.senderId ? 'mine' : 'other';
+┊  ┊60┊    MeteorObservable.subscribe('messages', this.selectedChat._id).subscribe(() => {
+┊  ┊61┊      MeteorObservable.autorun().subscribe(() => {
+┊  ┊62┊        this.messages = Messages.find(
+┊  ┊63┊          {chatId: this.selectedChat._id},
+┊  ┊64┊          {sort: {createdAt: 1}}
+┊  ┊65┊        ).map((messages: Message[]) => {
+┊  ┊66┊          messages.forEach((message: Message) => {
+┊  ┊67┊            message.ownership = this.senderId == message.senderId ? 'mine' : 'other';
+┊  ┊68┊          });
+┊  ┊69┊
+┊  ┊70┊          return messages;
+┊  ┊71┊        });
 ┊66┊72┊      });
-┊67┊  ┊
-┊68┊  ┊      return messages;
 ┊69┊73┊    });
 ┊70┊74┊
 ┊71┊75┊    this.autoScroller = this.autoScroll();
```
[}]: #

[{]: <helper> (nav_step next_ref="https://angular-meteor.com/tutorials/whatsapp2/ionic/1.0.0/summary" prev_ref="https://angular-meteor.com/tutorials/whatsapp2/ionic/1.0.0/chats-mutations")
| [< Previous Step](https://angular-meteor.com/tutorials/whatsapp2/ionic/1.0.0/chats-mutations) | [Next Step >](https://angular-meteor.com/tutorials/whatsapp2/ionic/1.0.0/summary) |
|:--------------------------------|--------------------------------:|
[}]: #

