[{]: <region> (header)
# Step 2: Chats Page
[}]: #
[{]: <region> (body)
## First Ionic Component

Now that we're finished with the initial setup, we can start building our app.

An application created by `Ionic`'s CLI will have a very clear methodology. The app is made out of pages, each page is made out of 3 files:

- `.html` - A view template file written in `HTML` based on `Angular 2`'s new [template engine](https://angular.io/docs/ts/latest/guide/template-syntax.html).
- `.scss` - A stylesheet file written in a `CSS` pre-process language called [SASS](https://sass-lang.com).
- `.ts` - A script file written in `Typescript`.

By default, the application will be created with 3 pages - `about`, `home` and `contact`. Since our app's flow doesn't contain any of them, we first gonna clean them up by running the following commands:

    $ rm -rf src/pages/about
    $ rm -rf src/pages/home
    $ rm -rf src/pages/contact
    $ rm -rf src/pages/tabs

Second, we will remove their declaration in the app module:

[{]: <helper> (diff_step 2.2)
#### Step 2.2: Removed tabs components from the module declaration

##### Changed src/app/app.module.ts
```diff
@@ -1,29 +1,17 @@
 ┊ 1┊ 1┊import { NgModule, ErrorHandler } from '@angular/core';
 ┊ 2┊ 2┊import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
 ┊ 3┊ 3┊import { MyApp } from './app.component';
-┊ 4┊  ┊import { AboutPage } from '../pages/about/about';
-┊ 5┊  ┊import { ContactPage } from '../pages/contact/contact';
-┊ 6┊  ┊import { HomePage } from '../pages/home/home';
-┊ 7┊  ┊import { TabsPage } from '../pages/tabs/tabs';
 ┊ 8┊ 4┊
 ┊ 9┊ 5┊@NgModule({
 ┊10┊ 6┊  declarations: [
-┊11┊  ┊    MyApp,
-┊12┊  ┊    AboutPage,
-┊13┊  ┊    ContactPage,
-┊14┊  ┊    HomePage,
-┊15┊  ┊    TabsPage
+┊  ┊ 7┊    MyApp
 ┊16┊ 8┊  ],
 ┊17┊ 9┊  imports: [
 ┊18┊10┊    IonicModule.forRoot(MyApp)
 ┊19┊11┊  ],
 ┊20┊12┊  bootstrap: [IonicApp],
 ┊21┊13┊  entryComponents: [
-┊22┊  ┊    MyApp,
-┊23┊  ┊    AboutPage,
-┊24┊  ┊    ContactPage,
-┊25┊  ┊    HomePage,
-┊26┊  ┊    TabsPage
+┊  ┊14┊    MyApp
 ┊27┊15┊  ],
 ┊28┊16┊  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
 ┊29┊17┊})
```
[}]: #

Now, let's create our new `Component`, we'll call it `ChatsPage`:

[{]: <helper> (diff_step 2.3)
#### Step 2.3: Create Chats page component

##### Added src/pages/chats/chats.ts
```diff
@@ -0,0 +1,10 @@
+┊  ┊ 1┊import { Component } from '@angular/core';
+┊  ┊ 2┊
+┊  ┊ 3┊@Component({
+┊  ┊ 4┊  templateUrl: 'chats.html'
+┊  ┊ 5┊})
+┊  ┊ 6┊export class ChatsPage {
+┊  ┊ 7┊  constructor() {
+┊  ┊ 8┊
+┊  ┊ 9┊  }
+┊  ┊10┊}
```
[}]: #

`Angular 2` uses decorators to declare `Component`s, and we use `ES2016` classes to create the actual component, and the `templateUrl` declares the template file for the component. So now let's create this template file, next to the component file:

[{]: <helper> (diff_step 2.4)
#### Step 2.4: Added chats page template

##### Added src/pages/chats/chats.html
```diff
@@ -0,0 +1,11 @@
+┊  ┊ 1┊<ion-header>
+┊  ┊ 2┊  <ion-navbar>
+┊  ┊ 3┊    <ion-title>
+┊  ┊ 4┊      Chats
+┊  ┊ 5┊    </ion-title>
+┊  ┊ 6┊  </ion-navbar>
+┊  ┊ 7┊</ion-header>
+┊  ┊ 8┊
+┊  ┊ 9┊<ion-content padding>
+┊  ┊10┊  Hello!
+┊  ┊11┊</ion-content>
```
[}]: #

Once creating an Ionic page it's recommended to use the following layout:

- &lt;ion-header&gt; - The header of the page. Will usually contain content that should be bounded to the top like navbar.
- &lt;ion-content&gt; - The content of the page. Will usually contain it's actual content like text.
- &lt;ion-footer&gt; - The footer of the page. Will usually contain content that should be bounded to the bottom like toolbars.

Now, we need to add a declaration for this new `Component` in our `NgModule` definition:

[{]: <helper> (diff_step 2.5)
#### Step 2.5: Add chats page to the NgModule

##### Changed src/app/app.module.ts
```diff
@@ -1,17 +1,20 @@
 ┊ 1┊ 1┊import { NgModule, ErrorHandler } from '@angular/core';
 ┊ 2┊ 2┊import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
+┊  ┊ 3┊import { ChatsPage } from '../pages/chats/chats';
 ┊ 3┊ 4┊import { MyApp } from './app.component';
 ┊ 4┊ 5┊
 ┊ 5┊ 6┊@NgModule({
 ┊ 6┊ 7┊  declarations: [
-┊ 7┊  ┊    MyApp
+┊  ┊ 8┊    MyApp,
+┊  ┊ 9┊    ChatsPage
 ┊ 8┊10┊  ],
 ┊ 9┊11┊  imports: [
 ┊10┊12┊    IonicModule.forRoot(MyApp)
 ┊11┊13┊  ],
 ┊12┊14┊  bootstrap: [IonicApp],
 ┊13┊15┊  entryComponents: [
-┊14┊  ┊    MyApp
+┊  ┊16┊    MyApp,
+┊  ┊17┊    ChatsPage
 ┊15┊18┊  ],
 ┊16┊19┊  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
 ┊17┊20┊})
```
[}]: #

> You can read more about [Angular 2 NgModule here](https://angular.io/docs/ts/latest/guide/ngmodule.html).

We will define the `ChatsPage` as the initial component of our app by setting the `rootPage` property in the main app component:

[{]: <helper> (diff_step 2.6)
#### Step 2.6: Use the chats page as the main root page

##### Changed src/app/app.component.ts
```diff
@@ -1,15 +1,13 @@
 ┊ 1┊ 1┊import { Component } from '@angular/core';
 ┊ 2┊ 2┊import { Platform } from 'ionic-angular';
 ┊ 3┊ 3┊import { StatusBar, Splashscreen } from 'ionic-native';
-┊ 4┊  ┊
-┊ 5┊  ┊import { TabsPage } from '../pages/tabs/tabs';
-┊ 6┊  ┊
+┊  ┊ 4┊import { ChatsPage } from '../pages/chats/chats';
 ┊ 7┊ 5┊
 ┊ 8┊ 6┊@Component({
 ┊ 9┊ 7┊  templateUrl: 'app.html'
 ┊10┊ 8┊})
 ┊11┊ 9┊export class MyApp {
-┊12┊  ┊  rootPage = TabsPage;
+┊  ┊10┊  rootPage = ChatsPage;
 ┊13┊11┊
 ┊14┊12┊  constructor(platform: Platform) {
 ┊15┊13┊    platform.ready().then(() => {
```
[}]: #

Let's add some code to our `Component` with a simple logic; Once the component is created we gonna define some dummy chats, using the `Observable.of`, so we can have some data to test our view against:

[{]: <helper> (diff_step 2.7)
#### Step 2.7: Add stubs for chats objects

##### Changed src/pages/chats/chats.ts
```diff
@@ -1,10 +1,64 @@
 ┊ 1┊ 1┊import { Component } from '@angular/core';
+┊  ┊ 2┊import { Observable } from 'rxjs';
+┊  ┊ 3┊import * as moment from 'moment';
 ┊ 2┊ 4┊
 ┊ 3┊ 5┊@Component({
 ┊ 4┊ 6┊  templateUrl: 'chats.html'
 ┊ 5┊ 7┊})
 ┊ 6┊ 8┊export class ChatsPage {
+┊  ┊ 9┊  chats: Observable<any[]>;
+┊  ┊10┊
 ┊ 7┊11┊  constructor() {
+┊  ┊12┊    this.chats = this.findChats();
+┊  ┊13┊  }
 ┊ 8┊14┊
+┊  ┊15┊  private findChats(): Observable<any[]> {
+┊  ┊16┊    return Observable.of([
+┊  ┊17┊      {
+┊  ┊18┊        _id: '0',
+┊  ┊19┊        title: 'Ethan Gonzalez',
+┊  ┊20┊        picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
+┊  ┊21┊        lastMessage: {
+┊  ┊22┊          content: 'You on your way?',
+┊  ┊23┊          createdAt: moment().subtract(1, 'hours').toDate()
+┊  ┊24┊        }
+┊  ┊25┊      },
+┊  ┊26┊      {
+┊  ┊27┊        _id: '1',
+┊  ┊28┊        title: 'Bryan Wallace',
+┊  ┊29┊        picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
+┊  ┊30┊        lastMessage: {
+┊  ┊31┊          content: 'Hey, it\'s me',
+┊  ┊32┊          createdAt: moment().subtract(2, 'hours').toDate()
+┊  ┊33┊        }
+┊  ┊34┊      },
+┊  ┊35┊      {
+┊  ┊36┊        _id: '2',
+┊  ┊37┊        title: 'Avery Stewart',
+┊  ┊38┊        picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
+┊  ┊39┊        lastMessage: {
+┊  ┊40┊          content: 'I should buy a boat',
+┊  ┊41┊          createdAt: moment().subtract(1, 'days').toDate()
+┊  ┊42┊        }
+┊  ┊43┊      },
+┊  ┊44┊      {
+┊  ┊45┊        _id: '3',
+┊  ┊46┊        title: 'Katie Peterson',
+┊  ┊47┊        picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
+┊  ┊48┊        lastMessage: {
+┊  ┊49┊          content: 'Look at my mukluks!',
+┊  ┊50┊          createdAt: moment().subtract(4, 'days').toDate()
+┊  ┊51┊        }
+┊  ┊52┊      },
+┊  ┊53┊      {
+┊  ┊54┊        _id: '4',
+┊  ┊55┊        title: 'Ray Edwards',
+┊  ┊56┊        picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
+┊  ┊57┊        lastMessage: {
+┊  ┊58┊          content: 'This is wicked good ice cream.',
+┊  ┊59┊          createdAt: moment().subtract(2, 'weeks').toDate()
+┊  ┊60┊        }
+┊  ┊61┊      }
+┊  ┊62┊    ]);
 ┊ 9┊63┊  }
 ┊10┊64┊}
```
[}]: #

> Further explanation regards `RxJS` can be found in [step 3](./step3.md)

`moment` is an essential package for our data fabrication, which requires us to install it using the following command:

    $ npm install --save moment

## TypeScript Interfaces

Now, because we use `TypeScript`, we can define our own data-types and use them in our app, which will give you a better auto-complete and developing experience in most IDEs. In our application, we have 2 models: a `chat` model and a `message` model. We will define their interfaces in a file located under the path `src/models.ts`:

[{]: <helper> (diff_step 2.9)
#### Step 2.9: Create models file with declarations of Chat, Message and MessageType

##### Added src/models.ts
```diff
@@ -0,0 +1,18 @@
+┊  ┊ 1┊export enum MessageType {
+┊  ┊ 2┊  TEXT = <any>'text'
+┊  ┊ 3┊}
+┊  ┊ 4┊
+┊  ┊ 5┊export interface Chat {
+┊  ┊ 6┊  _id?: string;
+┊  ┊ 7┊  title?: string;
+┊  ┊ 8┊  picture?: string;
+┊  ┊ 9┊  lastMessage?: Message;
+┊  ┊10┊}
+┊  ┊11┊
+┊  ┊12┊export interface Message {
+┊  ┊13┊  _id?: string;
+┊  ┊14┊  chatId?: string;
+┊  ┊15┊  content?: string;
+┊  ┊16┊  createdAt?: Date;
+┊  ┊17┊  type?: MessageType
+┊  ┊18┊}
```
[}]: #

Now that the models are up and set, we can use apply it to the `ChatsPage`:

[{]: <helper> (diff_step 2.10)
#### Step 2.10: Use TypeScript models

##### Changed src/pages/chats/chats.ts
```diff
@@ -1,18 +1,19 @@
 ┊ 1┊ 1┊import { Component } from '@angular/core';
 ┊ 2┊ 2┊import { Observable } from 'rxjs';
 ┊ 3┊ 3┊import * as moment from 'moment';
+┊  ┊ 4┊import { Chat, MessageType } from '../../models';
 ┊ 4┊ 5┊
 ┊ 5┊ 6┊@Component({
 ┊ 6┊ 7┊  templateUrl: 'chats.html'
 ┊ 7┊ 8┊})
 ┊ 8┊ 9┊export class ChatsPage {
-┊ 9┊  ┊  chats: Observable<any[]>;
+┊  ┊10┊  chats: Observable<Chat[]>;
 ┊10┊11┊
 ┊11┊12┊  constructor() {
 ┊12┊13┊    this.chats = this.findChats();
 ┊13┊14┊  }
 ┊14┊15┊
-┊15┊  ┊  private findChats(): Observable<any[]> {
+┊  ┊16┊  private findChats(): Observable<Chat[]> {
 ┊16┊17┊    return Observable.of([
 ┊17┊18┊      {
 ┊18┊19┊        _id: '0',
```
```diff
@@ -20,7 +21,8 @@
 ┊20┊21┊        picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
 ┊21┊22┊        lastMessage: {
 ┊22┊23┊          content: 'You on your way?',
-┊23┊  ┊          createdAt: moment().subtract(1, 'hours').toDate()
+┊  ┊24┊          createdAt: moment().subtract(1, 'hours').toDate(),
+┊  ┊25┊          type: MessageType.TEXT
 ┊24┊26┊        }
 ┊25┊27┊      },
 ┊26┊28┊      {
```
```diff
@@ -29,7 +31,8 @@
 ┊29┊31┊        picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
 ┊30┊32┊        lastMessage: {
 ┊31┊33┊          content: 'Hey, it\'s me',
-┊32┊  ┊          createdAt: moment().subtract(2, 'hours').toDate()
+┊  ┊34┊          createdAt: moment().subtract(2, 'hours').toDate(),
+┊  ┊35┊          type: MessageType.TEXT
 ┊33┊36┊        }
 ┊34┊37┊      },
 ┊35┊38┊      {
```
```diff
@@ -38,7 +41,8 @@
 ┊38┊41┊        picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
 ┊39┊42┊        lastMessage: {
 ┊40┊43┊          content: 'I should buy a boat',
-┊41┊  ┊          createdAt: moment().subtract(1, 'days').toDate()
+┊  ┊44┊          createdAt: moment().subtract(1, 'days').toDate(),
+┊  ┊45┊          type: MessageType.TEXT
 ┊42┊46┊        }
 ┊43┊47┊      },
 ┊44┊48┊      {
```
```diff
@@ -47,7 +51,8 @@
 ┊47┊51┊        picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
 ┊48┊52┊        lastMessage: {
 ┊49┊53┊          content: 'Look at my mukluks!',
-┊50┊  ┊          createdAt: moment().subtract(4, 'days').toDate()
+┊  ┊54┊          createdAt: moment().subtract(4, 'days').toDate(),
+┊  ┊55┊          type: MessageType.TEXT
 ┊51┊56┊        }
 ┊52┊57┊      },
 ┊53┊58┊      {
```
```diff
@@ -56,7 +61,8 @@
 ┊56┊61┊        picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
 ┊57┊62┊        lastMessage: {
 ┊58┊63┊          content: 'This is wicked good ice cream.',
-┊59┊  ┊          createdAt: moment().subtract(2, 'weeks').toDate()
+┊  ┊64┊          createdAt: moment().subtract(2, 'weeks').toDate(),
+┊  ┊65┊          type: MessageType.TEXT
 ┊60┊66┊        }
 ┊61┊67┊      }
 ┊62┊68┊    ]);
```
[}]: #

## Ionic's Theming System

`Ionic 2` provides us with a comfortable theming system which is based on `SASS` variables. The theme definition file is located in `src/theme/variable.scss`. Since we want our app to have a "Whatsappish" look, we will define a new `SASS` variable called `whatsapp` in the variables file:

[{]: <helper> (diff_step 2.11)
#### Step 2.11: Add whatsapp color to the app theme

##### Changed src/theme/variables.scss
```diff
@@ -28,7 +28,8 @@
 ┊28┊28┊  secondary:  #32db64,
 ┊29┊29┊  danger:     #f53d3d,
 ┊30┊30┊  light:      #f4f4f4,
-┊31┊  ┊  dark:       #222
+┊  ┊31┊  dark:       #222,
+┊  ┊32┊  whatsapp:   #075E54
 ┊32┊33┊);
```
[}]: #

The `whatsapp` color can be used by adding an attribute called `color` with a value `whatsapp` to any Ionic component.

To begin with, we can start by implementing the `ChatsView` and apply our newly defined theme into it. This view will contain a list representing all the available chats in the component's data-ser:

[{]: <helper> (diff_step 2.12)
#### Step 2.12: Add the layout of the chats page

##### Changed src/pages/chats/chats.html
```diff
@@ -1,11 +1,36 @@
 ┊ 1┊ 1┊<ion-header>
-┊ 2┊  ┊  <ion-navbar>
+┊  ┊ 2┊  <ion-navbar color="whatsapp">
 ┊ 3┊ 3┊    <ion-title>
 ┊ 4┊ 4┊      Chats
 ┊ 5┊ 5┊    </ion-title>
+┊  ┊ 6┊    <ion-buttons end>
+┊  ┊ 7┊      <button ion-button icon-only class="add-chat-button">
+┊  ┊ 8┊        <ion-icon name="person-add"></ion-icon>
+┊  ┊ 9┊      </button>
+┊  ┊10┊      <button ion-button icon-only class="options-button">
+┊  ┊11┊        <ion-icon name="more"></ion-icon>
+┊  ┊12┊      </button>
+┊  ┊13┊    </ion-buttons>
 ┊ 6┊14┊  </ion-navbar>
 ┊ 7┊15┊</ion-header>
 ┊ 8┊16┊
-┊ 9┊  ┊<ion-content padding>
-┊10┊  ┊  Hello!
+┊  ┊17┊<ion-content class="chats-page-content">
+┊  ┊18┊  <ion-list class="chats">
+┊  ┊19┊    <ion-item-sliding *ngFor="let chat of chats | async">
+┊  ┊20┊      <button ion-item class="chat">
+┊  ┊21┊        <img class="chat-picture" [src]="chat.picture">
+┊  ┊22┊        <div class="chat-info">
+┊  ┊23┊          <h2 class="chat-title">{{chat.title}}</h2>
+┊  ┊24┊
+┊  ┊25┊          <span *ngIf="chat.lastMessage" class="last-message">
+┊  ┊26┊            <p *ngIf="chat.lastMessage.type == 'text'" class="last-message-content last-message-content-text">{{chat.lastMessage.content}}</p>
+┊  ┊27┊            <span class="last-message-timestamp">{{chat.lastMessage.createdAt }}</span>
+┊  ┊28┊          </span>
+┊  ┊29┊        </div>
+┊  ┊30┊      </button>
+┊  ┊31┊      <ion-item-options class="chat-options">
+┊  ┊32┊        <button ion-button color="danger" class="option option-remove">Remove</button>
+┊  ┊33┊      </ion-item-options>
+┊  ┊34┊    </ion-item-sliding>
+┊  ┊35┊  </ion-list>
 ┊11┊36┊</ion-content>
```
[}]: #

We use `ion-list` which Ionic translates into a list, and we use `ion-item` to represent a single item in that list. A chat item includes an image, the receiver's name, and its recent message.

> The `async` pipe is used to iterate through data which should be fetched asynchronously, in this case, observables.

Now, in order to finish our theming and styling, let's create a stylesheet file for our component:

[{]: <helper> (diff_step 2.13)
#### Step 2.13: Create SCSS file for chats page

##### Added src/pages/chats/chats.scss
```diff
@@ -0,0 +1,20 @@
+┊  ┊ 1┊.chats-page-content {
+┊  ┊ 2┊  .chat-picture {
+┊  ┊ 3┊    border-radius: 50%;
+┊  ┊ 4┊    width: 50px;
+┊  ┊ 5┊    float: left;
+┊  ┊ 6┊  }
+┊  ┊ 7┊
+┊  ┊ 8┊  .chat-info {
+┊  ┊ 9┊    float: left;
+┊  ┊10┊    margin: 10px 0 0 20px;
+┊  ┊11┊
+┊  ┊12┊    .last-message-timestamp {
+┊  ┊13┊      position: absolute;
+┊  ┊14┊      top: 10px;
+┊  ┊15┊      right: 10px;
+┊  ┊16┊      font-size: 14px;
+┊  ┊17┊      color: #9A9898;
+┊  ┊18┊    }
+┊  ┊19┊  }
+┊  ┊20┊}
```
[}]: #

Ionic will load newly defined stylesheet files automatically, so you shouldn't be worried for importations.

## External Angular 2 Modules

Since `Ionic 2` uses `Angular 2` as the layer view, we can load `Angular 2` modules just like any other plain `Angular 2` application. One module that may come in our interest would be the `angular2-moment` module, which will provide us with the ability to use `moment`'s utility functions in the view as pipes.

It requires us to install `angular2-moment` module using the following command:

    $ npm install --save angular2-moment

Now we will need to declare this module in the app's main component:

[{]: <helper> (diff_step 2.15)
#### Step 2.15: Import MomentModule into our app module

##### Changed src/app/app.module.ts
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊import { NgModule, ErrorHandler } from '@angular/core';
+┊ ┊2┊import { MomentModule } from 'angular2-moment';
 ┊2┊3┊import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
 ┊3┊4┊import { ChatsPage } from '../pages/chats/chats';
 ┊4┊5┊import { MyApp } from './app.component';
```
```diff
@@ -9,7 +10,8 @@
 ┊ 9┊10┊    ChatsPage
 ┊10┊11┊  ],
 ┊11┊12┊  imports: [
-┊12┊  ┊    IonicModule.forRoot(MyApp)
+┊  ┊13┊    IonicModule.forRoot(MyApp),
+┊  ┊14┊    MomentModule
 ┊13┊15┊  ],
 ┊14┊16┊  bootstrap: [IonicApp],
 ┊15┊17┊  entryComponents: [
```
[}]: #

Which will make `moment` available as a pack of pipes, as mentioned earlier:

[{]: <helper> (diff_step 2.16)
#### Step 2.16: Use amCalendar pipe

##### Changed src/pages/chats/chats.html
```diff
@@ -24,7 +24,7 @@
 ┊24┊24┊
 ┊25┊25┊          <span *ngIf="chat.lastMessage" class="last-message">
 ┊26┊26┊            <p *ngIf="chat.lastMessage.type == 'text'" class="last-message-content last-message-content-text">{{chat.lastMessage.content}}</p>
-┊27┊  ┊            <span class="last-message-timestamp">{{chat.lastMessage.createdAt }}</span>
+┊  ┊27┊            <span class="last-message-timestamp">{{ chat.lastMessage.createdAt | amCalendar }}</span>
 ┊28┊28┊          </span>
 ┊29┊29┊        </div>
 ┊30┊30┊      </button>
```
[}]: #

## Ionic Touch Events

Ionic provides us with components which can handle mobile events like: slide, tap and pinch. Since we're going to take advantage of the "sliding" event in the `chats` view, we used the `ion-item-sliding` component, so any time we will slide our item to the left, we should see a `Remove` button.

Right now this button is not hooked to anything. It requires us to bind it into the component:

[{]: <helper> (diff_step 2.17)
#### Step 2.17: Add remove chat event

##### Changed src/pages/chats/chats.html
```diff
@@ -29,7 +29,7 @@
 ┊29┊29┊        </div>
 ┊30┊30┊      </button>
 ┊31┊31┊      <ion-item-options class="chat-options">
-┊32┊  ┊        <button ion-button color="danger" class="option option-remove">Remove</button>
+┊  ┊32┊        <button ion-button color="danger" class="option option-remove" (click)="removeChat(chat)">Remove</button>
 ┊33┊33┊      </ion-item-options>
 ┊34┊34┊    </ion-item-sliding>
 ┊35┊35┊  </ion-list>
```
[}]: #

And now that it is bound to the component we can safely implement its handler:

[{]: <helper> (diff_step 2.18)
#### Step 2.18: Implement removeChat method

##### Changed src/pages/chats/chats.ts
```diff
@@ -67,4 +67,13 @@
 ┊67┊67┊      }
 ┊68┊68┊    ]);
 ┊69┊69┊  }
+┊  ┊70┊
+┊  ┊71┊  removeChat(chat: Chat): void {
+┊  ┊72┊    this.chats = this.chats.map<Chat[]>(chatsArray => {
+┊  ┊73┊      const chatIndex = chatsArray.indexOf(chat);
+┊  ┊74┊      chatsArray.splice(chatIndex, 1);
+┊  ┊75┊
+┊  ┊76┊      return chatsArray;
+┊  ┊77┊    });
+┊  ┊78┊  }
 ┊70┊79┊}
```
[}]: #

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step1.md) | [Next Step >](step3.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #