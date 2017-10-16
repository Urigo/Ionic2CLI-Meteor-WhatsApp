# Step 2: Chats Page

## First Ionic Component

Now that we're finished with the initial setup, we can start building our app.

An application created by `Ionic`'s CLI will have a very clear methodology. The app is made out of pages, each page is made out of 3 files:

- `.html` - A view template file written in `HTML` based on `Angular 2`'s new [template engine](https://angular.io/docs/ts/latest/guide/template-syntax.html).
- `.scss` - A stylesheet file written in a `CSS` pre-process language called [SASS](https://sass-lang.com).
- `.ts` - A script file written in `Typescript`.

By default, the application will be created with the `home` page. Since our app's flow doesn't contain it, we first gonna clean it up by running the following command:

    $ rm -rf src/pages/home

Second, we will remove its declaration in the app module:

[{]: <helper> (diffStep 2.2)

#### [Step 2.2: Removed tabs components from the module declaration](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/1c9a68f)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 5┊ 5┊import { StatusBar } from &#x27;@ionic-native/status-bar&#x27;;
 ┊ 6┊ 6┊
 ┊ 7┊ 7┊import { MyApp } from &#x27;./app.component&#x27;;
 ┊ 9┊ 8┊
 ┊10┊ 9┊@NgModule({
 ┊11┊10┊  declarations: [
<b>+┊  ┊11┊    MyApp</b>
 ┊14┊12┊  ],
 ┊15┊13┊  imports: [
 ┊16┊14┊    BrowserModule,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊18┊16┊  ],
 ┊19┊17┊  bootstrap: [IonicApp],
 ┊20┊18┊  entryComponents: [
<b>+┊  ┊19┊    MyApp</b>
 ┊23┊20┊  ],
 ┊24┊21┊  providers: [
 ┊25┊22┊    StatusBar,
</pre>

[}]: #

Now, let's create our new `Component`, we'll call it `ChatsPage`:

[{]: <helper> (diffStep 2.3)

#### [Step 2.3: Create Chats page component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/1b14019)

##### Added src&#x2F;pages&#x2F;chats&#x2F;chats.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { Component } from &#x27;@angular/core&#x27;;</b>
<b>+┊  ┊ 2┊</b>
<b>+┊  ┊ 3┊@Component({</b>
<b>+┊  ┊ 4┊  templateUrl: &#x27;chats.html&#x27;</b>
<b>+┊  ┊ 5┊})</b>
<b>+┊  ┊ 6┊export class ChatsPage {</b>
<b>+┊  ┊ 7┊  constructor() {</b>
<b>+┊  ┊ 8┊</b>
<b>+┊  ┊ 9┊  }</b>
<b>+┊  ┊10┊}</b>
</pre>

[}]: #

`Angular 2` uses decorators to declare `Component`s, and we use `ES2016` classes to create the actual component, and the `templateUrl` declares the template file for the component. So now let's create this template file, next to the component file:

[{]: <helper> (diffStep 2.4)

#### [Step 2.4: Added chats page template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/987fcea)

##### Added src&#x2F;pages&#x2F;chats&#x2F;chats.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊&lt;ion-header&gt;</b>
<b>+┊  ┊ 2┊  &lt;ion-navbar&gt;</b>
<b>+┊  ┊ 3┊    &lt;ion-title&gt;</b>
<b>+┊  ┊ 4┊      Chats</b>
<b>+┊  ┊ 5┊    &lt;/ion-title&gt;</b>
<b>+┊  ┊ 6┊  &lt;/ion-navbar&gt;</b>
<b>+┊  ┊ 7┊&lt;/ion-header&gt;</b>
<b>+┊  ┊ 8┊</b>
<b>+┊  ┊ 9┊&lt;ion-content padding&gt;</b>
<b>+┊  ┊10┊  Hello!</b>
<b>+┊  ┊11┊&lt;/ion-content&gt;</b>
</pre>

[}]: #

Once creating an Ionic page it's recommended to use the following layout:

- &lt;ion-header&gt; - The header of the page. Will usually contain content that should be bounded to the top like navbar.
- &lt;ion-content&gt; - The content of the page. Will usually contain it's actual content like text.
- &lt;ion-footer&gt; - The footer of the page. Will usually contain content that should be bounded to the bottom like toolbars.

Now, we need to add a declaration for this new `Component` in our `NgModule` definition:

[{]: <helper> (diffStep 2.5)

#### [Step 2.5: Add chats page to the NgModule](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/5b0013b)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 3┊ 3┊import { IonicApp, IonicErrorHandler, IonicModule } from &#x27;ionic-angular&#x27;;
 ┊ 4┊ 4┊import { SplashScreen } from &#x27;@ionic-native/splash-screen&#x27;;
 ┊ 5┊ 5┊import { StatusBar } from &#x27;@ionic-native/status-bar&#x27;;
<b>+┊  ┊ 6┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;</b>
 ┊ 6┊ 7┊
 ┊ 7┊ 8┊import { MyApp } from &#x27;./app.component&#x27;;
 ┊ 8┊ 9┊
 ┊ 9┊10┊@NgModule({
 ┊10┊11┊  declarations: [
<b>+┊  ┊12┊    MyApp,</b>
<b>+┊  ┊13┊    ChatsPage</b>
 ┊12┊14┊  ],
 ┊13┊15┊  imports: [
 ┊14┊16┊    BrowserModule,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊16┊18┊  ],
 ┊17┊19┊  bootstrap: [IonicApp],
 ┊18┊20┊  entryComponents: [
<b>+┊  ┊21┊    MyApp,</b>
<b>+┊  ┊22┊    ChatsPage</b>
 ┊20┊23┊  ],
 ┊21┊24┊  providers: [
 ┊22┊25┊    StatusBar,
</pre>

[}]: #

> You can read more about [Angular 2 NgModule here](https://angular.io/docs/ts/latest/guide/ngmodule.html).

We will define the `ChatsPage` as the initial component of our app by setting the `rootPage` property in the main app component:

[{]: <helper> (diffStep 2.6)

#### [Step 2.6: Use the chats page as the main root page](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/de829e2)

##### Changed src&#x2F;app&#x2F;app.component.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 2┊ 2┊import { Platform } from &#x27;ionic-angular&#x27;;
 ┊ 3┊ 3┊import { StatusBar } from &#x27;@ionic-native/status-bar&#x27;;
 ┊ 4┊ 4┊import { SplashScreen } from &#x27;@ionic-native/splash-screen&#x27;;
<b>+┊  ┊ 5┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;</b>
 ┊ 5┊ 6┊
 ┊ 7┊ 7┊@Component({
 ┊ 8┊ 8┊  templateUrl: &#x27;app.html&#x27;
 ┊ 9┊ 9┊})
 ┊10┊10┊export class MyApp {
<b>+┊  ┊11┊  rootPage:any &#x3D; ChatsPage;</b>
 ┊12┊12┊
 ┊13┊13┊  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
 ┊14┊14┊    platform.ready().then(() &#x3D;&gt; {
</pre>

[}]: #

Let's add some code to our `Component` with a simple logic; Once the component is created we gonna define some dummy chats, using the `Observable.of`, so we can have some data to test our view against:

[{]: <helper> (diffStep 2.7)

#### [Step 2.7: Add stubs for chats objects](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/60d6ae6)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊import { Component } from &#x27;@angular/core&#x27;;
<b>+┊  ┊ 2┊import { Observable } from &#x27;rxjs&#x27;;</b>
<b>+┊  ┊ 3┊import * as moment from &#x27;moment&#x27;;</b>
 ┊ 2┊ 4┊
 ┊ 3┊ 5┊@Component({
 ┊ 4┊ 6┊  templateUrl: &#x27;chats.html&#x27;
 ┊ 5┊ 7┊})
 ┊ 6┊ 8┊export class ChatsPage {
<b>+┊  ┊ 9┊  chats: Observable&lt;any[]&gt;;</b>
<b>+┊  ┊10┊</b>
 ┊ 7┊11┊  constructor() {
<b>+┊  ┊12┊    this.chats &#x3D; this.findChats();</b>
<b>+┊  ┊13┊  }</b>
 ┊ 8┊14┊
<b>+┊  ┊15┊  private findChats(): Observable&lt;any[]&gt; {</b>
<b>+┊  ┊16┊    return Observable.of([</b>
<b>+┊  ┊17┊      {</b>
<b>+┊  ┊18┊        _id: &#x27;0&#x27;,</b>
<b>+┊  ┊19┊        title: &#x27;Ethan Gonzalez&#x27;,</b>
<b>+┊  ┊20┊        picture: &#x27;https://randomuser.me/api/portraits/thumb/men/1.jpg&#x27;,</b>
<b>+┊  ┊21┊        lastMessage: {</b>
<b>+┊  ┊22┊          content: &#x27;You on your way?&#x27;,</b>
<b>+┊  ┊23┊          createdAt: moment().subtract(1, &#x27;hours&#x27;).toDate()</b>
<b>+┊  ┊24┊        }</b>
<b>+┊  ┊25┊      },</b>
<b>+┊  ┊26┊      {</b>
<b>+┊  ┊27┊        _id: &#x27;1&#x27;,</b>
<b>+┊  ┊28┊        title: &#x27;Bryan Wallace&#x27;,</b>
<b>+┊  ┊29┊        picture: &#x27;https://randomuser.me/api/portraits/thumb/lego/1.jpg&#x27;,</b>
<b>+┊  ┊30┊        lastMessage: {</b>
<b>+┊  ┊31┊          content: &#x27;Hey, it\&#x27;s me&#x27;,</b>
<b>+┊  ┊32┊          createdAt: moment().subtract(2, &#x27;hours&#x27;).toDate()</b>
<b>+┊  ┊33┊        }</b>
<b>+┊  ┊34┊      },</b>
<b>+┊  ┊35┊      {</b>
<b>+┊  ┊36┊        _id: &#x27;2&#x27;,</b>
<b>+┊  ┊37┊        title: &#x27;Avery Stewart&#x27;,</b>
<b>+┊  ┊38┊        picture: &#x27;https://randomuser.me/api/portraits/thumb/women/1.jpg&#x27;,</b>
<b>+┊  ┊39┊        lastMessage: {</b>
<b>+┊  ┊40┊          content: &#x27;I should buy a boat&#x27;,</b>
<b>+┊  ┊41┊          createdAt: moment().subtract(1, &#x27;days&#x27;).toDate()</b>
<b>+┊  ┊42┊        }</b>
<b>+┊  ┊43┊      },</b>
<b>+┊  ┊44┊      {</b>
<b>+┊  ┊45┊        _id: &#x27;3&#x27;,</b>
<b>+┊  ┊46┊        title: &#x27;Katie Peterson&#x27;,</b>
<b>+┊  ┊47┊        picture: &#x27;https://randomuser.me/api/portraits/thumb/women/2.jpg&#x27;,</b>
<b>+┊  ┊48┊        lastMessage: {</b>
<b>+┊  ┊49┊          content: &#x27;Look at my mukluks!&#x27;,</b>
<b>+┊  ┊50┊          createdAt: moment().subtract(4, &#x27;days&#x27;).toDate()</b>
<b>+┊  ┊51┊        }</b>
<b>+┊  ┊52┊      },</b>
<b>+┊  ┊53┊      {</b>
<b>+┊  ┊54┊        _id: &#x27;4&#x27;,</b>
<b>+┊  ┊55┊        title: &#x27;Ray Edwards&#x27;,</b>
<b>+┊  ┊56┊        picture: &#x27;https://randomuser.me/api/portraits/thumb/men/2.jpg&#x27;,</b>
<b>+┊  ┊57┊        lastMessage: {</b>
<b>+┊  ┊58┊          content: &#x27;This is wicked good ice cream.&#x27;,</b>
<b>+┊  ┊59┊          createdAt: moment().subtract(2, &#x27;weeks&#x27;).toDate()</b>
<b>+┊  ┊60┊        }</b>
<b>+┊  ┊61┊      }</b>
<b>+┊  ┊62┊    ]);</b>
 ┊ 9┊63┊  }
 ┊10┊64┊}
</pre>

[}]: #

> Further explanation regards `RxJS` can be found in [step 3](./step3.md)

`moment` is an essential package for our data fabrication, which requires us to install it using the following command:

    $ npm install --save moment

## TypeScript Interfaces

Now, because we use `TypeScript`, we can define our own data-types and use them in our app, which will give you a better auto-complete and developing experience in most IDEs. In our application, we have 2 models: a `chat` model and a `message` model. We will define their interfaces in a file located under the path `src/models.ts`:

[{]: <helper> (diffStep 2.9)

#### [Step 2.9: Create models file with declarations of Chat, Message and MessageType](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/9cfbf85)

##### Added src&#x2F;models.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊export enum MessageType {</b>
<b>+┊  ┊ 2┊  TEXT &#x3D; &lt;any&gt;&#x27;text&#x27;</b>
<b>+┊  ┊ 3┊}</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊export interface Chat {</b>
<b>+┊  ┊ 6┊  _id?: string;</b>
<b>+┊  ┊ 7┊  title?: string;</b>
<b>+┊  ┊ 8┊  picture?: string;</b>
<b>+┊  ┊ 9┊  lastMessage?: Message;</b>
<b>+┊  ┊10┊}</b>
<b>+┊  ┊11┊</b>
<b>+┊  ┊12┊export interface Message {</b>
<b>+┊  ┊13┊  _id?: string;</b>
<b>+┊  ┊14┊  chatId?: string;</b>
<b>+┊  ┊15┊  content?: string;</b>
<b>+┊  ┊16┊  createdAt?: Date;</b>
<b>+┊  ┊17┊  type?: MessageType</b>
<b>+┊  ┊18┊}</b>
</pre>

[}]: #

Now that the models are up and set, we can apply them to the `ChatsPage`:

[{]: <helper> (diffStep "2.10")

#### [Step 2.10: Use TypeScript models](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/9e7dc4d)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊import { Component } from &#x27;@angular/core&#x27;;
 ┊ 2┊ 2┊import { Observable } from &#x27;rxjs&#x27;;
 ┊ 3┊ 3┊import * as moment from &#x27;moment&#x27;;
<b>+┊  ┊ 4┊import { Chat, MessageType } from &#x27;../../models&#x27;;</b>
 ┊ 4┊ 5┊
 ┊ 5┊ 6┊@Component({
 ┊ 6┊ 7┊  templateUrl: &#x27;chats.html&#x27;
 ┊ 7┊ 8┊})
 ┊ 8┊ 9┊export class ChatsPage {
<b>+┊  ┊10┊  chats: Observable&lt;Chat[]&gt;;</b>
 ┊10┊11┊
 ┊11┊12┊  constructor() {
 ┊12┊13┊    this.chats &#x3D; this.findChats();
 ┊13┊14┊  }
 ┊14┊15┊
<b>+┊  ┊16┊  private findChats(): Observable&lt;Chat[]&gt; {</b>
 ┊16┊17┊    return Observable.of([
 ┊17┊18┊      {
 ┊18┊19┊        _id: &#x27;0&#x27;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊20┊21┊        picture: &#x27;https://randomuser.me/api/portraits/thumb/men/1.jpg&#x27;,
 ┊21┊22┊        lastMessage: {
 ┊22┊23┊          content: &#x27;You on your way?&#x27;,
<b>+┊  ┊24┊          createdAt: moment().subtract(1, &#x27;hours&#x27;).toDate(),</b>
<b>+┊  ┊25┊          type: MessageType.TEXT</b>
 ┊24┊26┊        }
 ┊25┊27┊      },
 ┊26┊28┊      {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊29┊31┊        picture: &#x27;https://randomuser.me/api/portraits/thumb/lego/1.jpg&#x27;,
 ┊30┊32┊        lastMessage: {
 ┊31┊33┊          content: &#x27;Hey, it\&#x27;s me&#x27;,
<b>+┊  ┊34┊          createdAt: moment().subtract(2, &#x27;hours&#x27;).toDate(),</b>
<b>+┊  ┊35┊          type: MessageType.TEXT</b>
 ┊33┊36┊        }
 ┊34┊37┊      },
 ┊35┊38┊      {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊38┊41┊        picture: &#x27;https://randomuser.me/api/portraits/thumb/women/1.jpg&#x27;,
 ┊39┊42┊        lastMessage: {
 ┊40┊43┊          content: &#x27;I should buy a boat&#x27;,
<b>+┊  ┊44┊          createdAt: moment().subtract(1, &#x27;days&#x27;).toDate(),</b>
<b>+┊  ┊45┊          type: MessageType.TEXT</b>
 ┊42┊46┊        }
 ┊43┊47┊      },
 ┊44┊48┊      {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊47┊51┊        picture: &#x27;https://randomuser.me/api/portraits/thumb/women/2.jpg&#x27;,
 ┊48┊52┊        lastMessage: {
 ┊49┊53┊          content: &#x27;Look at my mukluks!&#x27;,
<b>+┊  ┊54┊          createdAt: moment().subtract(4, &#x27;days&#x27;).toDate(),</b>
<b>+┊  ┊55┊          type: MessageType.TEXT</b>
 ┊51┊56┊        }
 ┊52┊57┊      },
 ┊53┊58┊      {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊56┊61┊        picture: &#x27;https://randomuser.me/api/portraits/thumb/men/2.jpg&#x27;,
 ┊57┊62┊        lastMessage: {
 ┊58┊63┊          content: &#x27;This is wicked good ice cream.&#x27;,
<b>+┊  ┊64┊          createdAt: moment().subtract(2, &#x27;weeks&#x27;).toDate(),</b>
<b>+┊  ┊65┊          type: MessageType.TEXT</b>
 ┊60┊66┊        }
 ┊61┊67┊      }
 ┊62┊68┊    ]);
</pre>

[}]: #

## Ionic's Theming System

`Ionic 2` provides us with a comfortable theming system which is based on `SASS` variables. The theme definition file is located in `src/theme/variable.scss`. Since we want our app to have a "Whatsappish" look, we will define a new `SASS` variable called `whatsapp` in the variables file:

[{]: <helper> (diffStep 2.11)

#### [Step 2.11: Add whatsapp color to the app theme](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/3c23e61)

##### Changed src&#x2F;theme&#x2F;variables.scss
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊28┊28┊  secondary:  #32db64,
 ┊29┊29┊  danger:     #f53d3d,
 ┊30┊30┊  light:      #f4f4f4,
<b>+┊  ┊31┊  dark:       #222,</b>
<b>+┊  ┊32┊  whatsapp:   #075E54</b>
 ┊32┊33┊);
</pre>

[}]: #

The `whatsapp` color can be used by adding an attribute called `color` with a value `whatsapp` to any Ionic component.

To begin with, we can start by implementing the `ChatsView` and apply our newly defined theme into it. This view will contain a list representing all the available chats in the component's data-set:

[{]: <helper> (diffStep 2.12)

#### [Step 2.12: Add the layout of the chats page](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/8594871)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊&lt;ion-header&gt;
<b>+┊  ┊ 2┊  &lt;ion-navbar color&#x3D;&quot;whatsapp&quot;&gt;</b>
 ┊ 3┊ 3┊    &lt;ion-title&gt;
 ┊ 4┊ 4┊      Chats
 ┊ 5┊ 5┊    &lt;/ion-title&gt;
<b>+┊  ┊ 6┊    &lt;ion-buttons end&gt;</b>
<b>+┊  ┊ 7┊      &lt;button ion-button icon-only class&#x3D;&quot;add-chat-button&quot;&gt;</b>
<b>+┊  ┊ 8┊        &lt;ion-icon name&#x3D;&quot;person-add&quot;&gt;&lt;/ion-icon&gt;</b>
<b>+┊  ┊ 9┊      &lt;/button&gt;</b>
<b>+┊  ┊10┊      &lt;button ion-button icon-only class&#x3D;&quot;options-button&quot;&gt;</b>
<b>+┊  ┊11┊        &lt;ion-icon name&#x3D;&quot;more&quot;&gt;&lt;/ion-icon&gt;</b>
<b>+┊  ┊12┊      &lt;/button&gt;</b>
<b>+┊  ┊13┊    &lt;/ion-buttons&gt;</b>
 ┊ 6┊14┊  &lt;/ion-navbar&gt;
 ┊ 7┊15┊&lt;/ion-header&gt;
 ┊ 8┊16┊
<b>+┊  ┊17┊&lt;ion-content class&#x3D;&quot;chats-page-content&quot;&gt;</b>
<b>+┊  ┊18┊  &lt;ion-list class&#x3D;&quot;chats&quot;&gt;</b>
<b>+┊  ┊19┊    &lt;ion-item-sliding *ngFor&#x3D;&quot;let chat of chats | async&quot;&gt;</b>
<b>+┊  ┊20┊      &lt;button ion-item class&#x3D;&quot;chat&quot;&gt;</b>
<b>+┊  ┊21┊        &lt;img class&#x3D;&quot;chat-picture&quot; [src]&#x3D;&quot;chat.picture&quot;&gt;</b>
<b>+┊  ┊22┊        &lt;div class&#x3D;&quot;chat-info&quot;&gt;</b>
<b>+┊  ┊23┊          &lt;h2 class&#x3D;&quot;chat-title&quot;&gt;{{chat.title}}&lt;/h2&gt;</b>
<b>+┊  ┊24┊</b>
<b>+┊  ┊25┊          &lt;span *ngIf&#x3D;&quot;chat.lastMessage&quot; class&#x3D;&quot;last-message&quot;&gt;</b>
<b>+┊  ┊26┊            &lt;p *ngIf&#x3D;&quot;chat.lastMessage.type &#x3D;&#x3D; &#x27;text&#x27;&quot; class&#x3D;&quot;last-message-content last-message-content-text&quot;&gt;{{chat.lastMessage.content}}&lt;/p&gt;</b>
<b>+┊  ┊27┊            &lt;span class&#x3D;&quot;last-message-timestamp&quot;&gt;{{chat.lastMessage.createdAt }}&lt;/span&gt;</b>
<b>+┊  ┊28┊          &lt;/span&gt;</b>
<b>+┊  ┊29┊        &lt;/div&gt;</b>
<b>+┊  ┊30┊      &lt;/button&gt;</b>
<b>+┊  ┊31┊      &lt;ion-item-options class&#x3D;&quot;chat-options&quot;&gt;</b>
<b>+┊  ┊32┊        &lt;button ion-button color&#x3D;&quot;danger&quot; class&#x3D;&quot;option option-remove&quot;&gt;Remove&lt;/button&gt;</b>
<b>+┊  ┊33┊      &lt;/ion-item-options&gt;</b>
<b>+┊  ┊34┊    &lt;/ion-item-sliding&gt;</b>
<b>+┊  ┊35┊  &lt;/ion-list&gt;</b>
 ┊11┊36┊&lt;/ion-content&gt;
</pre>

[}]: #

We use `ion-list` which Ionic translates into a list, and we use `ion-item` to represent a single item in that list. A chat item includes an image, the receiver's name, and its recent message.

> The `async` pipe is used to iterate through data which should be fetched asynchronously, in this case, observables.

Now, in order to finish our theming and styling, let's create a stylesheet file for our component:

[{]: <helper> (diffStep 2.13)

#### [Step 2.13: Create SCSS file for chats page](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/4d8971f)

##### Added src&#x2F;pages&#x2F;chats&#x2F;chats.scss
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊.chats-page-content {</b>
<b>+┊  ┊ 2┊  .chat-picture {</b>
<b>+┊  ┊ 3┊    border-radius: 50%;</b>
<b>+┊  ┊ 4┊    width: 50px;</b>
<b>+┊  ┊ 5┊    float: left;</b>
<b>+┊  ┊ 6┊  }</b>
<b>+┊  ┊ 7┊</b>
<b>+┊  ┊ 8┊  .chat-info {</b>
<b>+┊  ┊ 9┊    float: left;</b>
<b>+┊  ┊10┊    margin: 10px 0 0 20px;</b>
<b>+┊  ┊11┊</b>
<b>+┊  ┊12┊    .last-message-timestamp {</b>
<b>+┊  ┊13┊      position: absolute;</b>
<b>+┊  ┊14┊      top: 10px;</b>
<b>+┊  ┊15┊      right: 10px;</b>
<b>+┊  ┊16┊      font-size: 14px;</b>
<b>+┊  ┊17┊      color: #9A9898;</b>
<b>+┊  ┊18┊    }</b>
<b>+┊  ┊19┊  }</b>
<b>+┊  ┊20┊}</b>
</pre>

[}]: #

Ionic will load newly defined stylesheet files automatically, so you shouldn't be worried for importations.

## External Angular 2 Modules

Since `Ionic 2` uses `Angular 2` as the layer view, we can load `Angular 2` modules just like any other plain `Angular 2` application. One module that may come in our interest would be the `angular2-moment` module, which will provide us with the ability to use `moment`'s utility functions in the view as pipes.

It requires us to install `angular2-moment` module using the following command:

    $ npm install --save angular2-moment

Now we will need to declare this module in the app's main component:

[{]: <helper> (diffStep 2.15)

#### [Step 2.15: Import MomentModule into our app module](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/0160c4c)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊3┊3┊import { IonicApp, IonicErrorHandler, IonicModule } from &#x27;ionic-angular&#x27;;
 ┊4┊4┊import { SplashScreen } from &#x27;@ionic-native/splash-screen&#x27;;
 ┊5┊5┊import { StatusBar } from &#x27;@ionic-native/status-bar&#x27;;
<b>+┊ ┊6┊import { MomentModule } from &#x27;angular2-moment&#x27;;</b>
 ┊6┊7┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;
 ┊7┊8┊
 ┊8┊9┊import { MyApp } from &#x27;./app.component&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊14┊15┊  ],
 ┊15┊16┊  imports: [
 ┊16┊17┊    BrowserModule,
<b>+┊  ┊18┊    IonicModule.forRoot(MyApp),</b>
<b>+┊  ┊19┊    MomentModule</b>
 ┊18┊20┊  ],
 ┊19┊21┊  bootstrap: [IonicApp],
 ┊20┊22┊  entryComponents: [
</pre>

[}]: #

Which will make `moment` available as a pack of pipes, as mentioned earlier:

[{]: <helper> (diffStep 2.16)

#### [Step 2.16: Use amCalendar pipe](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/cb9d236)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊24┊24┊
 ┊25┊25┊          &lt;span *ngIf&#x3D;&quot;chat.lastMessage&quot; class&#x3D;&quot;last-message&quot;&gt;
 ┊26┊26┊            &lt;p *ngIf&#x3D;&quot;chat.lastMessage.type &#x3D;&#x3D; &#x27;text&#x27;&quot; class&#x3D;&quot;last-message-content last-message-content-text&quot;&gt;{{chat.lastMessage.content}}&lt;/p&gt;
<b>+┊  ┊27┊            &lt;span class&#x3D;&quot;last-message-timestamp&quot;&gt;{{ chat.lastMessage.createdAt | amCalendar }}&lt;/span&gt;</b>
 ┊28┊28┊          &lt;/span&gt;
 ┊29┊29┊        &lt;/div&gt;
 ┊30┊30┊      &lt;/button&gt;
</pre>

[}]: #

## Ionic Touch Events

Ionic provides us with components which can handle mobile events like: slide, tap and pinch. Since we're going to take advantage of the "sliding" event in the `chats` view, we used the `ion-item-sliding` component, so any time we will slide our item to the left, we should see a `Remove` button.

Right now this button is not hooked to anything. It requires us to bind it into the component:

[{]: <helper> (diffStep 2.17)

#### [Step 2.17: Add remove chat event](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/21001eb)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊29┊29┊        &lt;/div&gt;
 ┊30┊30┊      &lt;/button&gt;
 ┊31┊31┊      &lt;ion-item-options class&#x3D;&quot;chat-options&quot;&gt;
<b>+┊  ┊32┊        &lt;button ion-button color&#x3D;&quot;danger&quot; class&#x3D;&quot;option option-remove&quot; (click)&#x3D;&quot;removeChat(chat)&quot;&gt;Remove&lt;/button&gt;</b>
 ┊33┊33┊      &lt;/ion-item-options&gt;
 ┊34┊34┊    &lt;/ion-item-sliding&gt;
 ┊35┊35┊  &lt;/ion-list&gt;
</pre>

[}]: #

And now that it is bound to the component we can safely implement its handler:

[{]: <helper> (diffStep 2.18)

#### [Step 2.18: Implement removeChat method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/daa701e)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊67┊67┊      }
 ┊68┊68┊    ]);
 ┊69┊69┊  }
<b>+┊  ┊70┊</b>
<b>+┊  ┊71┊  removeChat(chat: Chat): void {</b>
<b>+┊  ┊72┊    this.chats &#x3D; this.chats.map((chatsArray: Chat[]) &#x3D;&gt; {</b>
<b>+┊  ┊73┊      const chatIndex &#x3D; chatsArray.indexOf(chat);</b>
<b>+┊  ┊74┊      if (chatIndex !&#x3D;&#x3D; -1) {</b>
<b>+┊  ┊75┊        chatsArray.splice(chatIndex, 1);</b>
<b>+┊  ┊76┊      }</b>
<b>+┊  ┊77┊</b>
<b>+┊  ┊78┊      return chatsArray;</b>
<b>+┊  ┊79┊    });</b>
<b>+┊  ┊80┊  }</b>
 ┊70┊81┊}
</pre>

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/rxjs" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/setup")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/setup">PREVIOUS STEP</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/rxjs">NEXT STEP</a> ⟹

[}]: #

