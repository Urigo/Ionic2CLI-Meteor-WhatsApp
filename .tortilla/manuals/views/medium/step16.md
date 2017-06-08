# Step 16: FCM Push Notifications

In this step we are going to implement push notifications using Google's `Firebase Cloud Messaging` (`FCM`). Whenever a user will send you a message, if you don't have our application in the foreground you will get a push notification.

First we will have to create `google-services.json` in our project's root directory:

[{]: <helper> (diffStep 16.1)

#### [Step 16.1: Add google-services.json FCM config](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/9d0be02)

##### Added google-services.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊{</b>
<b>+┊  ┊ 2┊  &quot;project_info&quot;: {</b>
<b>+┊  ┊ 3┊    &quot;project_number&quot;: &quot;152311690748&quot;,</b>
<b>+┊  ┊ 4┊    &quot;firebase_url&quot;: &quot;https://meteor-c069e.firebaseio.com&quot;,</b>
<b>+┊  ┊ 5┊    &quot;project_id&quot;: &quot;meteor-c069e&quot;,</b>
<b>+┊  ┊ 6┊    &quot;storage_bucket&quot;: &quot;meteor-c069e.appspot.com&quot;</b>
<b>+┊  ┊ 7┊  },</b>
<b>+┊  ┊ 8┊  &quot;client&quot;: [</b>
<b>+┊  ┊ 9┊    {</b>
<b>+┊  ┊10┊      &quot;client_info&quot;: {</b>
<b>+┊  ┊11┊        &quot;mobilesdk_app_id&quot;: &quot;1:152311690748:android:25f0ec3806cf1f01&quot;,</b>
<b>+┊  ┊12┊        &quot;android_client_info&quot;: {</b>
<b>+┊  ┊13┊          &quot;package_name&quot;: &quot;io.ionic.starter&quot;</b>
<b>+┊  ┊14┊        }</b>
<b>+┊  ┊15┊      },</b>
<b>+┊  ┊16┊      &quot;oauth_client&quot;: [</b>
<b>+┊  ┊17┊        {</b>
<b>+┊  ┊18┊          &quot;client_id&quot;: &quot;152311690748-2ht8fdqhlnv8lsrrvnd7u521j9rcgi3h.apps.googleusercontent.com&quot;,</b>
<b>+┊  ┊19┊          &quot;client_type&quot;: 3</b>
<b>+┊  ┊20┊        }</b>
<b>+┊  ┊21┊      ],</b>
<b>+┊  ┊22┊      &quot;api_key&quot;: [</b>
<b>+┊  ┊23┊        {</b>
<b>+┊  ┊24┊          &quot;current_key&quot;: &quot;AIzaSyD9CKsY6bC_a4Equ2HpbcrSErgJ2pheDS4&quot;</b>
<b>+┊  ┊25┊        }</b>
<b>+┊  ┊26┊      ],</b>
<b>+┊  ┊27┊      &quot;services&quot;: {</b>
<b>+┊  ┊28┊        &quot;analytics_service&quot;: {</b>
<b>+┊  ┊29┊          &quot;status&quot;: 1</b>
<b>+┊  ┊30┊        },</b>
<b>+┊  ┊31┊        &quot;appinvite_service&quot;: {</b>
<b>+┊  ┊32┊          &quot;status&quot;: 1,</b>
<b>+┊  ┊33┊          &quot;other_platform_oauth_client&quot;: []</b>
<b>+┊  ┊34┊        },</b>
<b>+┊  ┊35┊        &quot;ads_service&quot;: {</b>
<b>+┊  ┊36┊          &quot;status&quot;: 2</b>
<b>+┊  ┊37┊        }</b>
<b>+┊  ┊38┊      }</b>
<b>+┊  ┊39┊    }</b>
<b>+┊  ┊40┊  ],</b>
<b>+┊  ┊41┊  &quot;configuration_version&quot;: &quot;1&quot;</b>
<b>+┊  ┊42┊}</b>
</pre>

[}]: #

Then we need to install the `FCM` `Cordova` plug-in:

    $ ionic cordova plugin add git+https://github.com/darkbasic/cordova-plugin-fcm.git --save
    $ npm install --save @ionic-native/fcm

Then let's add it to `app.module.ts`:

[{]: <helper> (diffStep 16.3)

#### [Step 16.3: Add FCM to app.module.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/9f97f05)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊10┊10┊import { Camera } from &#x27;@ionic-native/camera&#x27;;
 ┊11┊11┊import { Crop } from &#x27;@ionic-native/crop&#x27;;
 ┊12┊12┊import { Contacts } from &quot;@ionic-native/contacts&quot;;
<b>+┊  ┊13┊import { FCM } from &quot;@ionic-native/fcm&quot;;</b>
 ┊13┊14┊import { AgmCoreModule } from &#x27;@agm/core&#x27;;
 ┊14┊15┊import { MomentModule } from &#x27;angular2-moment&#x27;;
 ┊15┊16┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊77┊78┊    SmsReceiver,
 ┊78┊79┊    Camera,
 ┊79┊80┊    Crop,
<b>+┊  ┊81┊    Contacts,</b>
<b>+┊  ┊82┊    FCM</b>
 ┊81┊83┊  ]
 ┊82┊84┊})
 ┊83┊85┊export class AppModule {}
</pre>

[}]: #

Now we can start adding some `FCM` logic into `ChatsPage`:

[{]: <helper> (diffStep 16.4)

#### [Step 16.4: Add FCM logic to ChatsPage](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/604e560)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 7┊ 7┊import { MessagesPage } from &#x27;../messages/messages&#x27;;
 ┊ 8┊ 8┊import { ChatsOptionsComponent } from &#x27;./chats-options&#x27;;
 ┊ 9┊ 9┊import { NewChatComponent } from &#x27;./new-chat&#x27;;
<b>+┊  ┊10┊import { FCM } from &quot;@ionic-native/fcm&quot;;</b>
 ┊10┊11┊
 ┊11┊12┊@Component({
 ┊12┊13┊  templateUrl: &#x27;chats.html&#x27;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊20┊21┊    private popoverCtrl: PopoverController,
 ┊21┊22┊    private modalCtrl: ModalController,
 ┊22┊23┊    private alertCtrl: AlertController,
<b>+┊  ┊24┊    private platform: Platform,</b>
<b>+┊  ┊25┊    private fcm: FCM) {</b>
 ┊24┊26┊    this.senderId &#x3D; Meteor.userId();
 ┊25┊27┊  }
 ┊26┊28┊
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊35┊37┊        this.chats &#x3D; this.findChats();
 ┊36┊38┊      });
 ┊37┊39┊    });
<b>+┊  ┊40┊</b>
<b>+┊  ┊41┊    // Notifications</b>
<b>+┊  ┊42┊    if (this.platform.is(&#x27;cordova&#x27;)) {</b>
<b>+┊  ┊43┊      //this.fcm.subscribeToTopic(&#x27;news&#x27;);</b>
<b>+┊  ┊44┊</b>
<b>+┊  ┊45┊      this.fcm.getToken().then(token &#x3D;&gt; {</b>
<b>+┊  ┊46┊        console.log(&quot;Registering FCM token on backend&quot;);</b>
<b>+┊  ┊47┊        MeteorObservable.call(&#x27;saveFcmToken&#x27;, token).subscribe({</b>
<b>+┊  ┊48┊          next: () &#x3D;&gt; console.log(&quot;FCM Token saved&quot;),</b>
<b>+┊  ┊49┊          error: err &#x3D;&gt; console.error(&#x27;Impossible to save FCM token: &#x27;, err)</b>
<b>+┊  ┊50┊        });</b>
<b>+┊  ┊51┊      });</b>
<b>+┊  ┊52┊</b>
<b>+┊  ┊53┊      this.fcm.onNotification().subscribe(data &#x3D;&gt; {</b>
<b>+┊  ┊54┊        if (data.wasTapped) {</b>
<b>+┊  ┊55┊          console.log(&quot;Received FCM notification in background&quot;);</b>
<b>+┊  ┊56┊        } else {</b>
<b>+┊  ┊57┊          console.log(&quot;Received FCM notification in foreground&quot;);</b>
<b>+┊  ┊58┊        }</b>
<b>+┊  ┊59┊      });</b>
<b>+┊  ┊60┊</b>
<b>+┊  ┊61┊      this.fcm.onTokenRefresh().subscribe(token &#x3D;&gt; {</b>
<b>+┊  ┊62┊        console.log(&quot;Updating FCM token on backend&quot;);</b>
<b>+┊  ┊63┊        MeteorObservable.call(&#x27;saveFcmToken&#x27;, token).subscribe({</b>
<b>+┊  ┊64┊          next: () &#x3D;&gt; console.log(&quot;FCM Token updated&quot;),</b>
<b>+┊  ┊65┊          error: err &#x3D;&gt; console.error(&#x27;Impossible to update FCM token: &#x27; + err)</b>
<b>+┊  ┊66┊        });</b>
<b>+┊  ┊67┊      });</b>
<b>+┊  ┊68┊    }</b>
 ┊38┊69┊  }
 ┊39┊70┊
 ┊40┊71┊  findChats(): Observable&lt;Chat[]&gt; {
</pre>

[}]: #

We used the `saveFcmToken` `Meteor` method, so we need to create it first:

[{]: <helper> (diffStep 16.5)

#### [Step 16.5: Create the saveFcmToken Meteor method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/905defc)

##### Changed api&#x2F;server&#x2F;methods.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊2┊2┊import { Messages } from &#x27;./collections/messages&#x27;;
 ┊3┊3┊import { MessageType, Profile } from &#x27;./models&#x27;;
 ┊4┊4┊import { check, Match } from &#x27;meteor/check&#x27;;
<b>+┊ ┊5┊import { Users } from &quot;./collections/users&quot;;</b>
 ┊5┊6┊
 ┊6┊7┊const nonEmptyString &#x3D; Match.Where((str) &#x3D;&gt; {
 ┊7┊8┊  check(str, String);
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 94┊ 95┊  },
 ┊ 95┊ 96┊  countMessages(): number {
 ┊ 96┊ 97┊    return Messages.collection.find().count();
<b>+┊   ┊ 98┊  },</b>
<b>+┊   ┊ 99┊  saveFcmToken(token: string): void {</b>
<b>+┊   ┊100┊    if (!this.userId) throw new Meteor.Error(&#x27;unauthorized&#x27;, &#x27;User must be logged-in to call this method&#x27;);</b>
<b>+┊   ┊101┊</b>
<b>+┊   ┊102┊    check(token, nonEmptyString);</b>
<b>+┊   ┊103┊</b>
<b>+┊   ┊104┊    Users.collection.update({_id: this.userId}, {$set: {&quot;fcmToken&quot;: token}});</b>
 ┊ 97┊105┊  }
 ┊ 98┊106┊});
</pre>

[}]: #

Since we will soon need the `node-fetch` package, we will need to install it first:

    $ npm install --save node-fetch
    $ npm install --save-dev @types/node-fetch

Let's implement our server side service which will actually send the notification:

[{]: <helper> (diffStep 16.7)

#### [Step 16.7: Store credentials in settings.json](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/16edda7)

##### Changed api&#x2F;private&#x2F;settings.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 4┊ 4┊    &quot;verificationRetriesWaitTime&quot;: 0,
 ┊ 5┊ 5┊    &quot;adminPhoneNumbers&quot;: [&quot;+9721234567&quot;, &quot;+97212345678&quot;, &quot;+97212345679&quot;],
 ┊ 6┊ 6┊    &quot;phoneVerificationMasterCode&quot;: &quot;1234&quot;
<b>+┊  ┊ 7┊  },</b>
<b>+┊  ┊ 8┊  &quot;private&quot;: {</b>
<b>+┊  ┊ 9┊    &quot;fcm&quot;: {</b>
<b>+┊  ┊10┊      &quot;key&quot;: &quot;AIzaSyBnmvN5WNv3rAaLra1RUr9vA5k0pNp0KuY&quot;</b>
<b>+┊  ┊11┊    }</b>
 ┊ 7┊12┊  }
 ┊ 8┊13┊}
</pre>

[}]: #

Now we should edit the `AddMessage` `Meteor` method to use our just-created service to send the notification:

[{]: <helper> (diffStep 16.8)

#### [Step 16.8: Create server side fcm service](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/82697f5)

##### Added api&#x2F;server&#x2F;services&#x2F;fcm.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import fetch from &#x27;node-fetch&#x27;;</b>
<b>+┊  ┊ 2┊</b>
<b>+┊  ┊ 3┊export interface FcmNotification {</b>
<b>+┊  ┊ 4┊  title: string;</b>
<b>+┊  ┊ 5┊  text: string;</b>
<b>+┊  ┊ 6┊}</b>
<b>+┊  ┊ 7┊</b>
<b>+┊  ┊ 8┊export class FcmService {</b>
<b>+┊  ┊ 9┊  private key: string &#x3D; Meteor.settings.private.fcm.key;</b>
<b>+┊  ┊10┊</b>
<b>+┊  ┊11┊  sendNotification(notification: FcmNotification, destination: string) {</b>
<b>+┊  ┊12┊    const body &#x3D; {</b>
<b>+┊  ┊13┊      notification: notification,</b>
<b>+┊  ┊14┊      to: destination</b>
<b>+┊  ┊15┊    };</b>
<b>+┊  ┊16┊</b>
<b>+┊  ┊17┊    const options &#x3D; {</b>
<b>+┊  ┊18┊      method: &#x27;POST&#x27;,</b>
<b>+┊  ┊19┊      body: JSON.stringify(body),</b>
<b>+┊  ┊20┊      headers: {</b>
<b>+┊  ┊21┊        &quot;Content-Type&quot;: &quot;application/json&quot;,</b>
<b>+┊  ┊22┊        Authorization: &#x60;key&#x3D;${this.key}&#x60;</b>
<b>+┊  ┊23┊      },</b>
<b>+┊  ┊24┊    };</b>
<b>+┊  ┊25┊</b>
<b>+┊  ┊26┊    return fetch(&quot;https://fcm.googleapis.com/fcm/send&quot;, options);</b>
<b>+┊  ┊27┊  }</b>
<b>+┊  ┊28┊}</b>
<b>+┊  ┊29┊</b>
<b>+┊  ┊30┊export const fcmService &#x3D; new FcmService();</b>
</pre>

[}]: #

Before the `Typescript` compiler complains, let's update our `models`:

[{]: <helper> (diffStep 16.9)

#### [Step 16.9: Update addMessage Meteor method to send fcm notifications](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/60fee0e)

##### Changed api&#x2F;server&#x2F;methods.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊3┊3┊import { MessageType, Profile } from &#x27;./models&#x27;;
 ┊4┊4┊import { check, Match } from &#x27;meteor/check&#x27;;
 ┊5┊5┊import { Users } from &quot;./collections/users&quot;;
<b>+┊ ┊6┊import { fcmService } from &quot;./services/fcm&quot;;</b>
 ┊6┊7┊
 ┊7┊8┊const nonEmptyString &#x3D; Match.Where((str) &#x3D;&gt; {
 ┊8┊9┊  check(str, String);
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 83┊ 84┊        &#x27;Chat doesn\&#x27;t exist&#x27;);
 ┊ 84┊ 85┊    }
 ┊ 85┊ 86┊
<b>+┊   ┊ 87┊    const userId &#x3D; this.userId;</b>
<b>+┊   ┊ 88┊    const senderName &#x3D; Users.collection.findOne({_id: userId}).profile.name;</b>
<b>+┊   ┊ 89┊    const memberIds &#x3D; Chats.collection.findOne({_id: chatId}).memberIds;</b>
<b>+┊   ┊ 90┊    const tokens: string[] &#x3D; Users.collection.find(</b>
<b>+┊   ┊ 91┊      {</b>
<b>+┊   ┊ 92┊        _id: {$in: memberIds, $nin: [userId]},</b>
<b>+┊   ┊ 93┊        fcmToken: {$exists: true}</b>
<b>+┊   ┊ 94┊      }</b>
<b>+┊   ┊ 95┊    ).map((el) &#x3D;&gt; el.fcmToken);</b>
<b>+┊   ┊ 96┊</b>
<b>+┊   ┊ 97┊    for (let token of tokens) {</b>
<b>+┊   ┊ 98┊      console.log(&quot;Sending FCM notification&quot;);</b>
<b>+┊   ┊ 99┊      fcmService.sendNotification({&quot;title&quot;: &#x60;New message from ${senderName}&#x60;, &quot;text&quot;: content}, token);</b>
<b>+┊   ┊100┊    }</b>
<b>+┊   ┊101┊</b>
 ┊ 86┊102┊    return {
 ┊ 87┊103┊      messageId: Messages.collection.insert({
 ┊ 88┊104┊        chatId: chatId,
</pre>

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/facebook" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/addressbook")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/addressbook">PREVIOUS STEP</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/facebook">NEXT STEP</a> ⟹

[}]: #

