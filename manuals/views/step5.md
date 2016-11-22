[{]: <region> (header)
# Step 5: Authentication
[}]: #
[{]: <region> (body)
## Meteor Accounts (Server Side)

In this step we will authenticate and identify users in our app.

Before we go ahead and start extending our app, we will add a few packages which will make our lives a bit less complex when it comes to authentication and users management.

First we will update our Meteor server and add few Meteor packages called `accounts-base` and `accounts-phone` which will give us the ability to verify a user using an SMS code, so run the following inside `api` directory:

    api$ meteor add accounts-base
    api$ meteor add npm-bcrypt
    api$ meteor add mys:accounts-phone

For the sake of debugging we gonna write an authentication settings file (`api/private/settings.json`) which might make our life easier, but once your'e in production mode you *shouldn't* use this configuration:

[{]: <helper> (diff_step 5.2)
#### Step 5.2: Added settings file

##### Added api/private/settings.json
```diff
@@ -0,0 +1,8 @@
+┊ ┊1┊{
+┊ ┊2┊  "accounts-phone": {
+┊ ┊3┊    "verificationWaitTime": 0,
+┊ ┊4┊    "verificationRetriesWaitTime": 0,
+┊ ┊5┊    "adminPhoneNumbers": ["+9721234567", "+97212345678", "+97212345679"],
+┊ ┊6┊    "phoneVerificationMasterCode": "1234"
+┊ ┊7┊  }
+┊ ┊8┊}
```
[}]: #

Now anytime we run our app we should provide it with a `settings.json`:

    $ meteor run --settings private/settings.json

To make it simpler we can add `start` script to `package.json`:

[{]: <helper> (diff_step 5.3)
#### Step 5.3: Updated NPM script

##### Changed package.json
```diff
@@ -4,6 +4,7 @@
 ┊ 4┊ 4┊  "homepage": "http://ionicframework.com/",
 ┊ 5┊ 5┊  "private": true,
 ┊ 6┊ 6┊  "scripts": {
+┊  ┊ 7┊    "api": "cd api && meteor run --settings private/settings.json",
 ┊ 7┊ 8┊    "ionic:build": "ionic-app-scripts build",
 ┊ 8┊ 9┊    "ionic:serve": "ionic-app-scripts serve"
 ┊ 9┊10┊  },
```
[}]: #

> *NOTE*: If you would like to test the verification with a real phone number, `accounts-phone` provides an easy access for [twilio's API](https://www.twilio.com/), for more information see [accounts-phone's repo](https://github.com/okland/accounts-phone).

We will now apply the settings file we've just created so it can actually take effect:

[{]: <helper> (diff_step 5.4)
#### Step 5.4: Define SMS settings

##### Changed api/server/main.ts
```diff
@@ -1,11 +1,17 @@
 ┊ 1┊ 1┊import * as moment from "moment";
 ┊ 2┊ 2┊import { Meteor } from 'meteor/meteor';
+┊  ┊ 3┊import { Accounts } from 'meteor/accounts-base';
 ┊ 3┊ 4┊import { initMethods } from "./methods";
 ┊ 4┊ 5┊import { Chats, Messages } from "../collections/whatsapp-collections";
 ┊ 5┊ 6┊
 ┊ 6┊ 7┊Meteor.startup(() => {
 ┊ 7┊ 8┊  initMethods();
 ┊ 8┊ 9┊
+┊  ┊10┊  if (Meteor.settings) {
+┊  ┊11┊    Object.assign(Accounts._options, Meteor.settings['accounts-phone']);
+┊  ┊12┊    SMS.twilio = Meteor.settings['twilio'];
+┊  ┊13┊  }
+┊  ┊14┊
 ┊ 9┊15┊  if (Chats.find({}).cursor.count() === 0) {
 ┊10┊16┊    let chatId;
```
[}]: #

## Meteor Accounts (Client Side)

Second, we will update the client, and add the corresponding authentication packages to it as well:

    $ npm install --save accounts-base-client-side
    $ npm install --save accounts-phone

Let's import these packages in the app's main component so they can be a part of our bundle:

[{]: <helper> (diff_step 5.5)
#### Step 5.5: Added accounts packages to client side

##### Changed package.json
```diff
@@ -21,6 +21,8 @@
 ┊21┊21┊    "@ionic/storage": "1.1.6",
 ┊22┊22┊    "@types/meteor": "^1.3.31",
 ┊23┊23┊    "@types/underscore": "^1.7.36",
+┊  ┊24┊    "accounts-base-client-side": "^0.1.1",
+┊  ┊25┊    "accounts-phone": "0.0.1",
 ┊24┊26┊    "angular2-moment": "^1.0.0",
 ┊25┊27┊    "babel-runtime": "^6.20.0",
 ┊26┊28┊    "ionic-angular": "2.0.0-rc.4",
```
[}]: #

Install the necessary typings:

    $ npm install --save @types/meteor-accounts-phone

And import them:

[{]: <helper> (diff_step 5.6 src/declarations.d.ts)
#### Step 5.6: Add meteor-accounts-phone type declarations

##### Changed src/declarations.d.ts
```diff
@@ -12,6 +12,7 @@
 ┊12┊12┊  https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
 ┊13┊13┊*/
 ┊14┊14┊/// <reference types="meteor-typings" />
+┊  ┊15┊/// <reference types="@types/meteor-accounts-phone" />
 ┊15┊16┊/// <reference types="@types/underscore" />
 ┊16┊17┊/// <reference path="../api/models/whatsapp-models.d.ts" />
 ┊17┊18┊declare module '*';
```
[}]: #

## UI

For authentication we gonna create the following flow in our app:

- login - The initial page. Ask for the user's phone number.
- verification - Verify a user's phone number by an SMS authentication.
- profile - Ask a user to pickup its name. Afterwards he will be promoted to the tabs page.

Before we implement these pages, we need to identify if a user is currently logged in. If so, he will be automatically promoted to the chats view, if not, he is gonna be promoted to the login view and enter a phone number.

Let's apply this feature to our app's entry script:

[{]: <helper> (diff_step 5.8)
#### Step 5.8: Wait for user if logging in

##### Changed src/app/main.ts
```diff
@@ -4,7 +4,17 @@
 ┊ 4┊ 4┊import 'accounts-phone';
 ┊ 5┊ 5┊
 ┊ 6┊ 6┊import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
-┊ 7┊  ┊
 ┊ 8┊ 7┊import { AppModule } from './app.module';
+┊  ┊ 8┊import { MeteorObservable } from 'meteor-rxjs';
+┊  ┊ 9┊
+┊  ┊10┊Meteor.startup(() => {
+┊  ┊11┊  const sub = MeteorObservable.autorun().subscribe(() => {
+┊  ┊12┊    if (Meteor.loggingIn()) return;
+┊  ┊13┊
+┊  ┊14┊    setTimeout(() => {
+┊  ┊15┊      sub.unsubscribe();
+┊  ┊16┊    });
 ┊ 9┊17┊
-┊10┊  ┊platformBrowserDynamic().bootstrapModule(AppModule);
+┊  ┊18┊    platformBrowserDynamic().bootstrapModule(AppModule);
+┊  ┊19┊  });
+┊  ┊20┊});
```
[}]: #

Great, now that we're set, let's start implementing the views we mentioned earlier.

Let's start by creating the `LoginComponent`. In this component we will request an SMS verification right after a phone number has been entered:

[{]: <helper> (diff_step 5.9)
#### Step 5.9: Create login component

##### Added src/pages/auth/login.ts
```diff
@@ -0,0 +1,67 @@
+┊  ┊ 1┊import { Component } from '@angular/core';
+┊  ┊ 2┊import { NavController, AlertController } from 'ionic-angular';
+┊  ┊ 3┊
+┊  ┊ 4┊@Component({
+┊  ┊ 5┊  selector: 'login',
+┊  ┊ 6┊  templateUrl: "login.html"
+┊  ┊ 7┊})
+┊  ┊ 8┊export class LoginComponent {
+┊  ┊ 9┊  phone = '';
+┊  ┊10┊
+┊  ┊11┊  constructor(
+┊  ┊12┊    public navCtrl: NavController,
+┊  ┊13┊    public alertCtrl: AlertController
+┊  ┊14┊  ) {}
+┊  ┊15┊
+┊  ┊16┊  onInputKeypress({keyCode}: KeyboardEvent): void {
+┊  ┊17┊    if (keyCode == 13) {
+┊  ┊18┊      this.login();
+┊  ┊19┊    }
+┊  ┊20┊  }
+┊  ┊21┊
+┊  ┊22┊  login(): void {
+┊  ┊23┊    const alert = this.alertCtrl.create({
+┊  ┊24┊      title: 'Confirm',
+┊  ┊25┊      message: `Would you like to proceed with the phone number ${this.phone}?`,
+┊  ┊26┊      buttons: [
+┊  ┊27┊        {
+┊  ┊28┊          text: 'Cancel',
+┊  ┊29┊          role: 'cancel'
+┊  ┊30┊        },
+┊  ┊31┊        {
+┊  ┊32┊          text: 'Yes',
+┊  ┊33┊          handler: () => {
+┊  ┊34┊            this.handleLogin(alert);
+┊  ┊35┊            return false;
+┊  ┊36┊          }
+┊  ┊37┊        }
+┊  ┊38┊      ]
+┊  ┊39┊    });
+┊  ┊40┊
+┊  ┊41┊    alert.present();
+┊  ┊42┊  }
+┊  ┊43┊
+┊  ┊44┊  private handleLogin(alert): void {
+┊  ┊45┊    Accounts.requestPhoneVerification(this.phone, (e: Error) => {
+┊  ┊46┊      alert.dismiss().then(() => {
+┊  ┊47┊        if (e) return this.handleError(e);
+┊  ┊48┊
+┊  ┊49┊        // this.navCtrl.push(VerificationComponent, {
+┊  ┊50┊        //   phone: this.phone
+┊  ┊51┊        // });
+┊  ┊52┊      });
+┊  ┊53┊    });
+┊  ┊54┊  }
+┊  ┊55┊
+┊  ┊56┊  private handleError(e: Error): void {
+┊  ┊57┊    console.error(e);
+┊  ┊58┊
+┊  ┊59┊    const alert = this.alertCtrl.create({
+┊  ┊60┊      title: 'Oops!',
+┊  ┊61┊      message: e.message,
+┊  ┊62┊      buttons: ['OK']
+┊  ┊63┊    });
+┊  ┊64┊
+┊  ┊65┊    alert.present();
+┊  ┊66┊  }
+┊  ┊67┊}
```
[}]: #

The `onInputKeypress` handler is used to detect key press events. Once we press the login button, the `login` method is called and shows and alert dialog to confirm the action (See [reference](http://ionicframework.com/docs/v2/components/#alert)). If an error has occurred, the `handlerError` method is called and shows an alert dialog with the received error. If everything went as expected the `handleLogin` method is called. It requests for an SMS verification using `Accounts.requestPhoneVerification`, and promotes us to the verification view.

Hopefully that the component's logic is clear now, let's move to the template:

[{]: <helper> (diff_step 5.10)
#### Step 5.10: Create login component view

##### Added src/pages/auth/login.html
```diff
@@ -0,0 +1,25 @@
+┊  ┊ 1┊<ion-header>
+┊  ┊ 2┊  <ion-navbar color="whatsapp">
+┊  ┊ 3┊    <ion-title>Login</ion-title>
+┊  ┊ 4┊
+┊  ┊ 5┊    <ion-buttons end>
+┊  ┊ 6┊      <button ion-button class="done-button" (click)="login()">Done</button>
+┊  ┊ 7┊    </ion-buttons>
+┊  ┊ 8┊  </ion-navbar>
+┊  ┊ 9┊</ion-header>
+┊  ┊10┊
+┊  ┊11┊<ion-content padding class="login-page-content">
+┊  ┊12┊  <div class="instructions">
+┊  ┊13┊    <div>
+┊  ┊14┊      Please enter your phone number including its country code.
+┊  ┊15┊    </div>
+┊  ┊16┊    <br>
+┊  ┊17┊    <div>
+┊  ┊18┊      The messenger will send a one time SMS message to verify your phone number. Carrier SMS charges may apply.
+┊  ┊19┊    </div>
+┊  ┊20┊  </div>
+┊  ┊21┊
+┊  ┊22┊  <ion-item>
+┊  ┊23┊    <ion-input [(ngModel)]="phone" (keypress)="onInputKeypress($event)" type="tel" placeholder="Your phone number"></ion-input>
+┊  ┊24┊  </ion-item>
+┊  ┊25┊</ion-content>
```
[}]: #

And add some style into it:

[{]: <helper> (diff_step 5.11)
#### Step 5.11: Add login component view style

##### Added src/pages/auth/login.scss
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

As usual, newly created components should be imported in the app's module:

[{]: <helper> (diff_step 5.12)
#### Step 5.12: Add login component to NgModule

##### Changed src/app/app.module.ts
```diff
@@ -5,13 +5,15 @@
 ┊ 5┊ 5┊import { ChatsPage } from "../pages/chats/chats";
 ┊ 6┊ 6┊import { MomentModule } from "angular2-moment";
 ┊ 7┊ 7┊import { MessagesPage } from "../pages/messages/messages";
+┊  ┊ 8┊import { LoginComponent } from "../pages/auth/login";
 ┊ 8┊ 9┊
 ┊ 9┊10┊@NgModule({
 ┊10┊11┊  declarations: [
 ┊11┊12┊    MyApp,
 ┊12┊13┊    ChatsPage,
 ┊13┊14┊    TabsPage,
-┊14┊  ┊    MessagesPage
+┊  ┊15┊    MessagesPage,
+┊  ┊16┊    LoginComponent
 ┊15┊17┊  ],
 ┊16┊18┊  imports: [
 ┊17┊19┊    IonicModule.forRoot(MyApp),
```
```diff
@@ -22,7 +24,8 @@
 ┊22┊24┊    MyApp,
 ┊23┊25┊    ChatsPage,
 ┊24┊26┊    TabsPage,
-┊25┊  ┊    MessagesPage
+┊  ┊27┊    MessagesPage,
+┊  ┊28┊    LoginComponent
 ┊26┊29┊  ],
 ┊27┊30┊  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
 ┊28┊31┊})
```
[}]: #

Now let's add the ability to identify which page should be loaded - the chats page or the login page:

[{]: <helper> (diff_step 5.13)
#### Step 5.13: Add user identifiation in app's main component

##### Changed src/app/app.component.ts
```diff
@@ -1,17 +1,18 @@
 ┊ 1┊ 1┊import { Component } from '@angular/core';
 ┊ 2┊ 2┊import { Platform } from 'ionic-angular';
 ┊ 3┊ 3┊import { StatusBar, Splashscreen } from 'ionic-native';
-┊ 4┊  ┊
 ┊ 5┊ 4┊import { TabsPage } from '../pages/tabs/tabs';
-┊ 6┊  ┊
+┊  ┊ 5┊import { LoginComponent } from '../pages/auth/login';
 ┊ 7┊ 6┊
 ┊ 8┊ 7┊@Component({
 ┊ 9┊ 8┊  templateUrl: 'app.html'
 ┊10┊ 9┊})
 ┊11┊10┊export class MyApp {
-┊12┊  ┊  rootPage = TabsPage;
+┊  ┊11┊  rootPage: any;
 ┊13┊12┊
 ┊14┊13┊  constructor(platform: Platform) {
+┊  ┊14┊    this.rootPage = Meteor.user() ? TabsPage : LoginComponent;
+┊  ┊15┊
 ┊15┊16┊    platform.ready().then(() => {
 ┊16┊17┊      // Okay, so the platform is ready and our plugins are available.
 ┊17┊18┊      // Here you can do any higher level native things you might need.
```
[}]: #

Let's proceed and implement the verification page. We will start by creating its component, called `VerificationComponent`:

[{]: <helper> (diff_step 5.14)
#### Step 5.14: Add verification component

##### Added src/pages/verification/verification.ts
```diff
@@ -0,0 +1,53 @@
+┊  ┊ 1┊import { Component, OnInit, NgZone } from '@angular/core';
+┊  ┊ 2┊import { NavController, NavParams, AlertController } from 'ionic-angular';
+┊  ┊ 3┊import { Accounts } from 'meteor/accounts-base';
+┊  ┊ 4┊
+┊  ┊ 5┊@Component({
+┊  ┊ 6┊  selector: 'verification',
+┊  ┊ 7┊  templateUrl: 'verification.html'
+┊  ┊ 8┊})
+┊  ┊ 9┊export class VerificationComponent implements OnInit {
+┊  ┊10┊  code: string = '';
+┊  ┊11┊  phone: string;
+┊  ┊12┊
+┊  ┊13┊  constructor(
+┊  ┊14┊    public navCtrl: NavController,
+┊  ┊15┊    public alertCtrl: AlertController,
+┊  ┊16┊    public zone: NgZone,
+┊  ┊17┊    public navParams: NavParams
+┊  ┊18┊  ) {}
+┊  ┊19┊
+┊  ┊20┊  ngOnInit() {
+┊  ┊21┊    this.phone = this.navParams.get('phone');
+┊  ┊22┊  }
+┊  ┊23┊
+┊  ┊24┊  onInputKeypress({keyCode}: KeyboardEvent): void {
+┊  ┊25┊    if (keyCode == 13) {
+┊  ┊26┊      this.verify();
+┊  ┊27┊    }
+┊  ┊28┊  }
+┊  ┊29┊
+┊  ┊30┊  verify(): void {
+┊  ┊31┊    Accounts.verifyPhone(this.phone, this.code, (e: Error) => {
+┊  ┊32┊      this.zone.run(() => {
+┊  ┊33┊        if (e) return this.handleError(e);
+┊  ┊34┊
+┊  ┊35┊        // this.navCtrl.setRoot(ProfileComponent, {}, {
+┊  ┊36┊        //   animate: true
+┊  ┊37┊        // });
+┊  ┊38┊      });
+┊  ┊39┊    });
+┊  ┊40┊  }
+┊  ┊41┊
+┊  ┊42┊  private handleError(e: Error): void {
+┊  ┊43┊    console.error(e);
+┊  ┊44┊
+┊  ┊45┊    const alert = this.alertCtrl.create({
+┊  ┊46┊      title: 'Oops!',
+┊  ┊47┊      message: e.message,
+┊  ┊48┊      buttons: ['OK']
+┊  ┊49┊    });
+┊  ┊50┊
+┊  ┊51┊    alert.present();
+┊  ┊52┊  }
+┊  ┊53┊}
```
[}]: #

Logic is pretty much the same as in the login component. When verification succeeds we redirect the user to the `ProfileComponent`. Let's add the view template and the stylesheet:

[{]: <helper> (diff_step 5.15)
#### Step 5.15: Add verification component view

##### Added src/pages/verification/verification.html
```diff
@@ -0,0 +1,25 @@
+┊  ┊ 1┊<ion-header>
+┊  ┊ 2┊  <ion-navbar color="whatsapp">
+┊  ┊ 3┊    <ion-title>Verification</ion-title>
+┊  ┊ 4┊
+┊  ┊ 5┊    <ion-buttons end>
+┊  ┊ 6┊      <button ion-button class="verify-button" (click)="verify()">Verify</button>
+┊  ┊ 7┊    </ion-buttons>
+┊  ┊ 8┊  </ion-navbar>
+┊  ┊ 9┊</ion-header>
+┊  ┊10┊
+┊  ┊11┊<ion-content padding class="verification-page-content">
+┊  ┊12┊  <div class="instructions">
+┊  ┊13┊    <div>
+┊  ┊14┊      An SMS message with the verification code has been sent to {{phone}}.
+┊  ┊15┊    </div>
+┊  ┊16┊    <br>
+┊  ┊17┊    <div>
+┊  ┊18┊      To proceed, please enter the 4-digit verification code below.
+┊  ┊19┊    </div>
+┊  ┊20┊  </div>
+┊  ┊21┊
+┊  ┊22┊  <ion-item>
+┊  ┊23┊    <ion-input [(ngModel)]="code" (keypress)="onInputKeypress($event)" type="tel" placeholder="Your verification code"></ion-input>
+┊  ┊24┊  </ion-item>
+┊  ┊25┊</ion-content>
```
[}]: #

[{]: <helper> (diff_step 5.16)
#### Step 5.16: Add verification component styles

##### Added src/pages/verification/verification.scss
```diff
@@ -0,0 +1,11 @@
+┊  ┊ 1┊.verification-page-content {
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

And add it to the NgModule:

[{]: <helper> (diff_step 5.17)
#### Step 5.17: Add VerificationComponent to NgModule

##### Changed src/app/app.module.ts
```diff
@@ -6,6 +6,7 @@
 ┊ 6┊ 6┊import { MomentModule } from "angular2-moment";
 ┊ 7┊ 7┊import { MessagesPage } from "../pages/messages/messages";
 ┊ 8┊ 8┊import { LoginComponent } from "../pages/auth/login";
+┊  ┊ 9┊import { VerificationComponent } from "../pages/verification/verification";
 ┊ 9┊10┊
 ┊10┊11┊@NgModule({
 ┊11┊12┊  declarations: [
```
```diff
@@ -13,7 +14,8 @@
 ┊13┊14┊    ChatsPage,
 ┊14┊15┊    TabsPage,
 ┊15┊16┊    MessagesPage,
-┊16┊  ┊    LoginComponent
+┊  ┊17┊    LoginComponent,
+┊  ┊18┊    VerificationComponent
 ┊17┊19┊  ],
 ┊18┊20┊  imports: [
 ┊19┊21┊    IonicModule.forRoot(MyApp),
```
```diff
@@ -25,7 +27,8 @@
 ┊25┊27┊    ChatsPage,
 ┊26┊28┊    TabsPage,
 ┊27┊29┊    MessagesPage,
-┊28┊  ┊    LoginComponent
+┊  ┊30┊    LoginComponent,
+┊  ┊31┊    VerificationComponent
 ┊29┊32┊  ],
 ┊30┊33┊  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
 ┊31┊34┊})
```
[}]: #

And now that we have the `VerificationComponent` we can use it inside the `LoginComponent`:

[{]: <helper> (diff_step 5.18)
#### Step 5.18: Add navigation to verification page from the login component

##### Changed src/pages/auth/login.ts
```diff
@@ -1,5 +1,6 @@
 ┊1┊1┊import { Component } from '@angular/core';
 ┊2┊2┊import { NavController, AlertController } from 'ionic-angular';
+┊ ┊3┊import { VerificationComponent } from "../verification/verification";
 ┊3┊4┊
 ┊4┊5┊@Component({
 ┊5┊6┊  selector: 'login',
```
```diff
@@ -46,9 +47,9 @@
 ┊46┊47┊      alert.dismiss().then(() => {
 ┊47┊48┊        if (e) return this.handleError(e);
 ┊48┊49┊
-┊49┊  ┊        // this.navCtrl.push(VerificationComponent, {
-┊50┊  ┊        //   phone: this.phone
-┊51┊  ┊        // });
+┊  ┊50┊        this.navCtrl.push(VerificationComponent, {
+┊  ┊51┊          phone: this.phone
+┊  ┊52┊        });
 ┊52┊53┊      });
 ┊53┊54┊    });
 ┊54┊55┊  }
```
[}]: #

Last step of our authentication pattern is to pickup a name. We will create a `Profile` interface so the compiler can recognize profile-data structures:

[{]: <helper> (diff_step 5.19)
#### Step 5.19: Add profile model decleration

##### Changed api/models/whatsapp-models.d.ts
```diff
@@ -1,4 +1,9 @@
 ┊1┊1┊declare module 'api/models/whatsapp-models' {
+┊ ┊2┊  interface Profile {
+┊ ┊3┊    name?: string;
+┊ ┊4┊    picture?: string;
+┊ ┊5┊  }
+┊ ┊6┊
 ┊2┊7┊  interface Chat {
 ┊3┊8┊    _id?: string;
 ┊4┊9┊    title?: string;
```
[}]: #

And let's create the `ProfileComponent`:

[{]: <helper> (diff_step 5.20)
#### Step 5.20: Add profile component

##### Added src/pages/profile/profile.ts
```diff
@@ -0,0 +1,48 @@
+┊  ┊ 1┊import { Component, OnInit } from '@angular/core';
+┊  ┊ 2┊import { NavController, AlertController } from 'ionic-angular';
+┊  ┊ 3┊import { MeteorObservable } from 'meteor-rxjs';
+┊  ┊ 4┊import { Profile } from 'api/models/whatsapp-models';
+┊  ┊ 5┊import { TabsPage } from "../tabs/tabs";
+┊  ┊ 6┊
+┊  ┊ 7┊@Component({
+┊  ┊ 8┊  selector: 'profile',
+┊  ┊ 9┊  templateUrl: 'profile.html'
+┊  ┊10┊})
+┊  ┊11┊export class ProfileComponent implements OnInit {
+┊  ┊12┊  profile: Profile;
+┊  ┊13┊
+┊  ┊14┊  constructor(
+┊  ┊15┊    public navCtrl: NavController,
+┊  ┊16┊    public alertCtrl: AlertController
+┊  ┊17┊  ) {}
+┊  ┊18┊
+┊  ┊19┊  ngOnInit(): void {
+┊  ┊20┊    this.profile = Meteor.user().profile || {
+┊  ┊21┊      name: '',
+┊  ┊22┊      picture: '/ionicons/dist/svg/ios-contact.svg'
+┊  ┊23┊    };
+┊  ┊24┊  }
+┊  ┊25┊
+┊  ┊26┊  done(): void {
+┊  ┊27┊    MeteorObservable.call('updateProfile', this.profile).subscribe({
+┊  ┊28┊      next: () => {
+┊  ┊29┊        this.navCtrl.push(TabsPage);
+┊  ┊30┊      },
+┊  ┊31┊      error: (e: Error) => {
+┊  ┊32┊        this.handleError(e);
+┊  ┊33┊      }
+┊  ┊34┊    });
+┊  ┊35┊  }
+┊  ┊36┊
+┊  ┊37┊  private handleError(e: Error): void {
+┊  ┊38┊    console.error(e);
+┊  ┊39┊
+┊  ┊40┊    const alert = this.alertCtrl.create({
+┊  ┊41┊      title: 'Oops!',
+┊  ┊42┊      message: e.message,
+┊  ┊43┊      buttons: ['OK']
+┊  ┊44┊    });
+┊  ┊45┊
+┊  ┊46┊    alert.present();
+┊  ┊47┊  }
+┊  ┊48┊}
```
[}]: #

The logic is simple. We call the `updateProfile` method and redirect the user to the `TabsPage` if the action succeeded. The `updateProfile` method should look like so:

[{]: <helper> (diff_step 5.21)
#### Step 5.21: Added updateProfile method

##### Changed api/server/methods.ts
```diff
@@ -1,6 +1,7 @@
 ┊1┊1┊import { Meteor } from 'meteor/meteor';
 ┊2┊2┊import { Chats, Messages } from "../collections/whatsapp-collections";
 ┊3┊3┊import { check, Match } from "meteor/check";
+┊ ┊4┊import { Profile } from "api/models/whatsapp-models";
 ┊4┊5┊
 ┊5┊6┊const nonEmptyString = Match.Where((str) => {
 ┊6┊7┊  check(str, String);
```
```diff
@@ -9,6 +10,19 @@
 ┊ 9┊10┊
 ┊10┊11┊export function initMethods() {
 ┊11┊12┊  Meteor.methods({
+┊  ┊13┊    updateProfile(profile: Profile): void {
+┊  ┊14┊      if (!this.userId) throw new Meteor.Error('unauthorized',
+┊  ┊15┊        'User must be logged-in to create a new chat');
+┊  ┊16┊
+┊  ┊17┊      check(profile, {
+┊  ┊18┊        name: nonEmptyString,
+┊  ┊19┊        picture: nonEmptyString
+┊  ┊20┊      });
+┊  ┊21┊
+┊  ┊22┊      Meteor.users.update(this.userId, {
+┊  ┊23┊        $set: {profile}
+┊  ┊24┊      });
+┊  ┊25┊    },
 ┊12┊26┊    addMessage(chatId: string, content: string) {
 ┊13┊27┊      check(chatId, nonEmptyString);
 ┊14┊28┊      check(content, nonEmptyString);
```
[}]: #

If you'll take a look at the constructor's logic of the `ProfileComponent` we set the default profile picture to be one of ionicon's svgs. We need to make sure there is an access point available through the network to that asset. If we'd like to serve files as-is we simply gonna add them to the `www` dir. But first we'll need to update our `.gitignore` file to contain the upcoming changes:

[{]: <helper> (diff_step 5.22)
#### Step 5.22: Add ionicons to .gitignore

##### Changed .gitignore
```diff
@@ -26,7 +26,8 @@
 ┊26┊26┊plugins/
 ┊27┊27┊plugins/android.json
 ┊28┊28┊plugins/ios.json
-┊29┊  ┊www/
+┊  ┊29┊www/*
+┊  ┊30┊!www/ionicons
 ┊30┊31┊$RECYCLE.BIN/
 ┊31┊32┊
 ┊32┊33┊.DS_Store
```
[}]: #

And now that git can recognize our changes, let's add a symlink to `ionicons` in the `www` dir:

    www$ ln -s ../node_modules/ionicons

Now we can implement the view and the stylesheet:

[{]: <helper> (diff_step 5.24)
#### Step 5.24: Add profile component view

##### Added src/pages/profile/profile.html
```diff
@@ -0,0 +1,21 @@
+┊  ┊ 1┊<ion-header>
+┊  ┊ 2┊  <ion-navbar color="whatsapp">
+┊  ┊ 3┊    <ion-title>Profile</ion-title>
+┊  ┊ 4┊
+┊  ┊ 5┊    <ion-buttons end>
+┊  ┊ 6┊      <button ion-button class="done-button" (click)="done()">Done</button>
+┊  ┊ 7┊    </ion-buttons>
+┊  ┊ 8┊  </ion-navbar>
+┊  ┊ 9┊</ion-header>
+┊  ┊10┊
+┊  ┊11┊<ion-content class="profile-page-content">
+┊  ┊12┊  <div class="profile-picture">
+┊  ┊13┊    <img [src]="profile.picture">
+┊  ┊14┊    <ion-icon name="create"></ion-icon>
+┊  ┊15┊  </div>
+┊  ┊16┊
+┊  ┊17┊  <ion-item class="profile-name">
+┊  ┊18┊    <ion-label stacked>Name</ion-label>
+┊  ┊19┊    <ion-input [(ngModel)]="profile.name" placeholder="Your name"></ion-input>
+┊  ┊20┊  </ion-item>
+┊  ┊21┊</ion-content>
```
[}]: #

[{]: <helper> (diff_step 5.25)
#### Step 5.25: Add profile component view style

##### Added src/pages/profile/profile.scss
```diff
@@ -0,0 +1,20 @@
+┊  ┊ 1┊.profile-page-content {
+┊  ┊ 2┊  .profile-picture {
+┊  ┊ 3┊    max-width: 300px;
+┊  ┊ 4┊    display: block;
+┊  ┊ 5┊    margin: auto;
+┊  ┊ 6┊
+┊  ┊ 7┊    img {
+┊  ┊ 8┊      margin-bottom: -33px;
+┊  ┊ 9┊      width: 100%;
+┊  ┊10┊    }
+┊  ┊11┊
+┊  ┊12┊    ion-icon {
+┊  ┊13┊      float: right;
+┊  ┊14┊      font-size: 30px;
+┊  ┊15┊      opacity: 0.5;
+┊  ┊16┊      border-left: black solid 1px;
+┊  ┊17┊      padding-left: 5px;
+┊  ┊18┊    }
+┊  ┊19┊  }
+┊  ┊20┊}
```
[}]: #

Import our newly created component:

[{]: <helper> (diff_step 5.26)
#### Step 5.26: Add profile component to NgModule

##### Changed src/app/app.module.ts
```diff
@@ -7,6 +7,7 @@
 ┊ 7┊ 7┊import { MessagesPage } from "../pages/messages/messages";
 ┊ 8┊ 8┊import { LoginComponent } from "../pages/auth/login";
 ┊ 9┊ 9┊import { VerificationComponent } from "../pages/verification/verification";
+┊  ┊10┊import { ProfileComponent } from "../pages/profile/profile";
 ┊10┊11┊
 ┊11┊12┊@NgModule({
 ┊12┊13┊  declarations: [
```
```diff
@@ -15,7 +16,8 @@
 ┊15┊16┊    TabsPage,
 ┊16┊17┊    MessagesPage,
 ┊17┊18┊    LoginComponent,
-┊18┊  ┊    VerificationComponent
+┊  ┊19┊    VerificationComponent,
+┊  ┊20┊    ProfileComponent
 ┊19┊21┊  ],
 ┊20┊22┊  imports: [
 ┊21┊23┊    IonicModule.forRoot(MyApp),
```
```diff
@@ -28,7 +30,8 @@
 ┊28┊30┊    TabsPage,
 ┊29┊31┊    MessagesPage,
 ┊30┊32┊    LoginComponent,
-┊31┊  ┊    VerificationComponent
+┊  ┊33┊    VerificationComponent,
+┊  ┊34┊    ProfileComponent
 ┊32┊35┊  ],
 ┊33┊36┊  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
 ┊34┊37┊})
```
[}]: #

And use it in the `VerificationComponent`:

[{]: <helper> (diff_step 5.27)
#### Step 5.27: Add profile component to verification navigation

##### Changed src/pages/verification/verification.ts
```diff
@@ -1,6 +1,7 @@
 ┊1┊1┊import { Component, OnInit, NgZone } from '@angular/core';
 ┊2┊2┊import { NavController, NavParams, AlertController } from 'ionic-angular';
 ┊3┊3┊import { Accounts } from 'meteor/accounts-base';
+┊ ┊4┊import { ProfileComponent } from "../profile/profile";
 ┊4┊5┊
 ┊5┊6┊@Component({
 ┊6┊7┊  selector: 'verification',
```
```diff
@@ -32,9 +33,9 @@
 ┊32┊33┊      this.zone.run(() => {
 ┊33┊34┊        if (e) return this.handleError(e);
 ┊34┊35┊
-┊35┊  ┊        // this.navCtrl.setRoot(ProfileComponent, {}, {
-┊36┊  ┊        //   animate: true
-┊37┊  ┊        // });
+┊  ┊36┊        this.navCtrl.setRoot(ProfileComponent, {}, {
+┊  ┊37┊          animate: true
+┊  ┊38┊        });
 ┊38┊39┊      });
 ┊39┊40┊    });
 ┊40┊41┊  }
```
[}]: #

Our authentication flow is complete! However there are some few adjustments we need to make before we proceed to the next step. For the messaging system, each message should have an owner. If a user is logged-in a message document should be inserted with an additional `senderId` field:

[{]: <helper> (diff_step 5.28)
#### Step 5.28: Add senderId property to addMessage method

##### Changed api/server/methods.ts
```diff
@@ -24,6 +24,9 @@
 ┊24┊24┊      });
 ┊25┊25┊    },
 ┊26┊26┊    addMessage(chatId: string, content: string) {
+┊  ┊27┊      if (!this.userId) throw new Meteor.Error('unauthorized',
+┊  ┊28┊        'User must be logged-in to create a new chat');
+┊  ┊29┊
 ┊27┊30┊      check(chatId, nonEmptyString);
 ┊28┊31┊      check(content, nonEmptyString);
 ┊29┊32┊
```
```diff
@@ -34,6 +37,7 @@
 ┊34┊37┊
 ┊35┊38┊      return {
 ┊36┊39┊        messageId: Messages.collection.insert({
+┊  ┊40┊          senderId: this.userId,
 ┊37┊41┊          chatId: chatId,
 ┊38┊42┊          content: content,
 ┊39┊43┊          createdAt: new Date()
```
[}]: #

[{]: <helper> (diff_step 5.29)
#### Step 5.29: Add it also to the model

##### Changed api/models/whatsapp-models.d.ts
```diff
@@ -17,5 +17,6 @@
 ┊17┊17┊    content?: string;
 ┊18┊18┊    createdAt?: Date;
 ┊19┊19┊    ownership?: string;
+┊  ┊20┊    senderId?: string;
 ┊20┊21┊  }
 ┊21┊22┊}
```
[}]: #

We can determine message ownership inside the component:

[{]: <helper> (diff_step 5.30)
#### Step 5.30: Determine message ownership based on sender id

##### Changed src/pages/messages/messages.ts
```diff
@@ -16,11 +16,14 @@
 ┊16┊16┊  messages: Observable<Message[]>;
 ┊17┊17┊  message: string = "";
 ┊18┊18┊  autoScroller: MutationObserver;
+┊  ┊19┊  senderId: string;
 ┊19┊20┊
 ┊20┊21┊  constructor(navParams: NavParams, element: ElementRef) {
 ┊21┊22┊    this.selectedChat = <Chat>navParams.get('chat');
 ┊22┊23┊    this.title = this.selectedChat.title;
 ┊23┊24┊    this.picture = this.selectedChat.picture;
+┊  ┊25┊    this.senderId = Meteor.userId();
+┊  ┊26┊
 ┊24┊27┊  }
 ┊25┊28┊
 ┊26┊29┊  private get messagesPageContent(): Element {
```
```diff
@@ -44,15 +47,12 @@
 ┊44┊47┊  }
 ┊45┊48┊
 ┊46┊49┊  ngOnInit() {
-┊47┊  ┊    let isEven = false;
-┊48┊  ┊
 ┊49┊50┊    this.messages = Messages.find(
 ┊50┊51┊      {chatId: this.selectedChat._id},
 ┊51┊52┊      {sort: {createdAt: 1}}
 ┊52┊53┊    ).map((messages: Message[]) => {
 ┊53┊54┊      messages.forEach((message: Message) => {
-┊54┊  ┊        message.ownership = isEven ? 'mine' : 'other';
-┊55┊  ┊        isEven = !isEven;
+┊  ┊55┊        message.ownership = this.senderId == message.senderId ? 'mine' : 'other';
 ┊56┊56┊      });
 ┊57┊57┊
 ┊58┊58┊      return messages;
```
[}]: #

Now we're going to add the abilities to log-out and edit our profile as well, which are going to be presented to us using a popover. Let's show a [popover](http://ionicframework.com/docs/v2/components/#popovers) any time we press on the options icon in the top right corner of the chats view.

A popover, just like a page in our app, consists of a component, view, and style:

[{]: <helper> (diff_step 5.31)
#### Step 5.31: Add chats-options component

##### Added src/pages/chat-options/chat-options.ts
```diff
@@ -0,0 +1,70 @@
+┊  ┊ 1┊import { Component } from '@angular/core';
+┊  ┊ 2┊import { NavController, ViewController, AlertController } from 'ionic-angular';
+┊  ┊ 3┊import { ProfileComponent } from '../profile/profile';
+┊  ┊ 4┊import { LoginComponent } from '../auth/login';
+┊  ┊ 5┊
+┊  ┊ 6┊@Component({
+┊  ┊ 7┊  selector: 'chats-options',
+┊  ┊ 8┊  templateUrl: 'chat-options.html'
+┊  ┊ 9┊})
+┊  ┊10┊export class ChatsOptionsComponent {
+┊  ┊11┊  constructor(
+┊  ┊12┊    public navCtrl: NavController,
+┊  ┊13┊    public viewCtrl: ViewController,
+┊  ┊14┊    public alertCtrl: AlertController
+┊  ┊15┊  ) {}
+┊  ┊16┊
+┊  ┊17┊  editProfile(): void {
+┊  ┊18┊    this.viewCtrl.dismiss().then(() => {
+┊  ┊19┊      this.navCtrl.push(ProfileComponent);
+┊  ┊20┊    });
+┊  ┊21┊  }
+┊  ┊22┊
+┊  ┊23┊  logout(): void {
+┊  ┊24┊    const alert = this.alertCtrl.create({
+┊  ┊25┊      title: 'Logout',
+┊  ┊26┊      message: 'Are you sure you would like to proceed?',
+┊  ┊27┊      buttons: [
+┊  ┊28┊        {
+┊  ┊29┊          text: 'Cancel',
+┊  ┊30┊          role: 'cancel'
+┊  ┊31┊        },
+┊  ┊32┊        {
+┊  ┊33┊          text: 'Yes',
+┊  ┊34┊          handler: () => {
+┊  ┊35┊            this.handleLogout(alert);
+┊  ┊36┊            return false;
+┊  ┊37┊          }
+┊  ┊38┊        }
+┊  ┊39┊      ]
+┊  ┊40┊    });
+┊  ┊41┊
+┊  ┊42┊    this.viewCtrl.dismiss().then(() => {
+┊  ┊43┊      alert.present();
+┊  ┊44┊    });
+┊  ┊45┊  }
+┊  ┊46┊
+┊  ┊47┊  private handleLogout(alert): void {
+┊  ┊48┊    Meteor.logout((e: Error) => {
+┊  ┊49┊      alert.dismiss().then(() => {
+┊  ┊50┊        if (e) return this.handleError(e);
+┊  ┊51┊
+┊  ┊52┊        this.navCtrl.setRoot(LoginComponent, {}, {
+┊  ┊53┊          animate: true
+┊  ┊54┊        });
+┊  ┊55┊      });
+┊  ┊56┊    });
+┊  ┊57┊  }
+┊  ┊58┊
+┊  ┊59┊  private handleError(e: Error): void {
+┊  ┊60┊    console.error(e);
+┊  ┊61┊
+┊  ┊62┊    const alert = this.alertCtrl.create({
+┊  ┊63┊      title: 'Oops!',
+┊  ┊64┊      message: e.message,
+┊  ┊65┊      buttons: ['OK']
+┊  ┊66┊    });
+┊  ┊67┊
+┊  ┊68┊    alert.present();
+┊  ┊69┊  }
+┊  ┊70┊}
```
[}]: #

[{]: <helper> (diff_step 5.32)
#### Step 5.32: Add chats-options component view

##### Added src/pages/chat-options/chat-options.html
```diff
@@ -0,0 +1,18 @@
+┊  ┊ 1┊<ion-content class="chats-options-page-content">
+┊  ┊ 2┊  <ion-list class="options">
+┊  ┊ 3┊    <button ion-item class="option option-profile" (click)="editProfile()">
+┊  ┊ 4┊      <ion-icon name="contact" class="option-icon"></ion-icon>
+┊  ┊ 5┊      <div class="option-name">Profile</div>
+┊  ┊ 6┊    </button>
+┊  ┊ 7┊
+┊  ┊ 8┊    <button ion-item class="option option-about">
+┊  ┊ 9┊      <ion-icon name="information-circle" class="option-icon"></ion-icon>
+┊  ┊10┊      <div class="option-name">About</div>
+┊  ┊11┊    </button>
+┊  ┊12┊
+┊  ┊13┊    <button ion-item class="option option-logout" (click)="logout()">
+┊  ┊14┊      <ion-icon name="log-out" class="option-icon"></ion-icon>
+┊  ┊15┊      <div class="option-name">Logout</div>
+┊  ┊16┊    </button>
+┊  ┊17┊  </ion-list>
+┊  ┊18┊</ion-content>
```
[}]: #

[{]: <helper> (diff_step 5.33)
#### Step 5.33: Add chats-options component view style

##### Added src/pages/chat-options/chat-options.scss
```diff
@@ -0,0 +1,13 @@
+┊  ┊ 1┊.chats-options-page-content {
+┊  ┊ 2┊  .options {
+┊  ┊ 3┊    margin: 0;
+┊  ┊ 4┊  }
+┊  ┊ 5┊
+┊  ┊ 6┊  .option-name {
+┊  ┊ 7┊    float: left;
+┊  ┊ 8┊  }
+┊  ┊ 9┊
+┊  ┊10┊  .option-icon {
+┊  ┊11┊    float: right;
+┊  ┊12┊  }
+┊  ┊13┊}
```
[}]: #

[{]: <helper> (diff_step 5.34)
#### Step 5.34: Add chats-options component to the module definition

##### Changed src/app/app.module.ts
```diff
@@ -8,6 +8,7 @@
 ┊ 8┊ 8┊import { LoginComponent } from "../pages/auth/login";
 ┊ 9┊ 9┊import { VerificationComponent } from "../pages/verification/verification";
 ┊10┊10┊import { ProfileComponent } from "../pages/profile/profile";
+┊  ┊11┊import { ChatsOptionsComponent } from "../pages/chat-options/chat-options";
 ┊11┊12┊
 ┊12┊13┊@NgModule({
 ┊13┊14┊  declarations: [
```
```diff
@@ -17,7 +18,8 @@
 ┊17┊18┊    MessagesPage,
 ┊18┊19┊    LoginComponent,
 ┊19┊20┊    VerificationComponent,
-┊20┊  ┊    ProfileComponent
+┊  ┊21┊    ProfileComponent,
+┊  ┊22┊    ChatsOptionsComponent
 ┊21┊23┊  ],
 ┊22┊24┊  imports: [
 ┊23┊25┊    IonicModule.forRoot(MyApp),
```
```diff
@@ -31,7 +33,8 @@
 ┊31┊33┊    MessagesPage,
 ┊32┊34┊    LoginComponent,
 ┊33┊35┊    VerificationComponent,
-┊34┊  ┊    ProfileComponent
+┊  ┊36┊    ProfileComponent,
+┊  ┊37┊    ChatsOptionsComponent
 ┊35┊38┊  ],
 ┊36┊39┊  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
 ┊37┊40┊})
```
[}]: #

Now let's use it inside the `ChatsPage`:

[{]: <helper> (diff_step 5.35)
#### Step 5.35: Use the popover component

##### Changed src/pages/chats/chats.ts
```diff
@@ -2,8 +2,9 @@
 ┊ 2┊ 2┊import { Observable } from "rxjs";
 ┊ 3┊ 3┊import { Chat } from "api/models/whatsapp-models";
 ┊ 4┊ 4┊import { Chats, Messages } from "api/collections/whatsapp-collections";
-┊ 5┊  ┊import { NavController } from "ionic-angular";
+┊  ┊ 5┊import { NavController, PopoverController } from "ionic-angular";
 ┊ 6┊ 6┊import { MessagesPage } from "../messages/messages";
+┊  ┊ 7┊import { ChatsOptionsComponent } from "../chat-options/chat-options";
 ┊ 7┊ 8┊
 ┊ 8┊ 9┊@Component({
 ┊ 9┊10┊  templateUrl: 'chats.html'
```
```diff
@@ -11,7 +12,7 @@
 ┊11┊12┊export class ChatsPage implements OnInit {
 ┊12┊13┊  chats;
 ┊13┊14┊
-┊14┊  ┊  constructor(private navCtrl: NavController) {
+┊  ┊15┊  constructor(public navCtrl: NavController, public popoverCtrl: PopoverController) {
 ┊15┊16┊
 ┊16┊17┊  }
 ┊17┊18┊
```
```diff
@@ -33,6 +34,14 @@
 ┊33┊34┊      ).zone();
 ┊34┊35┊  }
 ┊35┊36┊
+┊  ┊37┊  showOptions(): void {
+┊  ┊38┊    const popover = this.popoverCtrl.create(ChatsOptionsComponent, {}, {
+┊  ┊39┊      cssClass: 'options-popover'
+┊  ┊40┊    });
+┊  ┊41┊
+┊  ┊42┊    popover.present();
+┊  ┊43┊  }
+┊  ┊44┊
 ┊36┊45┊  showMessages(chat): void {
 ┊37┊46┊    this.navCtrl.push(MessagesPage, {chat});
 ┊38┊47┊  }
```
[}]: #

And let's add an event handler in the view which will show the popover:

[{]: <helper> (diff_step 5.36)
#### Step 5.36: Added event handler

##### Changed src/pages/chats/chats.html
```diff
@@ -7,7 +7,7 @@
 ┊ 7┊ 7┊      <button ion-button icon-only class="add-chat-button">
 ┊ 8┊ 8┊        <ion-icon name="person-add"></ion-icon>
 ┊ 9┊ 9┊      </button>
-┊10┊  ┊      <button ion-button icon-only class="options-button">
+┊  ┊10┊      <button ion-button icon-only class="options-button" (click)="showOptions()">
 ┊11┊11┊        <ion-icon name="more"></ion-icon>
 ┊12┊12┊      </button>
 ┊13┊13┊    </ion-buttons>
```
[}]: #

As for now, once you click on the options icon in the chats view, the popover should appear in the middle of the screen. To fix it, we simply gonna edit the `scss` file of the chats page:

[{]: <helper> (diff_step 5.37)
#### Step 5.37: Add options-popover style to chats stylesheet

##### Changed src/pages/chats/chats.scss
```diff
@@ -18,3 +18,15 @@
 ┊18┊18┊    }
 ┊19┊19┊  }
 ┊20┊20┊}
+┊  ┊21┊
+┊  ┊22┊.options-popover {
+┊  ┊23┊  $popover-width: 200px;
+┊  ┊24┊  $popover-margin: 5px;
+┊  ┊25┊
+┊  ┊26┊  .popover-content {
+┊  ┊27┊    width: $popover-width;
+┊  ┊28┊    transform-origin: right top 0px !important;
+┊  ┊29┊    left: calc(100% - #{$popover-width} - #{$popover-margin}) !important;
+┊  ┊30┊    top: $popover-margin !important;
+┊  ┊31┊  }
+┊  ┊32┊}
```
[}]: #

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step4.md) | [Next Step >](step6.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #