[{]: <region> (header)
# Step 6: Messages Page
[}]: #
[{]: <region> (body)
In this step we will add the messages view and the ability to send messages.

Before we implement anything related to the messages pages, we first have to make sure that once we click on a chat item in the chats page, we will be promoted into its corresponding messages view. Let's first implement the `showMessages()` method in the chats component:

[{]: <helper> (diff_step 6.1)
#### Step 6.1: Add showMessages

##### Changed src/pages/chats/chats.ts
```diff
@@ -1,6 +1,7 @@
 ┊1┊1┊import { Component, OnInit } from '@angular/core';
 ┊2┊2┊import { Chats, Messages } from 'api/collections';
 ┊3┊3┊import { Chat } from 'api/models';
+┊ ┊4┊import { NavController } from 'ionic-angular';
 ┊4┊5┊import { Observable } from 'rxjs';
 ┊5┊6┊
 ┊6┊7┊@Component({
```
```diff
@@ -9,7 +10,7 @@
 ┊ 9┊10┊export class ChatsPage implements OnInit {
 ┊10┊11┊  chats;
 ┊11┊12┊
-┊12┊  ┊  constructor() {
+┊  ┊13┊  constructor(private navCtrl: NavController) {
 ┊13┊14┊  }
 ┊14┊15┊
 ┊15┊16┊  ngOnInit() {
```
```diff
@@ -30,6 +31,10 @@
 ┊30┊31┊      ).zone();
 ┊31┊32┊  }
 ┊32┊33┊
+┊  ┊34┊  showMessages(chat): void {
+┊  ┊35┊    this.navCtrl.push(MessagesPage, {chat});
+┊  ┊36┊  }
+┊  ┊37┊
 ┊33┊38┊  removeChat(chat: Chat): void {
 ┊34┊39┊    Chats.remove({_id: chat._id}).subscribe(() => {
 ┊35┊40┊    });
```
[}]: #

And let's register the click event in the view:

[{]: <helper> (diff_step 6.2)
#### Step 6.2: Bind click event to showMessages

##### Changed src/pages/chats/chats.html
```diff
@@ -17,7 +17,7 @@
 ┊17┊17┊<ion-content class="chats-page-content">
 ┊18┊18┊  <ion-list class="chats">
 ┊19┊19┊    <ion-item-sliding *ngFor="let chat of chats | async">
-┊20┊  ┊      <button ion-item class="chat">
+┊  ┊20┊      <button ion-item class="chat" (click)="showMessages(chat)">
 ┊21┊21┊        <img class="chat-picture" [src]="chat.picture">
 ┊22┊22┊        <div class="chat-info">
 ┊23┊23┊          <h2 class="chat-title">{{chat.title}}</h2>
```
[}]: #

Notice how we used a controller called `NavController`. The `NavController` is `Ionic`'s new method to navigate in our app. We can also use a traditional router, but since in a mobile app we have no access to the url bar, this might come more in handy. You can read more about the `NavController` [here](http://ionicframework.com/docs/v2/api/components/nav/NavController/).

Let's go ahead and implement the messages component. We'll call it `MessagesPage`:

[{]: <helper> (diff_step 6.3)
#### Step 6.3: Create a stub MessagesPage component

##### Added src/pages/messages/messages.ts
```diff
@@ -0,0 +1,21 @@
+┊  ┊ 1┊import { Component, OnInit } from '@angular/core';
+┊  ┊ 2┊import { NavParams } from 'ionic-angular';
+┊  ┊ 3┊import { Chat } from 'api/models';
+┊  ┊ 4┊
+┊  ┊ 5┊@Component({
+┊  ┊ 6┊  selector: 'messages-page',
+┊  ┊ 7┊  template: `Messages Page`
+┊  ┊ 8┊})
+┊  ┊ 9┊export class MessagesPage implements OnInit {
+┊  ┊10┊  selectedChat: Chat;
+┊  ┊11┊
+┊  ┊12┊  constructor(navParams: NavParams) {
+┊  ┊13┊    this.selectedChat = <Chat>navParams.get('chat');
+┊  ┊14┊
+┊  ┊15┊    console.log('Selected chat is: ', this.selectedChat);
+┊  ┊16┊  }
+┊  ┊17┊
+┊  ┊18┊  ngOnInit() {
+┊  ┊19┊
+┊  ┊20┊  }
+┊  ┊21┊}
```
[}]: #

As you can see, in order to get the chat's id we used the `NavParams` service. This is a simple service which gives you access to a key-value storage containing all the parameters we've passed using the `NavController`.

For more information about the `NavParams` service, see the following [link](http://ionicframework.com/docs/v2/api/components/nav/NavParams).

Don't forget that any component you create has to be imported in the app's module:

[{]: <helper> (diff_step 6.4)
#### Step 6.4: Import MessagesPage in the NgModule

##### Changed src/app/app.module.ts
```diff
@@ -2,12 +2,14 @@
 ┊ 2┊ 2┊import { MomentModule } from 'angular2-moment';
 ┊ 3┊ 3┊import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
 ┊ 4┊ 4┊import { ChatsPage } from '../pages/chats/chats';
+┊  ┊ 5┊import { MessagesPage } from '../pages/messages/messages';
 ┊ 5┊ 6┊import { MyApp } from './app.component';
 ┊ 6┊ 7┊
 ┊ 7┊ 8┊@NgModule({
 ┊ 8┊ 9┊  declarations: [
 ┊ 9┊10┊    MyApp,
-┊10┊  ┊    ChatsPage
+┊  ┊11┊    ChatsPage,
+┊  ┊12┊    MessagesPage
 ┊11┊13┊  ],
 ┊12┊14┊  imports: [
 ┊13┊15┊    IonicModule.forRoot(MyApp),
```
```diff
@@ -16,7 +18,8 @@
 ┊16┊18┊  bootstrap: [IonicApp],
 ┊17┊19┊  entryComponents: [
 ┊18┊20┊    MyApp,
-┊19┊  ┊    ChatsPage
+┊  ┊21┊    ChatsPage,
+┊  ┊22┊    MessagesPage
 ┊20┊23┊  ],
 ┊21┊24┊  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
 ┊22┊25┊})
```
[}]: #

Now we can complete our `ChatsPage`'s navigation method by importing the `MessagesPage`:

[{]: <helper> (diff_step 6.5)
#### Step 6.5: Import MessagesPage to chats page

##### Changed src/pages/chats/chats.ts
```diff
@@ -3,6 +3,7 @@
 ┊3┊3┊import { Chat } from 'api/models';
 ┊4┊4┊import { NavController } from 'ionic-angular';
 ┊5┊5┊import { Observable } from 'rxjs';
+┊ ┊6┊import { MessagesPage } from '../messages/messages';
 ┊6┊7┊
 ┊7┊8┊@Component({
 ┊8┊9┊  templateUrl: 'chats.html'
```
[}]: #

We're missing some important details in the messages page. We don't know who we're chatting with, we don't know how does he look like, and we don't know which message is ours, and which is not. We can add these using the following code snippet:

[{]: <helper> (diff_step 6.6)
#### Step 6.6: Add basic messages component

##### Changed src/pages/messages/messages.ts
```diff
@@ -1,21 +1,38 @@
 ┊ 1┊ 1┊import { Component, OnInit } from '@angular/core';
 ┊ 2┊ 2┊import { NavParams } from 'ionic-angular';
-┊ 3┊  ┊import { Chat } from 'api/models';
+┊  ┊ 3┊import { Chat, Message } from 'api/models';
+┊  ┊ 4┊import { Observable } from 'rxjs';
+┊  ┊ 5┊import { Messages } from 'api/collections';
 ┊ 4┊ 6┊
 ┊ 5┊ 7┊@Component({
 ┊ 6┊ 8┊  selector: 'messages-page',
-┊ 7┊  ┊  template: `Messages Page`
+┊  ┊ 9┊  templateUrl: 'messages.html'
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
-┊15┊  ┊    console.log('Selected chat is: ', this.selectedChat);
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
```
[}]: #

Since now we're not really able to determine the author of a message, we mark every even message as ours; But later on once we have an authentication system and users, we will be filling the missing gap.

We will also have to update the message model to have an `ownership` property:

[{]: <helper> (diff_step 6.7)
#### Step 6.7: Add ownership property to messages model

##### Changed api/server/models.ts
```diff
@@ -15,4 +15,5 @@
 ┊15┊15┊  content?: string;
 ┊16┊16┊  createdAt?: Date;
 ┊17┊17┊  type?: MessageType
+┊  ┊18┊  ownership?: string;
 ┊18┊19┊}
```
[}]: #

Now that we have a basic component, let's implement a messages view as well:

[{]: <helper> (diff_step 6.8)
#### Step 6.8: Add message page template

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
+┊  ┊11┊      <button ion-button icon-only class="options-button"><ion-icon name="more"></ion-icon></button>
+┊  ┊12┊    </ion-buttons>
+┊  ┊13┊  </ion-navbar>
+┊  ┊14┊</ion-header>
+┊  ┊15┊
+┊  ┊16┊<ion-content padding class="messages-page-content">
+┊  ┊17┊  <ion-scroll scrollY="true" class="messages">
+┊  ┊18┊    <div *ngFor="let message of messages | async" class="day-wrapper">
+┊  ┊19┊        <div [class]="'message message-' + message.ownership">
+┊  ┊20┊          <div *ngIf="message.type == 'text'" class="message-content message-content-text">{{message.content}}</div>
+┊  ┊21┊          <span class="message-timestamp">{{ message.createdAt }}</span>
+┊  ┊22┊      </div>
+┊  ┊23┊    </div>
+┊  ┊24┊  </ion-scroll>
+┊  ┊25┊</ion-content>
```
[}]: #

The template consists of a picture and a title inside the navigation bar. It also has two buttons. The purpose of the first button from the left would be sending attachments, and the second one should show an options pop-over, just like in the chats page. As for the content, we simply used a list of messages to show all available messages in the selected chat. To complete the view, let's write its belonging stylesheet:

[{]: <helper> (diff_step 6.9)
#### Step 6.9: Style the message component

##### Changed src/pages/messages/messages.html
```diff
@@ -15,7 +15,7 @@
 ┊15┊15┊
 ┊16┊16┊<ion-content padding class="messages-page-content">
 ┊17┊17┊  <ion-scroll scrollY="true" class="messages">
-┊18┊  ┊    <div *ngFor="let message of messages | async" class="day-wrapper">
+┊  ┊18┊    <div *ngFor="let message of messages | async" class="message-wrapper">
 ┊19┊19┊        <div [class]="'message message-' + message.ownership">
 ┊20┊20┊          <div *ngIf="message.type == 'text'" class="message-content message-content-text">{{message.content}}</div>
 ┊21┊21┊          <span class="message-timestamp">{{ message.createdAt }}</span>
```

##### Added src/pages/messages/messages.scss
```diff
@@ -0,0 +1,106 @@
+┊   ┊  1┊.messages-page-navbar {
+┊   ┊  2┊  .chat-picture {
+┊   ┊  3┊    width: 50px;
+┊   ┊  4┊    border-radius: 50%;
+┊   ┊  5┊    float: left;
+┊   ┊  6┊  }
+┊   ┊  7┊
+┊   ┊  8┊  .chat-title {
+┊   ┊  9┊    line-height: 50px;
+┊   ┊ 10┊    float: left;
+┊   ┊ 11┊  }
+┊   ┊ 12┊}
+┊   ┊ 13┊
+┊   ┊ 14┊.messages-page-content {
+┊   ┊ 15┊  > .scroll-content {
+┊   ┊ 16┊    margin: 42px -16px 42px !important;
+┊   ┊ 17┊  }
+┊   ┊ 18┊
+┊   ┊ 19┊  .day-wrapper .day-timestamp {
+┊   ┊ 20┊    margin-left: calc(50% - 64px);
+┊   ┊ 21┊    margin-right: calc(50% - 64px);
+┊   ┊ 22┊    margin-bottom: 9px;
+┊   ┊ 23┊    text-align: center;
+┊   ┊ 24┊    line-height: 27px;
+┊   ┊ 25┊    height: 27px;
+┊   ┊ 26┊    border-radius: 3px;
+┊   ┊ 27┊    color: gray;
+┊   ┊ 28┊    box-shadow: 0 1px 2px rgba(0, 0, 0, .15);
+┊   ┊ 29┊    background: #d9effa;
+┊   ┊ 30┊  }
+┊   ┊ 31┊
+┊   ┊ 32┊  .messages {
+┊   ┊ 33┊    height: 100%;
+┊   ┊ 34┊    background-image: url(/assets/chat-background.jpg);
+┊   ┊ 35┊    background-color: #E0DAD6;
+┊   ┊ 36┊    background-repeat: no-repeat;
+┊   ┊ 37┊    background-size: cover;
+┊   ┊ 38┊  }
+┊   ┊ 39┊
+┊   ┊ 40┊  .message-wrapper {
+┊   ┊ 41┊    margin-bottom: 9px;
+┊   ┊ 42┊
+┊   ┊ 43┊    &::after {
+┊   ┊ 44┊      content: "";
+┊   ┊ 45┊      display: table;
+┊   ┊ 46┊      clear: both;
+┊   ┊ 47┊    }
+┊   ┊ 48┊  }
+┊   ┊ 49┊
+┊   ┊ 50┊  .message {
+┊   ┊ 51┊    display: inline-block;
+┊   ┊ 52┊    position: relative;
+┊   ┊ 53┊    max-width: 65vh;
+┊   ┊ 54┊    border-radius: 7px;
+┊   ┊ 55┊    box-shadow: 0 1px 2px rgba(0, 0, 0, .15);
+┊   ┊ 56┊
+┊   ┊ 57┊    &.message-mine {
+┊   ┊ 58┊      float: right;
+┊   ┊ 59┊      background-color: #DCF8C6;
+┊   ┊ 60┊
+┊   ┊ 61┊      &::before {
+┊   ┊ 62┊        right: -11px;
+┊   ┊ 63┊        background-image: url(/assets/message-mine.png)
+┊   ┊ 64┊      }
+┊   ┊ 65┊    }
+┊   ┊ 66┊
+┊   ┊ 67┊    &.message-other {
+┊   ┊ 68┊      float: left;
+┊   ┊ 69┊      background-color: #FFF;
+┊   ┊ 70┊
+┊   ┊ 71┊      &::before {
+┊   ┊ 72┊        left: -11px;
+┊   ┊ 73┊        background-image: url(/assets/message-other.png)
+┊   ┊ 74┊      }
+┊   ┊ 75┊    }
+┊   ┊ 76┊
+┊   ┊ 77┊    &.message-other::before, &.message-mine::before {
+┊   ┊ 78┊      content: "";
+┊   ┊ 79┊      position: absolute;
+┊   ┊ 80┊      bottom: 3px;
+┊   ┊ 81┊      width: 12px;
+┊   ┊ 82┊      height: 19px;
+┊   ┊ 83┊      background-position: 50% 50%;
+┊   ┊ 84┊      background-repeat: no-repeat;
+┊   ┊ 85┊      background-size: contain;
+┊   ┊ 86┊    }
+┊   ┊ 87┊
+┊   ┊ 88┊    .message-content {
+┊   ┊ 89┊      padding: 5px 7px;
+┊   ┊ 90┊      word-wrap: break-word;
+┊   ┊ 91┊
+┊   ┊ 92┊      &::after {
+┊   ┊ 93┊        content: " \00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0";
+┊   ┊ 94┊        display: inline;
+┊   ┊ 95┊      }
+┊   ┊ 96┊    }
+┊   ┊ 97┊
+┊   ┊ 98┊    .message-timestamp {
+┊   ┊ 99┊      position: absolute;
+┊   ┊100┊      bottom: 2px;
+┊   ┊101┊      right: 7px;
+┊   ┊102┊      font-size: 12px;
+┊   ┊103┊      color: gray;
+┊   ┊104┊    }
+┊   ┊105┊  }
+┊   ┊106┊}
```
[}]: #

This style requires us to add some assets. So inside the `src/assets` dir, download the following:

    src/assets$ wget https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/raw/cc8a09a04e26b50395b703092fb15cb07aec36ce/src/assets/chat-background.jpg
    src/assets$ wget https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/raw/cc8a09a04e26b50395b703092fb15cb07aec36ce/src/assets/message-mine.png
    src/assets$ wget https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/raw/cc8a09a04e26b50395b703092fb15cb07aec36ce/src/assets/message-other.png

Now we need to take care of the message's timestamp and format it, then again we gonna use `angular2-moment` only this time we gonna use a different format using the `amDateFormat` pipe:

[{]: <helper> (diff_step 6.11)
#### Step 6.11: Use amDateFormat

##### Changed src/pages/messages/messages.html
```diff
@@ -18,7 +18,7 @@
 ┊18┊18┊    <div *ngFor="let message of messages | async" class="message-wrapper">
 ┊19┊19┊        <div [class]="'message message-' + message.ownership">
 ┊20┊20┊          <div *ngIf="message.type == 'text'" class="message-content message-content-text">{{message.content}}</div>
-┊21┊  ┊          <span class="message-timestamp">{{ message.createdAt }}</span>
+┊  ┊21┊          <span class="message-timestamp">{{ message.createdAt | amDateFormat: 'HH:mm' }}</span>
 ┊22┊22┊      </div>
 ┊23┊23┊    </div>
 ┊24┊24┊  </ion-scroll>
```
[}]: #

Our messages are set, but there is one really important feature missing: sending messages. Let's implement our message editor. We will start with the view itself. We will add an input for editing our messages, a `send` button, and a `record` button whose logic won't be implemented in this tutorial since we only wanna focus on the text messaging system. To fulfill this layout we gonna use a tool-bar (`ion-toolbar`) inside a footer (`ion-footer`) and place it underneath the content of the view:

[{]: <helper> (diff_step 6.12)
#### Step 6.12: Add message editor to messages view template

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
+┊  ┊32┊      <button ion-button icon-only *ngIf="message" class="message-editor-button" (click)="sendTextMessage()">
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

[{]: <helper> (diff_step 6.13)
#### Step 6.13: Add styles for message page footer

##### Changed src/pages/messages/messages.scss
```diff
@@ -104,3 +104,22 @@
 ┊104┊104┊    }
 ┊105┊105┊  }
 ┊106┊106┊}
+┊   ┊107┊
+┊   ┊108┊.messages-page-footer {
+┊   ┊109┊  padding-right: 0;
+┊   ┊110┊
+┊   ┊111┊  .message-editor {
+┊   ┊112┊    margin-left: 2px;
+┊   ┊113┊    padding-left: 5px;
+┊   ┊114┊    background: white;
+┊   ┊115┊    border-radius: 3px;
+┊   ┊116┊  }
+┊   ┊117┊
+┊   ┊118┊  .message-editor-button {
+┊   ┊119┊    box-shadow: none;
+┊   ┊120┊    width: 50px;
+┊   ┊121┊    height: 50px;
+┊   ┊122┊    font-size: 17px;
+┊   ┊123┊    margin: auto;
+┊   ┊124┊  }
+┊   ┊125┊}
```
[}]: #

Now we can implement the handler for messages sending in the component:

[{]: <helper> (diff_step 6.14)
#### Step 6.14: Implement sendTextMessage method

##### Changed src/pages/messages/messages.ts
```diff
@@ -1,8 +1,9 @@
 ┊1┊1┊import { Component, OnInit } from '@angular/core';
 ┊2┊2┊import { NavParams } from 'ionic-angular';
-┊3┊ ┊import { Chat, Message } from 'api/models';
+┊ ┊3┊import { Chat, Message, MessageType } from 'api/models';
 ┊4┊4┊import { Observable } from 'rxjs';
 ┊5┊5┊import { Messages } from 'api/collections';
+┊ ┊6┊import { MeteorObservable } from 'meteor-rxjs';
 ┊6┊7┊
 ┊7┊8┊@Component({
 ┊8┊9┊  selector: 'messages-page',
```
```diff
@@ -13,6 +14,7 @@
 ┊13┊14┊  title: string;
 ┊14┊15┊  picture: string;
 ┊15┊16┊  messages: Observable<Message[]>;
+┊  ┊17┊  message: string = '';
 ┊16┊18┊
 ┊17┊19┊  constructor(navParams: NavParams) {
 ┊18┊20┊    this.selectedChat = <Chat>navParams.get('chat');
```
```diff
@@ -35,4 +37,25 @@
 ┊35┊37┊      return messages;
 ┊36┊38┊    });
 ┊37┊39┊  }
+┊  ┊40┊
+┊  ┊41┊  onInputKeypress({ keyCode }: KeyboardEvent): void {
+┊  ┊42┊    if (keyCode === 13) {
+┊  ┊43┊      this.sendTextMessage();
+┊  ┊44┊    }
+┊  ┊45┊  }
+┊  ┊46┊
+┊  ┊47┊  sendTextMessage(): void {
+┊  ┊48┊    // If message was yet to be typed, abort
+┊  ┊49┊    if (!this.message) {
+┊  ┊50┊      return;
+┊  ┊51┊    }
+┊  ┊52┊
+┊  ┊53┊    MeteorObservable.call('addMessage', MessageType.TEXT,
+┊  ┊54┊      this.selectedChat._id,
+┊  ┊55┊      this.message
+┊  ┊56┊    ).zone().subscribe(() => {
+┊  ┊57┊      // Zero the input field
+┊  ┊58┊      this.message = '';
+┊  ┊59┊    });
+┊  ┊60┊  }
 ┊38┊61┊}
```
[}]: #

As you can see, we've used a `Meteor` method called `sendTextMessage`, which is yet to exist. This method will add messages to our messages collection and run on both client's local cache and server. Now we're going to create a `server/methods.ts` file in our server and implement the method's logic:

[{]: <helper> (diff_step 6.15)
#### Step 6.15: Implement Meteor method for adding a new message

##### Added api/server/methods.ts
```diff
@@ -0,0 +1,23 @@
+┊  ┊ 1┊import { Chats } from './collections/chats';
+┊  ┊ 2┊import { Messages } from './collections/messages';
+┊  ┊ 3┊import { MessageType } from './models';
+┊  ┊ 4┊
+┊  ┊ 5┊Meteor.methods({
+┊  ┊ 6┊  addMessage(type: MessageType, chatId: string, content: string) {
+┊  ┊ 7┊    const chatExists = !!Chats.collection.find(chatId).count();
+┊  ┊ 8┊
+┊  ┊ 9┊    if (!chatExists) {
+┊  ┊10┊      throw new Meteor.Error('chat-not-exists',
+┊  ┊11┊        'Chat doesn\'t exist');
+┊  ┊12┊    }
+┊  ┊13┊
+┊  ┊14┊    return {
+┊  ┊15┊      messageId: Messages.collection.insert({
+┊  ┊16┊        chatId: chatId,
+┊  ┊17┊        content: content,
+┊  ┊18┊        createdAt: new Date(),
+┊  ┊19┊        type: type
+┊  ┊20┊      })
+┊  ┊21┊    };
+┊  ┊22┊  }
+┊  ┊23┊});
```
[}]: #

We would also like to validate some data sent to methods we define. For this we're gonna use a utility package provided to us by `Meteor` and it's called `check`.

It requires us to add the following package in the server:

    api$ meteor add check

And we're gonna use it in the `addMessage` method we've just defined:

[{]: <helper> (diff_step 6.15)
#### Step 6.15: Implement Meteor method for adding a new message

##### Added api/server/methods.ts
```diff
@@ -0,0 +1,23 @@
+┊  ┊ 1┊import { Chats } from './collections/chats';
+┊  ┊ 2┊import { Messages } from './collections/messages';
+┊  ┊ 3┊import { MessageType } from './models';
+┊  ┊ 4┊
+┊  ┊ 5┊Meteor.methods({
+┊  ┊ 6┊  addMessage(type: MessageType, chatId: string, content: string) {
+┊  ┊ 7┊    const chatExists = !!Chats.collection.find(chatId).count();
+┊  ┊ 8┊
+┊  ┊ 9┊    if (!chatExists) {
+┊  ┊10┊      throw new Meteor.Error('chat-not-exists',
+┊  ┊11┊        'Chat doesn\'t exist');
+┊  ┊12┊    }
+┊  ┊13┊
+┊  ┊14┊    return {
+┊  ┊15┊      messageId: Messages.collection.insert({
+┊  ┊16┊        chatId: chatId,
+┊  ┊17┊        content: content,
+┊  ┊18┊        createdAt: new Date(),
+┊  ┊19┊        type: type
+┊  ┊20┊      })
+┊  ┊21┊    };
+┊  ┊22┊  }
+┊  ┊23┊});
```
[}]: #

## Auto Scroll

In addition, we would like the view to auto-scroll down whenever a new message is added. We can achieve that using a native class called [MutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver), which can detect changes in the view:

[{]: <helper> (diff_step 6.18)
#### Step 6.18: Implement auto scroll

##### Changed src/pages/messages/messages.ts
```diff
@@ -1,4 +1,4 @@
-┊1┊ ┊import { Component, OnInit } from '@angular/core';
+┊ ┊1┊import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
 ┊2┊2┊import { NavParams } from 'ionic-angular';
 ┊3┊3┊import { Chat, Message, MessageType } from 'api/models';
 ┊4┊4┊import { Observable } from 'rxjs';
```
```diff
@@ -9,20 +9,39 @@
 ┊ 9┊ 9┊  selector: 'messages-page',
 ┊10┊10┊  templateUrl: 'messages.html'
 ┊11┊11┊})
-┊12┊  ┊export class MessagesPage implements OnInit {
+┊  ┊12┊export class MessagesPage implements OnInit, OnDestroy {
 ┊13┊13┊  selectedChat: Chat;
 ┊14┊14┊  title: string;
 ┊15┊15┊  picture: string;
 ┊16┊16┊  messages: Observable<Message[]>;
 ┊17┊17┊  message: string = '';
+┊  ┊18┊  autoScroller: MutationObserver;
+┊  ┊19┊  scrollOffset = 0;
 ┊18┊20┊
-┊19┊  ┊  constructor(navParams: NavParams) {
+┊  ┊21┊  constructor(
+┊  ┊22┊    navParams: NavParams,
+┊  ┊23┊    private el: ElementRef
+┊  ┊24┊  ) {
 ┊20┊25┊    this.selectedChat = <Chat>navParams.get('chat');
 ┊21┊26┊    this.title = this.selectedChat.title;
 ┊22┊27┊    this.picture = this.selectedChat.picture;
 ┊23┊28┊  }
 ┊24┊29┊
+┊  ┊30┊  private get messagesPageContent(): Element {
+┊  ┊31┊    return this.el.nativeElement.querySelector('.messages-page-content');
+┊  ┊32┊  }
+┊  ┊33┊
+┊  ┊34┊  private get messagesList(): Element {
+┊  ┊35┊    return this.messagesPageContent.querySelector('.messages');
+┊  ┊36┊  }
+┊  ┊37┊
+┊  ┊38┊  private get scroller(): Element {
+┊  ┊39┊    return this.messagesList.querySelector('.scroll-content');
+┊  ┊40┊  }
+┊  ┊41┊
 ┊25┊42┊  ngOnInit() {
+┊  ┊43┊    this.autoScroller = this.autoScroll();
+┊  ┊44┊
 ┊26┊45┊    let isEven = false;
 ┊27┊46┊
 ┊28┊47┊    this.messages = Messages.find(
```
```diff
@@ -38,6 +57,28 @@
 ┊38┊57┊    });
 ┊39┊58┊  }
 ┊40┊59┊
+┊  ┊60┊  ngOnDestroy() {
+┊  ┊61┊    this.autoScroller.disconnect();
+┊  ┊62┊  }
+┊  ┊63┊
+┊  ┊64┊  autoScroll(): MutationObserver {
+┊  ┊65┊    const autoScroller = new MutationObserver(this.scrollDown.bind(this));
+┊  ┊66┊
+┊  ┊67┊    autoScroller.observe(this.messagesList, {
+┊  ┊68┊      childList: true,
+┊  ┊69┊      subtree: true
+┊  ┊70┊    });
+┊  ┊71┊
+┊  ┊72┊    return autoScroller;
+┊  ┊73┊  }
+┊  ┊74┊
+┊  ┊75┊  scrollDown(): void {
+┊  ┊76┊    // Scroll down and apply specified offset
+┊  ┊77┊    this.scroller.scrollTop = this.scroller.scrollHeight - this.scrollOffset;
+┊  ┊78┊    // Zero offset for next invocation
+┊  ┊79┊    this.scrollOffset = 0;
+┊  ┊80┊  }
+┊  ┊81┊
 ┊41┊82┊  onInputKeypress({ keyCode }: KeyboardEvent): void {
 ┊42┊83┊    if (keyCode === 13) {
 ┊43┊84┊      this.sendTextMessage();
```
[}]: #

So why didn't we update the scrolling position on a `Meteor` computation? - Because we want to initiate the scrolling function once the **view** is ready, not the **data**. They might look similar, but the difference is crucial.

## Group Messages

Our next goal would be grouping our messages on the view according to the day they were sent, with an exception of the current date. So let's say we're in January 2nd 2017; Messages from yesterday will appear above the label `January 1 2017`.

We can group our messages right after being fetched by the `Observable` using the `map` function:

[{]: <helper> (diff_step 6.19)
#### Step 6.19: Add group by date to the UI

##### Changed src/pages/messages/messages.ts
```diff
@@ -1,9 +1,10 @@
 ┊ 1┊ 1┊import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
 ┊ 2┊ 2┊import { NavParams } from 'ionic-angular';
 ┊ 3┊ 3┊import { Chat, Message, MessageType } from 'api/models';
-┊ 4┊  ┊import { Observable } from 'rxjs';
 ┊ 5┊ 4┊import { Messages } from 'api/collections';
 ┊ 6┊ 5┊import { MeteorObservable } from 'meteor-rxjs';
+┊  ┊ 6┊import * as moment from 'moment';
+┊  ┊ 7┊import { _ } from 'meteor/underscore';
 ┊ 7┊ 8┊
 ┊ 8┊ 9┊@Component({
 ┊ 9┊10┊  selector: 'messages-page',
```
```diff
@@ -13,7 +14,7 @@
 ┊13┊14┊  selectedChat: Chat;
 ┊14┊15┊  title: string;
 ┊15┊16┊  picture: string;
-┊16┊  ┊  messages: Observable<Message[]>;
+┊  ┊17┊  messagesDayGroups;
 ┊17┊18┊  message: string = '';
 ┊18┊19┊  autoScroller: MutationObserver;
 ┊19┊20┊  scrollOffset = 0;
```
```diff
@@ -41,26 +42,54 @@
 ┊41┊42┊
 ┊42┊43┊  ngOnInit() {
 ┊43┊44┊    this.autoScroller = this.autoScroll();
-┊44┊  ┊
-┊45┊  ┊    let isEven = false;
-┊46┊  ┊
-┊47┊  ┊    this.messages = Messages.find(
-┊48┊  ┊      {chatId: this.selectedChat._id},
-┊49┊  ┊      {sort: {createdAt: 1}}
-┊50┊  ┊    ).map((messages: Message[]) => {
-┊51┊  ┊      messages.forEach((message: Message) => {
-┊52┊  ┊        message.ownership = isEven ? 'mine' : 'other';
-┊53┊  ┊        isEven = !isEven;
-┊54┊  ┊      });
-┊55┊  ┊
-┊56┊  ┊      return messages;
-┊57┊  ┊    });
+┊  ┊45┊    this.subscribeMessages();
 ┊58┊46┊  }
 ┊59┊47┊
 ┊60┊48┊  ngOnDestroy() {
 ┊61┊49┊    this.autoScroller.disconnect();
 ┊62┊50┊  }
 ┊63┊51┊
+┊  ┊52┊  subscribeMessages() {
+┊  ┊53┊    this.scrollOffset = this.scroller.scrollHeight;
+┊  ┊54┊    this.messagesDayGroups = this.findMessagesDayGroups();
+┊  ┊55┊  }
+┊  ┊56┊
+┊  ┊57┊  findMessagesDayGroups() {
+┊  ┊58┊    let isEven = false;
+┊  ┊59┊
+┊  ┊60┊    return Messages.find({
+┊  ┊61┊      chatId: this.selectedChat._id
+┊  ┊62┊    }, {
+┊  ┊63┊      sort: { createdAt: 1 }
+┊  ┊64┊    })
+┊  ┊65┊      .map((messages: Message[]) => {
+┊  ┊66┊        const format = 'D MMMM Y';
+┊  ┊67┊
+┊  ┊68┊        // Compose missing data that we would like to show in the view
+┊  ┊69┊        messages.forEach((message) => {
+┊  ┊70┊          message.ownership = isEven ? 'mine' : 'other';
+┊  ┊71┊          isEven = !isEven;
+┊  ┊72┊
+┊  ┊73┊          return message;
+┊  ┊74┊        });
+┊  ┊75┊
+┊  ┊76┊        // Group by creation day
+┊  ┊77┊        const groupedMessages = _.groupBy(messages, (message) => {
+┊  ┊78┊          return moment(message.createdAt).format(format);
+┊  ┊79┊        });
+┊  ┊80┊
+┊  ┊81┊        // Transform dictionary into an array since Angular's view engine doesn't know how
+┊  ┊82┊        // to iterate through it
+┊  ┊83┊        return Object.keys(groupedMessages).map((timestamp: string) => {
+┊  ┊84┊          return {
+┊  ┊85┊            timestamp: timestamp,
+┊  ┊86┊            messages: groupedMessages[timestamp],
+┊  ┊87┊            today: moment().format(format) === timestamp
+┊  ┊88┊          };
+┊  ┊89┊        });
+┊  ┊90┊      });
+┊  ┊91┊  }
+┊  ┊92┊
 ┊64┊93┊  autoScroll(): MutationObserver {
 ┊65┊94┊    const autoScroller = new MutationObserver(this.scrollDown.bind(this));
```
[}]: #

And now we will add a nested iteration in the messages view; The outer loop would iterate through the messages day-groups, and the inner loop would iterate through the messages themselves:

[{]: <helper> (diff_step 6.20)
#### Step 6.20: Update the template to use grouped messages

##### Changed src/pages/messages/messages.html
```diff
@@ -15,11 +15,15 @@
 ┊15┊15┊
 ┊16┊16┊<ion-content padding class="messages-page-content">
 ┊17┊17┊  <ion-scroll scrollY="true" class="messages">
-┊18┊  ┊    <div *ngFor="let message of messages | async" class="message-wrapper">
+┊  ┊18┊    <div *ngFor="let day of messagesDayGroups | async" class="day-wrapper">
+┊  ┊19┊      <div *ngFor="let message of day.messages" class="message-wrapper">
 ┊19┊20┊        <div [class]="'message message-' + message.ownership">
 ┊20┊21┊          <div *ngIf="message.type == 'text'" class="message-content message-content-text">{{message.content}}</div>
 ┊21┊22┊          <span class="message-timestamp">{{ message.createdAt | amDateFormat: 'HH:mm' }}</span>
+┊  ┊23┊        </div>
 ┊22┊24┊      </div>
+┊  ┊25┊
+┊  ┊26┊      <div *ngIf="!day.today" class="day-timestamp">{{day.timestamp}}</div>
 ┊23┊27┊    </div>
 ┊24┊28┊  </ion-scroll>
 ┊25┊29┊</ion-content>
```
[}]: #

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step5.md) | [Next Step >](step7.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #
