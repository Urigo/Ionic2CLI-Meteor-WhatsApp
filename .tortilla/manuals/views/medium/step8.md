# Step 8: Chats Creation &amp; Removal

Our next step is about adding the ability to create new chats. We have the `ChatsPage` and the authentication system, but we need to hook them up some how. Let's define the initial `User` schema which will be used to retrieve its relevant information in our application:

[{]: <helper> (diffStep 8.1)

#### [Step 8.1: Added user model](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/13cab42)

##### Changed api&#x2F;server&#x2F;models.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊25┊25┊  type?: MessageType
 ┊26┊26┊  ownership?: string;
 ┊27┊27┊}
<b>+┊  ┊28┊</b>
<b>+┊  ┊29┊export interface User extends Meteor.User {</b>
<b>+┊  ┊30┊  profile?: Profile;</b>
<b>+┊  ┊31┊}</b>
</pre>

[}]: #

`Meteor` comes with a built-in users collection, defined as `Meteor.users`, but since we're using `Observables` vastly, we will wrap our collection with one:

[{]: <helper> (diffStep 8.2)

#### [Step 8.2: Wrap Meteor users collection](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/cef3c7e)

##### Added api&#x2F;server&#x2F;collections&#x2F;users.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊import { MongoObservable } from &#x27;meteor-rxjs&#x27;;</b>
<b>+┊ ┊2┊import { Meteor } from &#x27;meteor/meteor&#x27;;</b>
<b>+┊ ┊3┊import { User } from &#x27;../models&#x27;;</b>
<b>+┊ ┊4┊</b>
<b>+┊ ┊5┊export const Users &#x3D; MongoObservable.fromExisting&lt;User&gt;(Meteor.users);</b>
</pre>

[}]: #

For accessibility, we're gonna export the collection from the `index` file as well:

[{]: <helper> (diffStep 8.3)

#### [Step 8.3: Export users collection form index file](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/6ce05db)

##### Changed api&#x2F;server&#x2F;collections&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊export * from &#x27;./chats&#x27;;
 ┊2┊2┊export * from &#x27;./messages&#x27;;
<b>+┊ ┊3┊export * from &#x27;./users&#x27;;</b>
</pre>

[}]: #

## Chats Creation

We will be using `Ionic`'s modal dialog to show the chat creation view. The first thing we're gonna do would be implementing the component itself, along with its view and stylesheet:

[{]: <helper> (diffStep 8.4)

#### [Step 8.4: Added new chat component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/ec79ca1)

##### Added src&#x2F;pages&#x2F;chats&#x2F;new-chat.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { Component, OnInit } from &#x27;@angular/core&#x27;;</b>
<b>+┊  ┊ 2┊import { Chats, Users } from &#x27;api/collections&#x27;;</b>
<b>+┊  ┊ 3┊import { User } from &#x27;api/models&#x27;;</b>
<b>+┊  ┊ 4┊import { AlertController, ViewController } from &#x27;ionic-angular&#x27;;</b>
<b>+┊  ┊ 5┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;</b>
<b>+┊  ┊ 6┊import { _ } from &#x27;meteor/underscore&#x27;;</b>
<b>+┊  ┊ 7┊import { Observable, Subscription } from &#x27;rxjs&#x27;;</b>
<b>+┊  ┊ 8┊</b>
<b>+┊  ┊ 9┊@Component({</b>
<b>+┊  ┊10┊  selector: &#x27;new-chat&#x27;,</b>
<b>+┊  ┊11┊  templateUrl: &#x27;new-chat.html&#x27;</b>
<b>+┊  ┊12┊})</b>
<b>+┊  ┊13┊export class NewChatComponent implements OnInit {</b>
<b>+┊  ┊14┊  senderId: string;</b>
<b>+┊  ┊15┊  users: Observable&lt;User[]&gt;;</b>
<b>+┊  ┊16┊  usersSubscription: Subscription;</b>
<b>+┊  ┊17┊</b>
<b>+┊  ┊18┊  constructor(</b>
<b>+┊  ┊19┊    private alertCtrl: AlertController,</b>
<b>+┊  ┊20┊    private viewCtrl: ViewController</b>
<b>+┊  ┊21┊  ) {</b>
<b>+┊  ┊22┊    this.senderId &#x3D; Meteor.userId();</b>
<b>+┊  ┊23┊  }</b>
<b>+┊  ┊24┊</b>
<b>+┊  ┊25┊  ngOnInit() {</b>
<b>+┊  ┊26┊    this.loadUsers();</b>
<b>+┊  ┊27┊  }</b>
<b>+┊  ┊28┊</b>
<b>+┊  ┊29┊  addChat(user): void {</b>
<b>+┊  ┊30┊    MeteorObservable.call(&#x27;addChat&#x27;, user._id).subscribe({</b>
<b>+┊  ┊31┊      next: () &#x3D;&gt; {</b>
<b>+┊  ┊32┊        this.viewCtrl.dismiss();</b>
<b>+┊  ┊33┊      },</b>
<b>+┊  ┊34┊      error: (e: Error) &#x3D;&gt; {</b>
<b>+┊  ┊35┊        this.viewCtrl.dismiss().then(() &#x3D;&gt; {</b>
<b>+┊  ┊36┊          this.handleError(e);</b>
<b>+┊  ┊37┊        });</b>
<b>+┊  ┊38┊      }</b>
<b>+┊  ┊39┊    });</b>
<b>+┊  ┊40┊  }</b>
<b>+┊  ┊41┊</b>
<b>+┊  ┊42┊  loadUsers(): void {</b>
<b>+┊  ┊43┊    this.users &#x3D; this.findUsers();</b>
<b>+┊  ┊44┊  }</b>
<b>+┊  ┊45┊</b>
<b>+┊  ┊46┊  findUsers(): Observable&lt;User[]&gt; {</b>
<b>+┊  ┊47┊    // Find all belonging chats</b>
<b>+┊  ┊48┊    return Chats.find({</b>
<b>+┊  ┊49┊      memberIds: this.senderId</b>
<b>+┊  ┊50┊    }, {</b>
<b>+┊  ┊51┊      fields: {</b>
<b>+┊  ┊52┊        memberIds: 1</b>
<b>+┊  ┊53┊      }</b>
<b>+┊  ┊54┊    })</b>
<b>+┊  ┊55┊    // Invoke merge-map with an empty array in case no chat found</b>
<b>+┊  ┊56┊    .startWith([])</b>
<b>+┊  ┊57┊    .mergeMap((chats) &#x3D;&gt; {</b>
<b>+┊  ┊58┊      // Get all userIDs who we&#x27;re chatting with</b>
<b>+┊  ┊59┊      const receiverIds &#x3D; _.chain(chats)</b>
<b>+┊  ┊60┊        .pluck(&#x27;memberIds&#x27;)</b>
<b>+┊  ┊61┊        .flatten()</b>
<b>+┊  ┊62┊        .concat(this.senderId)</b>
<b>+┊  ┊63┊        .value();</b>
<b>+┊  ┊64┊</b>
<b>+┊  ┊65┊      // Find all users which are not in belonging chats</b>
<b>+┊  ┊66┊      return Users.find({</b>
<b>+┊  ┊67┊        _id: { $nin: receiverIds }</b>
<b>+┊  ┊68┊      })</b>
<b>+┊  ┊69┊      // Invoke map with an empty array in case no user found</b>
<b>+┊  ┊70┊      .startWith([]);</b>
<b>+┊  ┊71┊    });</b>
<b>+┊  ┊72┊  }</b>
<b>+┊  ┊73┊</b>
<b>+┊  ┊74┊  handleError(e: Error): void {</b>
<b>+┊  ┊75┊    console.error(e);</b>
<b>+┊  ┊76┊</b>
<b>+┊  ┊77┊    const alert &#x3D; this.alertCtrl.create({</b>
<b>+┊  ┊78┊      buttons: [&#x27;OK&#x27;],</b>
<b>+┊  ┊79┊      message: e.message,</b>
<b>+┊  ┊80┊      title: &#x27;Oops!&#x27;</b>
<b>+┊  ┊81┊    });</b>
<b>+┊  ┊82┊</b>
<b>+┊  ┊83┊    alert.present();</b>
<b>+┊  ┊84┊  }</b>
<b>+┊  ┊85┊}</b>
</pre>

[}]: #

[{]: <helper> (diffStep 8.5)

#### [Step 8.5: Added new chat template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/cee2a75)

##### Added src&#x2F;pages&#x2F;chats&#x2F;new-chat.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊&lt;ion-header&gt;</b>
<b>+┊  ┊ 2┊  &lt;ion-toolbar color&#x3D;&quot;whatsapp&quot;&gt;</b>
<b>+┊  ┊ 3┊    &lt;ion-title&gt;New Chat&lt;/ion-title&gt;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊    &lt;ion-buttons left&gt;</b>
<b>+┊  ┊ 6┊      &lt;button ion-button class&#x3D;&quot;dismiss-button&quot; (click)&#x3D;&quot;viewCtrl.dismiss()&quot;&gt;&lt;ion-icon name&#x3D;&quot;close&quot;&gt;&lt;/ion-icon&gt;&lt;/button&gt;</b>
<b>+┊  ┊ 7┊    &lt;/ion-buttons&gt;</b>
<b>+┊  ┊ 8┊</b>
<b>+┊  ┊ 9┊    &lt;ion-buttons end&gt;</b>
<b>+┊  ┊10┊      &lt;button ion-button class&#x3D;&quot;search-button&quot;&gt;&lt;ion-icon name&#x3D;&quot;search&quot;&gt;&lt;/ion-icon&gt;&lt;/button&gt;</b>
<b>+┊  ┊11┊    &lt;/ion-buttons&gt;</b>
<b>+┊  ┊12┊  &lt;/ion-toolbar&gt;</b>
<b>+┊  ┊13┊&lt;/ion-header&gt;</b>
<b>+┊  ┊14┊</b>
<b>+┊  ┊15┊&lt;ion-content class&#x3D;&quot;new-chat&quot;&gt;</b>
<b>+┊  ┊16┊  &lt;ion-list class&#x3D;&quot;users&quot;&gt;</b>
<b>+┊  ┊17┊    &lt;button ion-item *ngFor&#x3D;&quot;let user of users | async&quot; class&#x3D;&quot;user&quot; (click)&#x3D;&quot;addChat(user)&quot;&gt;</b>
<b>+┊  ┊18┊      &lt;img class&#x3D;&quot;user-picture&quot; [src]&#x3D;&quot;user.profile.picture&quot;&gt;</b>
<b>+┊  ┊19┊      &lt;h2 class&#x3D;&quot;user-name&quot;&gt;{{user.profile.name}}&lt;/h2&gt;</b>
<b>+┊  ┊20┊    &lt;/button&gt;</b>
<b>+┊  ┊21┊  &lt;/ion-list&gt;</b>
<b>+┊  ┊22┊&lt;/ion-content&gt;</b>
</pre>

[}]: #

[{]: <helper> (diffStep 8.6)

#### [Step 8.6: Added new chat styles](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/4ba13a9)

##### Added src&#x2F;pages&#x2F;chats&#x2F;new-chat.scss
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊.new-chat {</b>
<b>+┊  ┊ 2┊  .user-picture {</b>
<b>+┊  ┊ 3┊    border-radius: 50%;</b>
<b>+┊  ┊ 4┊    width: 50px;</b>
<b>+┊  ┊ 5┊    float: left;</b>
<b>+┊  ┊ 6┊  }</b>
<b>+┊  ┊ 7┊</b>
<b>+┊  ┊ 8┊  .user-name {</b>
<b>+┊  ┊ 9┊    margin-left: 20px;</b>
<b>+┊  ┊10┊    margin-top: 25px;</b>
<b>+┊  ┊11┊    transform: translate(0, -50%);</b>
<b>+┊  ┊12┊    float: left;</b>
<b>+┊  ┊13┊  }</b>
<b>+┊  ┊14┊}</b>
</pre>

[}]: #

The dialog should contain a list of all the users whose chat does not exist yet. Once we click on one of these users we should be demoted to the chats view with the new chat we've just created.

The dialog should be revealed whenever we click on one of the options in the options pop-over, therefore, we will implement the necessary handler:

[{]: <helper> (diffStep 8.7)

#### [Step 8.7: Added addChat method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/5f973c1)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊import { Component, OnInit } from &#x27;@angular/core&#x27;;
 ┊ 2┊ 2┊import { Chats, Messages } from &#x27;api/collections&#x27;;
 ┊ 3┊ 3┊import { Chat } from &#x27;api/models&#x27;;
<b>+┊  ┊ 4┊import { NavController, PopoverController, ModalController } from &#x27;ionic-angular&#x27;;</b>
 ┊ 5┊ 5┊import { Observable } from &#x27;rxjs&#x27;;
 ┊ 6┊ 6┊import { MessagesPage } from &#x27;../messages/messages&#x27;;
 ┊ 7┊ 7┊import { ChatsOptionsComponent } from &#x27;./chats-options&#x27;;
<b>+┊  ┊ 8┊import { NewChatComponent } from &#x27;./new-chat&#x27;;</b>
 ┊ 8┊ 9┊
 ┊ 9┊10┊@Component({
 ┊10┊11┊  templateUrl: &#x27;chats.html&#x27;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊14┊15┊
 ┊15┊16┊  constructor(
 ┊16┊17┊    private navCtrl: NavController,
<b>+┊  ┊18┊    private popoverCtrl: PopoverController,</b>
<b>+┊  ┊19┊    private modalCtrl: ModalController) {</b>
<b>+┊  ┊20┊  }</b>
<b>+┊  ┊21┊</b>
<b>+┊  ┊22┊  addChat(): void {</b>
<b>+┊  ┊23┊    const modal &#x3D; this.modalCtrl.create(NewChatComponent);</b>
<b>+┊  ┊24┊    modal.present();</b>
 ┊18┊25┊  }
 ┊19┊26┊
 ┊20┊27┊  ngOnInit() {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊35┊42┊      ).zone();
 ┊36┊43┊  }
 ┊37┊44┊
<b>+┊  ┊45┊</b>
 ┊38┊46┊  showMessages(chat): void {
 ┊39┊47┊    this.navCtrl.push(MessagesPage, {chat});
 ┊40┊48┊  }
</pre>

[}]: #

And bind it to the `click` event:

[{]: <helper> (diffStep 8.8)

#### [Step 8.8: Bind click event to new chat modal](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/2b8b582)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 4┊ 4┊      Chats
 ┊ 5┊ 5┊    &lt;/ion-title&gt;
 ┊ 6┊ 6┊    &lt;ion-buttons end&gt;
<b>+┊  ┊ 7┊      &lt;button ion-button icon-only class&#x3D;&quot;add-chat-button&quot; (click)&#x3D;&quot;addChat()&quot;&gt;</b>
 ┊ 8┊ 8┊        &lt;ion-icon name&#x3D;&quot;person-add&quot;&gt;&lt;/ion-icon&gt;
 ┊ 9┊ 9┊      &lt;/button&gt;
 ┊10┊10┊      &lt;button ion-button icon-only class&#x3D;&quot;options-button&quot; (click)&#x3D;&quot;showOptions()&quot;&gt;
</pre>

[}]: #

We will import the newly created component in the app's `NgModule` as well, so it can be recognized properly:

[{]: <helper> (diffStep 8.9)

#### [Step 8.9: Import new chat component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/b187013)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 5┊ 5┊import { StatusBar } from &#x27;@ionic-native/status-bar&#x27;;
 ┊ 6┊ 6┊import { MomentModule } from &#x27;angular2-moment&#x27;;
 ┊ 7┊ 7┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;
<b>+┊  ┊ 8┊import { NewChatComponent } from &#x27;../pages/chats/new-chat&#x27;;</b>
 ┊ 8┊ 9┊import { ChatsOptionsComponent } from &#x27;../pages/chats/chats-options&#x27;;
 ┊ 9┊10┊import { LoginPage } from &#x27;../pages/login/login&#x27;;
 ┊10┊11┊import { MessagesPage } from &#x27;../pages/messages/messages&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊21┊22┊    LoginPage,
 ┊22┊23┊    VerificationPage,
 ┊23┊24┊    ProfilePage,
<b>+┊  ┊25┊    ChatsOptionsComponent,</b>
<b>+┊  ┊26┊    NewChatComponent</b>
 ┊25┊27┊  ],
 ┊26┊28┊  imports: [
 ┊27┊29┊    BrowserModule,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊36┊38┊    LoginPage,
 ┊37┊39┊    VerificationPage,
 ┊38┊40┊    ProfilePage,
<b>+┊  ┊41┊    ChatsOptionsComponent,</b>
<b>+┊  ┊42┊    NewChatComponent</b>
 ┊40┊43┊  ],
 ┊41┊44┊  providers: [
 ┊42┊45┊    StatusBar,
</pre>

[}]: #

We're also required to implement the appropriate `Meteor` method which will be the actually handler for feeding our data-base with newly created chats:

[{]: <helper> (diffStep "8.10")

#### [Step 8.10: Implement addChat method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/1630cab)

##### Changed api&#x2F;server&#x2F;methods.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 9┊ 9┊});
 ┊10┊10┊
 ┊11┊11┊Meteor.methods({
<b>+┊  ┊12┊  addChat(receiverId: string): void {</b>
<b>+┊  ┊13┊    if (!this.userId) {</b>
<b>+┊  ┊14┊      throw new Meteor.Error(&#x27;unauthorized&#x27;,</b>
<b>+┊  ┊15┊        &#x27;User must be logged-in to create a new chat&#x27;);</b>
<b>+┊  ┊16┊    }</b>
<b>+┊  ┊17┊</b>
<b>+┊  ┊18┊    check(receiverId, nonEmptyString);</b>
<b>+┊  ┊19┊</b>
<b>+┊  ┊20┊    if (receiverId &#x3D;&#x3D;&#x3D; this.userId) {</b>
<b>+┊  ┊21┊      throw new Meteor.Error(&#x27;illegal-receiver&#x27;,</b>
<b>+┊  ┊22┊        &#x27;Receiver must be different than the current logged in user&#x27;);</b>
<b>+┊  ┊23┊    }</b>
<b>+┊  ┊24┊</b>
<b>+┊  ┊25┊    const chatExists &#x3D; !!Chats.collection.find({</b>
<b>+┊  ┊26┊      memberIds: { $all: [this.userId, receiverId] }</b>
<b>+┊  ┊27┊    }).count();</b>
<b>+┊  ┊28┊</b>
<b>+┊  ┊29┊    if (chatExists) {</b>
<b>+┊  ┊30┊      throw new Meteor.Error(&#x27;chat-exists&#x27;,</b>
<b>+┊  ┊31┊        &#x27;Chat already exists&#x27;);</b>
<b>+┊  ┊32┊    }</b>
<b>+┊  ┊33┊</b>
<b>+┊  ┊34┊    const chat &#x3D; {</b>
<b>+┊  ┊35┊      memberIds: [this.userId, receiverId]</b>
<b>+┊  ┊36┊    };</b>
<b>+┊  ┊37┊</b>
<b>+┊  ┊38┊    Chats.insert(chat);</b>
<b>+┊  ┊39┊  },</b>
 ┊12┊40┊  updateProfile(profile: Profile): void {
 ┊13┊41┊    if (!this.userId) throw new Meteor.Error(&#x27;unauthorized&#x27;,
 ┊14┊42┊      &#x27;User must be logged-in to create a new chat&#x27;);
</pre>

[}]: #

As you can see, a chat is inserted with an additional `memberIds` field. Whenever we have such a change we should update the model's schema accordingly, in this case we're talking about adding the `memberIds` field, like so:

[{]: <helper> (diffStep 8.11)

#### [Step 8.11: Add memberIds field](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/a81123d)

##### Changed api&#x2F;server&#x2F;models.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊14┊14┊  title?: string;
 ┊15┊15┊  picture?: string;
 ┊16┊16┊  lastMessage?: Message;
<b>+┊  ┊17┊  memberIds?: string[];</b>
 ┊17┊18┊}
 ┊18┊19┊
 ┊19┊20┊export interface Message {
</pre>

[}]: #

Thanks to our new-chat dialog, we can create chats dynamically with no need in initial fabrication. Let's replace the chats fabrication with users fabrication in the Meteor server:

[{]: <helper> (diffStep 8.12)

#### [Step 8.12: Create real user accounts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/b615fff)

##### Changed api&#x2F;server&#x2F;main.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Meteor } from &#x27;meteor/meteor&#x27;;
 ┊6┊2┊import { Accounts } from &#x27;meteor/accounts-base&#x27;;
<b>+┊ ┊3┊import { Users } from &#x27;./collections/users&#x27;;</b>
 ┊7┊4┊
 ┊8┊5┊Meteor.startup(() &#x3D;&gt; {
 ┊9┊6┊  if (Meteor.settings) {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊11┊ 8┊    SMS.twilio &#x3D; Meteor.settings[&#x27;twilio&#x27;];
 ┊12┊ 9┊  }
 ┊13┊10┊
<b>+┊  ┊11┊  if (Users.collection.find().count() &gt; 0) {</b>
<b>+┊  ┊12┊    return;</b>
 ┊76┊13┊  }
<b>+┊  ┊14┊</b>
<b>+┊  ┊15┊  Accounts.createUserWithPhone({</b>
<b>+┊  ┊16┊    phone: &#x27;+972540000001&#x27;,</b>
<b>+┊  ┊17┊    profile: {</b>
<b>+┊  ┊18┊      name: &#x27;Ethan Gonzalez&#x27;,</b>
<b>+┊  ┊19┊      picture: &#x27;https://randomuser.me/api/portraits/men/1.jpg&#x27;</b>
<b>+┊  ┊20┊    }</b>
<b>+┊  ┊21┊  });</b>
<b>+┊  ┊22┊</b>
<b>+┊  ┊23┊  Accounts.createUserWithPhone({</b>
<b>+┊  ┊24┊    phone: &#x27;+972540000002&#x27;,</b>
<b>+┊  ┊25┊    profile: {</b>
<b>+┊  ┊26┊      name: &#x27;Bryan Wallace&#x27;,</b>
<b>+┊  ┊27┊      picture: &#x27;https://randomuser.me/api/portraits/lego/1.jpg&#x27;</b>
<b>+┊  ┊28┊    }</b>
<b>+┊  ┊29┊  });</b>
<b>+┊  ┊30┊</b>
<b>+┊  ┊31┊  Accounts.createUserWithPhone({</b>
<b>+┊  ┊32┊    phone: &#x27;+972540000003&#x27;,</b>
<b>+┊  ┊33┊    profile: {</b>
<b>+┊  ┊34┊      name: &#x27;Avery Stewart&#x27;,</b>
<b>+┊  ┊35┊      picture: &#x27;https://randomuser.me/api/portraits/women/1.jpg&#x27;</b>
<b>+┊  ┊36┊    }</b>
<b>+┊  ┊37┊  });</b>
<b>+┊  ┊38┊</b>
<b>+┊  ┊39┊  Accounts.createUserWithPhone({</b>
<b>+┊  ┊40┊    phone: &#x27;+972540000004&#x27;,</b>
<b>+┊  ┊41┊    profile: {</b>
<b>+┊  ┊42┊      name: &#x27;Katie Peterson&#x27;,</b>
<b>+┊  ┊43┊      picture: &#x27;https://randomuser.me/api/portraits/women/2.jpg&#x27;</b>
<b>+┊  ┊44┊    }</b>
<b>+┊  ┊45┊  });</b>
<b>+┊  ┊46┊</b>
<b>+┊  ┊47┊  Accounts.createUserWithPhone({</b>
<b>+┊  ┊48┊    phone: &#x27;+972540000005&#x27;,</b>
<b>+┊  ┊49┊    profile: {</b>
<b>+┊  ┊50┊      name: &#x27;Ray Edwards&#x27;,</b>
<b>+┊  ┊51┊      picture: &#x27;https://randomuser.me/api/portraits/men/2.jpg&#x27;</b>
<b>+┊  ┊52┊    }</b>
<b>+┊  ┊53┊  });</b>
 ┊77┊54┊});
</pre>

[}]: #

Since we've changed the data fabrication method, the chat's title and picture are not hard-coded anymore, therefore, any additional data should be fetched in the components themselves:

[{]: <helper> (diffStep 8.13)

#### [Step 8.13: Implement chats with with real data](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/fbe5caf)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Component, OnInit } from &#x27;@angular/core&#x27;;
<b>+┊ ┊2┊import { Chats, Messages, Users } from &#x27;api/collections&#x27;;</b>
<b>+┊ ┊3┊import { Chat, Message } from &#x27;api/models&#x27;;</b>
 ┊4┊4┊import { NavController, PopoverController, ModalController } from &#x27;ionic-angular&#x27;;
<b>+┊ ┊5┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;</b>
<b>+┊ ┊6┊import { Observable, Subscriber } from &#x27;rxjs&#x27;;</b>
 ┊6┊7┊import { MessagesPage } from &#x27;../messages/messages&#x27;;
 ┊7┊8┊import { ChatsOptionsComponent } from &#x27;./chats-options&#x27;;
 ┊8┊9┊import { NewChatComponent } from &#x27;./new-chat&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊12┊13┊})
 ┊13┊14┊export class ChatsPage implements OnInit {
 ┊14┊15┊  chats;
<b>+┊  ┊16┊  senderId: string;</b>
 ┊15┊17┊
 ┊16┊18┊  constructor(
 ┊17┊19┊    private navCtrl: NavController,
 ┊18┊20┊    private popoverCtrl: PopoverController,
 ┊19┊21┊    private modalCtrl: ModalController) {
<b>+┊  ┊22┊    this.senderId &#x3D; Meteor.userId();</b>
 ┊20┊23┊  }
 ┊21┊24┊
 ┊22┊25┊  addChat(): void {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊25┊28┊  }
 ┊26┊29┊
 ┊27┊30┊  ngOnInit() {
<b>+┊  ┊31┊    this.chats &#x3D; this.findChats();</b>
 ┊43┊32┊  }
 ┊44┊33┊
<b>+┊  ┊34┊  findChats(): Observable&lt;Chat[]&gt; {</b>
<b>+┊  ┊35┊    // Find chats and transform them</b>
<b>+┊  ┊36┊    return Chats.find().map(chats &#x3D;&gt; {</b>
<b>+┊  ┊37┊      chats.forEach(chat &#x3D;&gt; {</b>
<b>+┊  ┊38┊        chat.title &#x3D; &#x27;&#x27;;</b>
<b>+┊  ┊39┊        chat.picture &#x3D; &#x27;&#x27;;</b>
<b>+┊  ┊40┊</b>
<b>+┊  ┊41┊        const receiverId &#x3D; chat.memberIds.find(memberId &#x3D;&gt; memberId !&#x3D;&#x3D; this.senderId);</b>
<b>+┊  ┊42┊        const receiver &#x3D; Users.findOne(receiverId);</b>
<b>+┊  ┊43┊</b>
<b>+┊  ┊44┊        if (receiver) {</b>
<b>+┊  ┊45┊          chat.title &#x3D; receiver.profile.name;</b>
<b>+┊  ┊46┊          chat.picture &#x3D; receiver.profile.picture;</b>
<b>+┊  ┊47┊        }</b>
<b>+┊  ┊48┊</b>
<b>+┊  ┊49┊        // This will make the last message reactive</b>
<b>+┊  ┊50┊        this.findLastChatMessage(chat._id).subscribe((message) &#x3D;&gt; {</b>
<b>+┊  ┊51┊          chat.lastMessage &#x3D; message;</b>
<b>+┊  ┊52┊        });</b>
<b>+┊  ┊53┊      });</b>
<b>+┊  ┊54┊</b>
<b>+┊  ┊55┊      return chats;</b>
<b>+┊  ┊56┊    });</b>
<b>+┊  ┊57┊  }</b>
<b>+┊  ┊58┊</b>
<b>+┊  ┊59┊  findLastChatMessage(chatId: string): Observable&lt;Message&gt; {</b>
<b>+┊  ┊60┊    return Observable.create((observer: Subscriber&lt;Message&gt;) &#x3D;&gt; {</b>
<b>+┊  ┊61┊      const chatExists &#x3D; () &#x3D;&gt; !!Chats.findOne(chatId);</b>
<b>+┊  ┊62┊</b>
<b>+┊  ┊63┊      // Re-compute until chat is removed</b>
<b>+┊  ┊64┊      MeteorObservable.autorun().takeWhile(chatExists).subscribe(() &#x3D;&gt; {</b>
<b>+┊  ┊65┊        Messages.find({ chatId }, {</b>
<b>+┊  ┊66┊          sort: { createdAt: -1 }</b>
<b>+┊  ┊67┊        }).subscribe({</b>
<b>+┊  ┊68┊          next: (messages) &#x3D;&gt; {</b>
<b>+┊  ┊69┊            // Invoke subscription with the last message found</b>
<b>+┊  ┊70┊            if (!messages.length) {</b>
<b>+┊  ┊71┊              return;</b>
<b>+┊  ┊72┊            }</b>
<b>+┊  ┊73┊</b>
<b>+┊  ┊74┊            const lastMessage &#x3D; messages[0];</b>
<b>+┊  ┊75┊            observer.next(lastMessage);</b>
<b>+┊  ┊76┊          },</b>
<b>+┊  ┊77┊          error: (e) &#x3D;&gt; {</b>
<b>+┊  ┊78┊            observer.error(e);</b>
<b>+┊  ┊79┊          },</b>
<b>+┊  ┊80┊          complete: () &#x3D;&gt; {</b>
<b>+┊  ┊81┊            observer.complete();</b>
<b>+┊  ┊82┊          }</b>
<b>+┊  ┊83┊        });</b>
<b>+┊  ┊84┊      });</b>
<b>+┊  ┊85┊    });</b>
<b>+┊  ┊86┊  }</b>
 ┊45┊87┊
 ┊46┊88┊  showMessages(chat): void {
 ┊47┊89┊    this.navCtrl.push(MessagesPage, {chat});
</pre>

[}]: #

Now we want our changes to take effect. We will reset the database so next time we run our `Meteor` server the users will be fabricated. To reset the database, first make sure the `Meteor` server is stopped , and then type the following command:

    api$ meteor reset

Now, as soon as you start the server, new users should be fabricated and inserted into the database:

    $ npm run api

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/privacy" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/authentication")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/authentication">PREVIOUS STEP</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/privacy">NEXT STEP</a> ⟹

[}]: #

