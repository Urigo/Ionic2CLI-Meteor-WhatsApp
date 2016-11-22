[{]: <region> (header)
# Step 4: Messages page
[}]: #
[{]: <region> (body)
In this step we will add the messages view and the ability to send messages.

Before we implement anything related to the messages pages, we first have to make sure that once we click on a chat item in the chats page, we will be promoted into its corresponding messages view.

Let's first implement the `showMessages()` method in the chats component

[{]: <helper> (diff_step 4.1)
#### Step 4.1: Added showMessage method

##### Changed src/pages/chats/chats.ts
```diff
@@ -2,6 +2,7 @@
 ┊2┊2┊import { Observable } from "rxjs";
 ┊3┊3┊import { Chat } from "api/models/whatsapp-models";
 ┊4┊4┊import { Chats, Messages } from "api/collections/whatsapp-collections";
+┊ ┊5┊import { NavController } from "ionic-angular";
 ┊5┊6┊
 ┊6┊7┊@Component({
 ┊7┊8┊  templateUrl: 'chats.html'
```
```diff
@@ -9,7 +10,7 @@
 ┊ 9┊10┊export class ChatsPage implements OnInit {
 ┊10┊11┊  chats;
 ┊11┊12┊
-┊12┊  ┊  constructor() {
+┊  ┊13┊  constructor(private navCtrl: NavController) {
 ┊13┊14┊
 ┊14┊15┊  }
 ┊15┊16┊
```
```diff
@@ -31,6 +32,10 @@
 ┊31┊32┊      ).zone();
 ┊32┊33┊  }
 ┊33┊34┊
+┊  ┊35┊  showMessages(chat): void {
+┊  ┊36┊    this.navCtrl.push(MessagesPage, {chat});
+┊  ┊37┊  }
+┊  ┊38┊
 ┊34┊39┊  removeChat(chat: Chat): void {
 ┊35┊40┊    // TODO: Implement it later
 ┊36┊41┊  }
```
[}]: #

And let's register the click event in the view:

[{]: <helper> (diff_step 4.2)
#### Step 4.2: Added the action to the button

##### Changed src/pages/chats/chats.html
```diff
@@ -17,7 +17,7 @@
 ┊17┊17┊<ion-content padding class="chats-page-content">
 ┊18┊18┊  <ion-list class="chats">
 ┊19┊19┊    <ion-item-sliding *ngFor="let chat of chats | async">
-┊20┊  ┊      <button ion-item class="chat">
+┊  ┊20┊      <button ion-item class="chat" (click)="showMessages(chat)">
 ┊21┊21┊        <img class="chat-picture" [src]="chat.picture">
 ┊22┊22┊
 ┊23┊23┊        <div class="chat-info">
```
[}]: #

Notice how we used we used a controller called `NavController`. The NavController is `Ionic`'s new method to navigate in our app, we can also use a traditional router, but since in a mobile app we have no access to the url bar, this might come more in handy. You can read more about the NavController [here](http://ionicframework.com/docs/v2/api/components/nav/NavController/).

Let's go ahead and implement the messages component. We'll call it `MessagesPage`:

[{]: <helper> (diff_step 4.3)
#### Step 4.3: Create a stub for the component

##### Added src/pages/messages/messages.ts
```diff
@@ -0,0 +1,21 @@
+┊  ┊ 1┊import { Component, OnInit } from "@angular/core";
+┊  ┊ 2┊import { NavParams } from "ionic-angular";
+┊  ┊ 3┊import { Chat } from "api/models/whatsapp-models";
+┊  ┊ 4┊
+┊  ┊ 5┊@Component({
+┊  ┊ 6┊  selector: "messages-page",
+┊  ┊ 7┊  template: `Messages Page`
+┊  ┊ 8┊})
+┊  ┊ 9┊export class MessagesPage implements OnInit {
+┊  ┊10┊  selectedChat: Chat;
+┊  ┊11┊
+┊  ┊12┊  constructor(navParams: NavParams) {
+┊  ┊13┊    this.selectedChat = <Chat>navParams.get('chat');
+┊  ┊14┊
+┊  ┊15┊    console.log("Selected chat is: ", this.selectedChat);
+┊  ┊16┊  }
+┊  ┊17┊
+┊  ┊18┊  ngOnInit() {
+┊  ┊19┊
+┊  ┊20┊  }
+┊  ┊21┊}
```
[}]: #

As you can see, in order to get the chat's id we used the `NavParams` service. This is a simple service which gives you access to a key-value storage containing all the parameters we've passed using the NavController. For more information about the NavParams service, see the following [link](http://ionicframework.com/docs/v2/api/components/nav/NavParams).

Now it has to be added to AppModule:

[{]: <helper> (diff_step 4.4)
#### Step 4.4: Added the Component to the NgModule

##### Changed src/app/app.module.ts
```diff
@@ -4,12 +4,14 @@
 ┊ 4┊ 4┊import { TabsPage } from '../pages/tabs/tabs';
 ┊ 5┊ 5┊import { ChatsPage } from "../pages/chats/chats";
 ┊ 6┊ 6┊import { MomentModule } from "angular2-moment";
+┊  ┊ 7┊import { MessagesPage } from "../pages/messages/messages";
 ┊ 7┊ 8┊
 ┊ 8┊ 9┊@NgModule({
 ┊ 9┊10┊  declarations: [
 ┊10┊11┊    MyApp,
 ┊11┊12┊    ChatsPage,
-┊12┊  ┊    TabsPage
+┊  ┊13┊    TabsPage,
+┊  ┊14┊    MessagesPage
 ┊13┊15┊  ],
 ┊14┊16┊  imports: [
 ┊15┊17┊    IonicModule.forRoot(MyApp),
```
```diff
@@ -19,7 +21,8 @@
 ┊19┊21┊  entryComponents: [
 ┊20┊22┊    MyApp,
 ┊21┊23┊    ChatsPage,
-┊22┊  ┊    TabsPage
+┊  ┊24┊    TabsPage,
+┊  ┊25┊    MessagesPage
 ┊23┊26┊  ],
 ┊24┊27┊  providers: []
 ┊25┊28┊})
```
[}]: #

We've used `MessagesPage` in `ChatsComponent` but we haven't imported it yet, let's make it now:

[{]: <helper> (diff_step 4.5)
#### Step 4.5: Added the correct import

##### Changed src/pages/chats/chats.ts
```diff
@@ -3,6 +3,7 @@
 ┊3┊3┊import { Chat } from "api/models/whatsapp-models";
 ┊4┊4┊import { Chats, Messages } from "api/collections/whatsapp-collections";
 ┊5┊5┊import { NavController } from "ionic-angular";
+┊ ┊6┊import { MessagesPage } from "../messages/messages";
 ┊6┊7┊
 ┊7┊8┊@Component({
 ┊8┊9┊  templateUrl: 'chats.html'
```
[}]: #

Now we can add some data to the component. We need a title and a picture to use inside the chat window. 

We also need a message:

[{]: <helper> (diff_step 4.6)
#### Step 4.6: Add basic messages component

##### Changed src/pages/messages/messages.ts
```diff
@@ -1,21 +1,39 @@
 ┊ 1┊ 1┊import { Component, OnInit } from "@angular/core";
 ┊ 2┊ 2┊import { NavParams } from "ionic-angular";
-┊ 3┊  ┊import { Chat } from "api/models/whatsapp-models";
+┊  ┊ 3┊import { Chat, Message } from "api/models/whatsapp-models";
+┊  ┊ 4┊import { Messages } from "api/collections/whatsapp-collections";
+┊  ┊ 5┊import { Observable} from "rxjs";
 ┊ 4┊ 6┊
 ┊ 5┊ 7┊@Component({
 ┊ 6┊ 8┊  selector: "messages-page",
-┊ 7┊  ┊  template: `Messages Page`
+┊  ┊ 9┊  templateUrl: "messages.html"
 ┊ 8┊10┊})
 ┊ 9┊11┊export class MessagesPage implements OnInit {
 ┊10┊12┊  selectedChat: Chat;
+┊  ┊13┊  title: string;
+┊  ┊14┊  picture: string;
+┊  ┊15┊  messages: Observable<Message[]>;
 ┊11┊16┊
 ┊12┊17┊  constructor(navParams: NavParams) {
 ┊13┊18┊    this.selectedChat = <Chat>navParams.get('chat');
-┊14┊  ┊
-┊15┊  ┊    console.log("Selected chat is: ", this.selectedChat);
+┊  ┊19┊    this.title = this.selectedChat.title;
+┊  ┊20┊    this.picture = this.selectedChat.picture;
 ┊16┊21┊  }
 ┊17┊22┊
 ┊18┊23┊  ngOnInit() {
+┊  ┊24┊    let isEven = false;
+┊  ┊25┊
+┊  ┊26┊    this.messages = Messages.find(
+┊  ┊27┊      {chatId: this.selectedChat._id},
+┊  ┊28┊      {sort: {createdAt: 1}}
+┊  ┊29┊    ).map((messages: Message[]) => {
+┊  ┊30┊      messages.forEach((message: Message) => {
+┊  ┊31┊        message.ownership = isEven ? 'mine' : 'other';
+┊  ┊32┊        isEven = !isEven;
+┊  ┊33┊      });
 ┊19┊34┊
+┊  ┊35┊      return messages;
+┊  ┊36┊    });
 ┊20┊37┊  }
 ┊21┊38┊}
+┊  ┊39┊
```
[}]: #

As you probably noticed, we added the ownership for each message. 
We're not able to determine the author of a message so we mark every even message as ours.

Let's add the `ownership` property to the model:

[{]: <helper> (diff_step 4.7)
#### Step 4.7: Add 'ownership' property to message model

##### Changed api/models/whatsapp-models.d.ts
```diff
@@ -11,5 +11,6 @@
 ┊11┊11┊    chatId?: string;
 ┊12┊12┊    content?: string;
 ┊13┊13┊    createdAt?: Date;
+┊  ┊14┊    ownership?: string;
 ┊14┊15┊  }
 ┊15┊16┊}
```
[}]: #

One thing missing, the template:

[{]: <helper> (diff_step 4.8)
#### Step 4.8: Add basic messages view template

##### Added src/pages/messages/messages.html
```diff
@@ -0,0 +1,25 @@
+┊  ┊ 1┊<ion-header>
+┊  ┊ 2┊  <ion-navbar color="whatsapp" class="messages-page-navbar">
+┊  ┊ 3┊    <ion-buttons>
+┊  ┊ 4┊      <img class="chat-picture" [src]="picture">
+┊  ┊ 5┊    </ion-buttons>
+┊  ┊ 6┊
+┊  ┊ 7┊    <ion-title class="chat-title">{{title}}</ion-title>
+┊  ┊ 8┊
+┊  ┊ 9┊    <ion-buttons end>
+┊  ┊10┊      <button ion-button icon-only class="attach-button"><ion-icon name="attach"></ion-icon></button>
+┊  ┊11┊      <button ion-button icon-only class="settings-button"><ion-icon name="more"></ion-icon></button>
+┊  ┊12┊    </ion-buttons>
+┊  ┊13┊  </ion-navbar>
+┊  ┊14┊</ion-header>
+┊  ┊15┊
+┊  ┊16┊<ion-content padding class="messages-page-content">
+┊  ┊17┊  <ion-scroll scrollY="true" class="messages">
+┊  ┊18┊    <div *ngFor="let message of messages | async" class="message-wrapper">
+┊  ┊19┊      <div [class]="'message message-' + message.ownership">
+┊  ┊20┊        <div class="message-content">{{message.content}}</div>
+┊  ┊21┊        <span class="message-timestamp">{{message.createdAt}}</span>
+┊  ┊22┊      </div>
+┊  ┊23┊    </div>
+┊  ┊24┊  </ion-scroll>
+┊  ┊25┊</ion-content>
```
[}]: #

The template has a picture and a title inside the Navigation Bar. 

It has also two buttons. Purpose of the first one is to send an attachment. The second one, just like in Chats, is to show more options.

As the content, we used list of messages.

It doesn't look quite good as it should, let's add some style:

[{]: <helper> (diff_step 4.9)
#### Step 4.9: Add basic messages stylesheet

##### Added src/pages/messages/messages.scss
```diff
@@ -0,0 +1,93 @@
+┊  ┊ 1┊.messages-page-navbar {
+┊  ┊ 2┊  .chat-picture {
+┊  ┊ 3┊    width: 50px;
+┊  ┊ 4┊    border-radius: 50%;
+┊  ┊ 5┊    float: left;
+┊  ┊ 6┊  }
+┊  ┊ 7┊
+┊  ┊ 8┊  .chat-title {
+┊  ┊ 9┊    line-height: 50px;
+┊  ┊10┊    float: left;
+┊  ┊11┊  }
+┊  ┊12┊}
+┊  ┊13┊
+┊  ┊14┊.messages-page-content {
+┊  ┊15┊  > .scroll-content {
+┊  ┊16┊    margin: 42px -15px 53px !important;
+┊  ┊17┊  }
+┊  ┊18┊
+┊  ┊19┊  .messages {
+┊  ┊20┊    height: 100%;
+┊  ┊21┊    background-image: url(/assets/chat-background.jpg);
+┊  ┊22┊    background-color: #E0DAD6;
+┊  ┊23┊    background-repeat: no-repeat;
+┊  ┊24┊    background-size: cover;
+┊  ┊25┊  }
+┊  ┊26┊
+┊  ┊27┊  .message-wrapper {
+┊  ┊28┊    margin-bottom: 9px;
+┊  ┊29┊
+┊  ┊30┊    &::after {
+┊  ┊31┊      content: "";
+┊  ┊32┊      display: table;
+┊  ┊33┊      clear: both;
+┊  ┊34┊    }
+┊  ┊35┊  }
+┊  ┊36┊
+┊  ┊37┊  .message {
+┊  ┊38┊    display: inline-block;
+┊  ┊39┊    position: relative;
+┊  ┊40┊    max-width: 236px;
+┊  ┊41┊    border-radius: 7px;
+┊  ┊42┊    box-shadow: 0 1px 2px rgba(0, 0, 0, .15);
+┊  ┊43┊
+┊  ┊44┊    &.message-mine {
+┊  ┊45┊      float: right;
+┊  ┊46┊      background-color: #DCF8C6;
+┊  ┊47┊
+┊  ┊48┊      &::before {
+┊  ┊49┊        right: -11px;
+┊  ┊50┊        background-image: url(/assets/message-mine.png)
+┊  ┊51┊      }
+┊  ┊52┊    }
+┊  ┊53┊
+┊  ┊54┊    &.message-other {
+┊  ┊55┊      float: left;
+┊  ┊56┊      background-color: #FFF;
+┊  ┊57┊
+┊  ┊58┊      &::before {
+┊  ┊59┊        left: -11px;
+┊  ┊60┊        background-image: url(/assets/message-other.png)
+┊  ┊61┊      }
+┊  ┊62┊    }
+┊  ┊63┊
+┊  ┊64┊    &.message-other::before, &.message-mine::before {
+┊  ┊65┊      content: "";
+┊  ┊66┊      position: absolute;
+┊  ┊67┊      bottom: 3px;
+┊  ┊68┊      width: 12px;
+┊  ┊69┊      height: 19px;
+┊  ┊70┊      background-position: 50% 50%;
+┊  ┊71┊      background-repeat: no-repeat;
+┊  ┊72┊      background-size: contain;
+┊  ┊73┊    }
+┊  ┊74┊
+┊  ┊75┊    .message-content {
+┊  ┊76┊      padding: 5px 7px;
+┊  ┊77┊      word-wrap: break-word;
+┊  ┊78┊
+┊  ┊79┊      &::after {
+┊  ┊80┊        content: " \00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0";
+┊  ┊81┊        display: inline;
+┊  ┊82┊      }
+┊  ┊83┊    }
+┊  ┊84┊
+┊  ┊85┊    .message-timestamp {
+┊  ┊86┊      position: absolute;
+┊  ┊87┊      bottom: 2px;
+┊  ┊88┊      right: 7px;
+┊  ┊89┊      font-size: 12px;
+┊  ┊90┊      color: gray;
+┊  ┊91┊    }
+┊  ┊92┊  }
+┊  ┊93┊}
```
[}]: #

This style requires us to add some assets, first we will create a copy called `assets` inside a `src` directory and then we will copy them like so:

    $ cd src/assets
    $ wget https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/raw/4a48a2fba2ff720b4dd7c903cd9ac68522aff7c7/src/assets/chat-background.jpg
    $ wget https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/raw/4a48a2fba2ff720b4dd7c903cd9ac68522aff7c7/src/assets/message-mine.png
    $ wget https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/raw/4a48a2fba2ff720b4dd7c903cd9ac68522aff7c7/src/assets/message-other.png

Now we need to take care of the message's timestamp and format it, then again we gonna use `angular2-moment` only this time we gonna use a different format using the `AmDateFormat` pipe:

[{]: <helper> (diff_step 4.11)
#### Step 4.11: Apply date format pipe to messages view template

##### Changed src/pages/messages/messages.html
```diff
@@ -18,7 +18,7 @@
 ┊18┊18┊    <div *ngFor="let message of messages | async" class="message-wrapper">
 ┊19┊19┊      <div [class]="'message message-' + message.ownership">
 ┊20┊20┊        <div class="message-content">{{message.content}}</div>
-┊21┊  ┊        <span class="message-timestamp">{{message.createdAt}}</span>
+┊  ┊21┊        <span class="message-timestamp">{{message.createdAt | amDateFormat: 'HH:MM'}}</span>
 ┊22┊22┊      </div>
 ┊23┊23┊    </div>
 ┊24┊24┊  </ion-scroll>
```
[}]: #

Our messages are set, but there is one really important feature missing and that's sending messages. Let's implement our message editor.

We will start with the view itself. We will add an input for editing our messages, a `send` button, and a `record` button whos logic won't be implemented in this tutorial since we only wanna focus on the text messaging system. To fulfill this layout we gonna use a tool-bar (`ion-toolbar`) inside a footer (`ion-footer`) and place it underneath the content of the view:

[{]: <helper> (diff_step 4.12)
#### Step 4.12: Add message editor to messages view template

##### Changed src/pages/messages/messages.html
```diff
@@ -23,3 +23,19 @@
 ┊23┊23┊    </div>
 ┊24┊24┊  </ion-scroll>
 ┊25┊25┊</ion-content>
+┊  ┊26┊
+┊  ┊27┊<ion-footer>
+┊  ┊28┊  <ion-toolbar color="whatsapp" class="messages-page-footer" position="bottom">
+┊  ┊29┊    <ion-input [(ngModel)]="message" (keypress)="onInputKeypress($event)" class="message-editor" placeholder="Type a message"></ion-input>
+┊  ┊30┊
+┊  ┊31┊    <ion-buttons end>
+┊  ┊32┊      <button ion-button icon-only *ngIf="message" class="message-editor-button" (click)="sendMessage()">
+┊  ┊33┊        <ion-icon name="send"></ion-icon>
+┊  ┊34┊      </button>
+┊  ┊35┊
+┊  ┊36┊      <button ion-button icon-only *ngIf="!message" class="message-editor-button">
+┊  ┊37┊        <ion-icon name="mic"></ion-icon>
+┊  ┊38┊      </button>
+┊  ┊39┊    </ion-buttons>
+┊  ┊40┊  </ion-toolbar>
+┊  ┊41┊</ion-footer>
```
[}]: #

Our stylesheet requires few adjustments as well:

[{]: <helper> (diff_step 4.13)
#### Step 4.13: Add message-editor style to messages stylesheet

##### Changed src/pages/messages/messages.scss
```diff
@@ -91,3 +91,22 @@
 ┊ 91┊ 91┊    }
 ┊ 92┊ 92┊  }
 ┊ 93┊ 93┊}
+┊   ┊ 94┊
+┊   ┊ 95┊.messages-page-footer {
+┊   ┊ 96┊  padding-right: 0;
+┊   ┊ 97┊
+┊   ┊ 98┊  .message-editor {
+┊   ┊ 99┊    margin-left: 2px;
+┊   ┊100┊    padding-left: 5px;
+┊   ┊101┊    background: white;
+┊   ┊102┊    border-radius: 3px;
+┊   ┊103┊  }
+┊   ┊104┊
+┊   ┊105┊  .message-editor-button {
+┊   ┊106┊    box-shadow: none;
+┊   ┊107┊    width: 50px;
+┊   ┊108┊    height: 50px;
+┊   ┊109┊    font-size: 17px;
+┊   ┊110┊    margin: auto;
+┊   ┊111┊  }
+┊   ┊112┊}
```
[}]: #

Now we can add handle message sending inside the component:

[{]: <helper> (diff_step 4.14)
#### Step 4.14: Add 'sendMessage()' handler to messages component

##### Changed src/pages/messages/messages.ts
```diff
@@ -3,6 +3,7 @@
 ┊3┊3┊import { Chat, Message } from "api/models/whatsapp-models";
 ┊4┊4┊import { Messages } from "api/collections/whatsapp-collections";
 ┊5┊5┊import { Observable} from "rxjs";
+┊ ┊6┊import { MeteorObservable } from "meteor-rxjs";
 ┊6┊7┊
 ┊7┊8┊@Component({
 ┊8┊9┊  selector: "messages-page",
```
```diff
@@ -13,6 +14,7 @@
 ┊13┊14┊  title: string;
 ┊14┊15┊  picture: string;
 ┊15┊16┊  messages: Observable<Message[]>;
+┊  ┊17┊  message: string = "";
 ┊16┊18┊
 ┊17┊19┊  constructor(navParams: NavParams) {
 ┊18┊20┊    this.selectedChat = <Chat>navParams.get('chat');
```
```diff
@@ -35,5 +37,17 @@
 ┊35┊37┊      return messages;
 ┊36┊38┊    });
 ┊37┊39┊  }
+┊  ┊40┊
+┊  ┊41┊  onInputKeypress({keyCode}: KeyboardEvent): void {
+┊  ┊42┊    if (keyCode == 13) {
+┊  ┊43┊      this.sendMessage();
+┊  ┊44┊    }
+┊  ┊45┊  }
+┊  ┊46┊
+┊  ┊47┊  sendMessage(): void {
+┊  ┊48┊    MeteorObservable.call('addMessage', this.selectedChat._id, this.message).zone().subscribe(() => {
+┊  ┊49┊      this.message = '';
+┊  ┊50┊    });
+┊  ┊51┊  }
 ┊38┊52┊}
```
[}]: #

As you can see, we used `addMessage` Method, which doesn't exist yet.

It the method which will add messages to our messages collection and run on both client's local cache and server. We're going to create a `server/imports/methods/methods.ts` file in our server and implement this method:

[{]: <helper> (diff_step 4.15)
#### Step 4.15: Add 'addMessage()' method to api

##### Added api/server/methods.ts
```diff
@@ -0,0 +1,21 @@
+┊  ┊ 1┊import { Meteor } from 'meteor/meteor';
+┊  ┊ 2┊import {Chats, Messages} from "../collections/whatsapp-collections";
+┊  ┊ 3┊
+┊  ┊ 4┊export function initMethods() {
+┊  ┊ 5┊  Meteor.methods({
+┊  ┊ 6┊    addMessage(chatId: string, content: string) {
+┊  ┊ 7┊      const chatExists = !!Chats.collection.find(chatId).count();
+┊  ┊ 8┊
+┊  ┊ 9┊      if (!chatExists) throw new Meteor.Error('chat-not-exists',
+┊  ┊10┊        'Chat doesn\'t exist');
+┊  ┊11┊
+┊  ┊12┊      return {
+┊  ┊13┊        messageId: Messages.collection.insert({
+┊  ┊14┊          chatId: chatId,
+┊  ┊15┊          content: content,
+┊  ┊16┊          createdAt: new Date()
+┊  ┊17┊        })
+┊  ┊18┊      }
+┊  ┊19┊    }
+┊  ┊20┊  });
+┊  ┊21┊}
```
[}]: #

Now let's import it and call the init method in the main server file:

[{]: <helper> (diff_step 4.16)
#### Step 4.16: Init methods in the server side

##### Changed api/server/main.ts
```diff
@@ -1,8 +1,11 @@
 ┊ 1┊ 1┊import { Meteor } from 'meteor/meteor';
 ┊ 2┊ 2┊import { Chats, Messages } from "../collections/whatsapp-collections";
 ┊ 3┊ 3┊import * as moment from "moment";
+┊  ┊ 4┊import { initMethods } from "./methods";
 ┊ 4┊ 5┊
 ┊ 5┊ 6┊Meteor.startup(() => {
+┊  ┊ 7┊  initMethods();
+┊  ┊ 8┊
 ┊ 6┊ 9┊  if (Chats.find({}).cursor.count() === 0) {
 ┊ 7┊10┊    let chatId;
```
[}]: #

We would also like to validate some data sent to methods we define.

For this we're going to use a utility package provided to us by Meteor and it's called `check`. Let's add it to the server (run inside `api` directory):

    $ meteor add check

And we're going use it in our method we just defined:

[{]: <helper> (diff_step 4.18)
#### Step 4.18: Add validations to 'addMessage()' method in api

##### Changed api/server/methods.ts
```diff
@@ -1,9 +1,18 @@
 ┊ 1┊ 1┊import { Meteor } from 'meteor/meteor';
-┊ 2┊  ┊import {Chats, Messages} from "../collections/whatsapp-collections";
+┊  ┊ 2┊import { Chats, Messages } from "../collections/whatsapp-collections";
+┊  ┊ 3┊import { check, Match } from "meteor/check";
+┊  ┊ 4┊
+┊  ┊ 5┊const nonEmptyString = Match.Where((str) => {
+┊  ┊ 6┊  check(str, String);
+┊  ┊ 7┊  return str.length > 0;
+┊  ┊ 8┊});
 ┊ 3┊ 9┊
 ┊ 4┊10┊export function initMethods() {
 ┊ 5┊11┊  Meteor.methods({
 ┊ 6┊12┊    addMessage(chatId: string, content: string) {
+┊  ┊13┊      check(chatId, nonEmptyString);
+┊  ┊14┊      check(content, nonEmptyString);
+┊  ┊15┊
 ┊ 7┊16┊      const chatExists = !!Chats.collection.find(chatId).count();
 ┊ 8┊17┊
 ┊ 9┊18┊      if (!chatExists) throw new Meteor.Error('chat-not-exists',
```
[}]: #

In addition, we would like the view to auto-scroll down whenever a new message is added:

[{]: <helper> (diff_step 4.19)
#### Step 4.19: Add an auto scroller to messages component

##### Changed src/pages/messages/messages.ts
```diff
@@ -1,27 +1,55 @@
-┊ 1┊  ┊import { Component, OnInit } from "@angular/core";
+┊  ┊ 1┊import {Component, OnInit, OnDestroy, ElementRef} from "@angular/core";
 ┊ 2┊ 2┊import { NavParams } from "ionic-angular";
 ┊ 3┊ 3┊import { Chat, Message } from "api/models/whatsapp-models";
 ┊ 4┊ 4┊import { Messages } from "api/collections/whatsapp-collections";
-┊ 5┊  ┊import { Observable} from "rxjs";
+┊  ┊ 5┊import { Observable, Subscription } from "rxjs";
 ┊ 6┊ 6┊import { MeteorObservable } from "meteor-rxjs";
 ┊ 7┊ 7┊
 ┊ 8┊ 8┊@Component({
 ┊ 9┊ 9┊  selector: "messages-page",
 ┊10┊10┊  templateUrl: "messages.html"
 ┊11┊11┊})
-┊12┊  ┊export class MessagesPage implements OnInit {
+┊  ┊12┊export class MessagesPage implements OnInit, OnDestroy {
 ┊13┊13┊  selectedChat: Chat;
 ┊14┊14┊  title: string;
 ┊15┊15┊  picture: string;
 ┊16┊16┊  messages: Observable<Message[]>;
 ┊17┊17┊  message: string = "";
+┊  ┊18┊  autoScroller: Subscription;
 ┊18┊19┊
-┊19┊  ┊  constructor(navParams: NavParams) {
+┊  ┊20┊  constructor(navParams: NavParams, element: ElementRef) {
 ┊20┊21┊    this.selectedChat = <Chat>navParams.get('chat');
 ┊21┊22┊    this.title = this.selectedChat.title;
 ┊22┊23┊    this.picture = this.selectedChat.picture;
 ┊23┊24┊  }
 ┊24┊25┊
+┊  ┊26┊  private get messagesPageContent(): Element {
+┊  ┊27┊    return document.querySelector('.messages-page-content');
+┊  ┊28┊  }
+┊  ┊29┊
+┊  ┊30┊  private get messagesPageFooter(): Element {
+┊  ┊31┊    return document.querySelector('.messages-page-footer');
+┊  ┊32┊  }
+┊  ┊33┊
+┊  ┊34┊  private get messagesList(): Element {
+┊  ┊35┊    return this.messagesPageContent.querySelector('.messages');
+┊  ┊36┊  }
+┊  ┊37┊
+┊  ┊38┊  private get messageEditor(): HTMLInputElement {
+┊  ┊39┊    return <HTMLInputElement>this.messagesPageFooter.querySelector('.message-editor');
+┊  ┊40┊  }
+┊  ┊41┊
+┊  ┊42┊  private get scroller(): Element {
+┊  ┊43┊    return this.messagesList.querySelector('.scroll-content');
+┊  ┊44┊  }
+┊  ┊45┊
+┊  ┊46┊  ngOnDestroy() {
+┊  ┊47┊    if (this.autoScroller) {
+┊  ┊48┊      this.autoScroller.unsubscribe();
+┊  ┊49┊      this.autoScroller = undefined;
+┊  ┊50┊    }
+┊  ┊51┊  }
+┊  ┊52┊
 ┊25┊53┊  ngOnInit() {
 ┊26┊54┊    let isEven = false;
 ┊27┊55┊
```
```diff
@@ -36,6 +64,11 @@
 ┊36┊64┊
 ┊37┊65┊      return messages;
 ┊38┊66┊    });
+┊  ┊67┊
+┊  ┊68┊    this.autoScroller = MeteorObservable.autorun().subscribe(() => {
+┊  ┊69┊      this.scroller.scrollTop = this.scroller.scrollHeight;
+┊  ┊70┊      this.messageEditor.focus();
+┊  ┊71┊    });
 ┊39┊72┊  }
 ┊40┊73┊
 ┊41┊74┊  onInputKeypress({keyCode}: KeyboardEvent): void {
```
[}]: #

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step3.md) | [Next Step >](step5.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #