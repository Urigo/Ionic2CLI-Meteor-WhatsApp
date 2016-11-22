# Step 6: Chats creation &amp; removal

Our next step is about adding the ability to create new chats. So far we had the chats list and the users feature, we just need to connect them.

We will open the new chat view using Ionic's modal dialog. The dialog is gonna pop up from the chats view once we click on the icon at the top right corner of the view. Let's implement the handler in the chats component first:

[{]: <helper> (diff_step 6.1)
#### Step 6.1: Add 'addChat' method to ChatsComponent

##### Changed src/pages/chats/chats.ts
```diff
@@ -2,7 +2,7 @@
 ┊2┊2┊import { Observable } from "rxjs";
 ┊3┊3┊import { Chat } from "api/models/whatsapp-models";
 ┊4┊4┊import { Chats, Messages } from "api/collections/whatsapp-collections";
-┊5┊ ┊import { NavController, PopoverController } from "ionic-angular";
+┊ ┊5┊import { NavController, PopoverController, ModalController } from "ionic-angular";
 ┊6┊6┊import { MessagesPage } from "../messages/messages";
 ┊7┊7┊import { ChatsOptionsComponent } from "../chat-options/chat-options";
 ┊8┊8┊
```
```diff
@@ -12,9 +12,11 @@
 ┊12┊12┊export class ChatsPage implements OnInit {
 ┊13┊13┊  chats;
 ┊14┊14┊
-┊15┊  ┊  constructor(public navCtrl: NavController, public popoverCtrl: PopoverController) {
-┊16┊  ┊
-┊17┊  ┊  }
+┊  ┊15┊  constructor(
+┊  ┊16┊    public navCtrl: NavController,
+┊  ┊17┊    public popoverCtrl: PopoverController,
+┊  ┊18┊    public modalCtrl: ModalController
+┊  ┊19┊  ) {}
 ┊18┊20┊
 ┊19┊21┊  ngOnInit() {
 ┊20┊22┊    this.chats = Chats
```
```diff
@@ -34,6 +36,11 @@
 ┊34┊36┊      ).zone();
 ┊35┊37┊  }
 ┊36┊38┊
+┊  ┊39┊  addChat(): void {
+┊  ┊40┊    const modal = this.modalCtrl.create(NewChatComponent);
+┊  ┊41┊    modal.present();
+┊  ┊42┊  }
+┊  ┊43┊
 ┊37┊44┊  showOptions(): void {
 ┊38┊45┊    const popover = this.popoverCtrl.create(ChatsOptionsComponent, {}, {
 ┊39┊46┊      cssClass: 'options-popover'
```
[}]: #

And let's bind the event to the view:

[{]: <helper> (diff_step 6.2)
#### Step 6.2: Bind that method

##### Changed src/pages/chats/chats.html
```diff
@@ -4,7 +4,7 @@
 ┊ 4┊ 4┊      Chats
 ┊ 5┊ 5┊    </ion-title>
 ┊ 6┊ 6┊    <ion-buttons end>
-┊ 7┊  ┊      <button ion-button icon-only class="add-chat-button">
+┊  ┊ 7┊      <button ion-button icon-only class="add-chat-button" (click)="addChat()">
 ┊ 8┊ 8┊        <ion-icon name="person-add"></ion-icon>
 ┊ 9┊ 9┊      </button>
 ┊10┊10┊      <button ion-button icon-only class="options-button" (click)="showOptions()">
```
[}]: #

The dialog should contain a list of all the users whose chat does not exist yet. Once we click on one of these users we should be demoted to the chats view with the new chat we've just created.

Since we wanna insert a new chat we need to create the corresponding method in the `methods.ts` file:

[{]: <helper> (diff_step 6.3)
#### Step 6.3: Define 'addChat' Method

##### Changed api/server/methods.ts
```diff
@@ -10,6 +10,28 @@
 ┊10┊10┊
 ┊11┊11┊export function initMethods() {
 ┊12┊12┊  Meteor.methods({
+┊  ┊13┊    addChat(receiverId: string): void {
+┊  ┊14┊      if (!this.userId) throw new Meteor.Error('unauthorized',
+┊  ┊15┊        'User must be logged-in to create a new chat');
+┊  ┊16┊
+┊  ┊17┊      check(receiverId, nonEmptyString);
+┊  ┊18┊
+┊  ┊19┊      if (receiverId == this.userId) throw new Meteor.Error('illegal-receiver',
+┊  ┊20┊        'Receiver must be different than the current logged in user');
+┊  ┊21┊
+┊  ┊22┊      const chatExists = !!Chats.collection.find({
+┊  ┊23┊        memberIds: {$all: [this.userId, receiverId]}
+┊  ┊24┊      }).count();
+┊  ┊25┊
+┊  ┊26┊      if (chatExists) throw new Meteor.Error('chat-exists',
+┊  ┊27┊        'Chat already exists');
+┊  ┊28┊
+┊  ┊29┊      const chat = {
+┊  ┊30┊        memberIds: [this.userId, receiverId]
+┊  ┊31┊      };
+┊  ┊32┊
+┊  ┊33┊      Chats.insert(chat);
+┊  ┊34┊    },
 ┊13┊35┊    updateProfile(profile: Profile): void {
 ┊14┊36┊      if (!this.userId) throw new Meteor.Error('unauthorized',
 ┊15┊37┊        'User must be logged-in to create a new chat');
```
[}]: #

As you can see, a chat is inserted with an additional `memberIds` field. Let's update the chat model accordingly:

[{]: <helper> (diff_step 6.4)
#### Step 6.4: Add memberIds prop in Chat model

##### Changed api/models/whatsapp-models.d.ts
```diff
@@ -9,6 +9,7 @@
 ┊ 9┊ 9┊    title?: string;
 ┊10┊10┊    picture?: string;
 ┊11┊11┊    lastMessage?: Message;
+┊  ┊12┊    memberIds?: string[];
 ┊12┊13┊  }
 ┊13┊14┊
 ┊14┊15┊  interface Message {
```
[}]: #

Now, in order to have access to the users collection, we need to wrap it with a `MeteorObservable`:

[{]: <helper> (diff_step 6.5)
#### Step 6.5: Create Observable collection from Meteor.users

##### Changed api/collections/whatsapp-collections.ts
```diff
@@ -1,4 +1,6 @@
 ┊1┊1┊import { MongoObservable } from "meteor-rxjs";
+┊ ┊2┊import { Meteor } from "meteor/meteor";
 ┊2┊3┊
 ┊3┊4┊export const Chats = new MongoObservable.Collection("chats");
 ┊4┊5┊export const Messages = new MongoObservable.Collection("messages");
+┊ ┊6┊export const Users = MongoObservable.fromExisting(Meteor.users);
```
[}]: #

We're also required to create an interface to the user model so TypeScript will recognize it:

[{]: <helper> (diff_step 6.6)
#### Step 6.6: Create a User model

##### Changed api/models/whatsapp-models.d.ts
```diff
@@ -20,4 +20,8 @@
 ┊20┊20┊    ownership?: string;
 ┊21┊21┊    senderId?: string;
 ┊22┊22┊  }
+┊  ┊23┊
+┊  ┊24┊  interface User extends Meteor.User {
+┊  ┊25┊    profile?: Profile;
+┊  ┊26┊  }
 ┊23┊27┊}
```
[}]: #

Now that we have the method ready we can go ahead and implement the new chat dialog:

[{]: <helper> (diff_step 6.7)
#### Step 6.7: Create NewChatComponent

##### Added src/pages/new-chat/new-chat.ts
```diff
@@ -0,0 +1,74 @@
+┊  ┊ 1┊import { Component, OnInit } from '@angular/core';
+┊  ┊ 2┊import { MeteorObservable, ObservableCursor } from 'meteor-rxjs';
+┊  ┊ 3┊import { NavController, ViewController, AlertController } from 'ionic-angular';
+┊  ┊ 4┊import { Chats, Users } from 'api/collections/whatsapp-collections';
+┊  ┊ 5┊import { User } from 'api/models/whatsapp-models';
+┊  ┊ 6┊
+┊  ┊ 7┊@Component({
+┊  ┊ 8┊  selector: 'new-chat',
+┊  ┊ 9┊  templateUrl: 'new-chat.html'
+┊  ┊10┊})
+┊  ┊11┊export class NewChatComponent implements OnInit {
+┊  ┊12┊  users;
+┊  ┊13┊  senderId: string;
+┊  ┊14┊
+┊  ┊15┊  constructor(
+┊  ┊16┊    public navCtrl: NavController,
+┊  ┊17┊    public viewCtrl: ViewController,
+┊  ┊18┊    public alertCtrl: AlertController
+┊  ┊19┊  ) {
+┊  ┊20┊    this.senderId = Meteor.userId();
+┊  ┊21┊  }
+┊  ┊22┊
+┊  ┊23┊  ngOnInit() {
+┊  ┊24┊    MeteorObservable.autorun().zone().subscribe(() => {
+┊  ┊25┊      this.users = this.findUsers().zone();
+┊  ┊26┊    });
+┊  ┊27┊  }
+┊  ┊28┊
+┊  ┊29┊  addChat(user): void {
+┊  ┊30┊    MeteorObservable.call('addChat', user._id).subscribe({
+┊  ┊31┊      next: () => {
+┊  ┊32┊        this.viewCtrl.dismiss();
+┊  ┊33┊      },
+┊  ┊34┊      error: (e: Error) => {
+┊  ┊35┊        this.viewCtrl.dismiss().then(() => {
+┊  ┊36┊          this.handleError(e);
+┊  ┊37┊        });
+┊  ┊38┊      }
+┊  ┊39┊    });
+┊  ┊40┊  }
+┊  ┊41┊
+┊  ┊42┊  private findUsers(): ObservableCursor<User> {
+┊  ┊43┊    return Chats.find({
+┊  ┊44┊      memberIds: this.senderId
+┊  ┊45┊    }, {
+┊  ┊46┊      fields: {
+┊  ┊47┊        memberIds: 1
+┊  ┊48┊      }
+┊  ┊49┊    })
+┊  ┊50┊      .startWith([]) // empty result
+┊  ┊51┊      .mergeMap((chats) => {
+┊  ┊52┊        const recieverIds = chats
+┊  ┊53┊          .map(({memberIds}) => memberIds)
+┊  ┊54┊          .reduce((result, memberIds) => result.concat(memberIds), [])
+┊  ┊55┊          .concat(this.senderId);
+┊  ┊56┊
+┊  ┊57┊        return Users.find({
+┊  ┊58┊          _id: {$nin: recieverIds}
+┊  ┊59┊        })
+┊  ┊60┊      });
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

[{]: <helper> (diff_step 6.8)
#### Step 6.8: Create NewChatComponent view

##### Added src/pages/new-chat/new-chat.html
```diff
@@ -0,0 +1,18 @@
+┊  ┊ 1┊<ion-header>
+┊  ┊ 2┊  <ion-toolbar color="whatsapp">
+┊  ┊ 3┊    <ion-title>New Chat</ion-title>
+┊  ┊ 4┊
+┊  ┊ 5┊    <ion-buttons end>
+┊  ┊ 6┊      <button ion-button class="dismiss-button" (click)="viewCtrl.dismiss()"><ion-icon name="close"></ion-icon></button>
+┊  ┊ 7┊    </ion-buttons>
+┊  ┊ 8┊  </ion-toolbar>
+┊  ┊ 9┊</ion-header>
+┊  ┊10┊
+┊  ┊11┊<ion-content class="new-chat">
+┊  ┊12┊  <ion-list class="users">
+┊  ┊13┊    <button ion-item *ngFor="let user of users | async" class="user" (click)="addChat(user)">
+┊  ┊14┊      <img class="user-picture" [src]="user.profile.picture">
+┊  ┊15┊      <h2 class="user-name">{{user.profile.name}}</h2>
+┊  ┊16┊    </button>
+┊  ┊17┊  </ion-list>
+┊  ┊18┊</ion-content>
```
[}]: #

[{]: <helper> (diff_step 6.9)
#### Step 6.9: Create NewChatComponent view style

##### Added src/pages/new-chat/new-chat.scss
```diff
@@ -0,0 +1,14 @@
+┊  ┊ 1┊.new-chat {
+┊  ┊ 2┊  .user-picture {
+┊  ┊ 3┊    border-radius: 50%;
+┊  ┊ 4┊    width: 50px;
+┊  ┊ 5┊    float: left;
+┊  ┊ 6┊  }
+┊  ┊ 7┊
+┊  ┊ 8┊  .user-name {
+┊  ┊ 9┊    margin-left: 20px;
+┊  ┊10┊    margin-top: 25px;
+┊  ┊11┊    transform: translate(0, -50%);
+┊  ┊12┊    float: left;
+┊  ┊13┊  }
+┊  ┊14┊}
```
[}]: #

[{]: <helper> (diff_step 6.1)
#### Step 6.1: Add 'addChat' method to ChatsComponent

##### Changed src/pages/chats/chats.ts
```diff
@@ -2,7 +2,7 @@
 ┊2┊2┊import { Observable } from "rxjs";
 ┊3┊3┊import { Chat } from "api/models/whatsapp-models";
 ┊4┊4┊import { Chats, Messages } from "api/collections/whatsapp-collections";
-┊5┊ ┊import { NavController, PopoverController } from "ionic-angular";
+┊ ┊5┊import { NavController, PopoverController, ModalController } from "ionic-angular";
 ┊6┊6┊import { MessagesPage } from "../messages/messages";
 ┊7┊7┊import { ChatsOptionsComponent } from "../chat-options/chat-options";
 ┊8┊8┊
```
```diff
@@ -12,9 +12,11 @@
 ┊12┊12┊export class ChatsPage implements OnInit {
 ┊13┊13┊  chats;
 ┊14┊14┊
-┊15┊  ┊  constructor(public navCtrl: NavController, public popoverCtrl: PopoverController) {
-┊16┊  ┊
-┊17┊  ┊  }
+┊  ┊15┊  constructor(
+┊  ┊16┊    public navCtrl: NavController,
+┊  ┊17┊    public popoverCtrl: PopoverController,
+┊  ┊18┊    public modalCtrl: ModalController
+┊  ┊19┊  ) {}
 ┊18┊20┊
 ┊19┊21┊  ngOnInit() {
 ┊20┊22┊    this.chats = Chats
```
```diff
@@ -34,6 +36,11 @@
 ┊34┊36┊      ).zone();
 ┊35┊37┊  }
 ┊36┊38┊
+┊  ┊39┊  addChat(): void {
+┊  ┊40┊    const modal = this.modalCtrl.create(NewChatComponent);
+┊  ┊41┊    modal.present();
+┊  ┊42┊  }
+┊  ┊43┊
 ┊37┊44┊  showOptions(): void {
 ┊38┊45┊    const popover = this.popoverCtrl.create(ChatsOptionsComponent, {}, {
 ┊39┊46┊      cssClass: 'options-popover'
```
[}]: #

Thanks to our new-chat dialog, we can create chats dynamically with no need in initial fabrication. Let's replace the chats fabrication with users fabrication in the Meteor server:

[{]: <helper> (diff_step 6.11)
#### Step 6.11: Replace chats fabrication with users fabrication

##### Changed api/server/main.ts
```diff
@@ -2,7 +2,7 @@
 ┊2┊2┊import { Meteor } from 'meteor/meteor';
 ┊3┊3┊import { Accounts } from 'meteor/accounts-base';
 ┊4┊4┊import { initMethods } from "./methods";
-┊5┊ ┊import { Chats, Messages } from "../collections/whatsapp-collections";
+┊ ┊5┊import { Users } from "../collections/whatsapp-collections";
 ┊6┊6┊
 ┊7┊7┊Meteor.startup(() => {
 ┊8┊8┊  initMethods();
```
```diff
@@ -12,62 +12,39 @@
 ┊12┊12┊    SMS.twilio = Meteor.settings['twilio'];
 ┊13┊13┊  }
 ┊14┊14┊
-┊15┊  ┊  if (Chats.find({}).cursor.count() === 0) {
-┊16┊  ┊    let chatId;
+┊  ┊15┊  if (Users.collection.find().count()) return;
 ┊17┊16┊
-┊18┊  ┊    chatId = Chats.collection.insert({
-┊19┊  ┊      title: 'Ethan Gonzalez',
+┊  ┊17┊  [{
+┊  ┊18┊    phone: '+972540000001',
+┊  ┊19┊    profile: {
+┊  ┊20┊      name: 'Ethan Gonzalez',
 ┊20┊21┊      picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg'
-┊21┊  ┊    });
-┊22┊  ┊
-┊23┊  ┊    Messages.collection.insert({
-┊24┊  ┊      chatId: chatId,
-┊25┊  ┊      content: 'You on your way?',
-┊26┊  ┊      createdAt: moment().subtract(1, 'hours').toDate()
-┊27┊  ┊    });
-┊28┊  ┊
-┊29┊  ┊    chatId = Chats.collection.insert({
-┊30┊  ┊      title: 'Bryan Wallace',
+┊  ┊22┊    }
+┊  ┊23┊  }, {
+┊  ┊24┊    phone: '+972540000002',
+┊  ┊25┊    profile: {
+┊  ┊26┊      name: 'Bryan Wallace',
 ┊31┊27┊      picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg'
-┊32┊  ┊    });
-┊33┊  ┊
-┊34┊  ┊    Messages.collection.insert({
-┊35┊  ┊      chatId: chatId,
-┊36┊  ┊      content: 'Hey, it\'s me',
-┊37┊  ┊      createdAt: moment().subtract(2, 'hours').toDate()
-┊38┊  ┊    });
-┊39┊  ┊
-┊40┊  ┊    chatId = Chats.collection.insert({
-┊41┊  ┊      title: 'Avery Stewart',
+┊  ┊28┊    }
+┊  ┊29┊  }, {
+┊  ┊30┊    phone: '+972540000003',
+┊  ┊31┊    profile: {
+┊  ┊32┊      name: 'Avery Stewart',
 ┊42┊33┊      picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg'
-┊43┊  ┊    });
-┊44┊  ┊
-┊45┊  ┊    Messages.collection.insert({
-┊46┊  ┊      chatId: chatId,
-┊47┊  ┊      content: 'I should buy a boat',
-┊48┊  ┊      createdAt: moment().subtract(1, 'days').toDate()
-┊49┊  ┊    });
-┊50┊  ┊
-┊51┊  ┊    chatId = Chats.collection.insert({
-┊52┊  ┊      title: 'Katie Peterson',
+┊  ┊34┊    }
+┊  ┊35┊  }, {
+┊  ┊36┊    phone: '+972540000004',
+┊  ┊37┊    profile: {
+┊  ┊38┊      name: 'Katie Peterson',
 ┊53┊39┊      picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg'
-┊54┊  ┊    });
-┊55┊  ┊
-┊56┊  ┊    Messages.collection.insert({
-┊57┊  ┊      chatId: chatId,
-┊58┊  ┊      content: 'Look at my mukluks!',
-┊59┊  ┊      createdAt: moment().subtract(4, 'days').toDate()
-┊60┊  ┊    });
-┊61┊  ┊
-┊62┊  ┊    chatId = Chats.collection.insert({
-┊63┊  ┊      title: 'Ray Edwards',
+┊  ┊40┊    }
+┊  ┊41┊  }, {
+┊  ┊42┊    phone: '+972540000005',
+┊  ┊43┊    profile: {
+┊  ┊44┊      name: 'Ray Edwards',
 ┊64┊45┊      picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg'
-┊65┊  ┊    });
-┊66┊  ┊
-┊67┊  ┊    Messages.collection.insert({
-┊68┊  ┊      chatId: chatId,
-┊69┊  ┊      content: 'This is wicked good ice cream.',
-┊70┊  ┊      createdAt: moment().subtract(2, 'weeks').toDate()
-┊71┊  ┊    });
-┊72┊  ┊  }
+┊  ┊46┊    }
+┊  ┊47┊  }].forEach(user => {
+┊  ┊48┊    Accounts.createUserWithPhone(user);
+┊  ┊49┊  });
 ┊73┊50┊});
```
[}]: #

And let's add the missing import inside the `ChatsPage`:

[{]: <helper> (diff_step 6.12)
#### Step 6.12: Added missing import

##### Changed src/pages/chats/chats.ts
```diff
@@ -5,6 +5,7 @@
 ┊ 5┊ 5┊import { NavController, PopoverController, ModalController } from "ionic-angular";
 ┊ 6┊ 6┊import { MessagesPage } from "../messages/messages";
 ┊ 7┊ 7┊import { ChatsOptionsComponent } from "../chat-options/chat-options";
+┊  ┊ 8┊import { NewChatComponent } from "../new-chat/new-chat";
 ┊ 8┊ 9┊
 ┊ 9┊10┊@Component({
 ┊10┊11┊  templateUrl: 'chats.html'
```
[}]: #

Since we've changed the data fabrication method, the chat's title and picture are not hardcoded anymore, therefore they should be calculated in the components themselves. Let's calculate those fields in the chats component:

[{]: <helper> (diff_step 6.13)
#### Step 6.13: Add title and picture to chat

##### Changed src/pages/chats/chats.ts
```diff
@@ -1,7 +1,7 @@
 ┊1┊1┊import { Component, OnInit } from '@angular/core';
 ┊2┊2┊import { Observable } from "rxjs";
 ┊3┊3┊import { Chat } from "api/models/whatsapp-models";
-┊4┊ ┊import { Chats, Messages } from "api/collections/whatsapp-collections";
+┊ ┊4┊import { Chats, Messages, Users } from "api/collections/whatsapp-collections";
 ┊5┊5┊import { NavController, PopoverController, ModalController } from "ionic-angular";
 ┊6┊6┊import { MessagesPage } from "../messages/messages";
 ┊7┊7┊import { ChatsOptionsComponent } from "../chat-options/chat-options";
```
```diff
@@ -12,6 +12,7 @@
 ┊12┊12┊})
 ┊13┊13┊export class ChatsPage implements OnInit {
 ┊14┊14┊  chats;
+┊  ┊15┊  senderId: string;
 ┊15┊16┊
 ┊16┊17┊  constructor(
 ┊17┊18┊    public navCtrl: NavController,
```
```diff
@@ -20,6 +21,8 @@
 ┊20┊21┊  ) {}
 ┊21┊22┊
 ┊22┊23┊  ngOnInit() {
+┊  ┊24┊    this.senderId = Meteor.userId();
+┊  ┊25┊
 ┊23┊26┊    this.chats = Chats
 ┊24┊27┊      .find({})
 ┊25┊28┊      .mergeMap((chats: Chat[]) =>
```
```diff
@@ -34,7 +37,20 @@
 ┊34┊37┊              })
 ┊35┊38┊          )
 ┊36┊39┊        )
-┊37┊  ┊      ).zone();
+┊  ┊40┊      ).map(chats => {
+┊  ┊41┊        chats.forEach(chat => {
+┊  ┊42┊          chat.title = '';
+┊  ┊43┊          chat.picture = '';
+┊  ┊44┊
+┊  ┊45┊          const receiver = Users.findOne(chat.memberIds.find(memberId => memberId !== this.senderId));
+┊  ┊46┊          if (!receiver) return;
+┊  ┊47┊
+┊  ┊48┊          chat.title = receiver.profile.name;
+┊  ┊49┊          chat.picture = receiver.profile.picture;
+┊  ┊50┊        });
+┊  ┊51┊
+┊  ┊52┊        return chats;
+┊  ┊53┊      }).zone();
 ┊38┊54┊  }
 ┊39┊55┊
 ┊40┊56┊  addChat(): void {
```
[}]: #

Now we want our changes to take effect. We will reset the database so next time we run our Meteor server the users will be fabricated. To reset the database, first make sure the Meteor server is stopped and then type the following command:

    $ meteor reset

And once we start our server again it should go through the initialization method and fabricate the users.

