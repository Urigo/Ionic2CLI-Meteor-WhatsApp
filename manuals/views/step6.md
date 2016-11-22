[{]: <region> (header)
# Step 6: Chats creation & removal
[}]: #
[{]: <region> (body)
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

The dialog should contain a list of all the users whom chat does not exist yet. Once we click on one of these users we should be demoted to the chats view with the new chat we've just created.

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

Now, in order to have access to the Meteor's Collection of Users, we need to wrap it as a `MeteorObservable` Collection:

[{]: <helper> (diff_step 6.5)
#### Step 6.5: Create Observable collection from Meteor.users

##### Changed api/collections/whatsapp-collections.ts
```diff
@@ -1,4 +1,7 @@
 ┊1┊1┊import { MongoObservable } from "meteor-rxjs";
 ┊2┊2┊
+┊ ┊3┊let Meteor = Package["meteor"].Meteor;
+┊ ┊4┊
 ┊3┊5┊export const Chats = new MongoObservable.Collection("chats");
 ┊4┊6┊export const Messages = new MongoObservable.Collection("messages");
+┊ ┊7┊export const Users = MongoObservable.fromExisting(Meteor.users);
```
[}]: #

> We take Meteor variable from `Package["meteor"].Meteor` because this file is loaded in both client and server, and this is the only way that works with both.

And let's create a TypeScript interface for User objects:

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
@@ -0,0 +1,77 @@
+┊  ┊ 1┊import { Component, OnInit } from '@angular/core';
+┊  ┊ 2┊import { MeteorObservable } from 'meteor-rxjs';
+┊  ┊ 3┊import { NavController, ViewController, AlertController } from 'ionic-angular';
+┊  ┊ 4┊import { Observable } from 'rxjs/Observable';
+┊  ┊ 5┊import { Chats, Users } from 'api/collections/whatsapp-collections';
+┊  ┊ 6┊import { User } from 'api/models/whatsapp-models';
+┊  ┊ 7┊
+┊  ┊ 8┊declare let Meteor;
+┊  ┊ 9┊
+┊  ┊10┊@Component({
+┊  ┊11┊  selector: 'new-chat',
+┊  ┊12┊  templateUrl: 'new-chat.html'
+┊  ┊13┊})
+┊  ┊14┊export class NewChatComponent implements OnInit {
+┊  ┊15┊  users: Observable<User>;
+┊  ┊16┊  senderId: string;
+┊  ┊17┊
+┊  ┊18┊  constructor(
+┊  ┊19┊    public navCtrl: NavController,
+┊  ┊20┊    public viewCtrl: ViewController,
+┊  ┊21┊    public alertCtrl: AlertController
+┊  ┊22┊  ) {
+┊  ┊23┊    this.senderId = Meteor.userId();
+┊  ┊24┊  }
+┊  ┊25┊
+┊  ┊26┊  ngOnInit() {
+┊  ┊27┊    MeteorObservable.autorun().zone().subscribe(() => {
+┊  ┊28┊      this.users = this.findUsers().zone();
+┊  ┊29┊    });
+┊  ┊30┊  }
+┊  ┊31┊
+┊  ┊32┊  addChat(user): void {
+┊  ┊33┊    MeteorObservable.call('addChat', user._id).subscribe({
+┊  ┊34┊      next: () => {
+┊  ┊35┊        this.viewCtrl.dismiss();
+┊  ┊36┊      },
+┊  ┊37┊      error: (e: Error) => {
+┊  ┊38┊        this.viewCtrl.dismiss().then(() => {
+┊  ┊39┊          this.handleError(e)
+┊  ┊40┊        });
+┊  ┊41┊      }
+┊  ┊42┊    });
+┊  ┊43┊  }
+┊  ┊44┊
+┊  ┊45┊  private findUsers(): Observable<User> {
+┊  ┊46┊    return Chats.find({
+┊  ┊47┊      memberIds: this.senderId
+┊  ┊48┊    }, {
+┊  ┊49┊      fields: {
+┊  ┊50┊        memberIds: 1
+┊  ┊51┊      }
+┊  ┊52┊    })
+┊  ┊53┊      .startWith([]) // empty result
+┊  ┊54┊      .mergeMap((chats) => {
+┊  ┊55┊        const recieverIds = chats
+┊  ┊56┊          .map(({memberIds}) => memberIds)
+┊  ┊57┊          .reduce((result, memberIds) => result.concat(memberIds), [])
+┊  ┊58┊          .concat(this.senderId);
+┊  ┊59┊
+┊  ┊60┊        return Users.find({
+┊  ┊61┊          _id: {$nin: recieverIds}
+┊  ┊62┊        })
+┊  ┊63┊      });
+┊  ┊64┊  }
+┊  ┊65┊
+┊  ┊66┊  private handleError(e: Error): void {
+┊  ┊67┊    console.error(e);
+┊  ┊68┊
+┊  ┊69┊    const alert = this.alertCtrl.create({
+┊  ┊70┊      title: 'Oops!',
+┊  ┊71┊      message: e.message,
+┊  ┊72┊      buttons: ['OK']
+┊  ┊73┊    });
+┊  ┊74┊
+┊  ┊75┊    alert.present();
+┊  ┊76┊  }
+┊  ┊77┊}
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

[{]: <helper> (diff_step 6.10)
#### Step 6.10: Register that component

##### Changed src/app/app.module.ts
```diff
@@ -9,6 +9,7 @@
 ┊ 9┊ 9┊import { VerificationComponent } from "../pages/verification/verification";
 ┊10┊10┊import { ProfileComponent } from "../pages/profile/profile";
 ┊11┊11┊import { ChatsOptionsComponent } from "../pages/chat-options/chat-options";
+┊  ┊12┊import { NewChatComponent } from "../pages/new-chat/new-chat";
 ┊12┊13┊
 ┊13┊14┊@NgModule({
 ┊14┊15┊  declarations: [
```
```diff
@@ -19,7 +20,8 @@
 ┊19┊20┊    LoginComponent,
 ┊20┊21┊    VerificationComponent,
 ┊21┊22┊    ProfileComponent,
-┊22┊  ┊    ChatsOptionsComponent
+┊  ┊23┊    ChatsOptionsComponent,
+┊  ┊24┊    NewChatComponent,
 ┊23┊25┊  ],
 ┊24┊26┊  imports: [
 ┊25┊27┊    IonicModule.forRoot(MyApp),
```
```diff
@@ -34,7 +36,8 @@
 ┊34┊36┊    LoginComponent,
 ┊35┊37┊    VerificationComponent,
 ┊36┊38┊    ProfileComponent,
-┊37┊  ┊    ChatsOptionsComponent
+┊  ┊39┊    ChatsOptionsComponent,
+┊  ┊40┊    NewChatComponent
 ┊38┊41┊  ],
 ┊39┊42┊  providers: []
 ┊40┊43┊})
```
[}]: #

Thanks to our new-chat dialog, we can create chats dynamically with no need in initial fabrication. Let's replace the chats fabrication with users fabrication in the Meteor server:

[{]: <helper> (diff_step 6.11)
#### Step 6.11: Replace chats fabrication with users fabrication

##### Changed api/server/main.ts
```diff
@@ -1,6 +1,5 @@
 ┊1┊1┊import { Meteor } from 'meteor/meteor';
-┊2┊ ┊import { Chats, Messages } from "../collections/whatsapp-collections";
-┊3┊ ┊import * as moment from "moment";
+┊ ┊2┊import { Users } from "../collections/whatsapp-collections";
 ┊4┊3┊import { initMethods } from "./methods";
 ┊5┊4┊import { Accounts } from 'meteor/accounts-base';
 ┊6┊5┊
```
```diff
@@ -14,62 +13,39 @@
 ┊14┊13┊    SMS.twilio = Meteor.settings['twilio'];
 ┊15┊14┊  }
 ┊16┊15┊
-┊17┊  ┊  if (Chats.find({}).cursor.count() === 0) {
-┊18┊  ┊    let chatId;
+┊  ┊16┊  if (Users.collection.find().count()) return;
 ┊19┊17┊
-┊20┊  ┊    chatId = Chats.collection.insert({
-┊21┊  ┊      title: 'Ethan Gonzalez',
+┊  ┊18┊  [{
+┊  ┊19┊    phone: '+972540000001',
+┊  ┊20┊    profile: {
+┊  ┊21┊      name: 'Ethan Gonzalez',
 ┊22┊22┊      picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg'
-┊23┊  ┊    });
-┊24┊  ┊
-┊25┊  ┊    Messages.collection.insert({
-┊26┊  ┊      chatId: chatId,
-┊27┊  ┊      content: 'You on your way?',
-┊28┊  ┊      createdAt: moment().subtract(1, 'hours').toDate()
-┊29┊  ┊    });
-┊30┊  ┊
-┊31┊  ┊    chatId = Chats.collection.insert({
-┊32┊  ┊      title: 'Bryan Wallace',
+┊  ┊23┊    }
+┊  ┊24┊  }, {
+┊  ┊25┊    phone: '+972540000002',
+┊  ┊26┊    profile: {
+┊  ┊27┊      name: 'Bryan Wallace',
 ┊33┊28┊      picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg'
-┊34┊  ┊    });
-┊35┊  ┊
-┊36┊  ┊    Messages.collection.insert({
-┊37┊  ┊      chatId: chatId,
-┊38┊  ┊      content: 'Hey, it\'s me',
-┊39┊  ┊      createdAt: moment().subtract(2, 'hours').toDate()
-┊40┊  ┊    });
-┊41┊  ┊
-┊42┊  ┊    chatId = Chats.collection.insert({
-┊43┊  ┊      title: 'Avery Stewart',
+┊  ┊29┊    }
+┊  ┊30┊  }, {
+┊  ┊31┊    phone: '+972540000003',
+┊  ┊32┊    profile: {
+┊  ┊33┊      name: 'Avery Stewart',
 ┊44┊34┊      picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg'
-┊45┊  ┊    });
-┊46┊  ┊
-┊47┊  ┊    Messages.collection.insert({
-┊48┊  ┊      chatId: chatId,
-┊49┊  ┊      content: 'I should buy a boat',
-┊50┊  ┊      createdAt: moment().subtract(1, 'days').toDate()
-┊51┊  ┊    });
-┊52┊  ┊
-┊53┊  ┊    chatId = Chats.collection.insert({
-┊54┊  ┊      title: 'Katie Peterson',
+┊  ┊35┊    }
+┊  ┊36┊  }, {
+┊  ┊37┊    phone: '+972540000004',
+┊  ┊38┊    profile: {
+┊  ┊39┊      name: 'Katie Peterson',
 ┊55┊40┊      picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg'
-┊56┊  ┊    });
-┊57┊  ┊
-┊58┊  ┊    Messages.collection.insert({
-┊59┊  ┊      chatId: chatId,
-┊60┊  ┊      content: 'Look at my mukluks!',
-┊61┊  ┊      createdAt: moment().subtract(4, 'days').toDate()
-┊62┊  ┊    });
-┊63┊  ┊
-┊64┊  ┊    chatId = Chats.collection.insert({
-┊65┊  ┊      title: 'Ray Edwards',
+┊  ┊41┊    }
+┊  ┊42┊  }, {
+┊  ┊43┊    phone: '+972540000005',
+┊  ┊44┊    profile: {
+┊  ┊45┊      name: 'Ray Edwards',
 ┊66┊46┊      picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg'
-┊67┊  ┊    });
-┊68┊  ┊
-┊69┊  ┊    Messages.collection.insert({
-┊70┊  ┊      chatId: chatId,
-┊71┊  ┊      content: 'This is wicked good ice cream.',
-┊72┊  ┊      createdAt: moment().subtract(2, 'weeks').toDate()
-┊73┊  ┊    });
-┊74┊  ┊  }
+┊  ┊47┊    }
+┊  ┊48┊  }].forEach(user => {
+┊  ┊49┊    Accounts.createUserWithPhone(user);
+┊  ┊50┊  });
 ┊75┊51┊});
```
[}]: #

And let's add the missing import inside the `ChatsPage`:

Since we changed the data fabrication method, the chat's title and picture are not hardcoded anymore, therefore they should be calculated in the components themselves. Let's calculate those fields in the chats component:

[{]: <helper> (diff_step 6.13)
#### Step 6.13: Add title and picture to chat

##### Changed src/pages/chats/chats.ts
```diff
@@ -1,17 +1,20 @@
 ┊ 1┊ 1┊import { Component, OnInit } from '@angular/core';
 ┊ 2┊ 2┊import { Observable } from "rxjs";
 ┊ 3┊ 3┊import { Chat } from "api/models/whatsapp-models";
-┊ 4┊  ┊import { Chats, Messages } from "api/collections/whatsapp-collections";
+┊  ┊ 4┊import { Chats, Messages, Users } from "api/collections/whatsapp-collections";
 ┊ 5┊ 5┊import { NavController, PopoverController, ModalController } from "ionic-angular";
 ┊ 6┊ 6┊import { MessagesPage } from "../messages/messages";
 ┊ 7┊ 7┊import { ChatsOptionsComponent } from "../chat-options/chat-options";
 ┊ 8┊ 8┊import { NewChatComponent } from "../new-chat/new-chat";
 ┊ 9┊ 9┊
+┊  ┊10┊declare let Meteor;
+┊  ┊11┊
 ┊10┊12┊@Component({
 ┊11┊13┊  templateUrl: 'chats.html'
 ┊12┊14┊})
 ┊13┊15┊export class ChatsPage implements OnInit {
 ┊14┊16┊  chats;
+┊  ┊17┊  senderId: string;
 ┊15┊18┊
 ┊16┊19┊  constructor(
 ┊17┊20┊    public navCtrl: NavController,
```
```diff
@@ -20,6 +23,8 @@
 ┊20┊23┊  ) {}
 ┊21┊24┊
 ┊22┊25┊  ngOnInit() {
+┊  ┊26┊    this.senderId = Meteor.userId();
+┊  ┊27┊
 ┊23┊28┊    this.chats = Chats
 ┊24┊29┊      .find({})
 ┊25┊30┊      .mergeMap((chats: Chat[]) =>
```
```diff
@@ -34,7 +39,20 @@
 ┊34┊39┊              })
 ┊35┊40┊          )
 ┊36┊41┊        )
-┊37┊  ┊      ).zone();
+┊  ┊42┊      ).map(chats => {
+┊  ┊43┊        chats.forEach(chat => {
+┊  ┊44┊          chat.title = '';
+┊  ┊45┊          chat.picture = '';
+┊  ┊46┊
+┊  ┊47┊          const receiver = Users.findOne(chat.memberIds.find(memberId => memberId !== this.senderId));
+┊  ┊48┊          if (!receiver) return;
+┊  ┊49┊
+┊  ┊50┊          chat.title = receiver.profile.name;
+┊  ┊51┊          chat.picture = receiver.profile.picture;
+┊  ┊52┊        });
+┊  ┊53┊
+┊  ┊54┊        return chats;
+┊  ┊55┊      }).zone();
 ┊38┊56┊  }
 ┊39┊57┊
 ┊40┊58┊  addChat(): void {
```
[}]: #

Now we want our changes to take effect. We will reset the database so next time we run our Meteor server the users will be fabricated. To reset the database, first make sure the Meteor server is stopped and then type the following command:

    $ meteor reset

And once we start our server again it should go through the initialization method and fabricate the users.

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step5.md) | [Next Step >](step7.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #