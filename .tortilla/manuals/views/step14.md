# Step 14: Native Mobile

In this step, we will be implementing additional native features like automatic phone number detection and access to the device's camera, to enhance the user experience.

## Automatic phone number detection

`Ionic 2` is provided by default with a `Cordova` plug-in called `cordova-plugin-sim`, which allows us to retrieve some data from the current device's SIM card, if even exists. We will use the SIM card to automatically detect the current device's phone number, so this way the user won't need to manually fill-in his phone number whenever he tries to login.

Let's start installing the `Sim` `Cordova` plug-in:

    $ ionic cordova plugin add cordova-plugin-sim --save
    $ npm install --save @ionic-native/sim

Then let's add it to `app.module.ts`:

[{]: <helper> (diffStep "14.2")

#### [Step 14.2: Add Sim to app.module.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/ab72bf1d)

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -5,6 +5,7 @@
 ┊ 5┊ 5┊import { StatusBar } from '@ionic-native/status-bar';
 ┊ 6┊ 6┊import { Geolocation } from '@ionic-native/geolocation';
 ┊ 7┊ 7┊import { ImagePicker } from '@ionic-native/image-picker';
+┊  ┊ 8┊import { Sim } from '@ionic-native/sim';
 ┊ 8┊ 9┊import { AgmCoreModule } from '@agm/core';
 ┊ 9┊10┊import { MomentModule } from 'angular2-moment';
 ┊10┊11┊import { ChatsPage } from '../pages/chats/chats';
```
```diff
@@ -67,7 +68,8 @@
 ┊67┊68┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
 ┊68┊69┊    PhoneService,
 ┊69┊70┊    ImagePicker,
-┊70┊  ┊    PictureService
+┊  ┊71┊    PictureService,
+┊  ┊72┊    Sim
 ┊71┊73┊  ]
 ┊72┊74┊})
 ┊73┊75┊export class AppModule {}
```

[}]: #

Let's add the appropriate handler in the `PhoneService`, we will use it inside the `LoginPage`:

[{]: <helper> (diffStep "14.3")

#### [Step 14.3: Use getNumber native method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/f2f2ec67)

##### Changed src&#x2F;pages&#x2F;login&#x2F;login.ts
```diff
@@ -1,4 +1,4 @@
-┊1┊ ┊import { Component } from '@angular/core';
+┊ ┊1┊import { Component, AfterContentInit } from '@angular/core';
 ┊2┊2┊import { Alert, AlertController, NavController } from 'ionic-angular';
 ┊3┊3┊import { PhoneService } from '../../services/phone';
 ┊4┊4┊import { VerificationPage } from '../verification/verification';
```
```diff
@@ -7,7 +7,7 @@
 ┊ 7┊ 7┊  selector: 'login',
 ┊ 8┊ 8┊  templateUrl: 'login.html'
 ┊ 9┊ 9┊})
-┊10┊  ┊export class LoginPage {
+┊  ┊10┊export class LoginPage implements AfterContentInit {
 ┊11┊11┊  private phone = '';
 ┊12┊12┊
 ┊13┊13┊  constructor(
```
```diff
@@ -16,6 +16,12 @@
 ┊16┊16┊    private navCtrl: NavController
 ┊17┊17┊  ) {}
 ┊18┊18┊
+┊  ┊19┊  ngAfterContentInit() {
+┊  ┊20┊    this.phoneService.getNumber()
+┊  ┊21┊      .then((phone) => this.phone = phone)
+┊  ┊22┊      .catch((e) => console.error(e.message));
+┊  ┊23┊  }
+┊  ┊24┊
 ┊19┊25┊  onInputKeypress({keyCode}: KeyboardEvent): void {
 ┊20┊26┊    if (keyCode === 13) {
 ┊21┊27┊      this.login();
```

[}]: #

[{]: <helper> (diffStep "14.4")

#### [Step 14.4: Implement getNumber with native ionic](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/fff95242)

##### Changed src&#x2F;services&#x2F;phone.ts
```diff
@@ -1,9 +1,32 @@
 ┊ 1┊ 1┊import { Injectable } from '@angular/core';
 ┊ 2┊ 2┊import { Accounts } from 'meteor/accounts-base';
 ┊ 3┊ 3┊import { Meteor } from 'meteor/meteor';
+┊  ┊ 4┊import { Platform } from 'ionic-angular';
+┊  ┊ 5┊import { Sim } from '@ionic-native/sim';
 ┊ 4┊ 6┊
 ┊ 5┊ 7┊@Injectable()
 ┊ 6┊ 8┊export class PhoneService {
+┊  ┊ 9┊  constructor(private platform: Platform,
+┊  ┊10┊              private sim: Sim) {
+┊  ┊11┊
+┊  ┊12┊  }
+┊  ┊13┊
+┊  ┊14┊  async getNumber(): Promise<string> {
+┊  ┊15┊    if (!this.platform.is('cordova')) {
+┊  ┊16┊      throw new Error('Cannot read SIM, platform is not Cordova.')
+┊  ┊17┊    }
+┊  ┊18┊
+┊  ┊19┊    if (!(await this.sim.hasReadPermission())) {
+┊  ┊20┊      try {
+┊  ┊21┊        await this.sim.requestReadPermission();
+┊  ┊22┊      } catch (e) {
+┊  ┊23┊        throw new Error('User denied SIM access.');
+┊  ┊24┊      }
+┊  ┊25┊    }
+┊  ┊26┊
+┊  ┊27┊    return '+' + (await this.sim.getSimInfo()).phoneNumber;
+┊  ┊28┊  }
+┊  ┊29┊
 ┊ 7┊30┊  verify(phoneNumber: string): Promise<void> {
 ┊ 8┊31┊    return new Promise<void>((resolve, reject) => {
 ┊ 9┊32┊      Accounts.requestPhoneVerification(phoneNumber, (e: Error) => {
```

[}]: #

## SMS OTP autofill

On supported platforms (`Android`) it would be nice to automatically detect the incoming OTP (One Time Password) SMS and fill the verification field in place of the user.

We need to add the `Cordova` plugin first:

    $ ionic cordova plugin add cordova-plugin-sms-receiver --save

Then we must create the corresponding `ionic-native` plugin, since no one created it:

[{]: <helper> (diffStep "14.6")

#### [Step 14.6: Added ionic-native plugin for reading SMS OTP](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/69a7ca21)

##### Added src&#x2F;ionic&#x2F;sms-receiver&#x2F;index.ts
```diff
@@ -0,0 +1,78 @@
+┊  ┊ 1┊import {Injectable} from '@angular/core';
+┊  ┊ 2┊import {Cordova, Plugin, IonicNativePlugin} from '@ionic-native/core';
+┊  ┊ 3┊
+┊  ┊ 4┊
+┊  ┊ 5┊/**
+┊  ┊ 6┊ * @name SmsReceiver
+┊  ┊ 7┊ * @description
+┊  ┊ 8┊ * Allows you to receive incoming SMS. You have the possibility to start and stop the message broadcasting.
+┊  ┊ 9┊ *
+┊  ┊10┊ * Requires Cordova plugin: `cordova-plugin-smsreceiver`. For more info, please see the [Cordova SmsReceiver docs](https://github.com/ahmedwahba/cordova-plugin-smsreceiver).
+┊  ┊11┊ *
+┊  ┊12┊ * @usage
+┊  ┊13┊ * ```typescript
+┊  ┊14┊ * import { SmsReceiver } from '@ionic-native/smsreceiver';
+┊  ┊15┊ *
+┊  ┊16┊ *
+┊  ┊17┊ * constructor(private smsReceiver: SmsReceiver) { }
+┊  ┊18┊ *
+┊  ┊19┊ * ...
+┊  ┊20┊ *
+┊  ┊21┊ * this.smsReceiver.isSupported().then(
+┊  ┊22┊ *   (supported) => console.log('Permission granted'),
+┊  ┊23┊ *   (err) => console.log('Permission denied: ', err)
+┊  ┊24┊ * );
+┊  ┊25┊ *
+┊  ┊26┊ * this.smsReceiver.startReceiving().then(
+┊  ┊27┊ *   (msg) => console.log('Message received: ', msg)
+┊  ┊28┊ * );
+┊  ┊29┊ *
+┊  ┊30┊ * this.smsReceiver.stopReceiving().then(
+┊  ┊31┊ *   () => console.log('Stopped receiving'),
+┊  ┊32┊ *   (err) => console.log('Error: ', err)
+┊  ┊33┊ * );
+┊  ┊34┊ * ```
+┊  ┊35┊ */
+┊  ┊36┊@Plugin({
+┊  ┊37┊  pluginName: 'SmsReceiver',
+┊  ┊38┊  plugin: 'cordova-plugin-smsreceiver',
+┊  ┊39┊  pluginRef: 'sms',
+┊  ┊40┊  repo: 'https://github.com/ahmedwahba/cordova-plugin-smsreceiver',
+┊  ┊41┊  platforms: ['Android']
+┊  ┊42┊})
+┊  ┊43┊@Injectable()
+┊  ┊44┊export class SmsReceiver extends IonicNativePlugin {
+┊  ┊45┊  /**
+┊  ┊46┊   * Check if the SMS permission is granted and SMS technology is supported by the device.
+┊  ┊47┊   * In case of Marshmallow devices, it requests permission from user.
+┊  ┊48┊   * @returns {void}
+┊  ┊49┊   */
+┊  ┊50┊  @Cordova()
+┊  ┊51┊  isSupported(callback: (supported: boolean) => void, error: () => void): void {
+┊  ┊52┊    return;
+┊  ┊53┊  }
+┊  ┊54┊
+┊  ┊55┊  /**
+┊  ┊56┊   * Start the SMS receiver waiting for incoming message.
+┊  ┊57┊   * The success callback function will be called every time a new message is received.
+┊  ┊58┊   * The error callback is called if an error occurs.
+┊  ┊59┊   * @returns {void}
+┊  ┊60┊   */
+┊  ┊61┊  @Cordova({
+┊  ┊62┊    platforms: ['Android']
+┊  ┊63┊  })
+┊  ┊64┊  startReceiving(callback: (msg: string) => void, error: () => void): void {
+┊  ┊65┊    return;
+┊  ┊66┊  }
+┊  ┊67┊
+┊  ┊68┊  /**
+┊  ┊69┊   * Stop the SMS receiver.
+┊  ┊70┊   * @returns {void}
+┊  ┊71┊   */
+┊  ┊72┊  @Cordova({
+┊  ┊73┊    platforms: ['Android']
+┊  ┊74┊  })
+┊  ┊75┊  stopReceiving(callback: () => void, error: () => void): void {
+┊  ┊76┊    return;
+┊  ┊77┊  }
+┊  ┊78┊}
```

[}]: #

Last but not the least we must import it into `app.module.ts` as usual:

[{]: <helper> (diffStep "14.7")

#### [Step 14.7: Add SmsReceiver to app.module.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/be2a408a)

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -6,6 +6,7 @@
 ┊ 6┊ 6┊import { Geolocation } from '@ionic-native/geolocation';
 ┊ 7┊ 7┊import { ImagePicker } from '@ionic-native/image-picker';
 ┊ 8┊ 8┊import { Sim } from '@ionic-native/sim';
+┊  ┊ 9┊import { SmsReceiver } from "../ionic/sms-receiver";
 ┊ 9┊10┊import { AgmCoreModule } from '@agm/core';
 ┊10┊11┊import { MomentModule } from 'angular2-moment';
 ┊11┊12┊import { ChatsPage } from '../pages/chats/chats';
```
```diff
@@ -69,7 +70,8 @@
 ┊69┊70┊    PhoneService,
 ┊70┊71┊    ImagePicker,
 ┊71┊72┊    PictureService,
-┊72┊  ┊    Sim
+┊  ┊73┊    Sim,
+┊  ┊74┊    SmsReceiver
 ┊73┊75┊  ]
 ┊74┊76┊})
 ┊75┊77┊export class AppModule {}
```

[}]: #

Let's start by using the yet-to-be-created method in the `verification` page:

[{]: <helper> (diffStep "14.8")

#### [Step 14.8: Use getSMS method in verification.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/ddac9c6b)

##### Changed src&#x2F;pages&#x2F;verification&#x2F;verification.ts
```diff
@@ -1,4 +1,4 @@
-┊1┊ ┊import { Component, OnInit } from '@angular/core';
+┊ ┊1┊import { AfterContentInit, Component, OnInit } from '@angular/core';
 ┊2┊2┊import { AlertController, NavController, NavParams } from 'ionic-angular';
 ┊3┊3┊import { PhoneService } from '../../services/phone';
 ┊4┊4┊import { ProfilePage } from '../profile/profile';
```
```diff
@@ -7,7 +7,7 @@
 ┊ 7┊ 7┊  selector: 'verification',
 ┊ 8┊ 8┊  templateUrl: 'verification.html'
 ┊ 9┊ 9┊})
-┊10┊  ┊export class VerificationPage implements OnInit {
+┊  ┊10┊export class VerificationPage implements OnInit, AfterContentInit {
 ┊11┊11┊  private code: string = '';
 ┊12┊12┊  private phone: string;
 ┊13┊13┊
```
```diff
@@ -22,6 +22,19 @@
 ┊22┊22┊    this.phone = this.navParams.get('phone');
 ┊23┊23┊  }
 ┊24┊24┊
+┊  ┊25┊  ngAfterContentInit() {
+┊  ┊26┊    this.phoneService.getSMS()
+┊  ┊27┊      .then((code: string) => {
+┊  ┊28┊        this.code = code;
+┊  ┊29┊        this.verify();
+┊  ┊30┊      })
+┊  ┊31┊      .catch((e: Error) => {
+┊  ┊32┊        if (e) {
+┊  ┊33┊          console.error(e.message);
+┊  ┊34┊        }
+┊  ┊35┊      });
+┊  ┊36┊  }
+┊  ┊37┊
 ┊25┊38┊  onInputKeypress({keyCode}: KeyboardEvent): void {
 ┊26┊39┊    if (keyCode === 13) {
 ┊27┊40┊      this.verify();
```

[}]: #

We will need `bluebird` to promisify `sms-receiver`:

    $ npm install --save bluebird
    $ npm install --save-dev @types/bluebird

We will need to add support for `es2016` in Typescript, because we will use `Array.prototype.includes()`:

[{]: <helper> (diffStep "14.10")

#### [Step 14.10: Added support for es2016 in Typescript](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/7e8c0619)

##### Changed tsconfig.json
```diff
@@ -7,7 +7,8 @@
 ┊ 7┊ 7┊    "experimentalDecorators": true,
 ┊ 8┊ 8┊    "lib": [
 ┊ 9┊ 9┊      "dom",
-┊10┊  ┊      "es2015"
+┊  ┊10┊      "es2015",
+┊  ┊11┊      "es2016"
 ┊11┊12┊    ],
 ┊12┊13┊    "module": "commonjs",
 ┊13┊14┊    "moduleResolution": "node",
```

[}]: #

Now we can implement the method in the `phone` service:

[{]: <helper> (diffStep "14.11")

#### [Step 14.11: Add getSMS method to phone.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/405ae503)

##### Changed api&#x2F;server&#x2F;models.ts
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊export const DEFAULT_PICTURE_URL = '/assets/default-profile-pic.svg';
+┊ ┊2┊export const TWILIO_SMS_NUMBERS = ["+12248032362"];
 ┊2┊3┊
 ┊3┊4┊export interface Profile {
 ┊4┊5┊  name?: string;
```

##### Changed src&#x2F;services&#x2F;phone.ts
```diff
@@ -3,12 +3,17 @@
 ┊ 3┊ 3┊import { Meteor } from 'meteor/meteor';
 ┊ 4┊ 4┊import { Platform } from 'ionic-angular';
 ┊ 5┊ 5┊import { Sim } from '@ionic-native/sim';
+┊  ┊ 6┊import { SmsReceiver } from "../ionic/sms-receiver";
+┊  ┊ 7┊import * as Bluebird from "bluebird";
+┊  ┊ 8┊import { TWILIO_SMS_NUMBERS } from "api/models";
+┊  ┊ 9┊import { Observable } from "rxjs";
 ┊ 6┊10┊
 ┊ 7┊11┊@Injectable()
 ┊ 8┊12┊export class PhoneService {
 ┊ 9┊13┊  constructor(private platform: Platform,
-┊10┊  ┊              private sim: Sim) {
-┊11┊  ┊
+┊  ┊14┊              private sim: Sim,
+┊  ┊15┊              private smsReceiver: SmsReceiver) {
+┊  ┊16┊    Bluebird.promisifyAll(this.smsReceiver);
 ┊12┊17┊  }
 ┊13┊18┊
 ┊14┊19┊  async getNumber(): Promise<string> {
```
```diff
@@ -27,6 +32,38 @@
 ┊27┊32┊    return '+' + (await this.sim.getSimInfo()).phoneNumber;
 ┊28┊33┊  }
 ┊29┊34┊
+┊  ┊35┊  async getSMS(): Promise<string> {
+┊  ┊36┊    if (!this.platform.is('android')) {
+┊  ┊37┊      throw new Error('Cannot read SMS, platform is not Android.')
+┊  ┊38┊    }
+┊  ┊39┊
+┊  ┊40┊    try {
+┊  ┊41┊      await (<any>this.smsReceiver).isSupported();
+┊  ┊42┊    } catch (e) {
+┊  ┊43┊      throw new Error('User denied SMS access.');
+┊  ┊44┊    }
+┊  ┊45┊
+┊  ┊46┊    const startObs = Observable.fromPromise((<any>this.smsReceiver).startReceiving()).map((msg: string) => msg);
+┊  ┊47┊    const timeoutObs = Observable.interval(120000).take(1).map(() => {
+┊  ┊48┊      throw new Error('Receiving SMS timed out.')
+┊  ┊49┊    });
+┊  ┊50┊
+┊  ┊51┊    try {
+┊  ┊52┊      var msg = await startObs.takeUntil(timeoutObs).toPromise();
+┊  ┊53┊    } catch (e) {
+┊  ┊54┊      await (<any>this.smsReceiver).stopReceiving();
+┊  ┊55┊      throw e;
+┊  ┊56┊    }
+┊  ┊57┊
+┊  ┊58┊    await (<any>this.smsReceiver).stopReceiving();
+┊  ┊59┊
+┊  ┊60┊    if (TWILIO_SMS_NUMBERS.includes(msg.split(">")[0])) {
+┊  ┊61┊      return msg.substr(msg.length - 4);
+┊  ┊62┊    } else {
+┊  ┊63┊      throw new Error('Sender is not a Twilio number.')
+┊  ┊64┊    }
+┊  ┊65┊  }
+┊  ┊66┊
 ┊30┊67┊  verify(phoneNumber: string): Promise<void> {
 ┊31┊68┊    return new Promise<void>((resolve, reject) => {
 ┊32┊69┊      Accounts.requestPhoneVerification(phoneNumber, (e: Error) => {
```

[}]: #

## Camera

Next - we will grant access to the device's camera so we can send pictures which are yet to exist in the gallery. Since the `Camera` plugin can also access the gallery, we will replace the previously used `ImagePicker` plugin with `Camera`, which is better maintained and allows for more code reuse.
We will also use the `Crop` plugin to force a 1:1 aspect ratio, when needed.

We will start by adding the appropriate `Cordova` plug-ins:

    $ ionic cordova plugin add cordova-plugin-camera --save
    $ ionic cordova plugin add cordova-plugin-crop --save
    $ npm install --save @ionic-native/camera
    $ npm install --save @ionic-native/crop

Then let's add them to `app.module.ts`:

[{]: <helper> (diffStep "14.13")

#### [Step 14.13: Add Camera and Crop to app.module.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/6eb7d0e4)

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -7,6 +7,8 @@
 ┊ 7┊ 7┊import { ImagePicker } from '@ionic-native/image-picker';
 ┊ 8┊ 8┊import { Sim } from '@ionic-native/sim';
 ┊ 9┊ 9┊import { SmsReceiver } from "../ionic/sms-receiver";
+┊  ┊10┊import { Camera } from '@ionic-native/camera';
+┊  ┊11┊import { Crop } from '@ionic-native/crop';
 ┊10┊12┊import { AgmCoreModule } from '@agm/core';
 ┊11┊13┊import { MomentModule } from 'angular2-moment';
 ┊12┊14┊import { ChatsPage } from '../pages/chats/chats';
```
```diff
@@ -71,7 +73,9 @@
 ┊71┊73┊    ImagePicker,
 ┊72┊74┊    PictureService,
 ┊73┊75┊    Sim,
-┊74┊  ┊    SmsReceiver
+┊  ┊76┊    SmsReceiver,
+┊  ┊77┊    Camera,
+┊  ┊78┊    Crop
 ┊75┊79┊  ]
 ┊76┊80┊})
 ┊77┊81┊export class AppModule {}
```

[}]: #

We will bind the `click` event in the view:

[{]: <helper> (diffStep "14.14")

#### [Step 14.14: Use the new sendPicture method in the template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/12fb8b75)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.html
```diff
@@ -1,11 +1,11 @@
 ┊ 1┊ 1┊<ion-content class="messages-attachments-page-content">
 ┊ 2┊ 2┊  <ion-list class="attachments">
-┊ 3┊  ┊    <button ion-item class="attachment attachment-gallery" (click)="sendPicture()">
+┊  ┊ 3┊    <button ion-item class="attachment attachment-gallery" (click)="sendPicture(false)">
 ┊ 4┊ 4┊      <ion-icon name="images" class="attachment-icon"></ion-icon>
 ┊ 5┊ 5┊      <div class="attachment-name">Gallery</div>
 ┊ 6┊ 6┊    </button>
 ┊ 7┊ 7┊
-┊ 8┊  ┊    <button ion-item class="attachment attachment-camera">
+┊  ┊ 8┊    <button ion-item class="attachment attachment-camera" (click)="sendPicture(true)">
 ┊ 9┊ 9┊      <ion-icon name="camera" class="attachment-icon"></ion-icon>
 ┊10┊10┊      <div class="attachment-name">Camera</div>
 ┊11┊11┊    </button>
```

[}]: #

And we will create the event handler in `MessagesAttachmentsComponent`:

[{]: <helper> (diffStep "14.15")

#### [Step 14.15: Use the getPicture method into messages-attachment.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/ea9cd551)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.ts
```diff
@@ -1,5 +1,5 @@
 ┊1┊1┊import { Component } from '@angular/core';
-┊2┊ ┊import { ModalController, ViewController } from 'ionic-angular';
+┊ ┊2┊import { AlertController, ModalController, Platform, ViewController } from 'ionic-angular';
 ┊3┊3┊import { NewLocationMessageComponent } from './location-message';
 ┊4┊4┊import { MessageType } from 'api/models';
 ┊5┊5┊import { PictureService } from '../../services/picture';
```
```diff
@@ -12,16 +12,26 @@
 ┊12┊12┊  constructor(
 ┊13┊13┊    private viewCtrl: ViewController,
 ┊14┊14┊    private modelCtrl: ModalController,
-┊15┊  ┊    private pictureService: PictureService
+┊  ┊15┊    private pictureService: PictureService,
+┊  ┊16┊    private platform: Platform,
+┊  ┊17┊    private alertCtrl: AlertController
 ┊16┊18┊  ) {}
 ┊17┊19┊
-┊18┊  ┊  sendPicture(): void {
-┊19┊  ┊    this.pictureService.select().then((file: File) => {
-┊20┊  ┊      this.viewCtrl.dismiss({
-┊21┊  ┊        messageType: MessageType.PICTURE,
-┊22┊  ┊        selectedPicture: file
+┊  ┊20┊  sendPicture(camera: boolean): void {
+┊  ┊21┊    if (camera && !this.platform.is('cordova')) {
+┊  ┊22┊      return console.warn('Device must run cordova in order to take pictures');
+┊  ┊23┊    }
+┊  ┊24┊
+┊  ┊25┊    this.pictureService.getPicture(camera, false)
+┊  ┊26┊      .then((blob: File) => {
+┊  ┊27┊        this.viewCtrl.dismiss({
+┊  ┊28┊          messageType: MessageType.PICTURE,
+┊  ┊29┊          selectedPicture: blob
+┊  ┊30┊        });
+┊  ┊31┊      })
+┊  ┊32┊      .catch((e) => {
+┊  ┊33┊        this.handleError(e);
 ┊23┊34┊      });
-┊24┊  ┊    });
 ┊25┊35┊  }
 ┊26┊36┊
 ┊27┊37┊  sendLocation(): void {
```
```diff
@@ -41,4 +51,16 @@
 ┊41┊51┊
 ┊42┊52┊    locationModal.present();
 ┊43┊53┊  }
+┊  ┊54┊
+┊  ┊55┊  handleError(e: Error): void {
+┊  ┊56┊    console.error(e);
+┊  ┊57┊
+┊  ┊58┊    const alert = this.alertCtrl.create({
+┊  ┊59┊      title: 'Oops!',
+┊  ┊60┊      message: e.message,
+┊  ┊61┊      buttons: ['OK']
+┊  ┊62┊    });
+┊  ┊63┊
+┊  ┊64┊    alert.present();
+┊  ┊65┊  }
 ┊44┊66┊}
```

[}]: #

Finally we can create a new method in the `PictureService` to take some pictures and remove the old method which used `ImagePicker`:

[{]: <helper> (diffStep "14.16")

#### [Step 14.16: Implement getPicture method in picture service](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/5f47563f)

##### Changed src&#x2F;services&#x2F;picture.ts
```diff
@@ -1,34 +1,50 @@
 ┊ 1┊ 1┊import { Injectable } from '@angular/core';
 ┊ 2┊ 2┊import { Platform } from 'ionic-angular';
-┊ 3┊  ┊import { ImagePicker } from '@ionic-native/image-picker';
 ┊ 4┊ 3┊import { UploadFS } from 'meteor/jalik:ufs';
 ┊ 5┊ 4┊import { PicturesStore } from 'api/collections';
 ┊ 6┊ 5┊import * as _ from 'lodash';
 ┊ 7┊ 6┊import { DEFAULT_PICTURE_URL } from 'api/models';
+┊  ┊ 7┊import { Camera, CameraOptions } from '@ionic-native/camera';
+┊  ┊ 8┊import { Crop } from '@ionic-native/crop';
 ┊ 8┊ 9┊
 ┊ 9┊10┊@Injectable()
 ┊10┊11┊export class PictureService {
 ┊11┊12┊  constructor(private platform: Platform,
-┊12┊  ┊              private imagePicker: ImagePicker) {
+┊  ┊13┊              private camera: Camera,
+┊  ┊14┊              private crop: Crop) {
 ┊13┊15┊  }
 ┊14┊16┊
-┊15┊  ┊  select(): Promise<File> {
-┊16┊  ┊    if (!this.platform.is('cordova') || !this.platform.is('mobile')) {
+┊  ┊17┊  getPicture(camera: boolean, crop: boolean): Promise<File> {
+┊  ┊18┊    if (!this.platform.is('cordova')) {
 ┊17┊19┊      return new Promise((resolve, reject) => {
-┊18┊  ┊        try {
-┊19┊  ┊          UploadFS.selectFile((file: File) => {
-┊20┊  ┊            resolve(file);
-┊21┊  ┊          });
-┊22┊  ┊        }
-┊23┊  ┊        catch (e) {
-┊24┊  ┊          reject(e);
+┊  ┊20┊        //TODO: add javascript image crop
+┊  ┊21┊        if (camera === true) {
+┊  ┊22┊          reject(new Error("Can't access the camera on Browser"));
+┊  ┊23┊        } else {
+┊  ┊24┊          try {
+┊  ┊25┊            UploadFS.selectFile((file: File) => {
+┊  ┊26┊              resolve(file);
+┊  ┊27┊            });
+┊  ┊28┊          } catch (e) {
+┊  ┊29┊            reject(e);
+┊  ┊30┊          }
 ┊25┊31┊        }
 ┊26┊32┊      });
 ┊27┊33┊    }
 ┊28┊34┊
-┊29┊  ┊    return this.imagePicker.getPictures({maximumImagesCount: 1}).then((URL: string) => {
-┊30┊  ┊      return this.convertURLtoBlob(URL);
-┊31┊  ┊    });
+┊  ┊35┊    return this.camera.getPicture(<CameraOptions>{
+┊  ┊36┊      destinationType: 1,
+┊  ┊37┊      quality: 50,
+┊  ┊38┊      correctOrientation: true,
+┊  ┊39┊      saveToPhotoAlbum: false,
+┊  ┊40┊      sourceType: camera ? 1 : 0
+┊  ┊41┊    })
+┊  ┊42┊      .then((fileURI) => {
+┊  ┊43┊        return crop ? this.crop.crop(fileURI, {quality: 50}) : fileURI;
+┊  ┊44┊      })
+┊  ┊45┊      .then((croppedFileURI) => {
+┊  ┊46┊        return this.convertURLtoBlob(croppedFileURI);
+┊  ┊47┊      });
 ┊32┊48┊  }
 ┊33┊49┊
 ┊34┊50┊  upload(blob: File): Promise<any> {
```

[}]: #

Choosing to take the picture from the camera instead of the gallery is as simple as passing a boolean parameter to the method. The same is true for cropping.

> *NOTE*: even if the client will not crop the image when passing `false`, the server will still crop it. Eventually, we will need to edit our `Store` in order to fix it.

We will also have to update `selectProfilePicture` in the profile `Page` to use `getPicture`:

[{]: <helper> (diffStep "14.17")

#### [Step 14.17: Update selectProfilePicture in profile.ts to use getPicture](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/3ee7305c)

##### Changed src&#x2F;pages&#x2F;profile&#x2F;profile.ts
```diff
@@ -36,7 +36,7 @@
 ┊36┊36┊  }
 ┊37┊37┊
 ┊38┊38┊  selectProfilePicture(): void {
-┊39┊  ┊    this.pictureService.select().then((blob) => {
+┊  ┊39┊    this.pictureService.getPicture(false, true).then((blob) => {
 ┊40┊40┊      this.uploadProfilePicture(blob);
 ┊41┊41┊    })
 ┊42┊42┊      .catch((e) => {
```

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/addressbook" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/file-upload")

| [< Previous Step](https://angular-meteor.com/tutorials/whatsapp2/ionic/file-upload) | [Next Step >](https://angular-meteor.com/tutorials/whatsapp2/ionic/addressbook) |
|:--------------------------------|--------------------------------:|

[}]: #

