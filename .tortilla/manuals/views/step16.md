# Step 16: FCM Push Notifications

In this step we are going to implement push notifications using Google's `Firebase Cloud Messaging` (`FCM`). Whenever a user will send you a message, if you don't have our application in the foreground you will get a push notification.

First we will have to create `google-services.json` in our project's root directory:

[{]: <helper> (diffStep 16.1)

#### [Step 16.1: Add google-services.json FCM config](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/f2c9f021)

##### Added google-services.json
```diff
@@ -0,0 +1,42 @@
+┊  ┊ 1┊{
+┊  ┊ 2┊  "project_info": {
+┊  ┊ 3┊    "project_number": "152311690748",
+┊  ┊ 4┊    "firebase_url": "https://meteor-c069e.firebaseio.com",
+┊  ┊ 5┊    "project_id": "meteor-c069e",
+┊  ┊ 6┊    "storage_bucket": "meteor-c069e.appspot.com"
+┊  ┊ 7┊  },
+┊  ┊ 8┊  "client": [
+┊  ┊ 9┊    {
+┊  ┊10┊      "client_info": {
+┊  ┊11┊        "mobilesdk_app_id": "1:152311690748:android:25f0ec3806cf1f01",
+┊  ┊12┊        "android_client_info": {
+┊  ┊13┊          "package_name": "io.ionic.starter"
+┊  ┊14┊        }
+┊  ┊15┊      },
+┊  ┊16┊      "oauth_client": [
+┊  ┊17┊        {
+┊  ┊18┊          "client_id": "152311690748-2ht8fdqhlnv8lsrrvnd7u521j9rcgi3h.apps.googleusercontent.com",
+┊  ┊19┊          "client_type": 3
+┊  ┊20┊        }
+┊  ┊21┊      ],
+┊  ┊22┊      "api_key": [
+┊  ┊23┊        {
+┊  ┊24┊          "current_key": "AIzaSyD9CKsY6bC_a4Equ2HpbcrSErgJ2pheDS4"
+┊  ┊25┊        }
+┊  ┊26┊      ],
+┊  ┊27┊      "services": {
+┊  ┊28┊        "analytics_service": {
+┊  ┊29┊          "status": 1
+┊  ┊30┊        },
+┊  ┊31┊        "appinvite_service": {
+┊  ┊32┊          "status": 1,
+┊  ┊33┊          "other_platform_oauth_client": []
+┊  ┊34┊        },
+┊  ┊35┊        "ads_service": {
+┊  ┊36┊          "status": 2
+┊  ┊37┊        }
+┊  ┊38┊      }
+┊  ┊39┊    }
+┊  ┊40┊  ],
+┊  ┊41┊  "configuration_version": "1"
+┊  ┊42┊}
```

[}]: #

Then we need to install the `FCM` `Cordova` plug-in:

    $ ionic cordova plugin add cordova-plugin-fcm --save
    $ npm install --save @ionic-native/fcm

Then let's add it to `app.module.ts`:

[{]: <helper> (diffStep 16.3)

#### [Step 16.3: Add FCM to app.module.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/d7b4a34f)

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -10,6 +10,7 @@
 ┊10┊10┊import { Camera } from '@ionic-native/camera';
 ┊11┊11┊import { Crop } from '@ionic-native/crop';
 ┊12┊12┊import { Contacts } from "@ionic-native/contacts";
+┊  ┊13┊import { FCM } from "@ionic-native/fcm";
 ┊13┊14┊import { AgmCoreModule } from '@agm/core';
 ┊14┊15┊import { MomentModule } from 'angular2-moment';
 ┊15┊16┊import { ChatsPage } from '../pages/chats/chats';
```
```diff
@@ -77,7 +78,8 @@
 ┊77┊78┊    SmsReceiver,
 ┊78┊79┊    Camera,
 ┊79┊80┊    Crop,
-┊80┊  ┊    Contacts
+┊  ┊81┊    Contacts,
+┊  ┊82┊    FCM
 ┊81┊83┊  ]
 ┊82┊84┊})
 ┊83┊85┊export class AppModule {}
```

[}]: #

Now we can start adding some `FCM` logic into `ChatsPage`:

[{]: <helper> (diffStep 16.4)

#### [Step 16.4: Add FCM logic to ChatsPage](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/8927c7d7)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
```diff
@@ -7,6 +7,7 @@
 ┊ 7┊ 7┊import { MessagesPage } from '../messages/messages';
 ┊ 8┊ 8┊import { ChatsOptionsComponent } from './chats-options';
 ┊ 9┊ 9┊import { NewChatComponent } from './new-chat';
+┊  ┊10┊import { FCM } from "@ionic-native/fcm";
 ┊10┊11┊
 ┊11┊12┊@Component({
 ┊12┊13┊  templateUrl: 'chats.html'
```
```diff
@@ -20,7 +21,8 @@
 ┊20┊21┊    private popoverCtrl: PopoverController,
 ┊21┊22┊    private modalCtrl: ModalController,
 ┊22┊23┊    private alertCtrl: AlertController,
-┊23┊  ┊    private platform: Platform) {
+┊  ┊24┊    private platform: Platform,
+┊  ┊25┊    private fcm: FCM) {
 ┊24┊26┊    this.senderId = Meteor.userId();
 ┊25┊27┊  }
 ┊26┊28┊
```
```diff
@@ -35,6 +37,35 @@
 ┊35┊37┊        this.chats = this.findChats();
 ┊36┊38┊      });
 ┊37┊39┊    });
+┊  ┊40┊
+┊  ┊41┊    // Notifications
+┊  ┊42┊    if (this.platform.is('cordova')) {
+┊  ┊43┊      //this.fcm.subscribeToTopic('news');
+┊  ┊44┊
+┊  ┊45┊      this.fcm.getToken().then(token => {
+┊  ┊46┊        console.log("Registering FCM token on backend");
+┊  ┊47┊        MeteorObservable.call('saveFcmToken', token).subscribe({
+┊  ┊48┊          next: () => console.log("FCM Token saved"),
+┊  ┊49┊          error: err => console.error('Impossible to save FCM token: ', err)
+┊  ┊50┊        });
+┊  ┊51┊      });
+┊  ┊52┊
+┊  ┊53┊      this.fcm.onNotification().subscribe(data => {
+┊  ┊54┊        if (data.wasTapped) {
+┊  ┊55┊          console.log("Received FCM notification in background");
+┊  ┊56┊        } else {
+┊  ┊57┊          console.log("Received FCM notification in foreground");
+┊  ┊58┊        }
+┊  ┊59┊      });
+┊  ┊60┊
+┊  ┊61┊      this.fcm.onTokenRefresh().subscribe(token => {
+┊  ┊62┊        console.log("Updating FCM token on backend");
+┊  ┊63┊        MeteorObservable.call('saveFcmToken', token).subscribe({
+┊  ┊64┊          next: () => console.log("FCM Token updated"),
+┊  ┊65┊          error: err => console.error('Impossible to update FCM token: ' + err)
+┊  ┊66┊        });
+┊  ┊67┊      });
+┊  ┊68┊    }
 ┊38┊69┊  }
 ┊39┊70┊
 ┊40┊71┊  findChats(): Observable<Chat[]> {
```

[}]: #

We used the `saveFcmToken` `Meteor` method, so we need to create it first:

[{]: <helper> (diffStep 16.5)

#### [Step 16.5: Create the saveFcmToken Meteor method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/e0e72145)

##### Changed api&#x2F;server&#x2F;methods.ts
```diff
@@ -2,6 +2,7 @@
 ┊2┊2┊import { Messages } from './collections/messages';
 ┊3┊3┊import { MessageType, Profile } from './models';
 ┊4┊4┊import { check, Match } from 'meteor/check';
+┊ ┊5┊import { Users } from "./collections/users";
 ┊5┊6┊
 ┊6┊7┊const nonEmptyString = Match.Where((str) => {
 ┊7┊8┊  check(str, String);
```
```diff
@@ -94,5 +95,12 @@
 ┊ 94┊ 95┊  },
 ┊ 95┊ 96┊  countMessages(): number {
 ┊ 96┊ 97┊    return Messages.collection.find().count();
+┊   ┊ 98┊  },
+┊   ┊ 99┊  saveFcmToken(token: string): void {
+┊   ┊100┊    if (!this.userId) throw new Meteor.Error('unauthorized', 'User must be logged-in to call this method');
+┊   ┊101┊
+┊   ┊102┊    check(token, nonEmptyString);
+┊   ┊103┊
+┊   ┊104┊    Users.collection.update({_id: this.userId}, {$set: {"fcmToken": token}});
 ┊ 97┊105┊  }
 ┊ 98┊106┊});
```

[}]: #

Since we will soon need the `node-fetch` package, we will need to install it first:

    $ npm install --save node-fetch
    $ npm install --save-dev @types/node-fetch

Let's implement our server side service which will actually send the notification:

[{]: <helper> (diffStep 16.7)

#### [Step 16.7: Store credentials in settings.json](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/17e7fa8b)

##### Changed api&#x2F;private&#x2F;settings.json
```diff
@@ -4,5 +4,10 @@
 ┊ 4┊ 4┊    "verificationRetriesWaitTime": 0,
 ┊ 5┊ 5┊    "adminPhoneNumbers": ["+9721234567", "+97212345678", "+97212345679"],
 ┊ 6┊ 6┊    "phoneVerificationMasterCode": "1234"
+┊  ┊ 7┊  },
+┊  ┊ 8┊  "private": {
+┊  ┊ 9┊    "fcm": {
+┊  ┊10┊      "key": "AIzaSyBnmvN5WNv3rAaLra1RUr9vA5k0pNp0KuY"
+┊  ┊11┊    }
 ┊ 7┊12┊  }
 ┊ 8┊13┊}
```

[}]: #

Now we should edit the `AddMessage` `Meteor` method to use our just-created service to send the notification:

[{]: <helper> (diffStep 16.8)

#### [Step 16.8: Create server side fcm service](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/e4b66ad6)

##### Added api&#x2F;server&#x2F;services&#x2F;fcm.ts
```diff
@@ -0,0 +1,30 @@
+┊  ┊ 1┊import fetch from 'node-fetch';
+┊  ┊ 2┊
+┊  ┊ 3┊export interface FcmNotification {
+┊  ┊ 4┊  title: string;
+┊  ┊ 5┊  text: string;
+┊  ┊ 6┊}
+┊  ┊ 7┊
+┊  ┊ 8┊export class FcmService {
+┊  ┊ 9┊  private key: string = Meteor.settings.private.fcm.key;
+┊  ┊10┊
+┊  ┊11┊  sendNotification(notification: FcmNotification, destination: string) {
+┊  ┊12┊    const body = {
+┊  ┊13┊      notification: notification,
+┊  ┊14┊      to: destination
+┊  ┊15┊    };
+┊  ┊16┊
+┊  ┊17┊    const options = {
+┊  ┊18┊      method: 'POST',
+┊  ┊19┊      body: JSON.stringify(body),
+┊  ┊20┊      headers: {
+┊  ┊21┊        "Content-Type": "application/json",
+┊  ┊22┊        Authorization: `key=${this.key}`
+┊  ┊23┊      },
+┊  ┊24┊    };
+┊  ┊25┊
+┊  ┊26┊    return fetch("https://fcm.googleapis.com/fcm/send", options);
+┊  ┊27┊  }
+┊  ┊28┊}
+┊  ┊29┊
+┊  ┊30┊export const fcmService = new FcmService();
```

[}]: #

Before the `Typescript` compiler complains, let's update our `models`:

[{]: <helper> (diffStep 16.9)

#### [Step 16.9: Update addMessage Meteor method to send fcm notifications](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/529f6acb)

##### Changed api&#x2F;server&#x2F;methods.ts
```diff
@@ -3,6 +3,7 @@
 ┊3┊3┊import { MessageType, Profile } from './models';
 ┊4┊4┊import { check, Match } from 'meteor/check';
 ┊5┊5┊import { Users } from "./collections/users";
+┊ ┊6┊import { fcmService } from "./services/fcm";
 ┊6┊7┊
 ┊7┊8┊const nonEmptyString = Match.Where((str) => {
 ┊8┊9┊  check(str, String);
```
```diff
@@ -83,6 +84,21 @@
 ┊ 83┊ 84┊        'Chat doesn\'t exist');
 ┊ 84┊ 85┊    }
 ┊ 85┊ 86┊
+┊   ┊ 87┊    const userId = this.userId;
+┊   ┊ 88┊    const senderName = Users.collection.findOne({_id: userId}).profile.name;
+┊   ┊ 89┊    const memberIds = Chats.collection.findOne({_id: chatId}).memberIds;
+┊   ┊ 90┊    const tokens: string[] = Users.collection.find(
+┊   ┊ 91┊      {
+┊   ┊ 92┊        _id: {$in: memberIds, $nin: [userId]},
+┊   ┊ 93┊        fcmToken: {$exists: true}
+┊   ┊ 94┊      }
+┊   ┊ 95┊    ).map((el) => el.fcmToken);
+┊   ┊ 96┊
+┊   ┊ 97┊    for (let token of tokens) {
+┊   ┊ 98┊      console.log("Sending FCM notification");
+┊   ┊ 99┊      fcmService.sendNotification({"title": `New message from ${senderName}`, "text": content}, token);
+┊   ┊100┊    }
+┊   ┊101┊
 ┊ 86┊102┊    return {
 ┊ 87┊103┊      messageId: Messages.collection.insert({
 ┊ 88┊104┊        chatId: chatId,
```

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/facebook" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/addressbook")

| [< Previous Step](https://angular-meteor.com/tutorials/whatsapp2/ionic/addressbook) | [Next Step >](https://angular-meteor.com/tutorials/whatsapp2/ionic/facebook) |
|:--------------------------------|--------------------------------:|

[}]: #

