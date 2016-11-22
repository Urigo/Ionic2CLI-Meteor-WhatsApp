[{]: <region> (header)
# Step 2: Chats page
[}]: #
[{]: <region> (body)
## First Ionic Component

Now that we're finished with the initial setup, we can start building our app.

An application created by Ionic's CLI will have a very clear methodology. The app is made out of pages, each page is made out of 3 files:

- `.html` - A view template file written in HTML based on Angular2's new [template engine](angular.io/docs/ts/latest/guide/template-syntax.html).
- `.scss` - A stylesheet file written in a CSS pre-process language called [SASS](sass-lang.com).
- `.ts` - A script file written in Typescript.

By default, the application will be created with 3 pages - `about`, `home` and `contact`. Since our app's flow doesn't contain any of them, we first gonna clean them up by running the following commands:

    $ rm -rf src/pages/about
    $ rm -rf src/pages/home
    $ rm -rf src/pages/contact

And we need to remove their usage from the tabs container:

[{]: <helper> (diff_step 2.2)
#### Step 2.2: Removed tabs from the Component

##### Changed src/pages/tabs/tabs.ts
```diff
@@ -1,19 +1,9 @@
 ┊ 1┊ 1┊import { Component } from '@angular/core';
 ┊ 2┊ 2┊
-┊ 3┊  ┊import { HomePage } from '../home/home';
-┊ 4┊  ┊import { AboutPage } from '../about/about';
-┊ 5┊  ┊import { ContactPage } from '../contact/contact';
-┊ 6┊  ┊
 ┊ 7┊ 3┊@Component({
 ┊ 8┊ 4┊  templateUrl: 'tabs.html'
 ┊ 9┊ 5┊})
 ┊10┊ 6┊export class TabsPage {
-┊11┊  ┊  // this tells the tabs component which Pages
-┊12┊  ┊  // should be each tab's root Page
-┊13┊  ┊  tab1Root: any = HomePage;
-┊14┊  ┊  tab2Root: any = AboutPage;
-┊15┊  ┊  tab3Root: any = ContactPage;
-┊16┊  ┊
 ┊17┊ 7┊  constructor() {
 ┊18┊ 8┊
 ┊19┊ 9┊  }
```
[}]: #

And remove them from the module definition:

[{]: <helper> (diff_step 2.1)
#### Step 2.1: Remove irrelevant pages

##### Changed src/app/app.module.ts
```diff
@@ -1,17 +1,11 @@
 ┊ 1┊ 1┊import { NgModule } from '@angular/core';
 ┊ 2┊ 2┊import { IonicApp, IonicModule } from 'ionic-angular';
 ┊ 3┊ 3┊import { MyApp } from './app.component';
-┊ 4┊  ┊import { AboutPage } from '../pages/about/about';
-┊ 5┊  ┊import { ContactPage } from '../pages/contact/contact';
-┊ 6┊  ┊import { HomePage } from '../pages/home/home';
 ┊ 7┊ 4┊import { TabsPage } from '../pages/tabs/tabs';
 ┊ 8┊ 5┊
 ┊ 9┊ 6┊@NgModule({
 ┊10┊ 7┊  declarations: [
 ┊11┊ 8┊    MyApp,
-┊12┊  ┊    AboutPage,
-┊13┊  ┊    ContactPage,
-┊14┊  ┊    HomePage,
 ┊15┊ 9┊    TabsPage
 ┊16┊10┊  ],
 ┊17┊11┊  imports: [
```
```diff
@@ -20,9 +14,6 @@
 ┊20┊14┊  bootstrap: [IonicApp],
 ┊21┊15┊  entryComponents: [
 ┊22┊16┊    MyApp,
-┊23┊  ┊    AboutPage,
-┊24┊  ┊    ContactPage,
-┊25┊  ┊    HomePage,
 ┊26┊17┊    TabsPage
 ┊27┊18┊  ],
 ┊28┊19┊  providers: []
```

##### Deleted src/pages/about/about.html
```diff
@@ -1,11 +0,0 @@
-┊ 1┊  ┊<ion-header>
-┊ 2┊  ┊  <ion-navbar>
-┊ 3┊  ┊    <ion-title>
-┊ 4┊  ┊      About
-┊ 5┊  ┊    </ion-title>
-┊ 6┊  ┊  </ion-navbar>
-┊ 7┊  ┊</ion-header>
-┊ 8┊  ┊
-┊ 9┊  ┊<ion-content padding>
-┊10┊  ┊
-┊11┊  ┊</ion-content>
```

##### Deleted src/pages/about/about.scss
```diff
@@ -1,3 +0,0 @@
-┊1┊ ┊page-about {
-┊2┊ ┊
-┊3┊ ┊}
```

##### Deleted src/pages/about/about.ts
```diff
@@ -1,15 +0,0 @@
-┊ 1┊  ┊import { Component } from '@angular/core';
-┊ 2┊  ┊
-┊ 3┊  ┊import { NavController } from 'ionic-angular';
-┊ 4┊  ┊
-┊ 5┊  ┊@Component({
-┊ 6┊  ┊  selector: 'page-about',
-┊ 7┊  ┊  templateUrl: 'about.html'
-┊ 8┊  ┊})
-┊ 9┊  ┊export class AboutPage {
-┊10┊  ┊
-┊11┊  ┊  constructor(public navCtrl: NavController) {
-┊12┊  ┊
-┊13┊  ┊  }
-┊14┊  ┊
-┊15┊  ┊}
```

##### Deleted src/pages/contact/contact.html
```diff
@@ -1,17 +0,0 @@
-┊ 1┊  ┊<ion-header>
-┊ 2┊  ┊  <ion-navbar>
-┊ 3┊  ┊    <ion-title>
-┊ 4┊  ┊      Contact
-┊ 5┊  ┊    </ion-title>
-┊ 6┊  ┊  </ion-navbar>
-┊ 7┊  ┊</ion-header>
-┊ 8┊  ┊
-┊ 9┊  ┊<ion-content>
-┊10┊  ┊  <ion-list>
-┊11┊  ┊    <ion-list-header>Follow us on Twitter</ion-list-header>
-┊12┊  ┊    <ion-item>
-┊13┊  ┊      <ion-icon name="ionic" item-left></ion-icon>
-┊14┊  ┊      @ionicframework
-┊15┊  ┊    </ion-item>
-┊16┊  ┊  </ion-list>
-┊17┊  ┊</ion-content>
```

##### Deleted src/pages/contact/contact.scss
```diff
@@ -1,3 +0,0 @@
-┊1┊ ┊page-contact {
-┊2┊ ┊
-┊3┊ ┊}
```

##### Deleted src/pages/contact/contact.ts
```diff
@@ -1,15 +0,0 @@
-┊ 1┊  ┊import { Component } from '@angular/core';
-┊ 2┊  ┊
-┊ 3┊  ┊import { NavController } from 'ionic-angular';
-┊ 4┊  ┊
-┊ 5┊  ┊@Component({
-┊ 6┊  ┊  selector: 'page-contact',
-┊ 7┊  ┊  templateUrl: 'contact.html'
-┊ 8┊  ┊})
-┊ 9┊  ┊export class ContactPage {
-┊10┊  ┊
-┊11┊  ┊  constructor(public navCtrl: NavController) {
-┊12┊  ┊
-┊13┊  ┊  }
-┊14┊  ┊
-┊15┊  ┊}
```

##### Deleted src/pages/home/home.html
```diff
@@ -1,17 +0,0 @@
-┊ 1┊  ┊<ion-header>
-┊ 2┊  ┊  <ion-navbar>
-┊ 3┊  ┊    <ion-title>Home</ion-title>
-┊ 4┊  ┊  </ion-navbar>
-┊ 5┊  ┊</ion-header>
-┊ 6┊  ┊
-┊ 7┊  ┊<ion-content padding>
-┊ 8┊  ┊  <h2>Welcome to Ionic!</h2>
-┊ 9┊  ┊  <p>
-┊10┊  ┊    This starter project comes with simple tabs-based layout for apps
-┊11┊  ┊    that are going to primarily use a Tabbed UI.
-┊12┊  ┊  </p>
-┊13┊  ┊  <p>
-┊14┊  ┊    Take a look at the <code>src/pages/</code> directory to add or change tabs,
-┊15┊  ┊    update any existing page or create new pages.
-┊16┊  ┊  </p>
-┊17┊  ┊</ion-content>
```

##### Deleted src/pages/home/home.scss
```diff
@@ -1,3 +0,0 @@
-┊1┊ ┊page-home {
-┊2┊ ┊
-┊3┊ ┊}
```

##### Deleted src/pages/home/home.ts
```diff
@@ -1,15 +0,0 @@
-┊ 1┊  ┊import { Component } from '@angular/core';
-┊ 2┊  ┊
-┊ 3┊  ┊import { NavController } from 'ionic-angular';
-┊ 4┊  ┊
-┊ 5┊  ┊@Component({
-┊ 6┊  ┊  selector: 'page-home',
-┊ 7┊  ┊  templateUrl: 'home.html'
-┊ 8┊  ┊})
-┊ 9┊  ┊export class HomePage {
-┊10┊  ┊
-┊11┊  ┊  constructor(public navCtrl: NavController) {
-┊12┊  ┊
-┊13┊  ┊  }
-┊14┊  ┊
-┊15┊  ┊}
```
[}]: #

And let's change the actual tabs to show the tabs we want:

[{]: <helper> (diff_step 2.3)
#### Step 2.3: Edit tabs template to contain the necessary tabs

##### Changed src/pages/tabs/tabs.html
```diff
@@ -1,5 +1,6 @@
 ┊1┊1┊<ion-tabs>
-┊2┊ ┊  <ion-tab [root]="tab1Root" tabTitle="Home" tabIcon="home"></ion-tab>
-┊3┊ ┊  <ion-tab [root]="tab2Root" tabTitle="About" tabIcon="information-circle"></ion-tab>
-┊4┊ ┊  <ion-tab [root]="tab3Root" tabTitle="Contact" tabIcon="contacts"></ion-tab>
+┊ ┊2┊  <ion-tab tabIcon="chatboxes"></ion-tab>
+┊ ┊3┊  <ion-tab tabIcon="contacts"></ion-tab>
+┊ ┊4┊  <ion-tab tabIcon="star"></ion-tab>
+┊ ┊5┊  <ion-tab tabIcon="clock"></ion-tab>
 ┊5┊6┊</ion-tabs>
```
[}]: #

We defined 4 tabs: `chats`, `contacts`, `favorites` and `recents`. In this tutorial we want to focus only on the messaging system, therefore we only gonna implement the chats tab, the rest is just for the layout.

If you will take a closer look at the view template we've just defined, you can see that one of the tab's attributes is wrapped with \[square brackets\]. This is part of Angular2's new template syntax and what it means is that the property called `root` of the HTML element is bound to the `chatsTabRoot` property of the component.

Our next step is to implement the `chats` tab - first let's start by adding `moment` as a dependency - we will use it soon:

    $ npm install --save moment

Let's go ahead and implement the chats component, let's start with it's view (just a stub, we will later implement):

[{]: <helper> (diff_step 2.5)
#### Step 2.5: Added ChatsPage view

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
- &lt;ion-footer&gt; - The footer of the page. Will usutally contain content that should be bounded to the bottom like toolbars.

And now we will implement the actual Component:

[{]: <helper> (diff_step 2.6)
#### Step 2.6: Added ChatsPage Component

##### Added src/pages/chats/chats.ts
```diff
@@ -0,0 +1,64 @@
+┊  ┊ 1┊import * as moment from 'moment';
+┊  ┊ 2┊import { Component } from '@angular/core';
+┊  ┊ 3┊import { Observable } from "rxjs";
+┊  ┊ 4┊
+┊  ┊ 5┊@Component({
+┊  ┊ 6┊  templateUrl: 'chats.html'
+┊  ┊ 7┊})
+┊  ┊ 8┊export class ChatsPage {
+┊  ┊ 9┊  chats: Observable<any[]>;
+┊  ┊10┊
+┊  ┊11┊  constructor() {
+┊  ┊12┊    this.chats = this.findChats();
+┊  ┊13┊  }
+┊  ┊14┊
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
+┊  ┊63┊  }
+┊  ┊64┊}
```
[}]: #

The logic is simple. 

Once the component is created we gonna define dummy chats just so we can test our view. As you can see we're using a package called [Moment](momentjs.com) to fabricate some date data. 

We use `Observable.of` which is a shortcut for creating an Observable with a single value.

Now let's add the new Component to the module definition so Angular 2 will know that the Component exists:

[{]: <helper> (diff_step 2.7)
#### Step 2.7: Added ChatsPage to the module definition

##### Changed src/app/app.module.ts
```diff
@@ -2,10 +2,12 @@
 ┊ 2┊ 2┊import { IonicApp, IonicModule } from 'ionic-angular';
 ┊ 3┊ 3┊import { MyApp } from './app.component';
 ┊ 4┊ 4┊import { TabsPage } from '../pages/tabs/tabs';
+┊  ┊ 5┊import { ChatsPage } from "../pages/chats/chats";
 ┊ 5┊ 6┊
 ┊ 6┊ 7┊@NgModule({
 ┊ 7┊ 8┊  declarations: [
 ┊ 8┊ 9┊    MyApp,
+┊  ┊10┊    ChatsPage,
 ┊ 9┊11┊    TabsPage
 ┊10┊12┊  ],
 ┊11┊13┊  imports: [
```
```diff
@@ -14,6 +16,7 @@
 ┊14┊16┊  bootstrap: [IonicApp],
 ┊15┊17┊  entryComponents: [
 ┊16┊18┊    MyApp,
+┊  ┊19┊    ChatsPage,
 ┊17┊20┊    TabsPage
 ┊18┊21┊  ],
 ┊19┊22┊  providers: []
```
[}]: #

And let's add it to the `TabsPage` which is the page that manages our tabs:

[{]: <helper> (diff_step 2.8)
#### Step 2.8: Added chats tab root

##### Changed src/pages/tabs/tabs.ts
```diff
@@ -1,9 +1,12 @@
 ┊ 1┊ 1┊import { Component } from '@angular/core';
+┊  ┊ 2┊import { ChatsPage } from "../chats/chats";
 ┊ 2┊ 3┊
 ┊ 3┊ 4┊@Component({
 ┊ 4┊ 5┊  templateUrl: 'tabs.html'
 ┊ 5┊ 6┊})
 ┊ 6┊ 7┊export class TabsPage {
+┊  ┊ 8┊  chatsTab = ChatsPage;
+┊  ┊ 9┊
 ┊ 7┊10┊  constructor() {
 ┊ 8┊11┊
 ┊ 9┊12┊  }
```
[}]: #

And add the tab definition to the view, so the tab we create will be linked to the new Component:

[{]: <helper> (diff_step 2.9)
#### Step 2.9: Added root to the tab element

##### Changed src/pages/tabs/tabs.html
```diff
@@ -1,5 +1,5 @@
 ┊1┊1┊<ion-tabs>
-┊2┊ ┊  <ion-tab tabIcon="chatboxes"></ion-tab>
+┊ ┊2┊  <ion-tab [root]="chatsTab" tabIcon="chatboxes"></ion-tab>
 ┊3┊3┊  <ion-tab tabIcon="contacts"></ion-tab>
 ┊4┊4┊  <ion-tab tabIcon="star"></ion-tab>
 ┊5┊5┊  <ion-tab tabIcon="clock"></ion-tab>
```
[}]: #

## TypeScript Interfaces

Now, because we use TypeScript, we can defined our types and use then in our app, and in most of the IDEs you will get a better auto-complete and developing experience.

So in our application, at the moment, we have two models: `Chat` and `Message`, so let's create the TypeScript definition for them.

The file extension should be `.d.ts` - this is the way to tell TypeScript that the file does not contain any login - only interfaces.

We will locate it under `/models/` directory, and later we will see how we can share those model definitions in both server side and client side.

So let's create the definitions file:

[{]: <helper> (diff_step 2.10)
#### Step 2.10: Added chat and message models

##### Added models/whatsapp-models.d.ts
```diff
@@ -0,0 +1,15 @@
+┊  ┊ 1┊declare module 'api/models/whatsapp-models' {
+┊  ┊ 2┊  interface Chat {
+┊  ┊ 3┊    _id?: string;
+┊  ┊ 4┊    title?: string;
+┊  ┊ 5┊    picture?: string;
+┊  ┊ 6┊    lastMessage?: Message;
+┊  ┊ 7┊  }
+┊  ┊ 8┊
+┊  ┊ 9┊  interface Message {
+┊  ┊10┊    _id?: string;
+┊  ┊11┊    chatId?: string;
+┊  ┊12┊    content?: string;
+┊  ┊13┊    createdAt?: Date;
+┊  ┊14┊  }
+┊  ┊15┊}
```
[}]: #

Note that we declared our interface inside a module called `api/models/whatsapp-models` - so we will be able to import the models from that path.

And we need to add this definition to our TypeScript config (`tsconfig.json`), so it would be available in our code:

[{]: <helper> (diff_step 2.11)
#### Step 2.11: Added models typings into the config

##### Changed src/declarations.d.ts
```diff
@@ -11,4 +11,5 @@
 ┊11┊11┊  For more info on type definition files, check out the Typescript docs here:
 ┊12┊12┊  https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
 ┊13┊13┊*/
+┊  ┊14┊/// <reference path="../models/whatsapp-models.d.ts" />
 ┊14┊15┊declare module '*';🚫↵
```
[}]: #

Now, let's use our new model in the `ChatsPage`:

[{]: <helper> (diff_step 2.12)
#### Step 2.12: Use Chat model in ChatsPage

##### Changed src/pages/chats/chats.ts
```diff
@@ -1,18 +1,19 @@
 ┊ 1┊ 1┊import * as moment from 'moment';
 ┊ 2┊ 2┊import { Component } from '@angular/core';
 ┊ 3┊ 3┊import { Observable } from "rxjs";
+┊  ┊ 4┊import { Chat } from "api/models/whatsapp-models";
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
[}]: #

## Ionic Themes
 
Ionic provides use a theme engine in order to define style faster and more efficient. 

The theme definition file is located in `src/theme/variable.scss`, and at the moment we will just add a new theme color, called `whatsapp`:

[{]: <helper> (diff_step 2.13)
#### Step 2.13: Added theme color definition

##### Changed src/theme/variables.scss
```diff
@@ -27,7 +27,8 @@
 ┊27┊27┊  secondary:  #32db64,
 ┊28┊28┊  danger:     #f53d3d,
 ┊29┊29┊  light:      #f4f4f4,
-┊30┊  ┊  dark:       #222
+┊  ┊30┊  dark:       #222,
+┊  ┊31┊  whatsapp:   #075E54
 ┊31┊32┊);
```
[}]: #

And now we will be able to use the new color anywhere in any Ionic Component by adding `color="whatsapp"` to the Component.

[{]: <helper> (diff_step 2.14)
#### Step 2.14: Apply whatsapp theme on tabs view

##### Changed src/pages/tabs/tabs.html
```diff
@@ -1,4 +1,4 @@
-┊1┊ ┊<ion-tabs>
+┊ ┊1┊<ion-tabs color="whatsapp">
 ┊2┊2┊  <ion-tab [root]="chatsTab" tabIcon="chatboxes"></ion-tab>
 ┊3┊3┊  <ion-tab tabIcon="contacts"></ion-tab>
 ┊4┊4┊  <ion-tab tabIcon="star"></ion-tab>
```
[}]: #

So let's add it to the view of the `ChatsPage`, and we will also use some more Ionic Components along with Angular 2 features:

[{]: <helper> (diff_step 2.15)
#### Step 2.15: Added chats page view with a list of chats

##### Changed src/pages/chats/chats.html
```diff
@@ -1,11 +1,32 @@
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
+┊  ┊17┊<ion-content padding class="chats-page-content">
+┊  ┊18┊  <ion-list class="chats">
+┊  ┊19┊    <button ion-item *ngFor="let chat of chats | async" class="chat">
+┊  ┊20┊      <img class="chat-picture" [src]="chat.picture">
+┊  ┊21┊
+┊  ┊22┊      <div class="chat-info">
+┊  ┊23┊        <h2 class="chat-title">{{chat.title}}</h2>
+┊  ┊24┊
+┊  ┊25┊        <span *ngIf="chat.lastMessage" class="last-message">
+┊  ┊26┊          <p class="last-message-content">{{chat.lastMessage.content}}</p>
+┊  ┊27┊          <span class="last-message-timestamp">{{chat.lastMessage.createdAt}}</span>
+┊  ┊28┊        </span>
+┊  ┊29┊      </div>
+┊  ┊30┊    </button>
+┊  ┊31┊  </ion-list>
 ┊11┊32┊</ion-content>
```
[}]: #

We use `ion-list` which Ionic translate into a list, and use `ion-item` for each one of the items in the list, and we also added to the view some images and text for each chat item.

> We use `ngFor` along with the `async` Pipe because we will use RxJS and Observables in the tutorial!

Now, in order to finish our theming and styling, let's create a stylesheet file for our Component:

[{]: <helper> (diff_step 2.16)
#### Step 2.16: Added some styles

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

> In Ionic 2, there is no need to load each specific style file - Ionic loads any style file under the `app` folder.

## External Angular 2 Modules

Ionic 2 application works just like any other Angular 2 application, which means we can use any external packages that we need. 

For example, we will add a usage with `angular2-moment` package, that adds useful Pipes we can use in our view, in order to manipulate the display of Date variables.

So let's add this package first:

    $ npm install --save angular2-moment
    
Now we need to tell our Angular 2 application to load that external module, so it would be available for use:
    
[{]: <helper> (diff_step 2.18)
#### Step 2.18: Import MomentModule into the module definition

##### Changed src/app/app.module.ts
```diff
@@ -3,6 +3,7 @@
 ┊3┊3┊import { MyApp } from './app.component';
 ┊4┊4┊import { TabsPage } from '../pages/tabs/tabs';
 ┊5┊5┊import { ChatsPage } from "../pages/chats/chats";
+┊ ┊6┊import { MomentModule } from "angular2-moment";
 ┊6┊7┊
 ┊7┊8┊@NgModule({
 ┊8┊9┊  declarations: [
```
```diff
@@ -11,7 +12,8 @@
 ┊11┊12┊    TabsPage
 ┊12┊13┊  ],
 ┊13┊14┊  imports: [
-┊14┊  ┊    IonicModule.forRoot(MyApp)
+┊  ┊15┊    IonicModule.forRoot(MyApp),
+┊  ┊16┊    MomentModule
 ┊15┊17┊  ],
 ┊16┊18┊  bootstrap: [IonicApp],
 ┊17┊19┊  entryComponents: [
```
[}]: #
    
And let's use a Pipe from that package it in the view:
    
[{]: <helper> (diff_step 2.19)
#### Step 2.19: Apply calendar pipe to chats view template

##### Changed src/pages/chats/chats.html
```diff
@@ -24,7 +24,7 @@
 ┊24┊24┊
 ┊25┊25┊        <span *ngIf="chat.lastMessage" class="last-message">
 ┊26┊26┊          <p class="last-message-content">{{chat.lastMessage.content}}</p>
-┊27┊  ┊          <span class="last-message-timestamp">{{chat.lastMessage.createdAt}}</span>
+┊  ┊27┊          <span class="last-message-timestamp">{{chat.lastMessage.createdAt | amCalendar }}</span>
 ┊28┊28┊        </span>
 ┊29┊29┊      </div>
 ┊30┊30┊    </button>
```
[}]: #
    
## Ionic Touch Events
    
Ionic provides us special Component's which handles touch events, for example: slide, tap and pinch. 

We can use those in our view, let's add a sliding button that will show us more functionality for each chat.

We add a remove button for each chat, so let's do it:

[{]: <helper> (diff_step 2.20)
#### Step 2.20: Add chat removal button to view template

##### Changed src/pages/chats/chats.html
```diff
@@ -16,17 +16,22 @@
 ┊16┊16┊
 ┊17┊17┊<ion-content padding class="chats-page-content">
 ┊18┊18┊  <ion-list class="chats">
-┊19┊  ┊    <button ion-item *ngFor="let chat of chats | async" class="chat">
-┊20┊  ┊      <img class="chat-picture" [src]="chat.picture">
+┊  ┊19┊    <ion-item-sliding *ngFor="let chat of chats | async">
+┊  ┊20┊      <button ion-item class="chat">
+┊  ┊21┊        <img class="chat-picture" [src]="chat.picture">
 ┊21┊22┊
-┊22┊  ┊      <div class="chat-info">
-┊23┊  ┊        <h2 class="chat-title">{{chat.title}}</h2>
+┊  ┊23┊        <div class="chat-info">
+┊  ┊24┊          <h2 class="chat-title">{{chat.title}}</h2>
 ┊24┊25┊
-┊25┊  ┊        <span *ngIf="chat.lastMessage" class="last-message">
-┊26┊  ┊          <p class="last-message-content">{{chat.lastMessage.content}}</p>
-┊27┊  ┊          <span class="last-message-timestamp">{{chat.lastMessage.createdAt | amCalendar }}</span>
-┊28┊  ┊        </span>
-┊29┊  ┊      </div>
-┊30┊  ┊    </button>
+┊  ┊26┊          <span *ngIf="chat.lastMessage" class="last-message">
+┊  ┊27┊            <p class="last-message-content">{{chat.lastMessage.content}}</p>
+┊  ┊28┊            <span class="last-message-timestamp">{{chat.lastMessage.createdAt | amCalendar }}</span>
+┊  ┊29┊          </span>
+┊  ┊30┊        </div>
+┊  ┊31┊      </button>
+┊  ┊32┊      <ion-item-options class="chat-options">
+┊  ┊33┊        <button ion-button color="danger" class="option option-remove" (click)="removeChat(chat)">Remove</button>
+┊  ┊34┊      </ion-item-options>
+┊  ┊35┊    </ion-item-sliding>
 ┊31┊36┊  </ion-list>
 ┊32┊37┊</ion-content>
```
[}]: #

And bind the event handler to the Component (we will implement the remove feature later): 

[{]: <helper> (diff_step 2.21)
#### Step 2.21: Add chat removal stub method to chats component

##### Changed src/pages/chats/chats.ts
```diff
@@ -62,4 +62,8 @@
 ┊62┊62┊      }
 ┊63┊63┊    ]);
 ┊64┊64┊  }
+┊  ┊65┊
+┊  ┊66┊  removeChat(chat: Chat): void {
+┊  ┊67┊    // TODO: Implement it later
+┊  ┊68┊  }
 ┊65┊69┊}
```
[}]: #

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step1.md) | [Next Step >](step3.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #