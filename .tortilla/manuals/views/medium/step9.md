# Step 9: Privacy &amp; Subscriptions

In this step we gonna take care of the app's security and encapsulation, since we don't want the users to do whatever they want, and we don't want them to be able to see content which is irrelevant for them.

We gonna start by removing a `Meteor` package named `insecure`. This package provides the client with the ability to run collection mutation methods. This is a behavior we are not interested in since removing data and creating data should be done in the server and only after certain validations. Meteor includes this package by default only for development purposes and it should be removed once our app is ready for production. As said, we will remove this package by typing the following command:

    api$ meteor remove insecure

## Secure Mutations

Since we enabled restrictions to run certain operations on data-collections directly from the client, we will need to define a method on the server which will handle each of these. By calling these methods, we will be able to manipulate the data the way we want, but not directly. The first method we're going to take care of would be the `removeChat` method, which will handle, obviously, chat removals by given ID:

[{]: <helper> (diffStep 9.2)

#### [Step 9.2: Add removeChat method on server side](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/6a8576d)

##### Changed api&#x2F;server&#x2F;methods.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊37┊37┊
 ┊38┊38┊    Chats.insert(chat);
 ┊39┊39┊  },
<b>+┊  ┊40┊  removeChat(chatId: string): void {</b>
<b>+┊  ┊41┊    if (!this.userId) {</b>
<b>+┊  ┊42┊      throw new Meteor.Error(&#x27;unauthorized&#x27;,</b>
<b>+┊  ┊43┊        &#x27;User must be logged-in to remove chat&#x27;);</b>
<b>+┊  ┊44┊    }</b>
<b>+┊  ┊45┊</b>
<b>+┊  ┊46┊    check(chatId, nonEmptyString);</b>
<b>+┊  ┊47┊</b>
<b>+┊  ┊48┊    const chatExists &#x3D; !!Chats.collection.find(chatId).count();</b>
<b>+┊  ┊49┊</b>
<b>+┊  ┊50┊    if (!chatExists) {</b>
<b>+┊  ┊51┊      throw new Meteor.Error(&#x27;chat-not-exists&#x27;,</b>
<b>+┊  ┊52┊        &#x27;Chat doesn\&#x27;t exist&#x27;);</b>
<b>+┊  ┊53┊    }</b>
<b>+┊  ┊54┊</b>
<b>+┊  ┊55┊    Chats.remove(chatId);</b>
<b>+┊  ┊56┊  },</b>
 ┊40┊57┊  updateProfile(profile: Profile): void {
 ┊41┊58┊    if (!this.userId) throw new Meteor.Error(&#x27;unauthorized&#x27;,
 ┊42┊59┊      &#x27;User must be logged-in to create a new chat&#x27;);
</pre>

[}]: #

We will carefully replace the removal method invocation in the `ChatsPage` with the method we've just defined:

[{]: <helper> (diffStep 9.3)

#### [Step 9.3: Use removeChat on client side](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/be1f946)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Component, OnInit } from &#x27;@angular/core&#x27;;
 ┊2┊2┊import { Chats, Messages, Users } from &#x27;api/collections&#x27;;
 ┊3┊3┊import { Chat, Message } from &#x27;api/models&#x27;;
<b>+┊ ┊4┊import { NavController, PopoverController, ModalController, AlertController } from &#x27;ionic-angular&#x27;;</b>
 ┊5┊5┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;
 ┊6┊6┊import { Observable, Subscriber } from &#x27;rxjs&#x27;;
 ┊7┊7┊import { MessagesPage } from &#x27;../messages/messages&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊18┊18┊  constructor(
 ┊19┊19┊    private navCtrl: NavController,
 ┊20┊20┊    private popoverCtrl: PopoverController,
<b>+┊  ┊21┊    private modalCtrl: ModalController,</b>
<b>+┊  ┊22┊    private alertCtrl: AlertController) {</b>
 ┊22┊23┊    this.senderId &#x3D; Meteor.userId();
 ┊23┊24┊  }
 ┊24┊25┊
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 90┊ 91┊  }
 ┊ 91┊ 92┊
 ┊ 92┊ 93┊  removeChat(chat: Chat): void {
<b>+┊   ┊ 94┊    MeteorObservable.call(&#x27;removeChat&#x27;, chat._id).subscribe({</b>
<b>+┊   ┊ 95┊      error: (e: Error) &#x3D;&gt; {</b>
<b>+┊   ┊ 96┊        if (e) {</b>
<b>+┊   ┊ 97┊          this.handleError(e);</b>
<b>+┊   ┊ 98┊        }</b>
<b>+┊   ┊ 99┊      }</b>
<b>+┊   ┊100┊    });</b>
<b>+┊   ┊101┊  }</b>
<b>+┊   ┊102┊</b>
<b>+┊   ┊103┊  handleError(e: Error): void {</b>
<b>+┊   ┊104┊    console.error(e);</b>
<b>+┊   ┊105┊</b>
<b>+┊   ┊106┊    const alert &#x3D; this.alertCtrl.create({</b>
<b>+┊   ┊107┊      buttons: [&#x27;OK&#x27;],</b>
<b>+┊   ┊108┊      message: e.message,</b>
<b>+┊   ┊109┊      title: &#x27;Oops!&#x27;</b>
 ┊ 94┊110┊    });
<b>+┊   ┊111┊</b>
<b>+┊   ┊112┊    alert.present();</b>
 ┊ 95┊113┊  }
 ┊ 96┊114┊
 ┊ 97┊115┊  showOptions(): void {
</pre>

[}]: #

In the `MessagesPage` we have options icon presented as three periods at the right side of the navigation bar. We will now implement this option menu which should pop-over once clicked. We will start by implementing its corresponding component called `MessagesOptionsComponent`, along with its view-template, style-sheet, and necessary importations:

[{]: <helper> (diffStep 9.4)

#### [Step 9.4: Add message options component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/d0dd97b)

##### Added src&#x2F;pages&#x2F;messages&#x2F;messages-options.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { Component } from &#x27;@angular/core&#x27;;</b>
<b>+┊  ┊ 2┊import { AlertController, NavController, NavParams, ViewController } from &#x27;ionic-angular&#x27;;</b>
<b>+┊  ┊ 3┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;</b>
<b>+┊  ┊ 4┊import { ChatsPage } from &#x27;../chats/chats&#x27;;</b>
<b>+┊  ┊ 5┊</b>
<b>+┊  ┊ 6┊@Component({</b>
<b>+┊  ┊ 7┊  selector: &#x27;messages-options&#x27;,</b>
<b>+┊  ┊ 8┊  templateUrl: &#x27;messages-options.html&#x27;</b>
<b>+┊  ┊ 9┊})</b>
<b>+┊  ┊10┊export class MessagesOptionsComponent {</b>
<b>+┊  ┊11┊  constructor(</b>
<b>+┊  ┊12┊    public alertCtrl: AlertController,</b>
<b>+┊  ┊13┊    public navCtrl: NavController,</b>
<b>+┊  ┊14┊    public params: NavParams,</b>
<b>+┊  ┊15┊    public viewCtrl: ViewController</b>
<b>+┊  ┊16┊  ) {}</b>
<b>+┊  ┊17┊</b>
<b>+┊  ┊18┊  remove(): void {</b>
<b>+┊  ┊19┊    const alert &#x3D; this.alertCtrl.create({</b>
<b>+┊  ┊20┊      title: &#x27;Remove&#x27;,</b>
<b>+┊  ┊21┊      message: &#x27;Are you sure you would like to proceed?&#x27;,</b>
<b>+┊  ┊22┊      buttons: [</b>
<b>+┊  ┊23┊        {</b>
<b>+┊  ┊24┊          text: &#x27;Cancel&#x27;,</b>
<b>+┊  ┊25┊          role: &#x27;cancel&#x27;</b>
<b>+┊  ┊26┊        },</b>
<b>+┊  ┊27┊        {</b>
<b>+┊  ┊28┊          text: &#x27;Yes&#x27;,</b>
<b>+┊  ┊29┊          handler: () &#x3D;&gt; {</b>
<b>+┊  ┊30┊            this.handleRemove(alert);</b>
<b>+┊  ┊31┊            return false;</b>
<b>+┊  ┊32┊          }</b>
<b>+┊  ┊33┊        }</b>
<b>+┊  ┊34┊      ]</b>
<b>+┊  ┊35┊    });</b>
<b>+┊  ┊36┊</b>
<b>+┊  ┊37┊    this.viewCtrl.dismiss().then(() &#x3D;&gt; {</b>
<b>+┊  ┊38┊      alert.present();</b>
<b>+┊  ┊39┊    });</b>
<b>+┊  ┊40┊  }</b>
<b>+┊  ┊41┊</b>
<b>+┊  ┊42┊  private handleRemove(alert): void {</b>
<b>+┊  ┊43┊    MeteorObservable.call(&#x27;removeChat&#x27;, this.params.get(&#x27;chat&#x27;)._id).subscribe({</b>
<b>+┊  ┊44┊      next: () &#x3D;&gt; {</b>
<b>+┊  ┊45┊        alert.dismiss().then(() &#x3D;&gt; {</b>
<b>+┊  ┊46┊          this.navCtrl.setRoot(ChatsPage, {}, {</b>
<b>+┊  ┊47┊            animate: true</b>
<b>+┊  ┊48┊          });</b>
<b>+┊  ┊49┊        });</b>
<b>+┊  ┊50┊      },</b>
<b>+┊  ┊51┊      error: (e: Error) &#x3D;&gt; {</b>
<b>+┊  ┊52┊        alert.dismiss().then(() &#x3D;&gt; {</b>
<b>+┊  ┊53┊          if (e) {</b>
<b>+┊  ┊54┊            return this.handleError(e);</b>
<b>+┊  ┊55┊          }</b>
<b>+┊  ┊56┊</b>
<b>+┊  ┊57┊          this.navCtrl.setRoot(ChatsPage, {}, {</b>
<b>+┊  ┊58┊            animate: true</b>
<b>+┊  ┊59┊          });</b>
<b>+┊  ┊60┊        });</b>
<b>+┊  ┊61┊      }</b>
<b>+┊  ┊62┊    });</b>
<b>+┊  ┊63┊  }</b>
<b>+┊  ┊64┊</b>
<b>+┊  ┊65┊  private handleError(e: Error): void {</b>
<b>+┊  ┊66┊    console.error(e);</b>
<b>+┊  ┊67┊</b>
<b>+┊  ┊68┊    const alert &#x3D; this.alertCtrl.create({</b>
<b>+┊  ┊69┊      title: &#x27;Oops!&#x27;,</b>
<b>+┊  ┊70┊      message: e.message,</b>
<b>+┊  ┊71┊      buttons: [&#x27;OK&#x27;]</b>
<b>+┊  ┊72┊    });</b>
<b>+┊  ┊73┊</b>
<b>+┊  ┊74┊    alert.present();</b>
<b>+┊  ┊75┊  }</b>
<b>+┊  ┊76┊}</b>
</pre>

[}]: #

[{]: <helper> (diffStep 9.5)

#### [Step 9.5: Add messages options template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/5e9106d)

##### Added src&#x2F;pages&#x2F;messages&#x2F;messages-options.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊&lt;ion-content class&#x3D;&quot;chats-options-page-content&quot;&gt;</b>
<b>+┊ ┊2┊  &lt;ion-list class&#x3D;&quot;options&quot;&gt;</b>
<b>+┊ ┊3┊    &lt;button ion-item class&#x3D;&quot;option option-remove&quot; (click)&#x3D;&quot;remove()&quot;&gt;</b>
<b>+┊ ┊4┊      &lt;ion-icon name&#x3D;&quot;trash&quot; class&#x3D;&quot;option-icon&quot;&gt;&lt;/ion-icon&gt;</b>
<b>+┊ ┊5┊      &lt;div class&#x3D;&quot;option-name&quot;&gt;Remove&lt;/div&gt;</b>
<b>+┊ ┊6┊    &lt;/button&gt;</b>
<b>+┊ ┊7┊  &lt;/ion-list&gt;</b>
<b>+┊ ┊8┊&lt;/ion-content&gt;</b>
</pre>

[}]: #

[{]: <helper> (diffStep 9.6)

#### [Step 9.6: Add message options styles](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/7e96724)

##### Added src&#x2F;pages&#x2F;messages&#x2F;messages-options.scss
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊.chats-options-page-content {</b>
<b>+┊  ┊ 2┊  .options {</b>
<b>+┊  ┊ 3┊    margin: 0;</b>
<b>+┊  ┊ 4┊  }</b>
<b>+┊  ┊ 5┊</b>
<b>+┊  ┊ 6┊  .option-name {</b>
<b>+┊  ┊ 7┊    float: left;</b>
<b>+┊  ┊ 8┊  }</b>
<b>+┊  ┊ 9┊</b>
<b>+┊  ┊10┊  .option-icon {</b>
<b>+┊  ┊11┊    float: right;</b>
<b>+┊  ┊12┊  }</b>
<b>+┊  ┊13┊}</b>
</pre>

[}]: #

[{]: <helper> (diffStep 9.7)

#### [Step 9.7: Import messages options component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/e613899)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 9┊ 9┊import { ChatsOptionsComponent } from &#x27;../pages/chats/chats-options&#x27;;
 ┊10┊10┊import { LoginPage } from &#x27;../pages/login/login&#x27;;
 ┊11┊11┊import { MessagesPage } from &#x27;../pages/messages/messages&#x27;;
<b>+┊  ┊12┊import { MessagesOptionsComponent } from &#x27;../pages/messages/messages-options&#x27;;</b>
 ┊12┊13┊import { ProfilePage } from &#x27;../pages/profile/profile&#x27;;
 ┊13┊14┊import { VerificationPage } from &#x27;../pages/verification/verification&#x27;;
 ┊14┊15┊import { PhoneService } from &#x27;../services/phone&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊23┊24┊    VerificationPage,
 ┊24┊25┊    ProfilePage,
 ┊25┊26┊    ChatsOptionsComponent,
<b>+┊  ┊27┊    NewChatComponent,</b>
<b>+┊  ┊28┊    MessagesOptionsComponent</b>
 ┊27┊29┊  ],
 ┊28┊30┊  imports: [
 ┊29┊31┊    BrowserModule,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊39┊41┊    VerificationPage,
 ┊40┊42┊    ProfilePage,
 ┊41┊43┊    ChatsOptionsComponent,
<b>+┊  ┊44┊    NewChatComponent,</b>
<b>+┊  ┊45┊    MessagesOptionsComponent</b>
 ┊43┊46┊  ],
 ┊44┊47┊  providers: [
 ┊45┊48┊    StatusBar,
</pre>

[}]: #

Now that the component is ready, we will implement the handler in the `MessagesPage` which will actually show it, using the `PopoverController`:

[{]: <helper> (diffStep 9.8)

#### [Step 9.8: Implemente showOptions method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/d41c237)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊import { Component, OnInit, OnDestroy, ElementRef } from &#x27;@angular/core&#x27;;
<b>+┊  ┊ 2┊import { NavParams, PopoverController } from &#x27;ionic-angular&#x27;;</b>
 ┊ 3┊ 3┊import { Chat, Message, MessageType } from &#x27;api/models&#x27;;
 ┊ 4┊ 4┊import { Messages } from &#x27;api/collections&#x27;;
 ┊ 5┊ 5┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;
 ┊ 6┊ 6┊import * as moment from &#x27;moment&#x27;;
 ┊ 7┊ 7┊import { _ } from &#x27;meteor/underscore&#x27;;
<b>+┊  ┊ 8┊import { MessagesOptionsComponent } from &#x27;./messages-options&#x27;;</b>
 ┊ 8┊ 9┊
 ┊ 9┊10┊@Component({
 ┊10┊11┊  selector: &#x27;messages-page&#x27;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊22┊23┊
 ┊23┊24┊  constructor(
 ┊24┊25┊    navParams: NavParams,
<b>+┊  ┊26┊    private el: ElementRef,</b>
<b>+┊  ┊27┊    private popoverCtrl: PopoverController</b>
 ┊26┊28┊  ) {
 ┊27┊29┊    this.selectedChat &#x3D; &lt;Chat&gt;navParams.get(&#x27;chat&#x27;);
 ┊28┊30┊    this.title &#x3D; this.selectedChat.title;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊56┊58┊    this.messagesDayGroups &#x3D; this.findMessagesDayGroups();
 ┊57┊59┊  }
 ┊58┊60┊
<b>+┊  ┊61┊  showOptions(): void {</b>
<b>+┊  ┊62┊    const popover &#x3D; this.popoverCtrl.create(MessagesOptionsComponent, {</b>
<b>+┊  ┊63┊      chat: this.selectedChat</b>
<b>+┊  ┊64┊    }, {</b>
<b>+┊  ┊65┊      cssClass: &#x27;options-popover messages-options-popover&#x27;</b>
<b>+┊  ┊66┊    });</b>
<b>+┊  ┊67┊</b>
<b>+┊  ┊68┊    popover.present();</b>
<b>+┊  ┊69┊  }</b>
<b>+┊  ┊70┊</b>
 ┊59┊71┊  findMessagesDayGroups() {
 ┊60┊72┊    return Messages.find({
 ┊61┊73┊      chatId: this.selectedChat._id
</pre>

[}]: #

And we will bind the handler for the view so any time we press on the `options` button the event will be trigger the handler:

[{]: <helper> (diffStep 9.9)

#### [Step 9.9: Bind showOptions to messages options button](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/419589b)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 8┊ 8┊
 ┊ 9┊ 9┊    &lt;ion-buttons end&gt;
 ┊10┊10┊      &lt;button ion-button icon-only class&#x3D;&quot;attach-button&quot;&gt;&lt;ion-icon name&#x3D;&quot;attach&quot;&gt;&lt;/ion-icon&gt;&lt;/button&gt;
<b>+┊  ┊11┊      &lt;button ion-button icon-only class&#x3D;&quot;options-button&quot; (click)&#x3D;&quot;showOptions()&quot;&gt;&lt;ion-icon name&#x3D;&quot;more&quot;&gt;&lt;/ion-icon&gt;&lt;/button&gt;</b>
 ┊12┊12┊    &lt;/ion-buttons&gt;
 ┊13┊13┊  &lt;/ion-navbar&gt;
 ┊14┊14┊&lt;/ion-header&gt;
</pre>

[}]: #

Right now all the chats are published to all the clients which is not very good for privacy, and it's inefficient since the entire data-base is being fetched automatically rather than fetching only the data which is necessary for the current view. This behavior occurs because of a `Meteor` package, which is installed by default for development purposes, called `autopublish`. To get rid of the auto-publishing behavior we will need to get rid of the `autopublish` package as well:

    api$ meteor remove autopublish

This requires us to explicitly define our publications. We will start with the `users` publication which will be used in the `NewChatComponent` to fetch all the users who we can potentially chat with:

[{]: <helper> (diffStep 9.11)

#### [Step 9.11: Add users publication](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/a2e7eb6)

##### Added api&#x2F;server&#x2F;publications.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { User } from &#x27;./models&#x27;;</b>
<b>+┊  ┊ 2┊import { Users } from &#x27;./collections/users&#x27;;</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊Meteor.publish(&#x27;users&#x27;, function(): Mongo.Cursor&lt;User&gt; {</b>
<b>+┊  ┊ 5┊  if (!this.userId) {</b>
<b>+┊  ┊ 6┊    return;</b>
<b>+┊  ┊ 7┊  }</b>
<b>+┊  ┊ 8┊</b>
<b>+┊  ┊ 9┊  return Users.collection.find({}, {</b>
<b>+┊  ┊10┊    fields: {</b>
<b>+┊  ┊11┊      profile: 1</b>
<b>+┊  ┊12┊    }</b>
<b>+┊  ┊13┊  });</b>
<b>+┊  ┊14┊});</b>
</pre>

[}]: #

The second publication we're going to implement would be the `messages` publication which will be used in the `MessagesPage`:

[{]: <helper> (diffStep 9.12)

#### [Step 9.12: Publish messages](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/9f79141)

##### Changed api&#x2F;server&#x2F;publications.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊import { User, Message } from &#x27;./models&#x27;;</b>
 ┊2┊2┊import { Users } from &#x27;./collections/users&#x27;;
<b>+┊ ┊3┊import { Messages } from &#x27;./collections/messages&#x27;;</b>
 ┊3┊4┊
 ┊4┊5┊Meteor.publish(&#x27;users&#x27;, function(): Mongo.Cursor&lt;User&gt; {
 ┊5┊6┊  if (!this.userId) {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊12┊13┊    }
 ┊13┊14┊  });
 ┊14┊15┊});
<b>+┊  ┊16┊</b>
<b>+┊  ┊17┊Meteor.publish(&#x27;messages&#x27;, function(chatId: string): Mongo.Cursor&lt;Message&gt; {</b>
<b>+┊  ┊18┊  if (!this.userId || !chatId) {</b>
<b>+┊  ┊19┊    return;</b>
<b>+┊  ┊20┊  }</b>
<b>+┊  ┊21┊</b>
<b>+┊  ┊22┊  return Messages.collection.find({</b>
<b>+┊  ┊23┊    chatId</b>
<b>+┊  ┊24┊  }, {</b>
<b>+┊  ┊25┊    sort: { createdAt: -1 }</b>
<b>+┊  ┊26┊  });</b>
<b>+┊  ┊27┊});</b>
</pre>

[}]: #

As you see, all our publications so far are only focused on fetching data from a single collection. We will now add the [publish-composite](https://atmospherejs.com/reywood/publish-composite) package which will help us implement joined collection publications:

    api$ meteor add reywood:publish-composite

We will install the package's declarations as well so the compiler can recognize the extensions made in `Meteor`'s API:

    $ npm install --save-dev @types/meteor-publish-composite

And we will import the declarations by adding the following field in the `tsconfig` file:

[{]: <helper> (diffStep 9.15)

#### [Step 9.15: Import @types/meteor-publish-composite](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/2258890)

##### Changed api&#x2F;tsconfig.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊17┊17┊    &quot;noImplicitAny&quot;: false,
 ┊18┊18┊    &quot;types&quot;: [
 ┊19┊19┊      &quot;meteor-typings&quot;,
<b>+┊  ┊20┊      &quot;@types/meteor-accounts-phone&quot;,</b>
<b>+┊  ┊21┊      &quot;@types/meteor-publish-composite&quot;</b>
 ┊21┊22┊    ]
 ┊22┊23┊  },
 ┊23┊24┊  &quot;exclude&quot;: [
</pre>

[}]: #

Now we will implement our first composite-publication, called `chats`. Why exactly does the `chats` publication has to count on multiple collections? That's because we're relying on multiple collections when presenting the data in the `ChatsPage`:

- **ChatsCollection** - Used to retrieve the actual information for each chat.
- **MessagesCollection** - Used to retrieve the last message for the corresponding chat.
- **UsersCollection** - Used to retrieve the receiver's information for the corresponding chat.

To implement this composite publication we will use the `Meteor.publishComposite` method:

[{]: <helper> (diffStep 9.16)

#### [Step 9.16: Implement chats publication](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/e354654)

##### Changed api&#x2F;server&#x2F;publications.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊import { User, Message, Chat } from &#x27;./models&#x27;;</b>
 ┊2┊2┊import { Users } from &#x27;./collections/users&#x27;;
 ┊3┊3┊import { Messages } from &#x27;./collections/messages&#x27;;
<b>+┊ ┊4┊import { Chats } from &#x27;./collections/chats&#x27;;</b>
 ┊4┊5┊
 ┊5┊6┊Meteor.publish(&#x27;users&#x27;, function(): Mongo.Cursor&lt;User&gt; {
 ┊6┊7┊  if (!this.userId) {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊25┊26┊    sort: { createdAt: -1 }
 ┊26┊27┊  });
 ┊27┊28┊});
<b>+┊  ┊29┊</b>
<b>+┊  ┊30┊Meteor.publishComposite(&#x27;chats&#x27;, function(): PublishCompositeConfig&lt;Chat&gt; {</b>
<b>+┊  ┊31┊  if (!this.userId) {</b>
<b>+┊  ┊32┊    return;</b>
<b>+┊  ┊33┊  }</b>
<b>+┊  ┊34┊</b>
<b>+┊  ┊35┊  return {</b>
<b>+┊  ┊36┊    find: () &#x3D;&gt; {</b>
<b>+┊  ┊37┊      return Chats.collection.find({ memberIds: this.userId });</b>
<b>+┊  ┊38┊    },</b>
<b>+┊  ┊39┊</b>
<b>+┊  ┊40┊    children: [</b>
<b>+┊  ┊41┊      &lt;PublishCompositeConfig1&lt;Chat, Message&gt;&gt; {</b>
<b>+┊  ┊42┊        find: (chat) &#x3D;&gt; {</b>
<b>+┊  ┊43┊          return Messages.collection.find({ chatId: chat._id }, {</b>
<b>+┊  ┊44┊            sort: { createdAt: -1 },</b>
<b>+┊  ┊45┊            limit: 1</b>
<b>+┊  ┊46┊          });</b>
<b>+┊  ┊47┊        }</b>
<b>+┊  ┊48┊      },</b>
<b>+┊  ┊49┊      &lt;PublishCompositeConfig1&lt;Chat, User&gt;&gt; {</b>
<b>+┊  ┊50┊        find: (chat) &#x3D;&gt; {</b>
<b>+┊  ┊51┊          return Users.collection.find({</b>
<b>+┊  ┊52┊            _id: { $in: chat.memberIds }</b>
<b>+┊  ┊53┊          }, {</b>
<b>+┊  ┊54┊            fields: { profile: 1 }</b>
<b>+┊  ┊55┊          });</b>
<b>+┊  ┊56┊        }</b>
<b>+┊  ┊57┊      }</b>
<b>+┊  ┊58┊    ]</b>
<b>+┊  ┊59┊  };</b>
<b>+┊  ┊60┊});</b>
</pre>

[}]: #

The `chats` publication is made out of several nodes, which are structured according to the list above.

We finished with all the necessary publications for now, all is left to do is using them. The usages of these publications are called `subscriptions`, so whenever we subscribe to a publication, we will fetch the data exported by it, and then we can run queries of this data in our client, as we desire.

The first subscription we're going to make would be the `users` subscription in the `NewChatComponent`, so whenever we open the dialog a subscription should be made:

[{]: <helper> (diffStep 9.17)

#### [Step 9.17: Subscribe to users](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/c5e33ef)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;new-chat.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊40┊40┊  }
 ┊41┊41┊
 ┊42┊42┊  loadUsers(): void {
<b>+┊  ┊43┊    // Fetch all users matching search pattern</b>
<b>+┊  ┊44┊    const subscription &#x3D; MeteorObservable.subscribe(&#x27;users&#x27;);</b>
<b>+┊  ┊45┊    const autorun &#x3D; MeteorObservable.autorun();</b>
<b>+┊  ┊46┊</b>
<b>+┊  ┊47┊    Observable.merge(subscription, autorun).subscribe(() &#x3D;&gt; {</b>
<b>+┊  ┊48┊      this.users &#x3D; this.findUsers();</b>
<b>+┊  ┊49┊    });</b>
 ┊44┊50┊  }
 ┊45┊51┊
 ┊46┊52┊  findUsers(): Observable&lt;User[]&gt; {
</pre>

[}]: #

The second subscription we're going to define would be the `chats` subscription in the `ChatsPage`, this way we will have the necessary data to work with when presenting the users we're chatting with:

[{]: <helper> (diffStep 9.18)

#### [Step 9.18: Subscribe to chats](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/1f50fec)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊29┊29┊  }
 ┊30┊30┊
 ┊31┊31┊  ngOnInit() {
<b>+┊  ┊32┊    MeteorObservable.subscribe(&#x27;chats&#x27;).subscribe(() &#x3D;&gt; {</b>
<b>+┊  ┊33┊      MeteorObservable.autorun().subscribe(() &#x3D;&gt; {</b>
<b>+┊  ┊34┊        this.chats &#x3D; this.findChats();</b>
<b>+┊  ┊35┊      });</b>
<b>+┊  ┊36┊    });</b>
 ┊33┊37┊  }
 ┊34┊38┊
 ┊35┊39┊  findChats(): Observable&lt;Chat[]&gt; {
</pre>

[}]: #

The `messages` publication is responsible for bringing all the relevant messages for a certain chat. Unlike the other two publications, this publication is actually parameterized and it requires us to pass a chat id during subscription. Let's subscribe to the `messages` publication in the `MessagesPage`, and pass the current active chat ID provided to us by the navigation parameters:

[{]: <helper> (diffStep 9.19)

#### [Step 9.19: Subscribe to messages](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/d8e5c80)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 6┊ 6┊import * as moment from &#x27;moment&#x27;;
 ┊ 7┊ 7┊import { _ } from &#x27;meteor/underscore&#x27;;
 ┊ 8┊ 8┊import { MessagesOptionsComponent } from &#x27;./messages-options&#x27;;
<b>+┊  ┊ 9┊import { Subscription } from &#x27;rxjs&#x27;;</b>
 ┊ 9┊10┊
 ┊10┊11┊@Component({
 ┊11┊12┊  selector: &#x27;messages-page&#x27;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊20┊21┊  autoScroller: MutationObserver;
 ┊21┊22┊  scrollOffset &#x3D; 0;
 ┊22┊23┊  senderId: string;
<b>+┊  ┊24┊  loadingMessages: boolean;</b>
<b>+┊  ┊25┊  messagesComputation: Subscription;</b>
 ┊23┊26┊
 ┊24┊27┊  constructor(
 ┊25┊28┊    navParams: NavParams,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊53┊56┊    this.autoScroller.disconnect();
 ┊54┊57┊  }
 ┊55┊58┊
<b>+┊  ┊59┊  // Subscribes to the relevant set of messages</b>
<b>+┊  ┊60┊  subscribeMessages(): void {</b>
<b>+┊  ┊61┊    // A flag which indicates if there&#x27;s a subscription in process</b>
<b>+┊  ┊62┊    this.loadingMessages &#x3D; true;</b>
<b>+┊  ┊63┊    // A custom offset to be used to re-adjust the scrolling position once</b>
<b>+┊  ┊64┊    // new dataset is fetched</b>
 ┊57┊65┊    this.scrollOffset &#x3D; this.scroller.scrollHeight;
<b>+┊  ┊66┊</b>
<b>+┊  ┊67┊    MeteorObservable.subscribe(&#x27;messages&#x27;,</b>
<b>+┊  ┊68┊      this.selectedChat._id</b>
<b>+┊  ┊69┊    ).subscribe(() &#x3D;&gt; {</b>
<b>+┊  ┊70┊      // Keep tracking changes in the dataset and re-render the view</b>
<b>+┊  ┊71┊      if (!this.messagesComputation) {</b>
<b>+┊  ┊72┊        this.messagesComputation &#x3D; this.autorunMessages();</b>
<b>+┊  ┊73┊      }</b>
<b>+┊  ┊74┊</b>
<b>+┊  ┊75┊      // Allow incoming subscription requests</b>
<b>+┊  ┊76┊      this.loadingMessages &#x3D; false;</b>
<b>+┊  ┊77┊    });</b>
<b>+┊  ┊78┊  }</b>
<b>+┊  ┊79┊</b>
<b>+┊  ┊80┊  // Detects changes in the messages dataset and re-renders the view</b>
<b>+┊  ┊81┊  autorunMessages(): Subscription {</b>
<b>+┊  ┊82┊    return MeteorObservable.autorun().subscribe(() &#x3D;&gt; {</b>
<b>+┊  ┊83┊      this.messagesDayGroups &#x3D; this.findMessagesDayGroups();</b>
<b>+┊  ┊84┊    });</b>
 ┊59┊85┊  }
 ┊60┊86┊
 ┊61┊87┊  showOptions(): void {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊113┊139┊  }
 ┊114┊140┊
 ┊115┊141┊  scrollDown(): void {
<b>+┊   ┊142┊    // Don&#x27;t scroll down if messages subscription is being loaded</b>
<b>+┊   ┊143┊    if (this.loadingMessages) {</b>
<b>+┊   ┊144┊      return;</b>
<b>+┊   ┊145┊    }</b>
<b>+┊   ┊146┊</b>
 ┊116┊147┊    // Scroll down and apply specified offset
 ┊117┊148┊    this.scroller.scrollTop &#x3D; this.scroller.scrollHeight - this.scrollOffset;
 ┊118┊149┊    // Zero offset for next invocation
</pre>

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/filter-and-pagination" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/chats-mutations")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/chats-mutations">PREVIOUS STEP</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/filter-and-pagination">NEXT STEP</a> ⟹

[}]: #

