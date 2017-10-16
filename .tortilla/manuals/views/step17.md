# Step 17: Facebook authentication

In this step we are going to implement `Facebook` auth and allow our users to start new chats with their Facebook friends who already use our app.

First we will have to install a couple of Meteor packages:

    api$ meteor add btafel:accounts-facebook-cordova
    api$ meteor add service-configuration

Then we will need to add the `Cordova` plugin `cordova-plugin-facebook4`:

    $ ionic cordova plugin add cordova-plugin-facebook4 --variable APP_ID="1800004730327605" --variable APP_NAME="Meteor - Test1" --save

Now we need to configure `oauth` services using `service-configuration`:

[{]: <helper> (diffStep 17.3)

#### [Step 17.3: Configure oauth services using service-configuration](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/ae5a2810)

##### Changed api&#x2F;server&#x2F;main.ts
```diff
@@ -2,6 +2,7 @@
 ┊2┊2┊import { Picture } from './models';
 ┊3┊3┊import { Accounts } from 'meteor/accounts-base';
 ┊4┊4┊import { Users } from './collections/users';
+┊ ┊5┊declare const ServiceConfiguration: any;
 ┊5┊6┊
 ┊6┊7┊Meteor.startup(() => {
 ┊7┊8┊  if (Meteor.settings) {
```
```diff
@@ -9,6 +10,17 @@
 ┊ 9┊10┊    SMS.twilio = Meteor.settings['twilio'];
 ┊10┊11┊  }
 ┊11┊12┊
+┊  ┊13┊  // Configuring oAuth services
+┊  ┊14┊  const services = Meteor.settings.private.oAuth;
+┊  ┊15┊
+┊  ┊16┊  if (services) {
+┊  ┊17┊    for (let service in services) {
+┊  ┊18┊      ServiceConfiguration.configurations.upsert({service: service}, {
+┊  ┊19┊        $set: services[service]
+┊  ┊20┊      });
+┊  ┊21┊    }
+┊  ┊22┊  }
+┊  ┊23┊
 ┊12┊24┊  if (Users.collection.find().count() > 0) {
 ┊13┊25┊    return;
 ┊14┊26┊  }
```

[}]: #

And store credentials in `settings.json`:

[{]: <helper> (diffStep 17.4)

#### [Step 17.4: Store credentials in settings.json](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/7a500245)

##### Changed api&#x2F;private&#x2F;settings.json
```diff
@@ -5,9 +5,29 @@
 ┊ 5┊ 5┊    "adminPhoneNumbers": ["+9721234567", "+97212345678", "+97212345679"],
 ┊ 6┊ 6┊    "phoneVerificationMasterCode": "1234"
 ┊ 7┊ 7┊  },
+┊  ┊ 8┊  "public": {
+┊  ┊ 9┊    "facebook": {
+┊  ┊10┊      "permissions": [
+┊  ┊11┊        "public_profile",
+┊  ┊12┊        "user_friends",
+┊  ┊13┊        "email"
+┊  ┊14┊      ],
+┊  ┊15┊      "profileFields": [
+┊  ┊16┊        "name",
+┊  ┊17┊        "gender",
+┊  ┊18┊        "location"
+┊  ┊19┊      ]
+┊  ┊20┊    }
+┊  ┊21┊  },
 ┊ 8┊22┊  "private": {
 ┊ 9┊23┊    "fcm": {
 ┊10┊24┊      "key": "AIzaSyBnmvN5WNv3rAaLra1RUr9vA5k0pNp0KuY"
+┊  ┊25┊    },
+┊  ┊26┊    "oAuth": {
+┊  ┊27┊      "facebook": {
+┊  ┊28┊        "appId": "1800004730327605",
+┊  ┊29┊        "secret": "57f57a93e8847896a0b779c0d0cdfa7b"
+┊  ┊30┊      }
 ┊11┊31┊    }
 ┊12┊32┊  }
 ┊13┊33┊}
```

[}]: #

Since `accounts-facebook-cordova` pollutes our user `profile` on `Cordova`, let's filter it in our `ProfilePage`:

[{]: <helper> (diffStep 17.5)

#### [Step 17.5: Filter user profile](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/e6fa60b3)

##### Changed src&#x2F;pages&#x2F;profile&#x2F;profile.ts
```diff
@@ -22,9 +22,10 @@
 ┊22┊22┊  ) {}
 ┊23┊23┊
 ┊24┊24┊  ngOnInit(): void {
-┊25┊  ┊    this.profile = Meteor.user().profile || {
-┊26┊  ┊      name: ''
-┊27┊  ┊    };
+┊  ┊25┊    this.profile = (({name = '', pictureId} = {}) => ({
+┊  ┊26┊      name,
+┊  ┊27┊      pictureId
+┊  ┊28┊    }))(Meteor.user().profile);
 ┊28┊29┊
 ┊29┊30┊    MeteorObservable.subscribe('user').subscribe(() => {
 ┊30┊31┊      let platform = this.platform.is('android') ? "android" :
```

[}]: #

Now we can create a test login method to check if everything works so far:

[{]: <helper> (diffStep 17.6)

#### [Step 17.6: Create a test login method and bind it to the user interface](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/c2b04361)

##### Changed src&#x2F;pages&#x2F;login&#x2F;login.html
```diff
@@ -22,4 +22,10 @@
 ┊22┊22┊  <ion-item>
 ┊23┊23┊    <ion-input [(ngModel)]="phone" (keypress)="onInputKeypress($event)" type="tel" placeholder="Your phone number"></ion-input>
 ┊24┊24┊  </ion-item>
+┊  ┊25┊
+┊  ┊26┊  <ion-item>
+┊  ┊27┊    <ion-buttons>
+┊  ┊28┊      <button ion-button (click)="loginFacebook()">Login with Facebook</button>
+┊  ┊29┊    </ion-buttons>
+┊  ┊30┊  </ion-item>
 ┊25┊31┊</ion-content>
```

##### Changed src&#x2F;pages&#x2F;login&#x2F;login.ts
```diff
@@ -50,6 +50,21 @@
 ┊50┊50┊    alert.present();
 ┊51┊51┊  }
 ┊52┊52┊
+┊  ┊53┊  loginFacebook(): void {
+┊  ┊54┊    const options = {
+┊  ┊55┊      requestPermissions: ['public_profile', 'user_friends', 'email']
+┊  ┊56┊    };
+┊  ┊57┊
+┊  ┊58┊    (<any>Meteor).loginWithFacebook(options, (error: Error) => {
+┊  ┊59┊      if (error) {
+┊  ┊60┊        this.handleError(error);
+┊  ┊61┊      } else {
+┊  ┊62┊        console.log("Logged in with Facebook succesfully.");
+┊  ┊63┊        console.log(Meteor.user());
+┊  ┊64┊      }
+┊  ┊65┊    });
+┊  ┊66┊  }
+┊  ┊67┊
 ┊53┊68┊  handleLogin(alert: Alert): void {
 ┊54┊69┊    alert.dismiss().then(() => {
 ┊55┊70┊      return this.phoneService.verify(this.phone);
```

[}]: #

Facebook callbacks will be handled by the Meteor server, which runs on a different port (3000) than the client. Since the request will come from the client (port 8100) we will face cross origin issues, so we will need to pass every connection through an `Nginx` proxy:

[{]: <helper> (diffStep 17.7)

#### [Step 17.7: Let every connection pass through Nginx](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/dbf7f00f)

##### Changed meteor-client.config.json
```diff
@@ -1,6 +1,7 @@
 ┊1┊1┊{
 ┊2┊2┊  "runtime": {
-┊3┊ ┊    "DDP_DEFAULT_CONNECTION_URL": "http://meteor.linuxsystems.it:3000"
+┊ ┊3┊    "DDP_DEFAULT_CONNECTION_URL": "http://meteor.linuxsystems.it",
+┊ ┊4┊    "ROOT_URL": "http://meteor.linuxsystems.it"
 ┊4┊5┊  },
 ┊5┊6┊  "import": [
 ┊6┊7┊
```

##### Changed package.json
```diff
@@ -9,7 +9,7 @@
 ┊ 9┊ 9┊    "url": "https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp.git"
 ┊10┊10┊  },
 ┊11┊11┊  "scripts": {
-┊12┊  ┊    "api": "cd api && export ROOT_URL=http://meteor.linuxsystems.it:3000 && meteor run --settings private/settings.json",
+┊  ┊12┊    "api": "cd api && export ROOT_URL=http://meteor.linuxsystems.it && meteor run --settings private/settings.json",
 ┊13┊13┊    "api:reset": "cd api && meteor reset",
 ┊14┊14┊    "clean": "ionic-app-scripts clean",
 ┊15┊15┊    "build": "ionic-app-scripts build",
```
```diff
@@ -113,4 +113,4 @@
 ┊113┊113┊      "android"
 ┊114┊114┊    ]
 ┊115┊115┊  }
-┊116┊   ┊}🚫↵
+┊   ┊116┊}
```

[}]: #

`Nginx` will listen on port 80 and redirect our requests to the client (port 8100) or to the server (port 3000) depending on the path. Obviously we will have to install `Nginx`, then we will have to edit its config and restart it:

    server {
      listen 80;
      server_name meteor.linuxsystems.it;

      location / {
        proxy_pass http://meteor.linuxsystems.it:8100;
      }

      location ~ ^/(_oauth|packages|ufs) {
        proxy_pass http://meteor.linuxsystems.it:3000;
      }

      location /sockjs {
        proxy_pass http://meteor.linuxsystems.it:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
      }

      error_page  500 502 503 504  /50x.html;

      location = /50x.html {
        root /usr/share/nginx/html;
      }
    }

From now on we will need to use `meteor.linuxsystems.it` instead of `localhost:8100` to reach our application. You cannot simply use `localhost` or an IP address because the Facebook API necessarily wants a FQDN, so you will have to either point `meteor.linuxsystems.it` to you own IP (for example editing `/etc/hosts`) or simply change you local IP address to match the one resolved by `meteor.linuxsystems.it`.

> Note that if you decide to edit `/etc/hosts` you will have to do so for every device, including your smartphone.

Now that we know that everything works we can remove our login test code:

[{]: <helper> (diffStep 17.8)

#### [Step 17.8: Remove the login test code](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/38a0b007)

##### Changed src&#x2F;pages&#x2F;login&#x2F;login.html
```diff
@@ -22,10 +22,4 @@
 ┊22┊22┊  <ion-item>
 ┊23┊23┊    <ion-input [(ngModel)]="phone" (keypress)="onInputKeypress($event)" type="tel" placeholder="Your phone number"></ion-input>
 ┊24┊24┊  </ion-item>
-┊25┊  ┊
-┊26┊  ┊  <ion-item>
-┊27┊  ┊    <ion-buttons>
-┊28┊  ┊      <button ion-button (click)="loginFacebook()">Login with Facebook</button>
-┊29┊  ┊    </ion-buttons>
-┊30┊  ┊  </ion-item>
 ┊31┊25┊</ion-content>
```

##### Changed src&#x2F;pages&#x2F;login&#x2F;login.ts
```diff
@@ -50,21 +50,6 @@
 ┊50┊50┊    alert.present();
 ┊51┊51┊  }
 ┊52┊52┊
-┊53┊  ┊  loginFacebook(): void {
-┊54┊  ┊    const options = {
-┊55┊  ┊      requestPermissions: ['public_profile', 'user_friends', 'email']
-┊56┊  ┊    };
-┊57┊  ┊
-┊58┊  ┊    (<any>Meteor).loginWithFacebook(options, (error: Error) => {
-┊59┊  ┊      if (error) {
-┊60┊  ┊        this.handleError(error);
-┊61┊  ┊      } else {
-┊62┊  ┊        console.log("Logged in with Facebook succesfully.");
-┊63┊  ┊        console.log(Meteor.user());
-┊64┊  ┊      }
-┊65┊  ┊    });
-┊66┊  ┊  }
-┊67┊  ┊
 ┊68┊53┊  handleLogin(alert: Alert): void {
 ┊69┊54┊    alert.dismiss().then(() => {
 ┊70┊55┊      return this.phoneService.verify(this.phone);
```

[}]: #

Since we need to link our users to their `Facebook` accounts instead of creating brand new accounts, let's add the `darkbasic:link-accounts` `Meteor` package:

    api$ meteor add darkbasic:link-accounts

Now we create the `linkFacebook` method in the `phone` service:

[{]: <helper> (diffStep "17.10")

#### [Step 17.10: Create linkFacebook method in phone service](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/f402102a)

##### Changed src&#x2F;services&#x2F;phone.ts
```diff
@@ -146,6 +146,23 @@
 ┊146┊146┊    });
 ┊147┊147┊  }
 ┊148┊148┊
+┊   ┊149┊  linkFacebook(): Promise<any> {
+┊   ┊150┊    return new Promise((resolve, reject) => {
+┊   ┊151┊      const options = {
+┊   ┊152┊        requestPermissions: ['public_profile', 'user_friends', 'email']
+┊   ┊153┊      };
+┊   ┊154┊
+┊   ┊155┊      // TODO: add link-accounts types to meteor typings
+┊   ┊156┊      (<any>Meteor).linkWithFacebook(options, (error: Error) => {
+┊   ┊157┊        if (error) {
+┊   ┊158┊          reject(new Error(error.message));
+┊   ┊159┊        } else {
+┊   ┊160┊          resolve();
+┊   ┊161┊        }
+┊   ┊162┊      });
+┊   ┊163┊    });
+┊   ┊164┊  }
+┊   ┊165┊
 ┊149┊166┊  logout(): Promise<void> {
 ┊150┊167┊    return new Promise<void>((resolve, reject) => {
 ┊151┊168┊      Meteor.logout((e: Error) => {
```

[}]: #

And `FacebookPage` with its view and style sheet:

[{]: <helper> (diffStep 17.11)

#### [Step 17.11: Create FacebookPage](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/2c578691)

##### Added src&#x2F;pages&#x2F;login&#x2F;facebook.ts
```diff
@@ -0,0 +1,74 @@
+┊  ┊ 1┊import { Component } from "@angular/core";
+┊  ┊ 2┊import { Alert, AlertController, NavController } from "ionic-angular";
+┊  ┊ 3┊import { PhoneService } from "../../services/phone";
+┊  ┊ 4┊import { ProfilePage } from "../profile/profile";
+┊  ┊ 5┊
+┊  ┊ 6┊@Component({
+┊  ┊ 7┊  selector: 'facebook',
+┊  ┊ 8┊  templateUrl: 'facebook.html'
+┊  ┊ 9┊})
+┊  ┊10┊export class FacebookPage {
+┊  ┊11┊
+┊  ┊12┊  constructor(private alertCtrl: AlertController,
+┊  ┊13┊              private phoneService: PhoneService,
+┊  ┊14┊              private navCtrl: NavController) {
+┊  ┊15┊  }
+┊  ┊16┊
+┊  ┊17┊  cancel(): void {
+┊  ┊18┊    const alert: Alert = this.alertCtrl.create({
+┊  ┊19┊      title: 'Confirm',
+┊  ┊20┊      message: `Would you like to proceed without linking your account with Facebook?`,
+┊  ┊21┊      buttons: [
+┊  ┊22┊        {
+┊  ┊23┊          text: 'Cancel',
+┊  ┊24┊          role: 'cancel'
+┊  ┊25┊        },
+┊  ┊26┊        {
+┊  ┊27┊          text: 'Yes',
+┊  ┊28┊          handler: () => {
+┊  ┊29┊            this.dontLink(alert);
+┊  ┊30┊            return false;
+┊  ┊31┊          }
+┊  ┊32┊        }
+┊  ┊33┊      ]
+┊  ┊34┊    });
+┊  ┊35┊
+┊  ┊36┊    alert.present();
+┊  ┊37┊  }
+┊  ┊38┊
+┊  ┊39┊  linkFacebook(): void {
+┊  ┊40┊    this.phoneService.linkFacebook()
+┊  ┊41┊      .then(() => {
+┊  ┊42┊        this.navCtrl.setRoot(ProfilePage, {}, {
+┊  ┊43┊          animate: true
+┊  ┊44┊        });
+┊  ┊45┊      })
+┊  ┊46┊      .catch((e) => {
+┊  ┊47┊        this.handleError(e);
+┊  ┊48┊      });
+┊  ┊49┊  }
+┊  ┊50┊
+┊  ┊51┊  dontLink(alert: Alert): void {
+┊  ┊52┊    alert.dismiss()
+┊  ┊53┊      .then(() => {
+┊  ┊54┊        this.navCtrl.setRoot(ProfilePage, {}, {
+┊  ┊55┊          animate: true
+┊  ┊56┊        });
+┊  ┊57┊      })
+┊  ┊58┊      .catch((e) => {
+┊  ┊59┊        this.handleError(e);
+┊  ┊60┊      });
+┊  ┊61┊  }
+┊  ┊62┊
+┊  ┊63┊  handleError(e: Error): void {
+┊  ┊64┊    console.error(e);
+┊  ┊65┊
+┊  ┊66┊    const alert = this.alertCtrl.create({
+┊  ┊67┊      title: 'Oops!',
+┊  ┊68┊      message: e.message,
+┊  ┊69┊      buttons: ['OK']
+┊  ┊70┊    });
+┊  ┊71┊
+┊  ┊72┊    alert.present();
+┊  ┊73┊  }
+┊  ┊74┊}
```

[}]: #

[{]: <helper> (diffStep 17.12)

#### [Step 17.12: Create FacebookPage View](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/13baaf98)

##### Added src&#x2F;pages&#x2F;login&#x2F;facebook.html
```diff
@@ -0,0 +1,23 @@
+┊  ┊ 1┊<ion-header>
+┊  ┊ 2┊  <ion-navbar color="whatsapp">
+┊  ┊ 3┊    <ion-title>Link with Facebook</ion-title>
+┊  ┊ 4┊
+┊  ┊ 5┊    <ion-buttons end>
+┊  ┊ 6┊      <button ion-button class="done-button" (click)="cancel()">Cancel</button>
+┊  ┊ 7┊    </ion-buttons>
+┊  ┊ 8┊  </ion-navbar>
+┊  ┊ 9┊</ion-header>
+┊  ┊10┊
+┊  ┊11┊<ion-content padding class="login-page-content">
+┊  ┊12┊  <div class="instructions">
+┊  ┊13┊    <div>
+┊  ┊14┊      You can link your account with Facebook to chat with more friends.
+┊  ┊15┊    </div>
+┊  ┊16┊    <br>
+┊  ┊17┊    <ion-item>
+┊  ┊18┊      <ion-buttons>
+┊  ┊19┊        <button ion-button (click)="linkFacebook()">Login with Facebook</button>
+┊  ┊20┊      </ion-buttons>
+┊  ┊21┊    </ion-item>
+┊  ┊22┊  </div>
+┊  ┊23┊</ion-content>
```

[}]: #

[{]: <helper> (diffStep 17.13)

#### [Step 17.13: Create FacebookPage style sheet](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/c61eeb3e)

##### Added src&#x2F;pages&#x2F;login&#x2F;facebook.scss
```diff
@@ -0,0 +1,11 @@
+┊  ┊ 1┊.login-page-content {
+┊  ┊ 2┊  .instructions {
+┊  ┊ 3┊    text-align: center;
+┊  ┊ 4┊    font-size: medium;
+┊  ┊ 5┊    margin: 50px;
+┊  ┊ 6┊  }
+┊  ┊ 7┊
+┊  ┊ 8┊  .text-input {
+┊  ┊ 9┊    text-align: center;
+┊  ┊10┊  }
+┊  ┊11┊}
```

[}]: #

Let's add it to `app.module.ts`:

[{]: <helper> (diffStep 17.14)

#### [Step 17.14: Add FacebookPage to app.module.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/443616bd)

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -23,6 +23,7 @@
 ┊23┊23┊import { NewLocationMessageComponent } from '../pages/messages/location-message';
 ┊24┊24┊import { ShowPictureComponent } from '../pages/messages/show-picture';
 ┊25┊25┊import { ProfilePage } from '../pages/profile/profile';
+┊  ┊26┊import { FacebookPage } from "../pages/login/facebook";
 ┊26┊27┊import { VerificationPage } from '../pages/verification/verification';
 ┊27┊28┊import { PhoneService } from '../services/phone';
 ┊28┊29┊import { PictureService } from '../services/picture';
```
```diff
@@ -36,6 +37,7 @@
 ┊36┊37┊    LoginPage,
 ┊37┊38┊    VerificationPage,
 ┊38┊39┊    ProfilePage,
+┊  ┊40┊    FacebookPage,
 ┊39┊41┊    ChatsOptionsComponent,
 ┊40┊42┊    NewChatComponent,
 ┊41┊43┊    MessagesOptionsComponent,
```
```diff
@@ -59,6 +61,7 @@
 ┊59┊61┊    LoginPage,
 ┊60┊62┊    VerificationPage,
 ┊61┊63┊    ProfilePage,
+┊  ┊64┊    FacebookPage,
 ┊62┊65┊    ChatsOptionsComponent,
 ┊63┊66┊    NewChatComponent,
 ┊64┊67┊    MessagesOptionsComponent,
```

[}]: #

Now we can finally redirect to `FacebookPage` from `VerificationPage` and the `Facebook` account linking should be finally working:

[{]: <helper> (diffStep 17.15)

#### [Step 17.15: Redirect to FacebookPage from the VerificationPage](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/d06f3426)

##### Changed src&#x2F;pages&#x2F;verification&#x2F;verification.ts
```diff
@@ -1,7 +1,7 @@
 ┊1┊1┊import { AfterContentInit, Component, OnInit } from '@angular/core';
 ┊2┊2┊import { AlertController, NavController, NavParams } from 'ionic-angular';
 ┊3┊3┊import { PhoneService } from '../../services/phone';
-┊4┊ ┊import { ProfilePage } from '../profile/profile';
+┊ ┊4┊import { FacebookPage } from "../login/facebook";
 ┊5┊5┊
 ┊6┊6┊@Component({
 ┊7┊7┊  selector: 'verification',
```
```diff
@@ -43,7 +43,7 @@
 ┊43┊43┊
 ┊44┊44┊  verify(): void {
 ┊45┊45┊    this.phoneService.login(this.phone, this.code).then(() => {
-┊46┊  ┊      this.navCtrl.setRoot(ProfilePage, {}, {
+┊  ┊46┊      this.navCtrl.setRoot(FacebookPage, {}, {
 ┊47┊47┊        animate: true
 ┊48┊48┊      });
 ┊49┊49┊    })
```

[}]: #

It's time to fetch our name and profile picture from `Facebook`, as well as listing our `Facebook` friends who we want to chat with.

Let's start by adding the `fb` package:

    $ npm install --save fb

Now we can create our server side `Facebook` service:

[{]: <helper> (diffStep 17.17)

#### [Step 17.17: Create facebook Meteor service](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/81d8474e)

##### Added api&#x2F;server&#x2F;services&#x2F;facebook.ts
```diff
@@ -0,0 +1,104 @@
+┊   ┊  1┊import {Users} from "../collections/users";
+┊   ┊  2┊import {FB} from "fb";
+┊   ┊  3┊
+┊   ┊  4┊export interface FbProfile {
+┊   ┊  5┊  name?: string;
+┊   ┊  6┊  pictureUrl?: string;
+┊   ┊  7┊};
+┊   ┊  8┊
+┊   ┊  9┊export class FacebookService {
+┊   ┊ 10┊  private APP_ID: string = Meteor.settings.private.oAuth.facebook.appId;
+┊   ┊ 11┊  private APP_SECRET: string = Meteor.settings.private.oAuth.facebook.secret;
+┊   ┊ 12┊
+┊   ┊ 13┊  constructor() {
+┊   ┊ 14┊  }
+┊   ┊ 15┊
+┊   ┊ 16┊  async getAppToken(): Promise<string> {
+┊   ┊ 17┊    try {
+┊   ┊ 18┊      return (await FB.api(`/oauth/access_token?client_id=${this.APP_ID}&client_secret=${this.APP_SECRET}&grant_type=client_credentials`)).access_token;
+┊   ┊ 19┊    } catch (e) {
+┊   ┊ 20┊      throw new Meteor.Error('cannot-receive', 'Cannot get an app token');
+┊   ┊ 21┊    }
+┊   ┊ 22┊  }
+┊   ┊ 23┊
+┊   ┊ 24┊//TODO: create a before.insert in the users collection to check if the token is valid
+┊   ┊ 25┊  async tokenIsValid(token: string): Promise<boolean> {
+┊   ┊ 26┊    try {
+┊   ┊ 27┊      return (await FB.api(`debug_token?input_token=${token}&access_token=${await this.getAppToken()}`)).data.is_valid;
+┊   ┊ 28┊    } catch (e) {
+┊   ┊ 29┊      console.error(e);
+┊   ┊ 30┊      return false;
+┊   ┊ 31┊    }
+┊   ┊ 32┊  }
+┊   ┊ 33┊
+┊   ┊ 34┊// Useless because we already got a long lived token
+┊   ┊ 35┊  async getLongLivedToken(token: string): Promise<string> {
+┊   ┊ 36┊    try {
+┊   ┊ 37┊      return (await FB.api(`/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.APP_ID}&client_secret=${this.APP_SECRET}&fb_exchange_token=${token}`)).access_token;
+┊   ┊ 38┊    } catch (e) {
+┊   ┊ 39┊      throw new Meteor.Error('cannot-receive', 'Cannot get a long lived token');
+┊   ┊ 40┊    }
+┊   ┊ 41┊  }
+┊   ┊ 42┊
+┊   ┊ 43┊  async getAccessToken(user: string): Promise<string> {
+┊   ┊ 44┊    //TODO: check if token has expired, if so the user must login again
+┊   ┊ 45┊    try {
+┊   ┊ 46┊      const facebook = await Users.findOne(user).services.facebook;
+┊   ┊ 47┊      if (facebook.accessToken) {
+┊   ┊ 48┊        return facebook.accessToken;
+┊   ┊ 49┊      } else {
+┊   ┊ 50┊        throw new Error();
+┊   ┊ 51┊      }
+┊   ┊ 52┊    } catch (e) {
+┊   ┊ 53┊      throw new Meteor.Error('unauthorized', 'User must be logged-in with Facebook to call this method');
+┊   ┊ 54┊    }
+┊   ┊ 55┊  }
+┊   ┊ 56┊
+┊   ┊ 57┊  async getFriends(accessToken: string, user?: string): Promise<any> {
+┊   ┊ 58┊    //TODO: check if more permissions are needed, if so user must login again
+┊   ┊ 59┊    try {
+┊   ┊ 60┊      const params: any = {
+┊   ┊ 61┊        //fields: 'id,name',
+┊   ┊ 62┊        limit: 5000
+┊   ┊ 63┊      };
+┊   ┊ 64┊      let friends: string[] = [];
+┊   ┊ 65┊      let result: any;
+┊   ┊ 66┊      const fb = FB.withAccessToken(accessToken);
+┊   ┊ 67┊
+┊   ┊ 68┊      do {
+┊   ┊ 69┊        result = await fb.api(`/${user || 'me'}/friends`, params);
+┊   ┊ 70┊        friends = friends.concat(result.data);
+┊   ┊ 71┊        params.after = result.paging && result.paging.cursors && result.paging.cursors.after;
+┊   ┊ 72┊      } while (result.paging && result.paging.next);
+┊   ┊ 73┊
+┊   ┊ 74┊      return friends;
+┊   ┊ 75┊    } catch (e) {
+┊   ┊ 76┊      console.error(e);
+┊   ┊ 77┊      throw new Meteor.Error('cannot-receive', 'Cannot get friends')
+┊   ┊ 78┊    }
+┊   ┊ 79┊  }
+┊   ┊ 80┊
+┊   ┊ 81┊  async getProfile(accessToken: string, user?: string): Promise<FbProfile> {
+┊   ┊ 82┊    //TODO: check if more permissions are needed, if so user must login again
+┊   ┊ 83┊    try {
+┊   ┊ 84┊      const params: any = {
+┊   ┊ 85┊        fields: 'id,name,picture.width(800).height(800)'
+┊   ┊ 86┊      };
+┊   ┊ 87┊
+┊   ┊ 88┊      let profile: FbProfile = {};
+┊   ┊ 89┊
+┊   ┊ 90┊      const fb = FB.withAccessToken(accessToken);
+┊   ┊ 91┊      const result = await fb.api(`/${user || 'me'}`, params);
+┊   ┊ 92┊
+┊   ┊ 93┊      profile.name = result.name;
+┊   ┊ 94┊      profile.pictureUrl = result.picture.data.url;
+┊   ┊ 95┊
+┊   ┊ 96┊      return profile;
+┊   ┊ 97┊    } catch (e) {
+┊   ┊ 98┊      console.error(e);
+┊   ┊ 99┊      throw new Meteor.Error('cannot-receive', 'Cannot get profile')
+┊   ┊100┊    }
+┊   ┊101┊  }
+┊   ┊102┊}
+┊   ┊103┊
+┊   ┊104┊export const facebookService = new FacebookService();
```

[}]: #

And the `getFbProfile` `Meteor` method:

[{]: <helper> (diffStep 17.18)

#### [Step 17.18: Create getFbProfile Meteor method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/aead5f75)

##### Changed api&#x2F;server&#x2F;methods.ts
```diff
@@ -4,6 +4,7 @@
 ┊ 4┊ 4┊import { check, Match } from 'meteor/check';
 ┊ 5┊ 5┊import { Users } from "./collections/users";
 ┊ 6┊ 6┊import { fcmService } from "./services/fcm";
+┊  ┊ 7┊import { facebookService, FbProfile } from "./services/facebook";
 ┊ 7┊ 8┊
 ┊ 8┊ 9┊const nonEmptyString = Match.Where((str) => {
 ┊ 9┊10┊  check(str, String);
```
```diff
@@ -118,5 +119,17 @@
 ┊118┊119┊    check(token, nonEmptyString);
 ┊119┊120┊
 ┊120┊121┊    Users.collection.update({_id: this.userId}, {$set: {"fcmToken": token}});
+┊   ┊122┊  },
+┊   ┊123┊  async getFbProfile(): Promise<FbProfile> {
+┊   ┊124┊    if (!this.userId) throw new Meteor.Error('unauthorized', 'User must be logged-in to call this method');
+┊   ┊125┊
+┊   ┊126┊    if (!Users.collection.findOne({'_id': this.userId}).services.facebook) {
+┊   ┊127┊      throw new Meteor.Error('unauthorized', 'User must be logged-in with Facebook to call this method');
+┊   ┊128┊    }
+┊   ┊129┊
+┊   ┊130┊    //TODO: handle error: token may be expired
+┊   ┊131┊    const accessToken = await facebookService.getAccessToken(this.userId);
+┊   ┊132┊    //TODO: handle error: user may have denied permissions
+┊   ┊133┊    return await facebookService.getProfile(accessToken);
 ┊121┊134┊  }
 ┊122┊135┊});
```

[}]: #

Finally we can update the `FacebookPage` to set the name and the picture from `Facebook`:

[{]: <helper> (diffStep 17.19)

#### [Step 17.19: Update facebook.ts to set name and picture from Facebook](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/f21341d3)

##### Changed src&#x2F;pages&#x2F;login&#x2F;facebook.ts
```diff
@@ -2,6 +2,9 @@
 ┊ 2┊ 2┊import { Alert, AlertController, NavController } from "ionic-angular";
 ┊ 3┊ 3┊import { PhoneService } from "../../services/phone";
 ┊ 4┊ 4┊import { ProfilePage } from "../profile/profile";
+┊  ┊ 5┊import { MeteorObservable } from "meteor-rxjs";
+┊  ┊ 6┊import { FbProfile } from "api/services/facebook";
+┊  ┊ 7┊import { Profile } from "api/models";
 ┊ 5┊ 8┊
 ┊ 6┊ 9┊@Component({
 ┊ 7┊10┊  selector: 'facebook',
```
```diff
@@ -39,8 +42,29 @@
 ┊39┊42┊  linkFacebook(): void {
 ┊40┊43┊    this.phoneService.linkFacebook()
 ┊41┊44┊      .then(() => {
-┊42┊  ┊        this.navCtrl.setRoot(ProfilePage, {}, {
-┊43┊  ┊          animate: true
+┊  ┊45┊        MeteorObservable.call('getFbProfile').subscribe({
+┊  ┊46┊          next: (fbProfile: FbProfile) => {
+┊  ┊47┊            const pathname = (new URL(fbProfile.pictureUrl)).pathname;
+┊  ┊48┊            const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
+┊  ┊49┊            const description = {name: filename};
+┊  ┊50┊            let profile: Profile = {name: fbProfile.name, pictureId: ""};
+┊  ┊51┊            MeteorObservable.call('ufsImportURL', fbProfile.pictureUrl, description, 'pictures')
+┊  ┊52┊              .map((value) => profile.pictureId = (<any>value)._id)
+┊  ┊53┊              .switchMapTo(MeteorObservable.call('updateProfile', profile))
+┊  ┊54┊              .subscribe({
+┊  ┊55┊                next: () => {
+┊  ┊56┊                  this.navCtrl.setRoot(ProfilePage, {}, {
+┊  ┊57┊                    animate: true
+┊  ┊58┊                  });
+┊  ┊59┊                },
+┊  ┊60┊                error: (e: Error) => {
+┊  ┊61┊                  this.handleError(e);
+┊  ┊62┊                }
+┊  ┊63┊              });
+┊  ┊64┊          },
+┊  ┊65┊          error: (e: Error) => {
+┊  ┊66┊            this.handleError(e);
+┊  ┊67┊          }
 ┊44┊68┊        });
 ┊45┊69┊      })
 ┊46┊70┊      .catch((e) => {
```

[}]: #

To use promises inside publications we will install the `promise` `Meteor` package:

    api$ meteor add promise

Now we can update the `users` publication to also publish `Facebook` friends:

[{]: <helper> (diffStep 17.21)

#### [Step 17.21: Update users publication to publish Facebook friends](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/e81cef1a)

##### Changed api&#x2F;server&#x2F;publications.ts
```diff
@@ -3,6 +3,7 @@
 ┊3┊3┊import { Messages } from './collections/messages';
 ┊4┊4┊import { Chats } from './collections/chats';
 ┊5┊5┊import { Pictures } from './collections/pictures';
+┊ ┊6┊import { facebookService } from "./services/facebook";
 ┊6┊7┊
 ┊7┊8┊Meteor.publishComposite('users', function(
 ┊8┊9┊  pattern: string,
```
```diff
@@ -14,11 +15,22 @@
 ┊14┊15┊
 ┊15┊16┊  let selector = {};
 ┊16┊17┊
+┊  ┊18┊  var facebookFriendsIds: string[] = [];
+┊  ┊19┊  if (Users.collection.findOne({'_id': this.userId}).services.facebook) {
+┊  ┊20┊    //FIXME: add definitions for the promise Meteor package
+┊  ┊21┊    //TODO: handle error: token may be expired
+┊  ┊22┊    const accessToken = (<any>Promise).await(facebookService.getAccessToken(this.userId));
+┊  ┊23┊    //TODO: handle error: user may have denied permissions
+┊  ┊24┊    const facebookFriends = (<any>Promise).await(facebookService.getFriends(accessToken));
+┊  ┊25┊    facebookFriendsIds = facebookFriends.map((friend) => friend.id);
+┊  ┊26┊  }
+┊  ┊27┊
 ┊17┊28┊  if (pattern) {
 ┊18┊29┊    selector = {
 ┊19┊30┊      'profile.name': { $regex: pattern, $options: 'i' },
 ┊20┊31┊      $or: [
 ┊21┊32┊        {'phone.number': {$in: contacts}},
+┊  ┊33┊        {'services.facebook.id': {$in: facebookFriendsIds}},
 ┊22┊34┊        {'profile.name': {$in: ['Ethan Gonzalez', 'Bryan Wallace', 'Avery Stewart', 'Katie Peterson', 'Ray Edwards']}}
 ┊23┊35┊      ]
 ┊24┊36┊    };
```
```diff
@@ -26,6 +38,7 @@
 ┊26┊38┊    selector = {
 ┊27┊39┊      $or: [
 ┊28┊40┊        {'phone.number': {$in: contacts}},
+┊  ┊41┊        {'services.facebook.id': {$in: facebookFriendsIds}},
 ┊29┊42┊        {'profile.name': {$in: ['Ethan Gonzalez', 'Bryan Wallace', 'Avery Stewart', 'Katie Peterson', 'Ray Edwards']}}
 ┊30┊43┊      ]
 ┊31┊44┊    }
```

[}]: #

Newest versions of the Facebook APIs don't allow to get a list of all the friends, you can simply get a list of friends who use your Facebook app. So in order to show them in the "New Chat" list they will need to do a Facebook login with our "Whatsapp Clone" application first.

To create test users you can also visit [http://developers.facebook.com](http://developers.facebook.com), select the Facebook app, then under roles there is a test users section where you can create test users. Unfortunately I fear that you will have to be the owner of the Facebook app in order to do so (or at lest be a tester), so you will probably need to create your own Facebook app. The procedure is pretty annoying anyway, because you will have to actually log in as each test user to be able to make them mutual friends.

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/summary" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/push-notifications")

| [< Previous Step](https://angular-meteor.com/tutorials/whatsapp2/ionic/push-notifications) | [Next Step >](https://angular-meteor.com/tutorials/whatsapp2/ionic/summary) |
|:--------------------------------|--------------------------------:|

[}]: #

