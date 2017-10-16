# Step 6: Messages Page

In this step we will add the messages view and the ability to send messages.

Before we implement anything related to the messages pages, we first have to make sure that once we click on a chat item in the chats page, we will be promoted into its corresponding messages view. Let's first implement the `showMessages()` method in the chats component:

[{]: <helper> (diffStep 6.1)

#### [Step 6.1: Add showMessages](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/97f3776)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Component, OnInit } from &#x27;@angular/core&#x27;;
 ┊2┊2┊import { Chats, Messages } from &#x27;api/collections&#x27;;
 ┊3┊3┊import { Chat } from &#x27;api/models&#x27;;
<b>+┊ ┊4┊import { NavController } from &#x27;ionic-angular&#x27;;</b>
 ┊4┊5┊import { Observable } from &#x27;rxjs&#x27;;
 ┊5┊6┊
 ┊6┊7┊@Component({
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 9┊10┊export class ChatsPage implements OnInit {
 ┊10┊11┊  chats;
 ┊11┊12┊
<b>+┊  ┊13┊  constructor(private navCtrl: NavController) {</b>
 ┊13┊14┊  }
 ┊14┊15┊
 ┊15┊16┊  ngOnInit() {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊30┊31┊      ).zone();
 ┊31┊32┊  }
 ┊32┊33┊
<b>+┊  ┊34┊  showMessages(chat): void {</b>
<b>+┊  ┊35┊    this.navCtrl.push(MessagesPage, {chat});</b>
<b>+┊  ┊36┊  }</b>
<b>+┊  ┊37┊</b>
 ┊33┊38┊  removeChat(chat: Chat): void {
 ┊34┊39┊    Chats.remove({_id: chat._id}).subscribe(() &#x3D;&gt; {
 ┊35┊40┊    });
</pre>

[}]: #

And let's register the click event in the view:

[{]: <helper> (diffStep 6.2)

#### [Step 6.2: Bind click event to showMessages](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/318bb7d)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊17┊17┊&lt;ion-content class&#x3D;&quot;chats-page-content&quot;&gt;
 ┊18┊18┊  &lt;ion-list class&#x3D;&quot;chats&quot;&gt;
 ┊19┊19┊    &lt;ion-item-sliding *ngFor&#x3D;&quot;let chat of chats | async&quot;&gt;
<b>+┊  ┊20┊      &lt;button ion-item class&#x3D;&quot;chat&quot; (click)&#x3D;&quot;showMessages(chat)&quot;&gt;</b>
 ┊21┊21┊        &lt;img class&#x3D;&quot;chat-picture&quot; [src]&#x3D;&quot;chat.picture&quot;&gt;
 ┊22┊22┊        &lt;div class&#x3D;&quot;chat-info&quot;&gt;
 ┊23┊23┊          &lt;h2 class&#x3D;&quot;chat-title&quot;&gt;{{chat.title}}&lt;/h2&gt;
</pre>

[}]: #

Notice how we used a controller called `NavController`. The `NavController` is `Ionic`'s new method to navigate in our app. We can also use a traditional router, but since in a mobile app we have no access to the url bar, this might come more in handy. You can read more about the `NavController` [here](http://ionicframework.com/docs/v2/api/components/nav/NavController/).

Let's go ahead and implement the messages component. We'll call it `MessagesPage`:

[{]: <helper> (diffStep 6.3)

#### [Step 6.3: Create a stub MessagesPage component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/5b84b93)

##### Added src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { Component, OnInit } from &#x27;@angular/core&#x27;;</b>
<b>+┊  ┊ 2┊import { NavParams } from &#x27;ionic-angular&#x27;;</b>
<b>+┊  ┊ 3┊import { Chat } from &#x27;api/models&#x27;;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊@Component({</b>
<b>+┊  ┊ 6┊  selector: &#x27;messages-page&#x27;,</b>
<b>+┊  ┊ 7┊  template: &#x60;Messages Page&#x60;</b>
<b>+┊  ┊ 8┊})</b>
<b>+┊  ┊ 9┊export class MessagesPage implements OnInit {</b>
<b>+┊  ┊10┊  selectedChat: Chat;</b>
<b>+┊  ┊11┊</b>
<b>+┊  ┊12┊  constructor(navParams: NavParams) {</b>
<b>+┊  ┊13┊    this.selectedChat &#x3D; &lt;Chat&gt;navParams.get(&#x27;chat&#x27;);</b>
<b>+┊  ┊14┊</b>
<b>+┊  ┊15┊    console.log(&#x27;Selected chat is: &#x27;, this.selectedChat);</b>
<b>+┊  ┊16┊  }</b>
<b>+┊  ┊17┊</b>
<b>+┊  ┊18┊  ngOnInit() {</b>
<b>+┊  ┊19┊</b>
<b>+┊  ┊20┊  }</b>
<b>+┊  ┊21┊}</b>
</pre>

[}]: #

As you can see, in order to get the chat's id we used the `NavParams` service. This is a simple service which gives you access to a key-value storage containing all the parameters we've passed using the `NavController`.

For more information about the `NavParams` service, see the following [link](http://ionicframework.com/docs/v2/api/components/nav/NavParams).

Don't forget that any component you create has to be imported in the app's module:

[{]: <helper> (diffStep 6.4)

#### [Step 6.4: Import MessagesPage in the NgModule](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/9b467ef)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 5┊ 5┊import { StatusBar } from &#x27;@ionic-native/status-bar&#x27;;
 ┊ 6┊ 6┊import { MomentModule } from &#x27;angular2-moment&#x27;;
 ┊ 7┊ 7┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;
<b>+┊  ┊ 8┊import { MessagesPage } from &#x27;../pages/messages/messages&#x27;;</b>
 ┊ 9┊ 9┊import { MyApp } from &#x27;./app.component&#x27;;
 ┊10┊10┊
 ┊11┊11┊@NgModule({
 ┊12┊12┊  declarations: [
 ┊13┊13┊    MyApp,
<b>+┊  ┊14┊    ChatsPage,</b>
<b>+┊  ┊15┊    MessagesPage</b>
 ┊15┊16┊  ],
 ┊16┊17┊  imports: [
 ┊17┊18┊    BrowserModule,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊21┊22┊  bootstrap: [IonicApp],
 ┊22┊23┊  entryComponents: [
 ┊23┊24┊    MyApp,
<b>+┊  ┊25┊    ChatsPage,</b>
<b>+┊  ┊26┊    MessagesPage</b>
 ┊25┊27┊  ],
 ┊26┊28┊  providers: [
 ┊27┊29┊    StatusBar,
</pre>

[}]: #

Now we can complete our `ChatsPage`'s navigation method by importing the `MessagesPage`:

[{]: <helper> (diffStep 6.5)

#### [Step 6.5: Import MessagesPage to chats page](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/74a834b)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊3┊3┊import { Chat } from &#x27;api/models&#x27;;
 ┊4┊4┊import { NavController } from &#x27;ionic-angular&#x27;;
 ┊5┊5┊import { Observable } from &#x27;rxjs&#x27;;
<b>+┊ ┊6┊import { MessagesPage } from &#x27;../messages/messages&#x27;;</b>
 ┊6┊7┊
 ┊7┊8┊@Component({
 ┊8┊9┊  templateUrl: &#x27;chats.html&#x27;
</pre>

[}]: #

We're missing some important details in the messages page. We don't know who we're chatting with, we don't know how does he look like, and we don't know which message is ours, and which is not. We can add these using the following code snippet:

[{]: <helper> (diffStep 6.6)

#### [Step 6.6: Add basic messages component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/d1cc4bb)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊import { Component, OnInit } from &#x27;@angular/core&#x27;;
 ┊ 2┊ 2┊import { NavParams } from &#x27;ionic-angular&#x27;;
<b>+┊  ┊ 3┊import { Chat, Message } from &#x27;api/models&#x27;;</b>
<b>+┊  ┊ 4┊import { Observable } from &#x27;rxjs&#x27;;</b>
<b>+┊  ┊ 5┊import { Messages } from &#x27;api/collections&#x27;;</b>
 ┊ 4┊ 6┊
 ┊ 5┊ 7┊@Component({
 ┊ 6┊ 8┊  selector: &#x27;messages-page&#x27;,
<b>+┊  ┊ 9┊  templateUrl: &#x27;messages.html&#x27;</b>
 ┊ 8┊10┊})
 ┊ 9┊11┊export class MessagesPage implements OnInit {
 ┊10┊12┊  selectedChat: Chat;
<b>+┊  ┊13┊  title: string;</b>
<b>+┊  ┊14┊  picture: string;</b>
<b>+┊  ┊15┊  messages: Observable&lt;Message[]&gt;;</b>
 ┊11┊16┊
 ┊12┊17┊  constructor(navParams: NavParams) {
 ┊13┊18┊    this.selectedChat &#x3D; &lt;Chat&gt;navParams.get(&#x27;chat&#x27;);
<b>+┊  ┊19┊    this.title &#x3D; this.selectedChat.title;</b>
<b>+┊  ┊20┊    this.picture &#x3D; this.selectedChat.picture;</b>
 ┊16┊21┊  }
 ┊17┊22┊
 ┊18┊23┊  ngOnInit() {
<b>+┊  ┊24┊    let isEven &#x3D; false;</b>
<b>+┊  ┊25┊</b>
<b>+┊  ┊26┊    this.messages &#x3D; Messages.find(</b>
<b>+┊  ┊27┊      {chatId: this.selectedChat._id},</b>
<b>+┊  ┊28┊      {sort: {createdAt: 1}}</b>
<b>+┊  ┊29┊    ).map((messages: Message[]) &#x3D;&gt; {</b>
<b>+┊  ┊30┊      messages.forEach((message: Message) &#x3D;&gt; {</b>
<b>+┊  ┊31┊        message.ownership &#x3D; isEven ? &#x27;mine&#x27; : &#x27;other&#x27;;</b>
<b>+┊  ┊32┊        isEven &#x3D; !isEven;</b>
<b>+┊  ┊33┊      });</b>
 ┊19┊34┊
<b>+┊  ┊35┊      return messages;</b>
<b>+┊  ┊36┊    });</b>
 ┊20┊37┊  }
 ┊21┊38┊}
</pre>

[}]: #

Since now we're not really able to determine the author of a message, we mark every even message as ours; But later on once we have an authentication system and users, we will be filling the missing gap.

We will also have to update the message model to have an `ownership` property:

[{]: <helper> (diffStep 6.7)

#### [Step 6.7: Add ownership property to messages model](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/086e670)

##### Changed api&#x2F;server&#x2F;models.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊15┊15┊  content?: string;
 ┊16┊16┊  createdAt?: Date;
 ┊17┊17┊  type?: MessageType
<b>+┊  ┊18┊  ownership?: string;</b>
 ┊18┊19┊}
</pre>

[}]: #

Now that we have a basic component, let's implement a messages view as well:

[{]: <helper> (diffStep 6.8)

#### [Step 6.8: Add message page template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/1d4cb5f)

##### Added src&#x2F;pages&#x2F;messages&#x2F;messages.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊&lt;ion-header&gt;</b>
<b>+┊  ┊ 2┊  &lt;ion-navbar color&#x3D;&quot;whatsapp&quot; class&#x3D;&quot;messages-page-navbar&quot;&gt;</b>
<b>+┊  ┊ 3┊    &lt;ion-buttons&gt;</b>
<b>+┊  ┊ 4┊      &lt;img class&#x3D;&quot;chat-picture&quot; [src]&#x3D;&quot;picture&quot;&gt;</b>
<b>+┊  ┊ 5┊    &lt;/ion-buttons&gt;</b>
<b>+┊  ┊ 6┊</b>
<b>+┊  ┊ 7┊    &lt;ion-title class&#x3D;&quot;chat-title&quot;&gt;{{title}}&lt;/ion-title&gt;</b>
<b>+┊  ┊ 8┊</b>
<b>+┊  ┊ 9┊    &lt;ion-buttons end&gt;</b>
<b>+┊  ┊10┊      &lt;button ion-button icon-only class&#x3D;&quot;attach-button&quot;&gt;&lt;ion-icon name&#x3D;&quot;attach&quot;&gt;&lt;/ion-icon&gt;&lt;/button&gt;</b>
<b>+┊  ┊11┊      &lt;button ion-button icon-only class&#x3D;&quot;options-button&quot;&gt;&lt;ion-icon name&#x3D;&quot;more&quot;&gt;&lt;/ion-icon&gt;&lt;/button&gt;</b>
<b>+┊  ┊12┊    &lt;/ion-buttons&gt;</b>
<b>+┊  ┊13┊  &lt;/ion-navbar&gt;</b>
<b>+┊  ┊14┊&lt;/ion-header&gt;</b>
<b>+┊  ┊15┊</b>
<b>+┊  ┊16┊&lt;ion-content padding class&#x3D;&quot;messages-page-content&quot;&gt;</b>
<b>+┊  ┊17┊  &lt;ion-scroll scrollY&#x3D;&quot;true&quot; class&#x3D;&quot;messages&quot;&gt;</b>
<b>+┊  ┊18┊    &lt;div *ngFor&#x3D;&quot;let message of messages | async&quot; class&#x3D;&quot;day-wrapper&quot;&gt;</b>
<b>+┊  ┊19┊        &lt;div [class]&#x3D;&quot;&#x27;message message-&#x27; + message.ownership&quot;&gt;</b>
<b>+┊  ┊20┊          &lt;div *ngIf&#x3D;&quot;message.type &#x3D;&#x3D; &#x27;text&#x27;&quot; class&#x3D;&quot;message-content message-content-text&quot;&gt;{{message.content}}&lt;/div&gt;</b>
<b>+┊  ┊21┊          &lt;span class&#x3D;&quot;message-timestamp&quot;&gt;{{ message.createdAt }}&lt;/span&gt;</b>
<b>+┊  ┊22┊      &lt;/div&gt;</b>
<b>+┊  ┊23┊    &lt;/div&gt;</b>
<b>+┊  ┊24┊  &lt;/ion-scroll&gt;</b>
<b>+┊  ┊25┊&lt;/ion-content&gt;</b>
</pre>

[}]: #

The template consists of a picture and a title inside the navigation bar. It also has two buttons. The purpose of the first button from the left would be sending attachments, and the second one should show an options pop-over, just like in the chats page. As for the content, we simply used a list of messages to show all available messages in the selected chat. To complete the view, let's write its belonging stylesheet:

[{]: <helper> (diffStep 6.9)

#### [Step 6.9: Style the message component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/52415c2)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊15┊15┊
 ┊16┊16┊&lt;ion-content padding class&#x3D;&quot;messages-page-content&quot;&gt;
 ┊17┊17┊  &lt;ion-scroll scrollY&#x3D;&quot;true&quot; class&#x3D;&quot;messages&quot;&gt;
<b>+┊  ┊18┊    &lt;div *ngFor&#x3D;&quot;let message of messages | async&quot; class&#x3D;&quot;message-wrapper&quot;&gt;</b>
 ┊19┊19┊        &lt;div [class]&#x3D;&quot;&#x27;message message-&#x27; + message.ownership&quot;&gt;
 ┊20┊20┊          &lt;div *ngIf&#x3D;&quot;message.type &#x3D;&#x3D; &#x27;text&#x27;&quot; class&#x3D;&quot;message-content message-content-text&quot;&gt;{{message.content}}&lt;/div&gt;
 ┊21┊21┊          &lt;span class&#x3D;&quot;message-timestamp&quot;&gt;{{ message.createdAt }}&lt;/span&gt;
</pre>

##### Added src&#x2F;pages&#x2F;messages&#x2F;messages.scss
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊.messages-page-navbar {</b>
<b>+┊   ┊  2┊  .chat-picture {</b>
<b>+┊   ┊  3┊    width: 50px;</b>
<b>+┊   ┊  4┊    border-radius: 50%;</b>
<b>+┊   ┊  5┊    float: left;</b>
<b>+┊   ┊  6┊  }</b>
<b>+┊   ┊  7┊</b>
<b>+┊   ┊  8┊  .chat-title {</b>
<b>+┊   ┊  9┊    line-height: 50px;</b>
<b>+┊   ┊ 10┊    float: left;</b>
<b>+┊   ┊ 11┊  }</b>
<b>+┊   ┊ 12┊}</b>
<b>+┊   ┊ 13┊</b>
<b>+┊   ┊ 14┊.messages-page-content {</b>
<b>+┊   ┊ 15┊  &gt; .scroll-content {</b>
<b>+┊   ┊ 16┊    margin: 42px -16px 42px !important;</b>
<b>+┊   ┊ 17┊  }</b>
<b>+┊   ┊ 18┊</b>
<b>+┊   ┊ 19┊  .day-wrapper .day-timestamp {</b>
<b>+┊   ┊ 20┊    margin-left: calc(50% - 64px);</b>
<b>+┊   ┊ 21┊    margin-right: calc(50% - 64px);</b>
<b>+┊   ┊ 22┊    margin-bottom: 9px;</b>
<b>+┊   ┊ 23┊    text-align: center;</b>
<b>+┊   ┊ 24┊    line-height: 27px;</b>
<b>+┊   ┊ 25┊    height: 27px;</b>
<b>+┊   ┊ 26┊    border-radius: 3px;</b>
<b>+┊   ┊ 27┊    color: gray;</b>
<b>+┊   ┊ 28┊    box-shadow: 0 1px 2px rgba(0, 0, 0, .15);</b>
<b>+┊   ┊ 29┊    background: #d9effa;</b>
<b>+┊   ┊ 30┊  }</b>
<b>+┊   ┊ 31┊</b>
<b>+┊   ┊ 32┊  .messages {</b>
<b>+┊   ┊ 33┊    height: 100%;</b>
<b>+┊   ┊ 34┊    background-image: url(../assets/chat-background.jpg);</b>
<b>+┊   ┊ 35┊    background-color: #E0DAD6;</b>
<b>+┊   ┊ 36┊    background-repeat: no-repeat;</b>
<b>+┊   ┊ 37┊    background-size: cover;</b>
<b>+┊   ┊ 38┊  }</b>
<b>+┊   ┊ 39┊</b>
<b>+┊   ┊ 40┊  .message-wrapper {</b>
<b>+┊   ┊ 41┊    margin-bottom: 9px;</b>
<b>+┊   ┊ 42┊</b>
<b>+┊   ┊ 43┊    &amp;::after {</b>
<b>+┊   ┊ 44┊      content: &quot;&quot;;</b>
<b>+┊   ┊ 45┊      display: table;</b>
<b>+┊   ┊ 46┊      clear: both;</b>
<b>+┊   ┊ 47┊    }</b>
<b>+┊   ┊ 48┊  }</b>
<b>+┊   ┊ 49┊</b>
<b>+┊   ┊ 50┊  .message {</b>
<b>+┊   ┊ 51┊    display: inline-block;</b>
<b>+┊   ┊ 52┊    position: relative;</b>
<b>+┊   ┊ 53┊    max-width: 65vh;</b>
<b>+┊   ┊ 54┊    border-radius: 7px;</b>
<b>+┊   ┊ 55┊    box-shadow: 0 1px 2px rgba(0, 0, 0, .15);</b>
<b>+┊   ┊ 56┊</b>
<b>+┊   ┊ 57┊    &amp;.message-mine {</b>
<b>+┊   ┊ 58┊      float: right;</b>
<b>+┊   ┊ 59┊      background-color: #DCF8C6;</b>
<b>+┊   ┊ 60┊</b>
<b>+┊   ┊ 61┊      &amp;::before {</b>
<b>+┊   ┊ 62┊        right: -11px;</b>
<b>+┊   ┊ 63┊        background-image: url(../assets/message-mine.png)</b>
<b>+┊   ┊ 64┊      }</b>
<b>+┊   ┊ 65┊    }</b>
<b>+┊   ┊ 66┊</b>
<b>+┊   ┊ 67┊    &amp;.message-other {</b>
<b>+┊   ┊ 68┊      float: left;</b>
<b>+┊   ┊ 69┊      background-color: #FFF;</b>
<b>+┊   ┊ 70┊</b>
<b>+┊   ┊ 71┊      &amp;::before {</b>
<b>+┊   ┊ 72┊        left: -11px;</b>
<b>+┊   ┊ 73┊        background-image: url(../assets/message-other.png)</b>
<b>+┊   ┊ 74┊      }</b>
<b>+┊   ┊ 75┊    }</b>
<b>+┊   ┊ 76┊</b>
<b>+┊   ┊ 77┊    &amp;.message-other::before, &amp;.message-mine::before {</b>
<b>+┊   ┊ 78┊      content: &quot;&quot;;</b>
<b>+┊   ┊ 79┊      position: absolute;</b>
<b>+┊   ┊ 80┊      bottom: 3px;</b>
<b>+┊   ┊ 81┊      width: 12px;</b>
<b>+┊   ┊ 82┊      height: 19px;</b>
<b>+┊   ┊ 83┊      background-position: 50% 50%;</b>
<b>+┊   ┊ 84┊      background-repeat: no-repeat;</b>
<b>+┊   ┊ 85┊      background-size: contain;</b>
<b>+┊   ┊ 86┊    }</b>
<b>+┊   ┊ 87┊</b>
<b>+┊   ┊ 88┊    .message-content {</b>
<b>+┊   ┊ 89┊      padding: 5px 7px;</b>
<b>+┊   ┊ 90┊      word-wrap: break-word;</b>
<b>+┊   ┊ 91┊</b>
<b>+┊   ┊ 92┊      &amp;::after {</b>
<b>+┊   ┊ 93┊        content: &quot; \00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0&quot;;</b>
<b>+┊   ┊ 94┊        display: inline;</b>
<b>+┊   ┊ 95┊      }</b>
<b>+┊   ┊ 96┊    }</b>
<b>+┊   ┊ 97┊</b>
<b>+┊   ┊ 98┊    .message-timestamp {</b>
<b>+┊   ┊ 99┊      position: absolute;</b>
<b>+┊   ┊100┊      bottom: 2px;</b>
<b>+┊   ┊101┊      right: 7px;</b>
<b>+┊   ┊102┊      font-size: 12px;</b>
<b>+┊   ┊103┊      color: gray;</b>
<b>+┊   ┊104┊    }</b>
<b>+┊   ┊105┊  }</b>
<b>+┊   ┊106┊}</b>
</pre>

[}]: #

This style requires us to add some assets. So inside the `src/assets` dir, download the following:

    src/assets$ wget https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/raw/cc8a09a04e26b50395b703092fb15cb07aec36ce/src/assets/chat-background.jpg
    src/assets$ wget https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/raw/cc8a09a04e26b50395b703092fb15cb07aec36ce/src/assets/message-mine.png
    src/assets$ wget https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/raw/cc8a09a04e26b50395b703092fb15cb07aec36ce/src/assets/message-other.png

Now we need to take care of the message's timestamp and format it, then again we gonna use `angular2-moment` only this time we gonna use a different format using the `amDateFormat` pipe:

[{]: <helper> (diffStep 6.11)

#### [Step 6.11: Use amDateFormat](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/c708598)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊18┊18┊    &lt;div *ngFor&#x3D;&quot;let message of messages | async&quot; class&#x3D;&quot;message-wrapper&quot;&gt;
 ┊19┊19┊        &lt;div [class]&#x3D;&quot;&#x27;message message-&#x27; + message.ownership&quot;&gt;
 ┊20┊20┊          &lt;div *ngIf&#x3D;&quot;message.type &#x3D;&#x3D; &#x27;text&#x27;&quot; class&#x3D;&quot;message-content message-content-text&quot;&gt;{{message.content}}&lt;/div&gt;
<b>+┊  ┊21┊          &lt;span class&#x3D;&quot;message-timestamp&quot;&gt;{{ message.createdAt | amDateFormat: &#x27;HH:mm&#x27; }}&lt;/span&gt;</b>
 ┊22┊22┊      &lt;/div&gt;
 ┊23┊23┊    &lt;/div&gt;
 ┊24┊24┊  &lt;/ion-scroll&gt;
</pre>

[}]: #

Our messages are set, but there is one really important feature missing: sending messages. Let's implement our message editor. We will start with the view itself. We will add an input for editing our messages, a `send` button, and a `record` button whose logic won't be implemented in this tutorial since we only wanna focus on the text messaging system. To fulfill this layout we gonna use a tool-bar (`ion-toolbar`) inside a footer (`ion-footer`) and place it underneath the content of the view:

[{]: <helper> (diffStep 6.12)

#### [Step 6.12: Add message editor to messages view template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/a8d19c1)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊23┊23┊    &lt;/div&gt;
 ┊24┊24┊  &lt;/ion-scroll&gt;
 ┊25┊25┊&lt;/ion-content&gt;
<b>+┊  ┊26┊</b>
<b>+┊  ┊27┊&lt;ion-footer&gt;</b>
<b>+┊  ┊28┊  &lt;ion-toolbar color&#x3D;&quot;whatsapp&quot; class&#x3D;&quot;messages-page-footer&quot; position&#x3D;&quot;bottom&quot;&gt;</b>
<b>+┊  ┊29┊    &lt;ion-input [(ngModel)]&#x3D;&quot;message&quot; (keypress)&#x3D;&quot;onInputKeypress($event)&quot; class&#x3D;&quot;message-editor&quot; placeholder&#x3D;&quot;Type a message&quot;&gt;&lt;/ion-input&gt;</b>
<b>+┊  ┊30┊</b>
<b>+┊  ┊31┊    &lt;ion-buttons end&gt;</b>
<b>+┊  ┊32┊      &lt;button ion-button icon-only *ngIf&#x3D;&quot;message&quot; class&#x3D;&quot;message-editor-button&quot; (click)&#x3D;&quot;sendTextMessage()&quot;&gt;</b>
<b>+┊  ┊33┊        &lt;ion-icon name&#x3D;&quot;send&quot;&gt;&lt;/ion-icon&gt;</b>
<b>+┊  ┊34┊      &lt;/button&gt;</b>
<b>+┊  ┊35┊</b>
<b>+┊  ┊36┊      &lt;button ion-button icon-only *ngIf&#x3D;&quot;!message&quot; class&#x3D;&quot;message-editor-button&quot;&gt;</b>
<b>+┊  ┊37┊        &lt;ion-icon name&#x3D;&quot;mic&quot;&gt;&lt;/ion-icon&gt;</b>
<b>+┊  ┊38┊      &lt;/button&gt;</b>
<b>+┊  ┊39┊    &lt;/ion-buttons&gt;</b>
<b>+┊  ┊40┊  &lt;/ion-toolbar&gt;</b>
<b>+┊  ┊41┊&lt;/ion-footer&gt;</b>
</pre>

[}]: #

Our stylesheet requires few adjustments as well:

[{]: <helper> (diffStep 6.13)

#### [Step 6.13: Add styles for message page footer](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/3feb112)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.scss
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊104┊104┊    }
 ┊105┊105┊  }
 ┊106┊106┊}
<b>+┊   ┊107┊</b>
<b>+┊   ┊108┊.messages-page-footer {</b>
<b>+┊   ┊109┊  padding-right: 0;</b>
<b>+┊   ┊110┊</b>
<b>+┊   ┊111┊  .message-editor {</b>
<b>+┊   ┊112┊    margin-left: 2px;</b>
<b>+┊   ┊113┊    padding-left: 5px;</b>
<b>+┊   ┊114┊    background: white;</b>
<b>+┊   ┊115┊    border-radius: 3px;</b>
<b>+┊   ┊116┊  }</b>
<b>+┊   ┊117┊</b>
<b>+┊   ┊118┊  .message-editor-button {</b>
<b>+┊   ┊119┊    box-shadow: none;</b>
<b>+┊   ┊120┊    width: 50px;</b>
<b>+┊   ┊121┊    height: 50px;</b>
<b>+┊   ┊122┊    font-size: 17px;</b>
<b>+┊   ┊123┊    margin: auto;</b>
<b>+┊   ┊124┊  }</b>
<b>+┊   ┊125┊}</b>
</pre>

[}]: #

Now we can implement the handler for messages sending in the component:

[{]: <helper> (diffStep 6.14)

#### [Step 6.14: Implement sendTextMessage method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/073db59)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Component, OnInit } from &#x27;@angular/core&#x27;;
 ┊2┊2┊import { NavParams } from &#x27;ionic-angular&#x27;;
<b>+┊ ┊3┊import { Chat, Message, MessageType } from &#x27;api/models&#x27;;</b>
 ┊4┊4┊import { Observable } from &#x27;rxjs&#x27;;
 ┊5┊5┊import { Messages } from &#x27;api/collections&#x27;;
<b>+┊ ┊6┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;</b>
 ┊6┊7┊
 ┊7┊8┊@Component({
 ┊8┊9┊  selector: &#x27;messages-page&#x27;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊13┊14┊  title: string;
 ┊14┊15┊  picture: string;
 ┊15┊16┊  messages: Observable&lt;Message[]&gt;;
<b>+┊  ┊17┊  message: string &#x3D; &#x27;&#x27;;</b>
 ┊16┊18┊
 ┊17┊19┊  constructor(navParams: NavParams) {
 ┊18┊20┊    this.selectedChat &#x3D; &lt;Chat&gt;navParams.get(&#x27;chat&#x27;);
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊35┊37┊      return messages;
 ┊36┊38┊    });
 ┊37┊39┊  }
<b>+┊  ┊40┊</b>
<b>+┊  ┊41┊  onInputKeypress({ keyCode }: KeyboardEvent): void {</b>
<b>+┊  ┊42┊    if (keyCode.charCode &#x3D;&#x3D;&#x3D; 13) {</b>
<b>+┊  ┊43┊      this.sendTextMessage();</b>
<b>+┊  ┊44┊    }</b>
<b>+┊  ┊45┊  }</b>
<b>+┊  ┊46┊</b>
<b>+┊  ┊47┊  sendTextMessage(): void {</b>
<b>+┊  ┊48┊    // If message was yet to be typed, abort</b>
<b>+┊  ┊49┊    if (!this.message) {</b>
<b>+┊  ┊50┊      return;</b>
<b>+┊  ┊51┊    }</b>
<b>+┊  ┊52┊</b>
<b>+┊  ┊53┊    MeteorObservable.call(&#x27;addMessage&#x27;, MessageType.TEXT,</b>
<b>+┊  ┊54┊      this.selectedChat._id,</b>
<b>+┊  ┊55┊      this.message</b>
<b>+┊  ┊56┊    ).zone().subscribe(() &#x3D;&gt; {</b>
<b>+┊  ┊57┊      // Zero the input field</b>
<b>+┊  ┊58┊      this.message &#x3D; &#x27;&#x27;;</b>
<b>+┊  ┊59┊    });</b>
<b>+┊  ┊60┊  }</b>
 ┊38┊61┊}
</pre>

[}]: #

As you can see, we've used a `Meteor` method called `addMessage`, which is yet to exist. This method will add messages to our messages collection and run on both client's local cache and server. Now we're going to create a `api/server/methods.ts` file in our server and implement the method's logic:

[{]: <helper> (diffStep 6.15)

#### [Step 6.15: Implement Meteor method for adding a new message](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/9ee0a4a)

##### Added api&#x2F;server&#x2F;methods.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { Chats } from &#x27;./collections/chats&#x27;;</b>
<b>+┊  ┊ 2┊import { Messages } from &#x27;./collections/messages&#x27;;</b>
<b>+┊  ┊ 3┊import { MessageType } from &#x27;./models&#x27;;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊Meteor.methods({</b>
<b>+┊  ┊ 6┊  addMessage(type: MessageType, chatId: string, content: string) {</b>
<b>+┊  ┊ 7┊    const chatExists &#x3D; !!Chats.collection.find(chatId).count();</b>
<b>+┊  ┊ 8┊</b>
<b>+┊  ┊ 9┊    if (!chatExists) {</b>
<b>+┊  ┊10┊      throw new Meteor.Error(&#x27;chat-not-exists&#x27;,</b>
<b>+┊  ┊11┊        &#x27;Chat doesn\&#x27;t exist&#x27;);</b>
<b>+┊  ┊12┊    }</b>
<b>+┊  ┊13┊</b>
<b>+┊  ┊14┊    return {</b>
<b>+┊  ┊15┊      messageId: Messages.collection.insert({</b>
<b>+┊  ┊16┊        chatId: chatId,</b>
<b>+┊  ┊17┊        content: content,</b>
<b>+┊  ┊18┊        createdAt: new Date(),</b>
<b>+┊  ┊19┊        type: type</b>
<b>+┊  ┊20┊      })</b>
<b>+┊  ┊21┊    };</b>
<b>+┊  ┊22┊  }</b>
<b>+┊  ┊23┊});</b>
</pre>

[}]: #

We would also like to validate some data sent to methods we define. For this we're gonna use a utility package provided to us by `Meteor` and it's called `check`.

It requires us to add the following package in the server:

    api$ meteor add check

And we're gonna use it in the `addMessage` method we've just defined:

[{]: <helper> (diffStep 6.17)

#### [Step 6.17: Use check to add validations](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/713353e)

##### Changed api&#x2F;server&#x2F;methods.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊import { Chats } from &#x27;./collections/chats&#x27;;
 ┊ 2┊ 2┊import { Messages } from &#x27;./collections/messages&#x27;;
 ┊ 3┊ 3┊import { MessageType } from &#x27;./models&#x27;;
<b>+┊  ┊ 4┊import { check, Match } from &#x27;meteor/check&#x27;;</b>
<b>+┊  ┊ 5┊</b>
<b>+┊  ┊ 6┊const nonEmptyString &#x3D; Match.Where((str) &#x3D;&gt; {</b>
<b>+┊  ┊ 7┊  check(str, String);</b>
<b>+┊  ┊ 8┊  return str.length &gt; 0;</b>
<b>+┊  ┊ 9┊});</b>
 ┊ 4┊10┊
 ┊ 5┊11┊Meteor.methods({
 ┊ 6┊12┊  addMessage(type: MessageType, chatId: string, content: string) {
<b>+┊  ┊13┊    check(type, Match.OneOf(String, [ MessageType.TEXT ]));</b>
<b>+┊  ┊14┊    check(chatId, nonEmptyString);</b>
<b>+┊  ┊15┊    check(content, nonEmptyString);</b>
<b>+┊  ┊16┊</b>
 ┊ 7┊17┊    const chatExists &#x3D; !!Chats.collection.find(chatId).count();
 ┊ 8┊18┊
 ┊ 9┊19┊    if (!chatExists) {
</pre>

[}]: #

## Auto Scroll

In addition, we would like the view to auto-scroll down whenever a new message is added. We can achieve that using a native class called [MutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver), which can detect changes in the view:

[{]: <helper> (diffStep 6.18)

#### [Step 6.18: Implement auto scroll](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/0376bc1)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊import { Component, OnInit, OnDestroy, ElementRef } from &#x27;@angular/core&#x27;;</b>
 ┊2┊2┊import { NavParams } from &#x27;ionic-angular&#x27;;
 ┊3┊3┊import { Chat, Message, MessageType } from &#x27;api/models&#x27;;
 ┊4┊4┊import { Observable } from &#x27;rxjs&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 9┊ 9┊  selector: &#x27;messages-page&#x27;,
 ┊10┊10┊  templateUrl: &#x27;messages.html&#x27;
 ┊11┊11┊})
<b>+┊  ┊12┊export class MessagesPage implements OnInit, OnDestroy {</b>
 ┊13┊13┊  selectedChat: Chat;
 ┊14┊14┊  title: string;
 ┊15┊15┊  picture: string;
 ┊16┊16┊  messages: Observable&lt;Message[]&gt;;
 ┊17┊17┊  message: string &#x3D; &#x27;&#x27;;
<b>+┊  ┊18┊  autoScroller: MutationObserver;</b>
<b>+┊  ┊19┊  scrollOffset &#x3D; 0;</b>
 ┊18┊20┊
<b>+┊  ┊21┊  constructor(</b>
<b>+┊  ┊22┊    navParams: NavParams,</b>
<b>+┊  ┊23┊    private el: ElementRef</b>
<b>+┊  ┊24┊  ) {</b>
 ┊20┊25┊    this.selectedChat &#x3D; &lt;Chat&gt;navParams.get(&#x27;chat&#x27;);
 ┊21┊26┊    this.title &#x3D; this.selectedChat.title;
 ┊22┊27┊    this.picture &#x3D; this.selectedChat.picture;
 ┊23┊28┊  }
 ┊24┊29┊
<b>+┊  ┊30┊  private get messagesPageContent(): Element {</b>
<b>+┊  ┊31┊    return this.el.nativeElement.querySelector(&#x27;.messages-page-content&#x27;);</b>
<b>+┊  ┊32┊  }</b>
<b>+┊  ┊33┊</b>
<b>+┊  ┊34┊  private get messagesList(): Element {</b>
<b>+┊  ┊35┊    return this.messagesPageContent.querySelector(&#x27;.messages&#x27;);</b>
<b>+┊  ┊36┊  }</b>
<b>+┊  ┊37┊</b>
<b>+┊  ┊38┊  private get scroller(): Element {</b>
<b>+┊  ┊39┊    return this.messagesList.querySelector(&#x27;.scroll-content&#x27;);</b>
<b>+┊  ┊40┊  }</b>
<b>+┊  ┊41┊</b>
 ┊25┊42┊  ngOnInit() {
<b>+┊  ┊43┊    this.autoScroller &#x3D; this.autoScroll();</b>
<b>+┊  ┊44┊</b>
 ┊26┊45┊    let isEven &#x3D; false;
 ┊27┊46┊
 ┊28┊47┊    this.messages &#x3D; Messages.find(
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊38┊57┊    });
 ┊39┊58┊  }
 ┊40┊59┊
<b>+┊  ┊60┊  ngOnDestroy() {</b>
<b>+┊  ┊61┊    this.autoScroller.disconnect();</b>
<b>+┊  ┊62┊  }</b>
<b>+┊  ┊63┊</b>
<b>+┊  ┊64┊  autoScroll(): MutationObserver {</b>
<b>+┊  ┊65┊    const autoScroller &#x3D; new MutationObserver(this.scrollDown.bind(this));</b>
<b>+┊  ┊66┊</b>
<b>+┊  ┊67┊    autoScroller.observe(this.messagesList, {</b>
<b>+┊  ┊68┊      childList: true,</b>
<b>+┊  ┊69┊      subtree: true</b>
<b>+┊  ┊70┊    });</b>
<b>+┊  ┊71┊</b>
<b>+┊  ┊72┊    return autoScroller;</b>
<b>+┊  ┊73┊  }</b>
<b>+┊  ┊74┊</b>
<b>+┊  ┊75┊  scrollDown(): void {</b>
<b>+┊  ┊76┊    // Scroll down and apply specified offset</b>
<b>+┊  ┊77┊    this.scroller.scrollTop &#x3D; this.scroller.scrollHeight - this.scrollOffset;</b>
<b>+┊  ┊78┊    // Zero offset for next invocation</b>
<b>+┊  ┊79┊    this.scrollOffset &#x3D; 0;</b>
<b>+┊  ┊80┊  }</b>
<b>+┊  ┊81┊</b>
 ┊41┊82┊  onInputKeypress({ keyCode }: KeyboardEvent): void {
<b>+┊  ┊83┊    if (keyCode &#x3D;&#x3D;&#x3D; 13) {</b>
 ┊43┊84┊      this.sendTextMessage();
 ┊44┊85┊    }
 ┊45┊86┊  }
</pre>

[}]: #

So why didn't we update the scrolling position on a `Meteor` computation? - Because we want to initiate the scrolling function once the **view** is ready, not the **data**. They might look similar, but the difference is crucial.

## Group Messages

Our next goal would be grouping our messages on the view according to the day they were sent, with an exception of the current date. So let's say we're in January 2nd 2017; Messages from yesterday will appear above the label `January 1 2017`.

We can group our messages right after being fetched by the `Observable` using the `map` function:

[{]: <helper> (diffStep 6.19)

#### [Step 6.19: Add group by date to the UI](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/0c46e72)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊import { Component, OnInit, OnDestroy, ElementRef } from &#x27;@angular/core&#x27;;
 ┊ 2┊ 2┊import { NavParams } from &#x27;ionic-angular&#x27;;
 ┊ 3┊ 3┊import { Chat, Message, MessageType } from &#x27;api/models&#x27;;
 ┊ 5┊ 4┊import { Messages } from &#x27;api/collections&#x27;;
 ┊ 6┊ 5┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;
<b>+┊  ┊ 6┊import * as moment from &#x27;moment&#x27;;</b>
<b>+┊  ┊ 7┊import { _ } from &#x27;meteor/underscore&#x27;;</b>
 ┊ 7┊ 8┊
 ┊ 8┊ 9┊@Component({
 ┊ 9┊10┊  selector: &#x27;messages-page&#x27;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊13┊14┊  selectedChat: Chat;
 ┊14┊15┊  title: string;
 ┊15┊16┊  picture: string;
<b>+┊  ┊17┊  messagesDayGroups;</b>
 ┊17┊18┊  message: string &#x3D; &#x27;&#x27;;
 ┊18┊19┊  autoScroller: MutationObserver;
 ┊19┊20┊  scrollOffset &#x3D; 0;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊41┊42┊
 ┊42┊43┊  ngOnInit() {
 ┊43┊44┊    this.autoScroller &#x3D; this.autoScroll();
<b>+┊  ┊45┊    this.subscribeMessages();</b>
 ┊58┊46┊  }
 ┊59┊47┊
 ┊60┊48┊  ngOnDestroy() {
 ┊61┊49┊    this.autoScroller.disconnect();
 ┊62┊50┊  }
 ┊63┊51┊
<b>+┊  ┊52┊  subscribeMessages() {</b>
<b>+┊  ┊53┊    this.scrollOffset &#x3D; this.scroller.scrollHeight;</b>
<b>+┊  ┊54┊    this.messagesDayGroups &#x3D; this.findMessagesDayGroups();</b>
<b>+┊  ┊55┊  }</b>
<b>+┊  ┊56┊</b>
<b>+┊  ┊57┊  findMessagesDayGroups() {</b>
<b>+┊  ┊58┊    let isEven &#x3D; false;</b>
<b>+┊  ┊59┊</b>
<b>+┊  ┊60┊    return Messages.find({</b>
<b>+┊  ┊61┊      chatId: this.selectedChat._id</b>
<b>+┊  ┊62┊    }, {</b>
<b>+┊  ┊63┊      sort: { createdAt: 1 }</b>
<b>+┊  ┊64┊    })</b>
<b>+┊  ┊65┊      .map((messages: Message[]) &#x3D;&gt; {</b>
<b>+┊  ┊66┊        const format &#x3D; &#x27;D MMMM Y&#x27;;</b>
<b>+┊  ┊67┊</b>
<b>+┊  ┊68┊        // Compose missing data that we would like to show in the view</b>
<b>+┊  ┊69┊        messages.forEach((message) &#x3D;&gt; {</b>
<b>+┊  ┊70┊          message.ownership &#x3D; isEven ? &#x27;mine&#x27; : &#x27;other&#x27;;</b>
<b>+┊  ┊71┊          isEven &#x3D; !isEven;</b>
<b>+┊  ┊72┊</b>
<b>+┊  ┊73┊          return message;</b>
<b>+┊  ┊74┊        });</b>
<b>+┊  ┊75┊</b>
<b>+┊  ┊76┊        // Group by creation day</b>
<b>+┊  ┊77┊        const groupedMessages &#x3D; _.groupBy(messages, (message) &#x3D;&gt; {</b>
<b>+┊  ┊78┊          return moment(message.createdAt).format(format);</b>
<b>+┊  ┊79┊        });</b>
<b>+┊  ┊80┊</b>
<b>+┊  ┊81┊        // Transform dictionary into an array since Angular&#x27;s view engine doesn&#x27;t know how</b>
<b>+┊  ┊82┊        // to iterate through it</b>
<b>+┊  ┊83┊        return Object.keys(groupedMessages).map((timestamp: string) &#x3D;&gt; {</b>
<b>+┊  ┊84┊          return {</b>
<b>+┊  ┊85┊            timestamp: timestamp,</b>
<b>+┊  ┊86┊            messages: groupedMessages[timestamp],</b>
<b>+┊  ┊87┊            today: moment().format(format) &#x3D;&#x3D;&#x3D; timestamp</b>
<b>+┊  ┊88┊          };</b>
<b>+┊  ┊89┊        });</b>
<b>+┊  ┊90┊      });</b>
<b>+┊  ┊91┊  }</b>
<b>+┊  ┊92┊</b>
 ┊64┊93┊  autoScroll(): MutationObserver {
 ┊65┊94┊    const autoScroller &#x3D; new MutationObserver(this.scrollDown.bind(this));
</pre>

[}]: #

And now we will add a nested iteration in the messages view; The outer loop would iterate through the messages day-groups, and the inner loop would iterate through the messages themselves:

[{]: <helper> (diffStep "6.20")

#### [Step 6.20: Update the template to use grouped messages](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/6c4d07c)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊15┊15┊
 ┊16┊16┊&lt;ion-content padding class&#x3D;&quot;messages-page-content&quot;&gt;
 ┊17┊17┊  &lt;ion-scroll scrollY&#x3D;&quot;true&quot; class&#x3D;&quot;messages&quot;&gt;
<b>+┊  ┊18┊    &lt;div *ngFor&#x3D;&quot;let day of messagesDayGroups | async&quot; class&#x3D;&quot;day-wrapper&quot;&gt;</b>
<b>+┊  ┊19┊      &lt;div *ngFor&#x3D;&quot;let message of day.messages&quot; class&#x3D;&quot;message-wrapper&quot;&gt;</b>
 ┊19┊20┊        &lt;div [class]&#x3D;&quot;&#x27;message message-&#x27; + message.ownership&quot;&gt;
 ┊20┊21┊          &lt;div *ngIf&#x3D;&quot;message.type &#x3D;&#x3D; &#x27;text&#x27;&quot; class&#x3D;&quot;message-content message-content-text&quot;&gt;{{message.content}}&lt;/div&gt;
 ┊21┊22┊          &lt;span class&#x3D;&quot;message-timestamp&quot;&gt;{{ message.createdAt | amDateFormat: &#x27;HH:mm&#x27; }}&lt;/span&gt;
<b>+┊  ┊23┊        &lt;/div&gt;</b>
 ┊22┊24┊      &lt;/div&gt;
<b>+┊  ┊25┊</b>
<b>+┊  ┊26┊      &lt;div *ngIf&#x3D;&quot;!day.today&quot; class&#x3D;&quot;day-timestamp&quot;&gt;{{day.timestamp}}&lt;/div&gt;</b>
 ┊23┊27┊    &lt;/div&gt;
 ┊24┊28┊  &lt;/ion-scroll&gt;
 ┊25┊29┊&lt;/ion-content&gt;
</pre>

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/authentication" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/folder-structure")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/folder-structure">PREVIOUS STEP</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/authentication">NEXT STEP</a> ⟹

[}]: #

