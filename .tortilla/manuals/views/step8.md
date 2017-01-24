# Step 8: Chats Creation &amp; Removal

Our next step is about adding the ability to create new chats. We have the `ChatsPage` and the authentication system, but we need to hook them up some how. Let's define the initial `User` schema which will be used to retrieve its relevant information in our application:

[{]: <helper> (diffStep "8.1")

#### [Step 8.1: Added user model](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/44804910)

##### Changed api&#x2F;server&#x2F;models.ts
```diff
@@ -25,3 +25,7 @@
 ┊25┊25┊  type?: MessageType
 ┊26┊26┊  ownership?: string;
 ┊27┊27┊}
+┊  ┊28┊
+┊  ┊29┊export interface User extends Meteor.User {
+┊  ┊30┊  profile?: Profile;
+┊  ┊31┊}
```

[}]: #

`Meteor` comes with a built-in users collection, defined as `Meteor.users`, but since we're using `Observables` vastly, we will wrap our collection with one:

[{]: <helper> (diffStep "8.2")

#### [Step 8.2: Wrap Meteor users collection](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/f2937191)

##### Added api&#x2F;server&#x2F;collections&#x2F;users.ts
```diff
@@ -0,0 +1,5 @@
+┊ ┊1┊import { MongoObservable } from 'meteor-rxjs';
+┊ ┊2┊import { Meteor } from 'meteor/meteor';
+┊ ┊3┊import { User } from '../models';
+┊ ┊4┊
+┊ ┊5┊export const Users = MongoObservable.fromExisting<User>(Meteor.users);
```

[}]: #

For accessibility, we're gonna export the collection from the `index` file as well:

[{]: <helper> (diffStep "8.3")

#### [Step 8.3: Export users collection form index file](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/f8e1b748)

##### Changed api&#x2F;server&#x2F;collections&#x2F;index.ts
```diff
@@ -1,2 +1,3 @@
 ┊1┊1┊export * from './chats';
 ┊2┊2┊export * from './messages';
+┊ ┊3┊export * from './users';
```

[}]: #

## Chats Creation

We will be using `Ionic`'s modal dialog to show the chat creation view. The first thing we're gonna do would be implementing the component itself, along with its view and stylesheet:

[{]: <helper> (diffStep "8.4")

#### [Step 8.4: Added new chat component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/cf92fbd3)

##### Added src&#x2F;pages&#x2F;chats&#x2F;new-chat.ts
```diff
@@ -0,0 +1,85 @@
+┊  ┊ 1┊import { Component, OnInit } from '@angular/core';
+┊  ┊ 2┊import { Chats, Users } from 'api/collections';
+┊  ┊ 3┊import { User } from 'api/models';
+┊  ┊ 4┊import { AlertController, ViewController } from 'ionic-angular';
+┊  ┊ 5┊import { MeteorObservable } from 'meteor-rxjs';
+┊  ┊ 6┊import * as _ from 'lodash';
+┊  ┊ 7┊import { Observable, Subscription } from 'rxjs';
+┊  ┊ 8┊
+┊  ┊ 9┊@Component({
+┊  ┊10┊  selector: 'new-chat',
+┊  ┊11┊  templateUrl: 'new-chat.html'
+┊  ┊12┊})
+┊  ┊13┊export class NewChatComponent implements OnInit {
+┊  ┊14┊  senderId: string;
+┊  ┊15┊  users: Observable<User[]>;
+┊  ┊16┊  usersSubscription: Subscription;
+┊  ┊17┊
+┊  ┊18┊  constructor(
+┊  ┊19┊    private alertCtrl: AlertController,
+┊  ┊20┊    private viewCtrl: ViewController
+┊  ┊21┊  ) {
+┊  ┊22┊    this.senderId = Meteor.userId();
+┊  ┊23┊  }
+┊  ┊24┊
+┊  ┊25┊  ngOnInit() {
+┊  ┊26┊    this.loadUsers();
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
+┊  ┊42┊  loadUsers(): void {
+┊  ┊43┊    this.users = this.findUsers();
+┊  ┊44┊  }
+┊  ┊45┊
+┊  ┊46┊  findUsers(): Observable<User[]> {
+┊  ┊47┊    // Find all belonging chats
+┊  ┊48┊    return Chats.find({
+┊  ┊49┊      memberIds: this.senderId
+┊  ┊50┊    }, {
+┊  ┊51┊      fields: {
+┊  ┊52┊        memberIds: 1
+┊  ┊53┊      }
+┊  ┊54┊    })
+┊  ┊55┊    // Invoke merge-map with an empty array in case no chat found
+┊  ┊56┊    .startWith([])
+┊  ┊57┊    .mergeMap((chats) => {
+┊  ┊58┊      // Get all userIDs who we're chatting with
+┊  ┊59┊      const receiverIds = _.chain(chats)
+┊  ┊60┊        .map('memberIds')
+┊  ┊61┊        .flatten()
+┊  ┊62┊        .concat(this.senderId)
+┊  ┊63┊        .value();
+┊  ┊64┊
+┊  ┊65┊      // Find all users which are not in belonging chats
+┊  ┊66┊      return Users.find({
+┊  ┊67┊        _id: { $nin: receiverIds }
+┊  ┊68┊      })
+┊  ┊69┊      // Invoke map with an empty array in case no user found
+┊  ┊70┊      .startWith([]);
+┊  ┊71┊    });
+┊  ┊72┊  }
+┊  ┊73┊
+┊  ┊74┊  handleError(e: Error): void {
+┊  ┊75┊    console.error(e);
+┊  ┊76┊
+┊  ┊77┊    const alert = this.alertCtrl.create({
+┊  ┊78┊      buttons: ['OK'],
+┊  ┊79┊      message: e.message,
+┊  ┊80┊      title: 'Oops!'
+┊  ┊81┊    });
+┊  ┊82┊
+┊  ┊83┊    alert.present();
+┊  ┊84┊  }
+┊  ┊85┊}
```

[}]: #

[{]: <helper> (diffStep "8.5")

#### [Step 8.5: Added new chat template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/765d0daa)

##### Added src&#x2F;pages&#x2F;chats&#x2F;new-chat.html
```diff
@@ -0,0 +1,22 @@
+┊  ┊ 1┊<ion-header>
+┊  ┊ 2┊  <ion-toolbar color="whatsapp">
+┊  ┊ 3┊    <ion-title>New Chat</ion-title>
+┊  ┊ 4┊
+┊  ┊ 5┊    <ion-buttons left>
+┊  ┊ 6┊      <button ion-button class="dismiss-button" (click)="viewCtrl.dismiss()"><ion-icon name="close"></ion-icon></button>
+┊  ┊ 7┊    </ion-buttons>
+┊  ┊ 8┊
+┊  ┊ 9┊    <ion-buttons end>
+┊  ┊10┊      <button ion-button class="search-button"><ion-icon name="search"></ion-icon></button>
+┊  ┊11┊    </ion-buttons>
+┊  ┊12┊  </ion-toolbar>
+┊  ┊13┊</ion-header>
+┊  ┊14┊
+┊  ┊15┊<ion-content class="new-chat">
+┊  ┊16┊  <ion-list class="users">
+┊  ┊17┊    <button ion-item *ngFor="let user of users | async" class="user" (click)="addChat(user)">
+┊  ┊18┊      <img class="user-picture" [src]="user.profile.picture">
+┊  ┊19┊      <h2 class="user-name">{{user.profile.name}}</h2>
+┊  ┊20┊    </button>
+┊  ┊21┊  </ion-list>
+┊  ┊22┊</ion-content>
```

[}]: #

[{]: <helper> (diffStep "8.6")

#### [Step 8.6: Added new chat styles](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/65558f81)

##### Added src&#x2F;pages&#x2F;chats&#x2F;new-chat.scss
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

The dialog should contain a list of all the users whose chat does not exist yet. Once we click on one of these users we should be demoted to the chats view with the new chat we've just created.

The dialog should be revealed whenever we click on one of the options in the options pop-over, therefore, we will implement the necessary handler:

[{]: <helper> (diffStep "8.7")

#### [Step 8.7: Added addChat method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/0dcfa86d)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
```diff
@@ -1,10 +1,11 @@
 ┊ 1┊ 1┊import { Component, OnInit } from '@angular/core';
 ┊ 2┊ 2┊import { Chats, Messages } from 'api/collections';
 ┊ 3┊ 3┊import { Chat } from 'api/models';
-┊ 4┊  ┊import { NavController, PopoverController } from 'ionic-angular';
+┊  ┊ 4┊import { NavController, PopoverController, ModalController } from 'ionic-angular';
 ┊ 5┊ 5┊import { Observable } from 'rxjs';
 ┊ 6┊ 6┊import { MessagesPage } from '../messages/messages';
 ┊ 7┊ 7┊import { ChatsOptionsComponent } from './chats-options';
+┊  ┊ 8┊import { NewChatComponent } from './new-chat';
 ┊ 8┊ 9┊
 ┊ 9┊10┊@Component({
 ┊10┊11┊  templateUrl: 'chats.html'
```
```diff
@@ -14,7 +15,13 @@
 ┊14┊15┊
 ┊15┊16┊  constructor(
 ┊16┊17┊    private navCtrl: NavController,
-┊17┊  ┊    private popoverCtrl: PopoverController) {
+┊  ┊18┊    private popoverCtrl: PopoverController,
+┊  ┊19┊    private modalCtrl: ModalController) {
+┊  ┊20┊  }
+┊  ┊21┊
+┊  ┊22┊  addChat(): void {
+┊  ┊23┊    const modal = this.modalCtrl.create(NewChatComponent);
+┊  ┊24┊    modal.present();
 ┊18┊25┊  }
 ┊19┊26┊
 ┊20┊27┊  ngOnInit() {
```
```diff
@@ -35,6 +42,7 @@
 ┊35┊42┊      ).zone();
 ┊36┊43┊  }
 ┊37┊44┊
+┊  ┊45┊
 ┊38┊46┊  showMessages(chat): void {
 ┊39┊47┊    this.navCtrl.push(MessagesPage, {chat});
 ┊40┊48┊  }
```

[}]: #

And bind it to the `click` event:

[{]: <helper> (diffStep "8.8")

#### [Step 8.8: Bind click event to new chat modal](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/05b290aa)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.html
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

We will import the newly created component in the app's `NgModule` as well, so it can be recognized properly:

[{]: <helper> (diffStep "8.9")

#### [Step 8.9: Import new chat component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/248080c0)

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -5,6 +5,7 @@
 ┊ 5┊ 5┊import { StatusBar } from '@ionic-native/status-bar';
 ┊ 6┊ 6┊import { MomentModule } from 'angular2-moment';
 ┊ 7┊ 7┊import { ChatsPage } from '../pages/chats/chats';
+┊  ┊ 8┊import { NewChatComponent } from '../pages/chats/new-chat';
 ┊ 8┊ 9┊import { ChatsOptionsComponent } from '../pages/chats/chats-options';
 ┊ 9┊10┊import { LoginPage } from '../pages/login/login';
 ┊10┊11┊import { MessagesPage } from '../pages/messages/messages';
```
```diff
@@ -21,7 +22,8 @@
 ┊21┊22┊    LoginPage,
 ┊22┊23┊    VerificationPage,
 ┊23┊24┊    ProfilePage,
-┊24┊  ┊    ChatsOptionsComponent
+┊  ┊25┊    ChatsOptionsComponent,
+┊  ┊26┊    NewChatComponent
 ┊25┊27┊  ],
 ┊26┊28┊  imports: [
 ┊27┊29┊    BrowserModule,
```
```diff
@@ -36,7 +38,8 @@
 ┊36┊38┊    LoginPage,
 ┊37┊39┊    VerificationPage,
 ┊38┊40┊    ProfilePage,
-┊39┊  ┊    ChatsOptionsComponent
+┊  ┊41┊    ChatsOptionsComponent,
+┊  ┊42┊    NewChatComponent
 ┊40┊43┊  ],
 ┊41┊44┊  providers: [
 ┊42┊45┊    StatusBar,
```

[}]: #

We're also required to implement the appropriate `Meteor` method which will be the actually handler for feeding our data-base with newly created chats:

[{]: <helper> (diffStep "8.10")

#### [Step 8.10: Implement addChat method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/17932b6a)

##### Changed api&#x2F;server&#x2F;methods.ts
```diff
@@ -9,6 +9,34 @@
 ┊ 9┊ 9┊});
 ┊10┊10┊
 ┊11┊11┊Meteor.methods({
+┊  ┊12┊  addChat(receiverId: string): void {
+┊  ┊13┊    if (!this.userId) {
+┊  ┊14┊      throw new Meteor.Error('unauthorized',
+┊  ┊15┊        'User must be logged-in to create a new chat');
+┊  ┊16┊    }
+┊  ┊17┊
+┊  ┊18┊    check(receiverId, nonEmptyString);
+┊  ┊19┊
+┊  ┊20┊    if (receiverId === this.userId) {
+┊  ┊21┊      throw new Meteor.Error('illegal-receiver',
+┊  ┊22┊        'Receiver must be different than the current logged in user');
+┊  ┊23┊    }
+┊  ┊24┊
+┊  ┊25┊    const chatExists = !!Chats.collection.find({
+┊  ┊26┊      memberIds: { $all: [this.userId, receiverId] }
+┊  ┊27┊    }).count();
+┊  ┊28┊
+┊  ┊29┊    if (chatExists) {
+┊  ┊30┊      throw new Meteor.Error('chat-exists',
+┊  ┊31┊        'Chat already exists');
+┊  ┊32┊    }
+┊  ┊33┊
+┊  ┊34┊    const chat = {
+┊  ┊35┊      memberIds: [this.userId, receiverId]
+┊  ┊36┊    };
+┊  ┊37┊
+┊  ┊38┊    Chats.insert(chat);
+┊  ┊39┊  },
 ┊12┊40┊  updateProfile(profile: Profile): void {
 ┊13┊41┊    if (!this.userId) throw new Meteor.Error('unauthorized',
 ┊14┊42┊      'User must be logged-in to create a new chat');
```

[}]: #

As you can see, a chat is inserted with an additional `memberIds` field. Whenever we have such a change we should update the model's schema accordingly, in this case we're talking about adding the `memberIds` field, like so:

[{]: <helper> (diffStep "8.11")

#### [Step 8.11: Add memberIds field](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/dece0343)

##### Changed api&#x2F;server&#x2F;models.ts
```diff
@@ -14,6 +14,7 @@
 ┊14┊14┊  title?: string;
 ┊15┊15┊  picture?: string;
 ┊16┊16┊  lastMessage?: Message;
+┊  ┊17┊  memberIds?: string[];
 ┊17┊18┊}
 ┊18┊19┊
 ┊19┊20┊export interface Message {
```

[}]: #

Thanks to our new-chat dialog, we can create chats dynamically with no need in initial fabrication. Let's replace the chats fabrication with users fabrication in the Meteor server:

[{]: <helper> (diffStep "8.12")

#### [Step 8.12: Create real user accounts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/ccb6c484)

##### Changed api&#x2F;server&#x2F;main.ts
```diff
@@ -1,9 +1,6 @@
 ┊1┊1┊import { Meteor } from 'meteor/meteor';
-┊2┊ ┊import { Chats } from './collections/chats';
-┊3┊ ┊import { Messages } from './collections/messages';
-┊4┊ ┊import * as moment from 'moment';
-┊5┊ ┊import { MessageType } from './models';
 ┊6┊2┊import { Accounts } from 'meteor/accounts-base';
+┊ ┊3┊import { Users } from './collections/users';
 ┊7┊4┊
 ┊8┊5┊Meteor.startup(() => {
 ┊9┊6┊  if (Meteor.settings) {
```
```diff
@@ -11,67 +8,47 @@
 ┊11┊ 8┊    SMS.twilio = Meteor.settings['twilio'];
 ┊12┊ 9┊  }
 ┊13┊10┊
-┊14┊  ┊  if (Chats.find({}).cursor.count() === 0) {
-┊15┊  ┊    let chatId;
-┊16┊  ┊
-┊17┊  ┊    chatId = Chats.collection.insert({
-┊18┊  ┊      title: 'Ethan Gonzalez',
-┊19┊  ┊      picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg'
-┊20┊  ┊    });
-┊21┊  ┊
-┊22┊  ┊    Messages.collection.insert({
-┊23┊  ┊      chatId: chatId,
-┊24┊  ┊      content: 'You on your way?',
-┊25┊  ┊      createdAt: moment().subtract(1, 'hours').toDate(),
-┊26┊  ┊      type: MessageType.TEXT
-┊27┊  ┊    });
-┊28┊  ┊
-┊29┊  ┊    chatId = Chats.collection.insert({
-┊30┊  ┊      title: 'Bryan Wallace',
-┊31┊  ┊      picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg'
-┊32┊  ┊    });
-┊33┊  ┊
-┊34┊  ┊    Messages.collection.insert({
-┊35┊  ┊      chatId: chatId,
-┊36┊  ┊      content: 'Hey, it\'s me',
-┊37┊  ┊      createdAt: moment().subtract(2, 'hours').toDate(),
-┊38┊  ┊      type: MessageType.TEXT
-┊39┊  ┊    });
-┊40┊  ┊
-┊41┊  ┊    chatId = Chats.collection.insert({
-┊42┊  ┊      title: 'Avery Stewart',
-┊43┊  ┊      picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg'
-┊44┊  ┊    });
-┊45┊  ┊
-┊46┊  ┊    Messages.collection.insert({
-┊47┊  ┊      chatId: chatId,
-┊48┊  ┊      content: 'I should buy a boat',
-┊49┊  ┊      createdAt: moment().subtract(1, 'days').toDate(),
-┊50┊  ┊      type: MessageType.TEXT
-┊51┊  ┊    });
-┊52┊  ┊
-┊53┊  ┊    chatId = Chats.collection.insert({
-┊54┊  ┊      title: 'Katie Peterson',
-┊55┊  ┊      picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg'
-┊56┊  ┊    });
-┊57┊  ┊
-┊58┊  ┊    Messages.collection.insert({
-┊59┊  ┊      chatId: chatId,
-┊60┊  ┊      content: 'Look at my mukluks!',
-┊61┊  ┊      createdAt: moment().subtract(4, 'days').toDate(),
-┊62┊  ┊      type: MessageType.TEXT
-┊63┊  ┊    });
-┊64┊  ┊
-┊65┊  ┊    chatId = Chats.collection.insert({
-┊66┊  ┊      title: 'Ray Edwards',
-┊67┊  ┊      picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg'
-┊68┊  ┊    });
-┊69┊  ┊
-┊70┊  ┊    Messages.collection.insert({
-┊71┊  ┊      chatId: chatId,
-┊72┊  ┊      content: 'This is wicked good ice cream.',
-┊73┊  ┊      createdAt: moment().subtract(2, 'weeks').toDate(),
-┊74┊  ┊      type: MessageType.TEXT
-┊75┊  ┊    });
+┊  ┊11┊  if (Users.collection.find().count() > 0) {
+┊  ┊12┊    return;
 ┊76┊13┊  }
+┊  ┊14┊
+┊  ┊15┊  Accounts.createUserWithPhone({
+┊  ┊16┊    phone: '+972540000001',
+┊  ┊17┊    profile: {
+┊  ┊18┊      name: 'Ethan Gonzalez',
+┊  ┊19┊      picture: 'https://randomuser.me/api/portraits/men/1.jpg'
+┊  ┊20┊    }
+┊  ┊21┊  });
+┊  ┊22┊
+┊  ┊23┊  Accounts.createUserWithPhone({
+┊  ┊24┊    phone: '+972540000002',
+┊  ┊25┊    profile: {
+┊  ┊26┊      name: 'Bryan Wallace',
+┊  ┊27┊      picture: 'https://randomuser.me/api/portraits/lego/1.jpg'
+┊  ┊28┊    }
+┊  ┊29┊  });
+┊  ┊30┊
+┊  ┊31┊  Accounts.createUserWithPhone({
+┊  ┊32┊    phone: '+972540000003',
+┊  ┊33┊    profile: {
+┊  ┊34┊      name: 'Avery Stewart',
+┊  ┊35┊      picture: 'https://randomuser.me/api/portraits/women/1.jpg'
+┊  ┊36┊    }
+┊  ┊37┊  });
+┊  ┊38┊
+┊  ┊39┊  Accounts.createUserWithPhone({
+┊  ┊40┊    phone: '+972540000004',
+┊  ┊41┊    profile: {
+┊  ┊42┊      name: 'Katie Peterson',
+┊  ┊43┊      picture: 'https://randomuser.me/api/portraits/women/2.jpg'
+┊  ┊44┊    }
+┊  ┊45┊  });
+┊  ┊46┊
+┊  ┊47┊  Accounts.createUserWithPhone({
+┊  ┊48┊    phone: '+972540000005',
+┊  ┊49┊    profile: {
+┊  ┊50┊      name: 'Ray Edwards',
+┊  ┊51┊      picture: 'https://randomuser.me/api/portraits/men/2.jpg'
+┊  ┊52┊    }
+┊  ┊53┊  });
 ┊77┊54┊});
```

[}]: #

Since we've changed the data fabrication method, the chat's title and picture are not hard-coded anymore, therefore, any additional data should be fetched in the components themselves:

[{]: <helper> (diffStep "8.13")

#### [Step 8.13: Implement chats with with real data](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/813b487a)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
```diff
@@ -1,8 +1,9 @@
 ┊1┊1┊import { Component, OnInit } from '@angular/core';
-┊2┊ ┊import { Chats, Messages } from 'api/collections';
-┊3┊ ┊import { Chat } from 'api/models';
+┊ ┊2┊import { Chats, Messages, Users } from 'api/collections';
+┊ ┊3┊import { Chat, Message } from 'api/models';
 ┊4┊4┊import { NavController, PopoverController, ModalController } from 'ionic-angular';
-┊5┊ ┊import { Observable } from 'rxjs';
+┊ ┊5┊import { MeteorObservable } from 'meteor-rxjs';
+┊ ┊6┊import { Observable, Subscriber } from 'rxjs';
 ┊6┊7┊import { MessagesPage } from '../messages/messages';
 ┊7┊8┊import { ChatsOptionsComponent } from './chats-options';
 ┊8┊9┊import { NewChatComponent } from './new-chat';
```
```diff
@@ -12,11 +13,13 @@
 ┊12┊13┊})
 ┊13┊14┊export class ChatsPage implements OnInit {
 ┊14┊15┊  chats;
+┊  ┊16┊  senderId: string;
 ┊15┊17┊
 ┊16┊18┊  constructor(
 ┊17┊19┊    private navCtrl: NavController,
 ┊18┊20┊    private popoverCtrl: PopoverController,
 ┊19┊21┊    private modalCtrl: ModalController) {
+┊  ┊22┊    this.senderId = Meteor.userId();
 ┊20┊23┊  }
 ┊21┊24┊
 ┊22┊25┊  addChat(): void {
```
```diff
@@ -25,23 +28,62 @@
 ┊25┊28┊  }
 ┊26┊29┊
 ┊27┊30┊  ngOnInit() {
-┊28┊  ┊    this.chats = Chats
-┊29┊  ┊      .find({})
-┊30┊  ┊      .mergeMap((chats: Chat[]) =>
-┊31┊  ┊        Observable.combineLatest(
-┊32┊  ┊          ...chats.map((chat: Chat) =>
-┊33┊  ┊            Messages
-┊34┊  ┊              .find({chatId: chat._id})
-┊35┊  ┊              .startWith(null)
-┊36┊  ┊              .map(messages => {
-┊37┊  ┊                if (messages) chat.lastMessage = messages[0];
-┊38┊  ┊                return chat;
-┊39┊  ┊              })
-┊40┊  ┊          )
-┊41┊  ┊        )
-┊42┊  ┊      ).zone();
+┊  ┊31┊    this.chats = this.findChats();
 ┊43┊32┊  }
 ┊44┊33┊
+┊  ┊34┊  findChats(): Observable<Chat[]> {
+┊  ┊35┊    // Find chats and transform them
+┊  ┊36┊    return Chats.find().map(chats => {
+┊  ┊37┊      chats.forEach(chat => {
+┊  ┊38┊        chat.title = '';
+┊  ┊39┊        chat.picture = '';
+┊  ┊40┊
+┊  ┊41┊        const receiverId = chat.memberIds.find(memberId => memberId !== this.senderId);
+┊  ┊42┊        const receiver = Users.findOne(receiverId);
+┊  ┊43┊
+┊  ┊44┊        if (receiver) {
+┊  ┊45┊          chat.title = receiver.profile.name;
+┊  ┊46┊          chat.picture = receiver.profile.picture;
+┊  ┊47┊        }
+┊  ┊48┊
+┊  ┊49┊        // This will make the last message reactive
+┊  ┊50┊        this.findLastChatMessage(chat._id).subscribe((message) => {
+┊  ┊51┊          chat.lastMessage = message;
+┊  ┊52┊        });
+┊  ┊53┊      });
+┊  ┊54┊
+┊  ┊55┊      return chats;
+┊  ┊56┊    });
+┊  ┊57┊  }
+┊  ┊58┊
+┊  ┊59┊  findLastChatMessage(chatId: string): Observable<Message> {
+┊  ┊60┊    return Observable.create((observer: Subscriber<Message>) => {
+┊  ┊61┊      const chatExists = () => !!Chats.findOne(chatId);
+┊  ┊62┊
+┊  ┊63┊      // Re-compute until chat is removed
+┊  ┊64┊      MeteorObservable.autorun().takeWhile(chatExists).subscribe(() => {
+┊  ┊65┊        Messages.find({ chatId }, {
+┊  ┊66┊          sort: { createdAt: -1 }
+┊  ┊67┊        }).subscribe({
+┊  ┊68┊          next: (messages) => {
+┊  ┊69┊            // Invoke subscription with the last message found
+┊  ┊70┊            if (!messages.length) {
+┊  ┊71┊              return;
+┊  ┊72┊            }
+┊  ┊73┊
+┊  ┊74┊            const lastMessage = messages[0];
+┊  ┊75┊            observer.next(lastMessage);
+┊  ┊76┊          },
+┊  ┊77┊          error: (e) => {
+┊  ┊78┊            observer.error(e);
+┊  ┊79┊          },
+┊  ┊80┊          complete: () => {
+┊  ┊81┊            observer.complete();
+┊  ┊82┊          }
+┊  ┊83┊        });
+┊  ┊84┊      });
+┊  ┊85┊    });
+┊  ┊86┊  }
 ┊45┊87┊
 ┊46┊88┊  showMessages(chat): void {
 ┊47┊89┊    this.navCtrl.push(MessagesPage, {chat});
```

[}]: #

Now we want our changes to take effect. We will reset the database so next time we run our `Meteor` server the users will be fabricated. To reset the database, first make sure the `Meteor` server is stopped , and then type the following command:

    api$ meteor reset

Now, as soon as you start the server, new users should be fabricated and inserted into the database:

    $ npm run api

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/privacy" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/authentication")

| [< Previous Step](https://angular-meteor.com/tutorials/whatsapp2/ionic/authentication) | [Next Step >](https://angular-meteor.com/tutorials/whatsapp2/ionic/privacy) |
|:--------------------------------|--------------------------------:|

[}]: #

